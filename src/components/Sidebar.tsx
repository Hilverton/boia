"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  LayoutGrid,
  Key,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Shapes,
  Globe,
  Lock,
  MoreVertical,
  Search,
  Trash2,
  Edit3,
  Copy,
  ShieldAlert,
  Folder,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectItem } from "@/types";
import { formatPriceBrl, formatRunwareCredits } from "@/data/models";

export type NavTab =
  | "studio"
  | "gallery"
  | "elements"
  | "favorites"
  | "vitrine"
  | "denied"
  | "help";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  openConfigModal: () => void;
  balance: number;
  projects: ProjectItem[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: () => void;
  onDeleteProject?: (id: string) => void;
  onRenameProject?: (id: string, newName: string) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  openConfigModal,
  balance,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
}: SidebarProps) {
  const [projectSearch, setProjectSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleCopyLink = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/p/${projectId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(projectId);
    setTimeout(() => {
      setCopiedId(null);
      setOpenMenuId(null);
    }, 1200);
  };

  const handleRename = (project: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const newName = window.prompt("Novo nome do projeto:", project.name);
    if (newName && newName.trim() && onRenameProject) {
      onRenameProject(project.id, newName.trim());
    }
  };

  const handleDelete = (project: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (
      window.confirm(
        `Excluir "${project.name}"?\nO projeto sai da lista. As gerações dele continuam em Minhas gerações.`
      )
    ) {
      if (onDeleteProject) {
        onDeleteProject(project.id);
      }
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[#1B2540] bg-[#0A1022]/95 backdrop-blur-md transition-all duration-300",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#1B2540] shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            onSelectProject(null);
            setActiveTab("studio");
          }}
        >
          {/* Official Boia Lifebuoy Icon */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#060A16] border border-[#283456] shadow-md shadow-black/40 overflow-hidden">
            <svg viewBox="0 0 32 32" className="h-6 w-6">
              <path
                fill="#0A1022"
                d="M7.2 0H24.8C28.78 0 32 3.22 32 7.2V24.8C32 28.78 28.78 32 24.8 32H7.2C3.22 32 0 28.78 0 24.8V7.2C0 3.22 3.22 0 7.2 0Z"
              />
              <path
                fill="#F2EDE4"
                d="M13.67 21.62C13.66 21.61 13.65 21.61 13.63 21.6C14.36 21.91 15.16 22.08 16 22.08C16.82 22.08 17.61 21.92 18.33 21.62L20.65 27.24C19.22 27.83 17.65 28.16 16 28.16C14.35 28.16 12.78 27.83 11.35 27.24ZM20.65 4.76 18.33 10.38C17.61 10.08 16.82 9.92 16 9.92C15.18 9.92 14.39 10.08 13.67 10.38L11.35 4.76C12.78 4.17 14.35 3.84 16 3.84C17.65 3.84 19.22 4.17 20.65 4.76ZM28.16 16C28.16 17.65 27.83 19.22 27.24 20.65L21.62 18.33C21.92 17.61 22.08 16.82 22.08 16C22.08 15.18 21.92 14.39 21.62 13.67L27.24 11.35C27.83 12.78 28.16 14.35 28.16 16ZM4.76 11.35 10.38 13.67C10.08 14.39 9.92 15.18 9.92 16C9.92 16.82 10.08 17.61 10.38 18.33L4.76 20.65C4.17 19.22 3.84 17.65 3.84 16C3.84 14.35 4.17 12.78 4.76 11.35Z"
              />
              <path
                fill="#FF5500"
                d="M20.65 4.76C23.63 6 26 8.37 27.24 11.35L21.62 13.67C21 12.19 19.81 11 18.33 10.38L20.65 4.76ZM20.65 27.24 18.33 21.62C19.81 21 21 19.81 21.62 18.33L27.24 20.65C26 23.63 23.63 26 20.65 27.24ZM4.76 11.35C6 8.37 8.37 6 11.35 4.76L13.67 10.38C12.19 11 11 12.19 10.38 13.67L4.76 11.35ZM13.67 21.62 11.35 27.24C8.37 26 6 23.63 4.76 20.65L10.38 18.33C11 19.81 12.19 21 13.67 21.62Z"
              />
            </svg>
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-[#F2EDE4] leading-tight">
                boia
              </span>
              <span className="text-[10px] text-[#97A1BC] tracking-wider uppercase font-semibold">
                Estúdio IA
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1B2540] text-[#97A1BC] hover:bg-[#16203A] hover:text-[#EDF1FA] transition-colors cursor-pointer"
          title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Main Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 custom-scrollbar">
        {/* Core Links */}
        <nav className="space-y-1">
          {/* Início (Estúdio) */}
          <button
            onClick={() => {
              onSelectProject(null);
              setActiveTab("studio");
            }}
            title={collapsed ? "Início" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer",
              activeTab === "studio" && activeProjectId === null
                ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
                : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
            )}
          >
            <Sparkles
              size={17}
              className={
                activeTab === "studio" && activeProjectId === null
                  ? "text-[#FF5500]"
                  : "text-[#97A1BC]"
              }
            />
            {!collapsed && <span>Início</span>}
          </button>

          {/* Minhas gerações */}
          <button
            onClick={() => {
              onSelectProject(null);
              setActiveTab("gallery");
            }}
            title={collapsed ? "Minhas gerações" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer",
              activeTab === "gallery" && activeProjectId === null
                ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
                : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
            )}
          >
            <LayoutGrid
              size={17}
              className={
                activeTab === "gallery" && activeProjectId === null
                  ? "text-[#FF5500]"
                  : "text-[#97A1BC]"
              }
            />
            {!collapsed && <span>Minhas gerações</span>}
          </button>

          {/* Meus elementos */}
          <button
            onClick={() => {
              onSelectProject(null);
              setActiveTab("elements");
            }}
            title={collapsed ? "Meus elementos" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer",
              activeTab === "elements"
                ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
                : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
            )}
          >
            <Shapes
              size={17}
              className={activeTab === "elements" ? "text-[#FF5500]" : "text-[#97A1BC]"}
            />
            {!collapsed && <span>Meus elementos</span>}
          </button>

          {/* Meus favoritos */}
          <button
            onClick={() => {
              onSelectProject(null);
              setActiveTab("favorites");
            }}
            title={collapsed ? "Meus favoritos" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer",
              activeTab === "favorites"
                ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
                : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
            )}
          >
            <Star
              size={17}
              className={
                activeTab === "favorites"
                  ? "text-[#FF5500] fill-[#FF5500]"
                  : "text-[#97A1BC]"
              }
            />
            {!collapsed && <span>Meus favoritos</span>}
          </button>

          {/* Vitrine */}
          <button
            onClick={() => {
              onSelectProject(null);
              setActiveTab("vitrine");
            }}
            title={collapsed ? "Vitrine" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer",
              activeTab === "vitrine"
                ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
                : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
            )}
          >
            <Globe
              size={17}
              className={activeTab === "vitrine" ? "text-[#FF5500]" : "text-[#97A1BC]"}
            />
            {!collapsed && <span>Vitrine</span>}
          </button>
        </nav>

        {/* PROJETOS SECTION */}
        <div className="pt-2 border-t border-[#1B2540]/80">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#97A1BC]">
                  Projetos ({projects.length})
                </span>
                <button
                  onClick={onCreateProject}
                  title="Criar novo projeto"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#FF5500] hover:text-[#FF7A2C] transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Novo</span>
                </button>
              </div>

              {/* Project Search */}
              <div className="relative px-1">
                <Search
                  size={13}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66708E]"
                />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Buscar projeto..."
                  className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-[#1B2540] bg-[#060A16]/90 text-[11px] text-[#EDF1FA] placeholder-[#66708E] outline-none focus:border-[#FF5500]/60 transition-colors"
                />
              </div>

              {/* Projects List */}
              <div className="space-y-0.5 pt-1">
                {filteredProjects.map((p) => {
                  const isActive = activeProjectId === p.id;
                  const isMenuOpen = openMenuId === p.id;

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all cursor-pointer select-none",
                        isActive
                          ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 font-semibold"
                          : "text-[#BAC3DA] hover:bg-[#16203A]/60 hover:text-white"
                      )}
                      onClick={() => {
                        onSelectProject(p.id);
                        setActiveTab("studio");
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <Folder
                          size={15}
                          className={cn(
                            "shrink-0",
                            isActive ? "text-[#FF5500]" : "text-[#66708E] group-hover:text-[#BAC3DA]"
                          )}
                        />
                        <span className="truncate">{p.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Private Badge */}
                        {p.isPrivate && (
                          <span
                            className="flex items-center gap-1 rounded bg-[#16203A] px-1.5 py-0.5 text-[9px] text-[#97A1BC] border border-[#283456]"
                            title="Projeto privado"
                          >
                            <Lock size={9} />
                            <span>Privado</span>
                          </span>
                        )}

                        {/* Three dots options */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : p.id);
                            }}
                            className={cn(
                              "p-1 rounded-md text-[#97A1BC] hover:text-white hover:bg-[#1F2C50] transition-colors opacity-0 group-hover:opacity-100",
                              isMenuOpen && "opacity-100 bg-[#1F2C50]"
                            )}
                            title="Mais opções do projeto"
                          >
                            <MoreVertical size={13} />
                          </button>

                          {/* Context Menu Dropdown */}
                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-6 z-50 w-36 rounded-xl border border-[#283456] bg-[#0A1022] p-1 shadow-xl shadow-black/80 animate-in fade-in"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleRename(p, e)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#BAC3DA] hover:bg-[#16203A] hover:text-white transition-colors"
                              >
                                <Edit3 size={13} />
                                <span>Renomear</span>
                              </button>
                              <button
                                onClick={(e) => handleCopyLink(p.id, e)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[#BAC3DA] hover:bg-[#16203A] hover:text-white transition-colors"
                              >
                                {copiedId === p.id ? (
                                  <>
                                    <Check size={13} className="text-[#4FD49B]" />
                                    <span className="text-[#4FD49B]">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} />
                                    <span>Copiar link</span>
                                  </>
                                )}
                              </button>
                              <div className="my-1 border-t border-[#1B2540]" />
                              <button
                                onClick={(e) => handleDelete(p, e)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={13} />
                                <span>Excluir</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onCreateProject}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16203A] text-[#FF5500] hover:bg-[#1F2C50] transition-colors"
                title="Novo projeto"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM LINKS */}
        <div className="pt-2 border-t border-[#1B2540]/80 space-y-1">
          {/* Gerações negadas */}
          <button
            onClick={() => setActiveTab("denied")}
            title={collapsed ? "Gerações negadas" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all cursor-pointer",
              activeTab === "denied"
                ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40"
                : "text-[#66708E] hover:bg-[#16203A]/60 hover:text-[#97A1BC]"
            )}
          >
            <ShieldAlert size={16} />
            {!collapsed && <span>Gerações negadas</span>}
          </button>

          {/* Preços & Como funciona */}
          <button
            onClick={() => setActiveTab("help")}
            title={collapsed ? "Preços & Como funciona" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all cursor-pointer",
              activeTab === "help"
                ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40"
                : "text-[#66708E] hover:bg-[#16203A]/60 hover:text-[#97A1BC]"
            )}
          >
            <HelpCircle size={16} />
            {!collapsed && <span>Preços & Como funciona</span>}
          </button>
        </div>
      </div>

      {/* Runware Balance Card */}
      <div className="p-3 border-t border-[#1B2540] shrink-0 bg-[#0A1022]">
        {!collapsed ? (
          <div className="rounded-xl border border-[#283456] bg-[#0F172C] p-3 shadow-inner">
            <div className="flex items-center justify-between text-xs text-[#97A1BC] mb-1.5">
              <span>Saldo Runware</span>
              <span className="flex h-2 w-2 rounded-full bg-[#4FD49B] animate-pulse" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="text-base font-bold text-white font-mono">
                  ${balance.toFixed(4)}
                </span>
                <span className="text-[10px] text-[#4FD49B] font-mono">
                  {formatRunwareCredits(balance)} pts ≈ {formatPriceBrl(balance)}
                </span>
              </div>
              <button
                onClick={openConfigModal}
                className="text-[11px] font-semibold text-[#FF5500] hover:text-[#FF7A2C] transition-colors cursor-pointer"
              >
                Gerenciar
              </button>
            </div>
            <p className="text-[10px] text-[#66708E] mt-1.5">
              Preço de custo real por geração
            </p>
          </div>
        ) : (
          <button
            onClick={openConfigModal}
            className="flex w-full items-center justify-center py-2 text-xs font-mono font-bold text-[#4FD49B]"
            title={`Saldo: $${balance.toFixed(4)} (${formatPriceBrl(balance)})`}
          >
            ${balance.toFixed(2)}
          </button>
        )}
      </div>
    </aside>
  );
}
