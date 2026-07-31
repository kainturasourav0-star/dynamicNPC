"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Bot } from "lucide-react";

// WebGL Background Shader Component
const WebGLShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexSource = `
        attribute vec2 position;
        varying vec2 v_texCoord;
        void main() {
            v_texCoord = position * 0.5 + 0.5;
            v_texCoord.y = 1.0 - v_texCoord.y;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentSource = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 v_texCoord;

        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = v_texCoord;
            vec2 p = (uv - 0.5) * 2.0;
            p.x *= u_resolution.x / u_resolution.y;

            float time = u_time * 0.1;
            
            vec3 color1 = vec3(0.02, 0.45, 0.55); // Cyan
            vec3 color2 = vec3(0.01, 0.02, 0.05); // Deep Space
            
            float d = length(p);
            float glow = exp(-d * 0.5);
            
            float wave = sin(p.y * 3.0 + p.x * 2.0 + time * 5.0) * 0.5 + 0.5;
            float wave2 = sin(p.x * 2.0 - p.y * 1.5 - time * 3.0) * 0.5 + 0.5;
            
            vec3 finalColor = mix(color2, color1 * 0.15, glow);
            finalColor += color1 * wave * wave2 * 0.05;
            
            float n = noise(uv + time);
            finalColor += n * 0.02;
            
            finalColor *= smoothstep(1.5, 0.5, d);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

  function createShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    if (!program) return;
    
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return;
    
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    let animFrameId: number;

    const render = (time: number) => {
        if (!canvas || !gl) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, time * 0.001);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas || !gl) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} id="shader-canvas" className="w-full h-full block" />;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cursorHover, setCursorHover] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseDown = () => setMouseDown(true);
    const handleMouseUp = () => setMouseDown(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const hoverIn = () => setCursorHover(true);
  const hoverOut = () => setCursorHover(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.status === "success") {
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans cursor-none select-none">
      
      {/* WebGL Animated shader container */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <WebGLShaderBackground />
      </div>

      {/* Tactile Noise/Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.05]"
        style={{
          backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCkNZnNYfMvGB1Jbrdm9wXJghpQfyt3Ib43cagXrRxohi0K8ftTSbfnNaOZ38UpMz2ONIYgKBKmj-yvzglZMTcsLzFF3-jG6h_L3-9OyZKKoQ6QIanmVZjFx_syO7GwNAeqI9TUbSKr1qkipYhtNvi918shsaa6pynC3-WMXmY3kpSeTz4jGQsiJLvWkI6s511Q2k-WJDUcbhvQtTGEY8TRlI9afwbYUxBczwdSw-ICtvP61bPCh0k7kA)"
        }}
      />

      {/* Custom Circular Cursor */}
      <div 
        className={`fixed pointer-events-none z-[10000] rounded-full border border-white mix-blend-difference transition-transform duration-150 ease-out hidden md:block ${
          cursorHover ? "scale-[4] bg-white" : ""
        } ${mouseDown ? "scale-[0.8]" : ""}`}
        style={{
          width: "20px",
          height: "20px",
          left: `${cursorPos.x - 10}px`,
          top: `${cursorPos.y - 10}px`,
        }}
      />

      <style jsx global>{`
        body {
          cursor: none !important;
        }
      `}</style>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo and title */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-cyan-400 p-3 rounded-none text-black shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#e5e2e1]">
              NPC-402 Console
            </h1>
            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mt-1">
              Enter credentials below to access key profiles.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0c0c0c]/80 border border-white/10 rounded-none p-8 backdrop-blur-md shadow-2xl space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-none text-center font-bold font-mono uppercase">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Developer Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050505]/80 border border-white/10 rounded-none pl-10 pr-3 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050505]/80 border border-white/10 rounded-none pl-10 pr-3 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
              className="w-full bg-cyan-400 hover:bg-white hover:text-black text-black font-bold py-3.5 rounded-none text-xs font-mono uppercase tracking-widest transition flex items-center justify-center gap-2 duration-350 cursor-none"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
              ) : (
                <>
                  Enter Console
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-[10px] text-slate-500 pt-4 border-t border-white/5 font-mono uppercase tracking-wider flex justify-between">
            <span>New user? <Link href="/signup" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="text-cyan-400 hover:underline">Register</Link></span>
            <span>Auto-create enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
