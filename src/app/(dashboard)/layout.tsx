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
  ChevronDown
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
    { name: "API Keys", path: "/dashboard/keys", icon: Key },
    { name: "Dialogue Logs", path: "/dashboard/logs", icon: Terminal },
    { name: "Integrations & Docs", path: "/dashboard/docs", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Dynamic NPC
              </span>
              <div className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">
                x402 AI Engine
              </div>
            </div>
          </div>

          {/* Project Selector */}
          <div className="p-4 relative">
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1 px-1">
              Active Project
            </label>
            <button
              onClick={() => setShowProjDropdown(!showProjDropdown)}
              className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 transition px-3 py-2 rounded-lg text-sm text-left text-slate-300"
            >
              <span className="flex items-center gap-2 truncate">
                <FolderGit2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {activeProjectName}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {showProjDropdown && (
              <div className="absolute left-4 right-4 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 overflow-hidden">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleSwitchProject(proj.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-800 transition ${
                      proj.id === activeProjectId ? "text-indigo-400 bg-slate-800/40" : "text-slate-300"
                    }`}
                  >
                    {proj.name}
                  </button>
                ))}
                <div className="border-t border-slate-800 p-2">
                  <button
                    onClick={() => setShowAddProjModal(true)}
                    className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 py-1.5 rounded text-xs transition font-semibold"
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-[0_0_10px_rgba(79,70,229,0.1)]"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {children}
      </main>

      {/* Create Project Modal */}
      {showAddProjModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-96 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-100 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My RPG Game"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-semibold transition"
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
