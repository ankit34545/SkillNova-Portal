"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  PenTool,
  Highlighter,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Type,
  Undo2,
  Redo2,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Layers,
} from "lucide-react";
import type { WhiteboardStroke, WhiteboardPage } from "@/types/meet";

interface CollaborativeWhiteboardProps {
  roomId: string;
  isTeacherOrHost: boolean;
  pages: WhiteboardPage[];
  onSaveStroke: (stroke: WhiteboardStroke) => void;
  onClearCanvas: () => void;
}

export default function CollaborativeWhiteboard({
  roomId,
  isTeacherOrHost,
  pages,
  onSaveStroke,
  onClearCanvas,
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<
    "pen" | "highlighter" | "eraser" | "line" | "rect" | "circle" | "arrow" | "text"
  >("pen");
  const [color, setColor] = useState("#38bdf8"); // Cyan default
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Local stroke history for instant responsive rendering + undo
  const [localStrokes, setLocalStrokes] = useState<WhiteboardStroke[]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardStroke[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);

  // Sync strokes from props on initial load or peer update
  useEffect(() => {
    if (pages[currentPageIndex]?.strokes) {
      setLocalStrokes(pages[currentPageIndex].strokes);
    }
  }, [pages, currentPageIndex]);

  // Redraw canvas whenever strokes change or zoom updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset and clear with subtle dark grid background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);

    // Draw subtle engineering grid dots
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    for (let x = 20; x < canvas.width / zoomLevel; x += 30) {
      for (let y = 20; y < canvas.height / zoomLevel; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render strokes
    localStrokes.forEach((stroke) => {
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "highlighter") {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = stroke.strokeWidth * 3;
      } else if (stroke.tool === "eraser") {
        ctx.strokeStyle = "#090d16"; // Background color
        ctx.lineWidth = stroke.strokeWidth * 4;
      }

      if ((stroke.tool === "pen" || stroke.tool === "highlighter" || stroke.tool === "eraser") && stroke.points) {
        ctx.beginPath();
        for (let i = 0; i < stroke.points.length; i += 2) {
          const px = stroke.points[i];
          const py = stroke.points[i + 1];
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else if (stroke.tool === "rect" && stroke.x !== undefined && stroke.y !== undefined && stroke.width && stroke.height) {
        ctx.beginPath();
        ctx.strokeRect(stroke.x, stroke.y, stroke.width, stroke.height);
      } else if (stroke.tool === "circle" && stroke.x !== undefined && stroke.y !== undefined && stroke.width) {
        ctx.beginPath();
        ctx.arc(stroke.x, stroke.y, Math.abs(stroke.width) / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (stroke.tool === "line" && stroke.points && stroke.points.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0], stroke.points[1]);
        ctx.lineTo(stroke.points[2], stroke.points[3]);
        ctx.stroke();
      } else if (stroke.tool === "arrow" && stroke.points && stroke.points.length >= 4) {
        const [x1, y1, x2, y2] = stroke.points;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 14;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (stroke.tool === "text" && stroke.text && stroke.x !== undefined && stroke.y !== undefined) {
        ctx.fillStyle = stroke.color;
        ctx.font = "bold 16px Inter, sans-serif";
        ctx.fillText(stroke.text, stroke.x, stroke.y);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [localStrokes, zoomLevel]);

  // Canvas Mouse / Touch events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);

    if (activeTool === "text") {
      const text = prompt("Enter text to add to whiteboard:");
      if (text && text.trim()) {
        const textStroke: WhiteboardStroke = {
          id: "stroke-" + Date.now(),
          tool: "text",
          x: coords.x,
          y: coords.y,
          text: text.trim(),
          color,
          strokeWidth,
        };
        setLocalStrokes((prev) => [...prev, textStroke]);
        onSaveStroke(textStroke);
      }
      setIsDrawing(false);
      return;
    }

    setCurrentPoints([coords.x, coords.y]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const coords = getCoordinates(e);

    if (activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") {
      setCurrentPoints((prev) => [...prev, coords.x, coords.y]);

      // Immediate visual feedback
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.scale(zoomLevel, zoomLevel);
        ctx.strokeStyle = activeTool === "eraser" ? "#090d16" : color;
        ctx.lineWidth = activeTool === "eraser" ? strokeWidth * 4 : strokeWidth;
        if (activeTool === "highlighter") {
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = strokeWidth * 3;
        }
        ctx.lineCap = "round";
        ctx.beginPath();
        const pts = currentPoints;
        if (pts.length >= 2) {
          ctx.moveTo(pts[pts.length - 2], pts[pts.length - 1]);
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const coords = getCoordinates(e);
    setIsDrawing(false);

    let newStroke: WhiteboardStroke | null = null;

    if (activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") {
      const allPts = [...currentPoints, coords.x, coords.y];
      if (allPts.length >= 4) {
        newStroke = {
          id: "stroke-" + Date.now(),
          tool: activeTool,
          points: allPts,
          color: activeTool === "eraser" ? "#090d16" : color,
          strokeWidth,
        };
      }
    } else if (activeTool === "rect") {
      newStroke = {
        id: "stroke-" + Date.now(),
        tool: "rect",
        x: Math.min(startPos.x, coords.x),
        y: Math.min(startPos.y, coords.y),
        width: Math.abs(coords.x - startPos.x),
        height: Math.abs(coords.y - startPos.y),
        color,
        strokeWidth,
      };
    } else if (activeTool === "circle") {
      newStroke = {
        id: "stroke-" + Date.now(),
        tool: "circle",
        x: startPos.x,
        y: startPos.y,
        width: Math.hypot(coords.x - startPos.x, coords.y - startPos.y) * 2,
        color,
        strokeWidth,
      };
    } else if (activeTool === "line" || activeTool === "arrow") {
      newStroke = {
        id: "stroke-" + Date.now(),
        tool: activeTool,
        points: [startPos.x, startPos.y, coords.x, coords.y],
        color,
        strokeWidth,
      };
    }

    if (newStroke) {
      setLocalStrokes((prev) => [...prev, newStroke!]);
      setRedoStack([]);
      onSaveStroke(newStroke);
    }

    setStartPos(null);
    setCurrentPoints([]);
  };

  const handleUndo = () => {
    if (localStrokes.length === 0) return;
    const popped = localStrokes[localStrokes.length - 1];
    setLocalStrokes((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, popped]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const restored = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setLocalStrokes((prev) => [...prev, restored]);
    onSaveStroke(restored);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `SkillNova_Whiteboard_${roomId}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const palette = ["#38bdf8", "#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#f8fafc"];

  return (
    <div className="w-full h-full flex flex-col bg-midnight-950 rounded-2xl border border-white/10 overflow-hidden relative select-none">
      {/* Top Floating Whiteboard Tooling Bar */}
      <div className="p-2 sm:p-3 bg-midnight-900/90 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-10">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTool("pen")}
            className={`p-2 rounded-lg text-xs transition-colors ${
              activeTool === "pen" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Pen Tool"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("highlighter")}
            className={`p-2 rounded-lg text-xs transition-colors ${
              activeTool === "highlighter" ? "bg-purple-500/20 text-purple-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("rect")}
            className={`p-2 rounded-lg text-xs transition-colors ${
              activeTool === "rect" ? "bg-pink-500/20 text-pink-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("circle")}
            className={`p-2 rounded-lg text-xs transition-colors ${
              activeTool === "circle" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("arrow")}
            className={`p-2 rounded-lg text-xs transition-colors ${
              activeTool === "arrow" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Flow Arrow"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("text")}
            className={`p-2 rounded-lg text-xs transition-colors ${
              activeTool === "text" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Text Insertion"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("eraser")}
            className={`p-2 rounded-lg text-xs transition-colors ${
              activeTool === "eraser" ? "bg-red-500/20 text-red-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette & Stroke Size */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  color === c ? "scale-125 border-white" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none"
            title="Stroke Width"
          >
            <option value={2}>2px</option>
            <option value={3}>3px</option>
            <option value={5}>5px</option>
            <option value={8}>8px</option>
          </select>
        </div>

        {/* Undo, Redo, Zoom, Clear & Export */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={localStrokes.length === 0}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 w-9 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.1))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {isTeacherOrHost && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear the collaborative whiteboard?")) {
                  setLocalStrokes([]);
                  setRedoStack([]);
                  onClearCanvas();
                }
              }}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleExportPNG}
            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-1 text-xs"
            title="Export as PNG"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#090d16]">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
}
