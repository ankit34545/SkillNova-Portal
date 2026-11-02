// src/lib/code-runner.ts
// Secure Code Execution Engine with Sandboxing, Isolation & Provider Architecture
// Supported Execution Providers:
// 1. Client-Side Sandboxed Iframe (HTML/CSS/JavaScript with postMessage communication & DOM isolation)
// 2. Extensible WebAssembly / Isolated Worker for Python (Pyodide in browser)
// 3. Isolated Backend Container / Judge0 Provider interface for compiled languages (C, C++, Java, Rust, Go)

export interface CodeExecutionRequest {
  language: string;
  files: Record<string, string>; // path -> content
  mainFile?: string;
  stdin?: string;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryKb?: number;
  status: "success" | "runtime_error" | "compile_error" | "timeout" | "unsupported_runtime";
  isPreviewable?: boolean;
}

export interface LanguageRuntimeDefinition {
  id: string;
  name: string;
  version: string;
  extension: string;
  monacoLanguage: string;
  templateFiles: Record<string, string>;
  isExecutionSupported: boolean;
  executionEnvironment: "browser_sandbox" | "browser_wasm" | "container_isolated";
  statusNotice?: string;
}

export const LANGUAGE_REGISTRY: Record<string, LanguageRuntimeDefinition> = {
  javascript: {
    id: "javascript",
    name: "JavaScript (Node/ES6)",
    version: "ES2022",
    extension: "js",
    monacoLanguage: "javascript",
    isExecutionSupported: true,
    executionEnvironment: "browser_sandbox",
    templateFiles: {
      "index.js": `// SkillNova CodingLab - JavaScript
function main() {
  console.log("Hello from SkillNova CodingLab!");
  const numbers = [1, 2, 3, 4, 5];
  const doubled = numbers.map(n => n * 2);
  console.log("Doubled array:", doubled);
}

main();
`,
    },
  },
  html: {
    id: "html",
    name: "HTML5 / Web Canvas",
    version: "HTML5 / CSS3 / ES6",
    extension: "html",
    monacoLanguage: "html",
    isExecutionSupported: true,
    executionEnvironment: "browser_sandbox",
    templateFiles: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkillNova Web Project</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      margin: 0;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    button {
      background: #06b6d4;
      color: #000;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>SkillNova Interactive Preview</h1>
    <p>Live reload enabled. Edit HTML, CSS, or JS in CodingLab!</p>
    <button onclick="alert('Hello from sandboxed iframe!')">Click Me</button>
  </div>
</body>
</html>`,
    },
  },
  python: {
    id: "python",
    name: "Python 3",
    version: "3.11",
    extension: "py",
    monacoLanguage: "python",
    isExecutionSupported: true,
    executionEnvironment: "browser_wasm",
    templateFiles: {
      "main.py": `# SkillNova CodingLab - Python
import sys

def solve():
    print(f"Python Runtime initialized successfully! Version: {sys.version.split()[0]}")
    languages = ["Python", "JavaScript", "C++", "Java"]
    print("Available tracks:", ", ".join(languages))

if __name__ == "__main__":
    solve()
`,
    },
  },
  cpp: {
    id: "cpp",
    name: "C++ (GCC)",
    version: "C++20",
    extension: "cpp",
    monacoLanguage: "cpp",
    isExecutionSupported: false,
    executionEnvironment: "container_isolated",
    statusNotice: "C++ container execution requires Judge0 or custom Docker backend. Use Web/Python tracks for zero-install client execution.",
    templateFiles: {
      "main.cpp": `#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello from SkillNova C++ Track!" << std::endl;
    std::vector<int> v = {10, 20, 30};
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    return 0;
}
`,
    },
  },
  java: {
    id: "java",
    name: "Java (OpenJDK)",
    version: "17 LTS",
    extension: "java",
    monacoLanguage: "java",
    isExecutionSupported: false,
    executionEnvironment: "container_isolated",
    statusNotice: "Java compilation requires Judge0 or Docker runner. Web/Python tracks are fully live.",
    templateFiles: {
      "Main.java": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from SkillNova Java Track!");
    }
}
`,
    },
  },
};

