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
  Plus,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity,
  icons
} from "lucide-react";

const Search = icons.Search;
import { WalletConnectButton } from "@/components/WalletConnectButton";

interface Project {
  id: string;
  name: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  let signOut = async () => {};
  try {
    const clerk = useClerk();
    if (clerk?.signOut) signOut = clerk.signOut;
  } catch (e) {}

  let userEmail = "developer@npc402.io";
  try {
    const clerkUser = useUser();
    if (clerkUser?.user?.primaryEmailAddress?.emailAddress) {
      userEmail = clerkUser.user.primaryEmailAddress.emailAddress;
    }
  } catch (e) {}

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [showProjDropdown, setShowProjDropdown] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [showAddProjModal, setShowAddProjModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCommandSearch, setShowCommandSearch] = useState(false);
  const [blockNum, setBlockNum] = useState(18492317);

  // Live block ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNum(prev => prev + 1 + Math.floor(Math.random() * 3));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

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

  const navigationGroups = [
    {
      group: "CORE PLATFORM",
      items: [
        { name: "Overview", path: "/dashboard#overview", icon: LayoutDashboard },
        { name: "NPC Profiles", path: "/dashboard#profiles", icon: Bot },
        { name: "Dialogue Logs", path: "/dashboard#logs", icon: Terminal },
      ]
    },
    {
      group: "INTELLIGENCE & AI",
      items: [
        { name: "OmniVoice Studio", path: "/dashboard#voice", icon: Volume2, badge: "Neural" },
        { name: "Dialogue Sandbox", path: "/dashboard#sandbox", icon: Play },
        { name: "Interactive Demo", path: "/dashboard#demo", icon: Gamepad2 },
      ]
    },
    {
      group: "DEVELOPER TOOLS",
      items: [
        { name: "API Keys", path: "/dashboard#keys", icon: Key },
        { name: "Integrations", path: "/dashboard#integrations", icon: Cpu },
        { name: "Documentation", path: "/dashboard#docs", icon: BookOpen },
      ]
    }
  ];

  const allItems = navigationGroups.flatMap(g => g.items);

