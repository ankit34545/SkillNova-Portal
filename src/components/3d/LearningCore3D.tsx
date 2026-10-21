// @ts-nocheck
"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Generate floating space particles
function ParticleField() {
  const pointsRef = useRef<any>(null);
  const [positions] = useState(() => {
    const coords = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i += 3) {
      coords[i] = (Math.random() - 0.5) * 16;
      coords[i + 1] = (Math.random() - 0.5) * 16;
      coords[i + 2] = (Math.random() - 0.5) * 16;
    }
    return coords;
  });

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#818cf8"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// Orbiting Skill Node
interface OrbitNodeProps {
  radius: number;
  speed: number;
  initialAngle: number;
  label: string;
  color: string;
  iconSymbol: string;
  onSelectNode: (label: string) => void;
  isSelected: boolean;
}

function OrbitNode({
  radius,
  speed,
  initialAngle,
  label,
  color,
  iconSymbol,
  onSelectNode,
  isSelected,
}: OrbitNodeProps) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(initialAngle);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Slow down on hover
    const currentSpeed = hovered ? speed * 0.2 : speed;
    angleRef.current += delta * currentSpeed;

    const x = Math.cos(angleRef.current) * radius;
    const z = Math.sin(angleRef.current) * radius;
    const y = Math.sin(angleRef.current * 2) * 0.4;

    meshRef.current.position.set(x, y, z);
  });

  return (
    <group ref={meshRef}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(label);
        }}
      >
        <sphereGeometry args={[hovered || isSelected ? 0.32 : 0.24, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 1.4 : 0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbit node ring glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.38, 24]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={hovered ? 0.8 : 0.3} />
      </mesh>
    </group>
  );
}

// Geometric Learning Core
function QuantumCore({ activeSkill }: { activeSkill: string }) {
  const coreRef = useRef<any>(null);
  const outerWireRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.3;
      coreRef.current.rotation.y += delta * 0.45;
    }
    if (outerWireRef.current) {
      outerWireRef.current.rotation.x -= delta * 0.2;
      outerWireRef.current.rotation.z += delta * 0.25;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.8}>
      <group>
        {/* Central Icosahedron Solid Core */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#4338ca"
            emissiveIntensity={0.7}
            roughness={0.15}
            metalness={0.85}
            wireframe={false}
          />
        </mesh>

        {/* Outer Faceted Wireframe Cage */}
        <mesh ref={outerWireRef}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#06b6d4"
            emissiveIntensity={0.5}
            wireframe={true}
            transparent
            opacity={0.45}
          />
        </mesh>

        {/* Glowing Energy Torus Rings */}
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[1.85, 0.02, 16, 80]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, 0, Math.PI / 3]}>
          <torusGeometry args={[2.3, 0.02, 16, 80]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

// Parallax Camera Controller
function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    // Gentle mouse parallax
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.7, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.7 + 0.2, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export interface LearningCore3DProps {
  onSkillSelect?: (skill: string) => void;
  selectedSkill?: string;
}

export default function LearningCore3D({
  onSkillSelect,
  selectedSkill = "AI Engineering",
}: LearningCore3DProps) {
  const handleSelect = (skill: string) => {
    if (onSkillSelect) onSkillSelect(skill);
  };

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.5, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 8, 5]} intensity={1.5} color="#c084fc" />
        <pointLight position={[-6, -4, -4]} intensity={2} color="#06b6d4" />
        <pointLight position={[0, 4, 2]} intensity={1.8} color="#ffffff" />

        <Rig />
        <ParticleField />
        <QuantumCore activeSkill={selectedSkill} />

        {/* Orbiting skill nodes */}
        <OrbitNode
          radius={2.4}
          speed={0.45}
          initialAngle={0}
          label="AI Engineering"
          color="#a855f7"
          iconSymbol="AI"
          onSelectNode={handleSelect}
          isSelected={selectedSkill === "AI Engineering"}
        />
        <OrbitNode
          radius={2.9}
          speed={0.35}
          initialAngle={Math.PI * 0.6}
          label="Full-Stack Web"
          color="#38bdf8"
          iconSymbol="FS"
          onSelectNode={handleSelect}
          isSelected={selectedSkill === "Full-Stack Web"}
        />
        <OrbitNode
          radius={3.3}
          speed={0.28}
          initialAngle={Math.PI * 1.2}
          label="Cloud & DevOps"
          color="#34d399"
          iconSymbol="OPS"
          onSelectNode={handleSelect}
          isSelected={selectedSkill === "Cloud & DevOps"}
        />
        <OrbitNode
          radius={2.7}
          speed={0.38}
          initialAngle={Math.PI * 1.7}
          label="System Design & DSA"
          color="#ec4899"
          iconSymbol="SYS"
          onSelectNode={handleSelect}
          isSelected={selectedSkill === "System Design & DSA"}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
}
