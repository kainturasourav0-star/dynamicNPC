"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bot, 
  Key, 
  Terminal, 
  BookOpen, 
  LogOut, 
  LayoutDashboard, 
  FolderGit2,
  ChevronDown,
  Play,
  Gamepad2
} from "lucide-react";

interface Project {
  id: string;
  name: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [showProjDropdown, setShowProjDropdown] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [showAddProjModal, setShowAddProjModal] = useState(false);

  useEffect(() => {
    // Fetch projects on load
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.status === "success") {
        setProjects(data.projects);
        // Find active project from cookies or default to first
        const activeId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("projectId="))
          ?.split("=")[1];
        
        if (activeId) {
          setActiveProjectId(activeId);
        } else if (data.projects.length > 0) {
          setActiveProjectId(data.projects[0].id);
        }
      } else {
        // Redirect to login if unauthorized
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  const handleSwitchProject = async (id: string) => {
    try {
      const res = await fetch("/api/projects/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setActiveProjectId(id);
        setShowProjDropdown(false);
        window.location.reload(); // Reload to refresh active project context
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjName }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setProjects([...projects, data.project]);
        setActiveProjectId(data.project.id);
        setNewProjName("");
        setShowAddProjModal(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const activeProjectName = projects.find(p => p.id === activeProjectId)?.name || "Select Project...";

  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "NPC Profiles", path: "/dashboard/npcs", icon: Bot },
    { name: "Dialogue Sandbox", path: "/dashboard/sandbox", icon: Play },
    { name: "Interactive Demo Game", path: "/dashboard/game", icon: Gamepad2 },
    { name: "API Keys", path: "/dashboard/keys", icon: Key },
    { name: "Dialogue Logs", path: "/dashboard/logs", icon: Terminal },
    { name: "Integrations & Docs", path: "/dashboard/docs", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#e5e2e1] font-sans relative">
      {/* Tactile Noise/Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
        style={{
          backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCkNZnNYfMvGB1Jbrdm9wXJghpQfyt3Ib43cagXrRxohi0K8ftTSbfnNaOZ38UpMz2ONIYgKBKmj-yvzglZMTcsLzFF3-jG6h_L3-9OyZKKoQ6QIanmVZjFx_syO7GwNAeqI9TUbSKr1qkipYhtNvi918shsaa6pynC3-WMXmY3kpSeTz4jGQsiJLvWkI6s511Q2k-WJDUcbhvQtTGEY8TRlI9afwbYUxBczwdSw-ICtvP61bPCh0k7kA)"
        }}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-[#0c0c0c] border-r border-[#2F323B] flex flex-col justify-between z-10">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-[#2F323B] flex items-center gap-3">
            <div className="bg-cyan-400 p-2 rounded-none text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tighter text-white">
                NPC-402
              </span>
              <div className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">
                Protocol Console
              </div>
            </div>
          </div>

          {/* Project Selector */}
          <div className="p-4 relative">
            <label className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.2em] block mb-1 px-1">
              Active Project
            </label>
            <button
              onClick={() => setShowProjDropdown(!showProjDropdown)}
              className="w-full flex items-center justify-between bg-[#050505] border border-[#2F323B] hover:border-cyan-400 transition px-3 py-2.5 rounded-none text-xs text-left text-slate-300 font-mono"
            >
              <span className="flex items-center gap-2 truncate">
                <FolderGit2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                {activeProjectName}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {showProjDropdown && (
              <div className="absolute left-4 right-4 mt-1 bg-[#0c0c0c] border border-[#2F323B] rounded-none shadow-2xl z-20 overflow-hidden">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleSwitchProject(proj.id)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-mono hover:bg-cyan-500/10 hover:text-cyan-400 transition ${
                      proj.id === activeProjectId ? "text-cyan-400 bg-cyan-500/5 font-bold" : "text-slate-300"
                    }`}
                  >
                    {proj.name}
                  </button>
                ))}
                <div className="border-t border-[#2F323B] p-2 bg-[#050505]/40">
                  <button
                    onClick={() => setShowAddProjModal(true)}
                    className="w-full bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/20 py-2 rounded-none text-[10px] font-mono uppercase tracking-wider transition font-bold"
                  >
                    + Create Project
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider font-mono transition-all duration-200 border-l-2 rounded-none ${
                    isActive
                      ? "bg-[#141414] text-cyan-400 border-l-cyan-400 border-y-white/5 border-r-white/5 shadow-[0_0_15px_rgba(6,182,212,0.05)] font-bold"
                      : "text-slate-400 hover:bg-[#141414]/50 hover:text-white border-l-transparent border-y-transparent border-r-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-[#2F323B] bg-[#050505]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20 rounded-none"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#050505] p-8 z-10">
        {children}
      </main>

      {/* Create Project Modal */}
      {showAddProjModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#0c0c0c] border border-[#2F323B] p-8 rounded-none w-96 shadow-2xl relative">
            <h3 className="font-extrabold text-lg uppercase tracking-tight text-slate-100 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My RPG Game"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#050505] border border-[#2F323B] rounded-none px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition placeholder-slate-700"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProjModal(false)}
                  className="px-6 py-2.5 bg-[#141414] hover:bg-white/10 text-xs font-mono uppercase border border-white/5 rounded-none transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-white hover:text-black text-black text-xs font-mono uppercase font-bold rounded-none transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
