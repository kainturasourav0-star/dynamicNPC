"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  Cpu, 
  Layers, 
  ArrowRight, 
  Bot,
  Gamepad2
} from "lucide-react";

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

export default function HomePage() {
  const [cursorHover, setCursorHover] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const [scrolledY, setScrolledY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setMouseDown(true);
    const handleMouseUp = () => setMouseDown(false);
    const handleScroll = () => setScrolledY(window.scrollY);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("scroll", handleScroll);

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".reveal-up, .reveal-kinetic");
    animatedElements.forEach(el => observer.observe(el));

    // Staggered hero entrance
    setTimeout(() => {
      const firstSectionEl = document.querySelectorAll("section:first-of-type .reveal-up");
      firstSectionEl.forEach(el => {
        el.classList.add("active");
        (el as HTMLElement).style.filter = "blur(0px)";
        (el as HTMLElement).style.transform = "translateY(0) scale(1)";
      });
    }, 100);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const hoverIn = () => setCursorHover(true);
  const hoverOut = () => setCursorHover(false);

  return (
    <div className="font-sans antialiased bg-[#050505] text-[#e5e2e1] min-h-screen overflow-x-hidden cursor-none selection:bg-cyan-500/30 selection:text-white">
      
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

      {/* Style overrides block */}
      <style jsx global>{`
        body {
          cursor: none !important;
        }
        .reveal-up {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-up.active {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-kinetic {
          opacity: 0;
          transform: perspective(1000px) translateY(50px) rotateX(10deg);
          transition: all 1.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-kinetic.active {
          opacity: 1;
          transform: perspective(1000px) translateY(0) rotateX(0deg);
        }
        .hero-title-gradient {
          background: linear-gradient(to bottom, #ffffff 0%, rgba(255, 255, 255, 0.4) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-12 md:px-16 h-20 bg-[#050505]/40 backdrop-blur-2xl border-b border-white/5">
        <Link 
          href="/dashboard" 
          onMouseEnter={hoverIn} 
          onMouseLeave={hoverOut}
          className="text-lg md:text-xl font-black tracking-tighter text-[#e5e2e1] hover:text-cyan-400 transition"
        >
          NPC-402
        </Link>
        <div className="hidden md:flex gap-8 font-mono text-[10px] uppercase tracking-[0.25em]">
          <Link href="/login" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="text-cyan-400 font-bold border-b border-cyan-400 pb-1">Protocol</Link>
          <Link href="/dashboard/sandbox" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="text-[#bcc9cd] hover:text-white transition">Inspector</Link>
          <Link href="/dashboard/docs" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="text-[#bcc9cd] hover:text-white transition">Docs</Link>
          <Link href="/dashboard/game" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="text-[#bcc9cd] hover:text-white transition">Network</Link>
        </div>
        <Link 
          href="/login" 
          onMouseEnter={hoverIn} 
          onMouseLeave={hoverOut}
          className="bg-cyan-400 text-[#003640] font-mono text-[10px] uppercase px-8 py-3 tracking-widest hover:bg-white hover:text-black transition active:scale-95 duration-350 rounded-none font-bold"
        >
          Connect
        </Link>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="relative z-10 text-center px-12 md:px-16 w-full max-w-[1440px] mx-auto">
            <p className="font-mono text-cyan-400 text-xs uppercase tracking-[0.6em] mb-8 reveal-up" style={{ transitionDelay: "200ms", filter: "blur(5px)" }}>
              Autonomous Intelligence Engine
            </p>
            <h1 className="text-6xl md:text-[120px] font-black uppercase tracking-tighter leading-[0.95] reveal-up mb-4" style={{ transitionDelay: "400ms" }}>
              <span className="hero-title-gradient">Crafting</span> <br/>
              <span className="text-cyan-400">Meaningful</span> <br/>
              <span className="hero-title-gradient">Protocols</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12 reveal-up" style={{ transitionDelay: "600ms", filter: "blur(2px)" }}>
              <div className="max-w-md text-[#bcc9cd] text-sm md:text-base text-left md:text-center border-l-2 md:border-l-0 md:border-t-2 border-cyan-500/30 pl-6 md:pl-0 md:pt-6 leading-relaxed">
                NPC-402 is an independent AI dialogue engine powering the next generation of games through strategy, design, and EIP-191 payment settlements.
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-12 reveal-up" style={{ transitionDelay: "800ms" }}>
              <Link 
                href="/login" 
                onMouseEnter={hoverIn} 
                onMouseLeave={hoverOut}
                className="px-12 py-5 bg-white text-black font-mono text-[11px] uppercase tracking-widest font-bold hover:scale-105 transition-transform duration-300 rounded-none cursor-none"
              >
                Let's Talk
              </Link>
              <Link 
                href="/dashboard" 
                onMouseEnter={hoverIn} 
                onMouseLeave={hoverOut}
                className="px-12 py-5 border border-white/20 text-white font-mono text-[11px] uppercase tracking-widest hover:bg-white/10 transition-colors duration-300 rounded-none cursor-none"
              >
                Console Playground
              </Link>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 reveal-up" style={{ transitionDelay: "1200ms" }}>
            <span className="font-mono text-white/40 uppercase tracking-[0.3em] text-[10px]">Scroll to explore</span>
            <div className="w-[1px] h-20 bg-gradient-to-b from-cyan-400 to-transparent"></div>
          </div>
        </section>

        {/* The Philosophy Section */}
        <section className="py-24 px-12 md:px-16 max-w-[1440px] mx-auto reveal-kinetic">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <span className="font-mono text-cyan-400 uppercase mb-4 block tracking-[0.2em] text-xs">Our Philosophy</span>
              <h2 className="text-5xl md:text-7xl font-extrabold leading-[0.9] tracking-tighter uppercase mb-8">
                We design for <br/> <span className="opacity-30">Longevity</span>
              </h2>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-[1px] bg-cyan-400"></div>
                <p className="font-mono text-xs uppercase tracking-tighter text-[#bcc9cd]">Clarity first, craft always, built to scale.</p>
              </div>
            </div>
            
            <div className="md:col-span-6 md:col-start-7 flex flex-col justify-end h-full mt-6 md:mt-0">
              <p className="text-base md:text-lg text-[#bcc9cd] leading-relaxed max-w-xl">
                Our mission is to make technology feel human by designing digital assets that are intuitive, purposeful, and cryptographically settled. We bypass conventional billing loops to create direct, player-aligned AI dialogue experiences.
              </p>
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <span className="text-5xl md:text-7xl block text-cyan-400 font-extrabold leading-none tracking-tighter">402</span>
                  <span className="font-mono text-[10px] uppercase text-white/50 tracking-widest mt-1 block">Core Modules</span>
                </div>
                <div>
                  <span className="text-5xl md:text-7xl block text-cyan-400 font-extrabold leading-none tracking-tighter">0.2s</span>
                  <span className="font-mono text-[10px] uppercase text-white/50 tracking-widest mt-1 block">Response Latency</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid section */}
        <section className="py-24 px-12 md:px-16 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto space-y-8">
            <div className="mb-16 reveal-kinetic">
              <h3 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-none">
                System <span className="text-cyan-400 italic">Interoperability</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Module 1: Inspector Card */}
              <div 
                className="md:col-span-2 bg-[#0c0c0c]/40 backdrop-blur-2xl border border-white/10 p-8 md:p-12 flex flex-col justify-between reveal-kinetic relative group transition-all duration-500 hover:border-cyan-400 hover:bg-[#141414]/60 hover:scale-[1.01]"
                style={{
                  transform: `translateY(${scrolledY * 0.02}px)`
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-cyan-400 text-xs uppercase block mb-2 tracking-widest">Module 01</span>
                    <h4 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">Protocol Inspector</h4>
                  </div>
                  <ArrowUpRight className="text-cyan-400 group-hover:rotate-45 transition-transform duration-500 w-8 h-8" />
                </div>

                {/* Simulated HUD Log */}
                <div className="relative w-full h-[250px] mt-12 bg-black/40 border border-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-x-6 bottom-6 p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded font-mono text-[10px] text-cyan-400/80">
                    <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                      <span>SYSTEM_STATUS: STABLE</span>
                      <span>X402_LINK: ACTIVE</span>
                    </div>
                    <div className="space-y-1">
                      <p>&gt; FETCHING DIALOGUE_NODES...</p>
                      <p>&gt; ANALYZING SENTIMENT_VECTOR [0.942]</p>
                      <p className="text-white">&gt; PROTOCOL_HANDSHAKE: SUCCESSFUL</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Stack Stats Cards */}
              <div className="flex flex-col gap-8">
                {/* Stat block 1 */}
                <div className="bg-[#0c0c0c]/40 backdrop-blur-2xl border border-white/10 p-8 flex-1 reveal-kinetic transition-all duration-500 hover:border-cyan-400 hover:bg-[#141414]/60 hover:scale-[1.01]" style={{ transitionDelay: "200ms" }}>
                  <Cpu className="text-cyan-400 mb-4 w-8 h-8" />
                  <h5 className="font-mono text-[11px] uppercase font-bold mb-3 tracking-widest text-slate-200">Neural Architecture</h5>
                  <p className="text-[#bcc9cd] text-xs md:text-sm leading-relaxed">Self-evolving weights and fallback routing that adapts to player intent in real-time.</p>
                </div>
                {/* Stat block 2 */}
                <div className="bg-[#0c0c0c]/40 backdrop-blur-2xl border border-white/10 p-8 flex-1 reveal-kinetic transition-all duration-500 hover:border-cyan-400 hover:bg-[#141414]/60 hover:scale-[1.01]" style={{ transitionDelay: "400ms" }}>
                  <Layers className="text-lime-400 mb-4 w-8 h-8" />
                  <h5 className="font-mono text-[11px] uppercase font-bold mb-3 tracking-widest text-slate-200">Ecosystem Hub</h5>
                  <p className="text-[#bcc9cd] text-xs md:text-sm leading-relaxed">Cross-chain dialogue persistence and EIP-191 cryptographic verification across games.</p>
                </div>
              </div>
            </div>

            {/* Game Viewport Card */}
            <div 
              className="bg-[#0c0c0c]/40 backdrop-blur-2xl border border-white/10 p-4 md:p-8 reveal-kinetic transition-all duration-500 hover:border-cyan-400 hover:bg-[#141414]/60" 
              style={{ transitionDelay: "300ms" }}
            >
              <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-lg group">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                <div 
                  className="w-full h-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-[2000ms]"
                  style={{
                    backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuDUf0rxVyl0BY93lYCUFfrb_c7AZsYbYKo4uXOSJE41fQ9zoBAPynYU82U1X4fvaYoNHby4AGm8XtYAHPjBhti8BgmZiba_3bAd9686Eq8-gv1ipHHo7lQiglgPtysnw_VPosQhyYCXWZYC6ks8jzrvVMtuhJWHfbHg5s9TS6pN7WGaDlVekIfBzCwkpHvVZ5k3XNVadAmbzRx7-tkVzURqz-Fvxc7PGQ644QPH_zRy7JU7RYGJQYrwpw)",
                    transform: `translateY(${scrolledY * 0.04}px)`
                  }}
                />
                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-20">
                  <span className="font-mono text-cyan-400 text-[10px] uppercase mb-2 block tracking-[0.25em]">Live Town Simulation</span>
                  <h4 className="text-3xl md:text-6xl font-extrabold uppercase leading-none tracking-tighter text-white flex items-center gap-3">
                    <Gamepad2 className="w-8 h-8 md:w-12 md:h-12 text-cyan-400 animate-pulse" />
                    Game Viewport
                  </h4>
                </div>
                <div className="absolute top-6 right-6 z-20 flex gap-2">
                  <div className="px-3 py-1 bg-cyan-400 text-black font-mono text-[9px] uppercase font-bold">4K RAW</div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white font-mono text-[9px] uppercase">60 FPS</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-12 md:px-16 text-center relative z-10">
            <h2 className="text-5xl md:text-[120px] font-black uppercase mb-12 reveal-kinetic tracking-tighter leading-none">
              Ready to <br/> <span className="text-cyan-400 italic">Sync?</span>
            </h2>
            <div className="reveal-up mt-12" style={{ transitionDelay: "200ms" }}>
              <a 
                href="mailto:hello@npc-402.protocol" 
                onMouseEnter={hoverIn} 
                onMouseLeave={hoverOut}
                className="inline-block group cursor-none"
              >
                <div className="flex items-center gap-6 md:gap-8 justify-center">
                  <span className="text-3xl md:text-7xl font-black group-hover:text-cyan-400 transition-colors tracking-tighter uppercase text-[#e5e2e1]">
                    HELLO@NPC-402
                  </span>
                  <div className="w-20 h-20 md:w-28 md:h-28 border-2 border-white rounded-full flex items-center justify-center group-hover:bg-cyan-400 group-hover:border-cyan-400 transition-all duration-300">
                    <ArrowRight className="w-8 h-8 text-white group-hover:text-black transition-transform group-hover:scale-125 duration-300" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="relative w-full border-t border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center py-10 px-12 md:px-16 max-w-[1440px] mx-auto text-center md:text-left gap-6">
          <div className="flex flex-col">
            <div className="text-2xl font-black tracking-tighter text-[#e5e2e1]">NPC-402</div>
            <div className="font-mono text-[9px] text-[#bcc9cd] tracking-widest mt-1 uppercase">
              ©{new Date().getFullYear()} NPC-402 PROTOCOL. ALL RIGHTS RESERVED.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#bcc9cd]">
            <Link href="/login" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="hover:text-cyan-400 transition">Terms</Link>
            <Link href="/login" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="hover:text-cyan-400 transition">Privacy</Link>
            <Link href="/login" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="hover:text-cyan-400 transition">Status: <span className="text-cyan-400">Active</span></Link>
            <a href="https://github.com/kainturasourav0-star/dynamicNPC" target="_blank" rel="noopener noreferrer" onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="hover:text-cyan-400 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