  const searchFilteredItems = allItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#060A13] text-[#E8EEF9] font-sans selection:bg-[#35E0F5] selection:text-black relative overflow-x-hidden">
      {/* Dynamic Ambient Background Shimmer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(680px_420px_at_12%_-8%,rgba(53,224,245,0.09),transparent_62%),radial-gradient(720px_480px_at_92%_4%,rgba(154,140,255,0.08),transparent_60%),radial-gradient(600px_500px_at_55%_110%,rgba(61,220,151,0.05),transparent_65%)]" />
      </div>

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ─── Luxury Desktop Sidebar (Width 252px) ─────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[252px] bg-gradient-to-b from-[#090F1C] to-[#070C16] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-[38px] h-[38px] rounded-[11px] bg-gradient-to-br from-[rgba(53,224,245,0.18)] to-[rgba(154,140,255,0.18)] border border-[rgba(53,224,245,0.35)] shadow-[0_0_18px_rgba(53,224,245,0.22)] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#35E0F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <circle cx="12" cy="12" r="2.5"/>
                  <path d="M12 9.5V7M12 17v-2.5M9.5 12H7M17 12h-2.5"/>
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-[#E8EEF9] text-base tracking-tight flex items-center gap-1.5">
                  NPC-402
                  <span className="font-mono text-[9.5px] font-semibold text-[#35E0F5] bg-[rgba(53,224,245,0.11)] border border-[rgba(53,224,245,0.3)] px-1.5 py-0.5 rounded-[5px]">
                    v2.4
                  </span>
                </div>
                <p className="text-[8.5px] font-mono tracking-[0.24em] text-[#5E6E89] uppercase font-bold mt-0.5">
                  NEURAL DIALOGUE PROTOCOL
                </p>
              </div>
            </Link>
          </div>

          {/* Project Switcher */}
          <div className="px-4 pb-2">
            <div className="relative">
              <div className="text-[9px] font-mono tracking-[0.22em] text-[#5E6E89] font-bold px-2 pb-1.5 flex items-center gap-1.5">
                <span className="pulse-dot-cyan"></span>
                ACTIVE REALM
              </div>
              <button
                onClick={() => setShowProjDropdown(!showProjDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] bg-[#0C1322] hover:bg-[#101A2E] border border-white/[0.08] hover:border-white/[0.18] transition-colors text-left"
              >
                <span className="text-xs font-semibold text-[#E8EEF9] truncate">
                  {activeProjectName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#5E6E89] transition-transform duration-200 flex-shrink-0 ${showProjDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Project Dropdown */}
              {showProjDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-[12px] bg-[#0D121B] border border-white/[0.14] shadow-2xl p-2 space-y-1 backdrop-blur-2xl">
                  <div className="px-3 py-1.5 text-[10px] font-mono text-[#5E6E89] uppercase tracking-wider border-b border-white/[0.06] flex items-center justify-between">
                    <span>Switch Active Realm</span>
                    <span>{projects.length} Total</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1 py-1">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchProject(p.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                          p.id === activeProjectId
                            ? "bg-[#35E0F5]/15 text-[#35E0F5] font-bold border border-[#35E0F5]/35"
                            : "text-[#9AA8C0] hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {p.id === activeProjectId && <span className="w-1.5 h-1.5 rounded-full bg-[#35E0F5] shadow-[0_0_6px_#35E0F5]" />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowProjDropdown(false);
                      setShowAddProjModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#35E0F5]/10 hover:bg-[#35E0F5]/20 text-[#35E0F5] text-xs font-semibold transition border border-[#35E0F5]/30 mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Realm</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-5">
            {navigationGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="px-3 text-[9px] font-mono font-bold tracking-[0.22em] text-[#5E6E89] uppercase">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all text-[#9AA8C0] hover:text-white hover:bg-white/[0.06] group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-[#5E6E89] group-hover:text-[#35E0F5] transition-colors flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#9A8CFF]/20 text-[#9A8CFF] border border-[#9A8CFF]/30">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Account & Status Ticker */}
          <div className="p-3 border-t border-white/[0.08] space-y-2 bg-[#070C16]">
            <div className="p-3 rounded-[12px] bg-[#0C1322] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#9AA8C0]">
                <span className="pulse-dot-green"></span>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-[#5E6E89]">
                <Activity className="w-3 h-3 text-[#35E0F5]" />
                <span>Base Sepolia · </span>
                <span className="text-[#35E0F5] font-bold">{blockNum.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-[10px] bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#35E0F5]/20 border border-[#35E0F5]/30 flex items-center justify-center text-[#35E0F5] text-xs font-mono font-bold flex-shrink-0">
                  {userEmail[0].toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-[#5E6E89] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 px-6 sm:px-8 bg-[#060A13]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9AA8C0] hover:text-white"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#5E6E89]">NPC-402</span>
              <span className="text-[#5E6E89]/60">/</span>
              <span className="text-[#9AA8C0]">{activeProjectName}</span>
              <span className="text-[#5E6E89]/60">/</span>
              <span className="text-[#35E0F5] font-semibold">Control Center</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div 
              onClick={() => setShowCommandSearch(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#0C1322] border border-white/[0.08] text-[#5E6E89] hover:border-[#35E0F5]/40 transition-colors cursor-pointer w-52"
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs text-[#5E6E89]">Search personas…</span>
              <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">⌘K</kbd>
            </div>

            {/* Base Sepolia Pulse */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#0C1322] border border-white/[0.08] text-[#9AA8C0] text-xs font-mono">
              <span className="pulse-dot-green"></span>
              <span>Base Sepolia: <b className="text-[#3DDC97]">Live</b></span>
            </div>

            {/* Neural Studio Link */}
            <Link
              href="/dashboard#voice"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-[#9AA8C0] hover:text-white text-xs font-semibold transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#35E0F5]" />
              <span>Neural Studio</span>
            </Link>

            <WalletConnectButton />
          </div>
        </header>

        {/* Spacious Main Body */}
        <main className="flex-1 py-8 px-6 sm:px-8 max-w-[1560px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ─── Command Search Modal (⌘K) ────────────────────────────────────── */}
      {showCommandSearch && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0D121B] border border-white/[0.14] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#35E0F5]" />
              <input
                type="text"
                placeholder="Search personas, logs, endpoints…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none font-sans"
                autoFocus
              />
              <button onClick={() => setShowCommandSearch(false)} className="text-xs text-[#5E6E89] hover:text-white px-2 py-1 rounded bg-white/[0.05]">
                ESC
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              {searchFilteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setShowCommandSearch(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] text-[#9AA8C0] hover:text-[#35E0F5] transition text-xs font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#35E0F5]" />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#5E6E89]">{item.path}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Project Modal ──────────────────────────────────────────────── */}
      {showAddProjModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0D121B] border border-white/[0.14] rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white font-display">Create Realm / Project</h3>
              <p className="text-xs text-[#5E6E89] leading-relaxed font-sans">
                Each realm manages its own independent NPC dialogue state, API keys, and memory RAG partitions.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#9AA8C0] mb-2 uppercase tracking-wider">
                  Project / Game Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chronicles of Aethelgard"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#06080C] border border-white/[0.12] text-white text-sm focus:outline-none focus:border-[#35E0F5] focus:ring-1 focus:ring-[#35E0F5] transition font-sans"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-xs font-semibold text-[#9AA8C0] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#35E0F5] to-[#2F8CF6] hover:brightness-110 disabled:opacity-40 text-black text-xs font-bold transition shadow-lg shadow-[#35E0F5]/25"
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
