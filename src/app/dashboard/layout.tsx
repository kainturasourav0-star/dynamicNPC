"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { 
  Bot, 
  Key, 
  Terminal, 
  BookOpen, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown,
  Play,
  Gamepad2,
  Volume2,
  Cpu,
  Plus
} from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";

interface Project {
  id: string;
  name: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [showProjDropdown, setShowProjDropdown] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [showAddProjModal, setShowAddProjModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.status === "success" && data.projects?.length > 0) {
        setProjects(data.projects);
        const activeId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("projectId="))
          ?.split("=")[1];
        
        if (activeId && data.projects.some((p: Project) => p.id === activeId)) {
          setActiveProjectId(activeId);
        } else {
          setActiveProjectId(data.projects[0].id);
        }
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
        window.location.reload();
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
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeProjectName = activeProject?.name || "Cyberpunk Realm RPG";

  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "NPC Profiles", path: "/dashboard/npcs", icon: Bot },
    { name: "Dialogue Sandbox", path: "/dashboard/sandbox", icon: Play },
    { name: "Interactive Demo", path: "/dashboard/game", icon: Gamepad2 },
    { name: "API Keys", path: "/dashboard/keys", icon: Key },
    { name: "Dialogue Logs", path: "/dashboard/logs", icon: Terminal },
    { name: "OmniVoice Studio", path: "/dashboard/voice-agent", icon: Volume2 },
    { name: "Integrations", path: "/dashboard/integrations", icon: Cpu },
    { name: "Documentation", path: "/dashboard/docs", icon: BookOpen },
  ];

  const currentRouteName = menuItems.find(m => m.path === pathname)?.name || "Console";

  return (
    <div className="flex min-h-screen bg-[#07090C] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Subtle Ambient Background Light */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/[0.02] rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ─── Modern Desktop Sidebar (Width 250px) ─────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[250px] bg-[#0B0F14] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo & Header */}
          <div className="p-5 pb-4 border-b border-white/[0.08]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-150">
                <div className="w-full h-full bg-[#07090C] rounded-[6px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">
                    NPC-402
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-medium">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  AI Dialogue Infrastructure
                </p>
              </div>
            </Link>
          </div>

          {/* Project / Workspace Switcher */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5 font-semibold px-1">
              Workspace
            </span>
            <div className="relative">
              <button
                onClick={() => setShowProjDropdown(!showProjDropdown)}
                className="w-full flex items-center justify-between bg-[#0F141A] hover:bg-[#121820] border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-150 px-3 py-2 rounded-xl text-xs text-left text-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" />
                  <span className="truncate font-medium">{activeProjectName}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 flex-shrink-0 ${showProjDropdown ? "rotate-180" : ""}`} />
              </button>

              {showProjDropdown && (
                <div className="absolute left-0 right-0 mt-1.5 bg-[#0F141A] border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden py-1.5 backdrop-blur-xl animate-in fade-in duration-100">
                  <div className="max-h-48 overflow-y-auto">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => handleSwitchProject(proj.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-cyan-500/10 transition-colors ${
                          proj.id === activeProjectId ? "text-cyan-400 bg-cyan-500/10 font-bold" : "text-slate-300"
                        }`}
                      >
                        <span className="truncate">{proj.name}</span>
                        {proj.id === activeProjectId && <span className="text-[9px] font-mono text-cyan-400">ACTIVE</span>}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/10 p-1.5 mt-1">
                    <button
                      onClick={() => { setShowProjDropdown(false); setShowAddProjModal(true); }}
                      className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center gap-1.5 border border-cyan-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? "bg-cyan-500/10 text-white font-semibold border border-cyan-500/25 shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Area: Operational Status & User Profile */}
          <div className="p-3 border-t border-white/[0.08] space-y-2 bg-[#0B0F14]">
            {/* System Status Pill */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-slate-300 font-sans text-xs">System Operational</span>
              </div>
              <span className="text-[10px] text-slate-500">99.99%</span>
            </div>

            {/* User Profile Card */}
            <div className="p-2.5 rounded-xl bg-[#0F141A] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs flex-shrink-0">
                  {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "D"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.fullName || user?.firstName || "Developer"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">
                    {user?.primaryEmailAddress?.emailAddress || "developer@npc402.dev"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#07090C]/90 backdrop-blur-xl border-b border-white/[0.08] px-6 sm:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-cyan-400 bg-white/5 border border-white/10"
              aria-label="Open sidebar"
            >
              ☰
            </button>
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Console</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-semibold">{currentRouteName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live x402 Protocol Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span>x402 Connected</span>
            </div>

            {/* Wallet Connect Button */}
            <WalletConnectButton />
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>

      {/* Create Project Modal */}
      {showAddProjModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F141A] border border-white/15 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-white mb-1.5">Create New Project</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Set up an isolated game environment with dedicated NPC profiles, dialogue histories, and API credentials.
            </p>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Realm RPG"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition placeholder-slate-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium rounded-xl border border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


