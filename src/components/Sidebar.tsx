"use client";

import React from "react";
import { Sparkles, LayoutGrid, Key, HelpCircle, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: "studio" | "gallery" | "help";
  setActiveTab: (tab: "studio" | "gallery" | "help") => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  openConfigModal: () => void;
  balance: number;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  openConfigModal,
  balance,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[#1B2540] bg-[#0A1022]/95 backdrop-blur-md transition-all duration-300",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#1B2540]">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab("studio")}
        >
          {/* Official Boia Lifebuoy Icon */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#060A16] border border-[#283456] shadow-md shadow-black/40 overflow-hidden">
            <svg viewBox="0 0 32 32" className="h-6 w-6">
              <path fill="#0A1022" d="M7.2 0H24.8C28.78 0 32 3.22 32 7.2V24.8C32 28.78 28.78 32 24.8 32H7.2C3.22 32 0 28.78 0 24.8V7.2C0 3.22 3.22 0 7.2 0Z"/>
              <path fill="#F2EDE4" d="M13.67 21.62C13.66 21.61 13.65 21.61 13.63 21.6C14.36 21.91 15.16 22.08 16 22.08C16.82 22.08 17.61 21.92 18.33 21.62L20.65 27.24C19.22 27.83 17.65 28.16 16 28.16C14.35 28.16 12.78 27.83 11.35 27.24ZM20.65 4.76 18.33 10.38C17.61 10.08 16.82 9.92 16 9.92C15.18 9.92 14.39 10.08 13.67 10.38L11.35 4.76C12.78 4.17 14.35 3.84 16 3.84C17.65 3.84 19.22 4.17 20.65 4.76ZM28.16 16C28.16 17.65 27.83 19.22 27.24 20.65L21.62 18.33C21.92 17.61 22.08 16.82 22.08 16C22.08 15.18 21.92 14.39 21.62 13.67L27.24 11.35C27.83 12.78 28.16 14.35 28.16 16ZM4.76 11.35 10.38 13.67C10.08 14.39 9.92 15.18 9.92 16C9.92 16.82 10.08 17.61 10.38 18.33L4.76 20.65C4.17 19.22 3.84 17.65 3.84 16C3.84 14.35 4.17 12.78 4.76 11.35Z"/>
              <path fill="#FF5500" d="M20.65 4.76C23.63 6 26 8.37 27.24 11.35L21.62 13.67C21 12.19 19.81 11 18.33 10.38L20.65 4.76ZM20.65 27.24 18.33 21.62C19.81 21 21 19.81 21.62 18.33L27.24 20.65C26 23.63 23.63 26 20.65 27.24ZM4.76 11.35C6 8.37 8.37 6 11.35 4.76L13.67 10.38C12.19 11 11 12.19 10.38 13.67L4.76 11.35ZM13.67 21.62 11.35 27.24C8.37 26 6 23.63 4.76 20.65L10.38 18.33C11 19.81 12.19 21 13.67 21.62Z"/>
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
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1B2540] text-[#97A1BC] hover:bg-[#16203A] hover:text-[#EDF1FA] transition-colors"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 p-3">
        <button
          onClick={() => setActiveTab("studio")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all",
            activeTab === "studio"
              ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
              : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
          )}
        >
          <Sparkles
            size={18}
            className={activeTab === "studio" ? "text-[#FF5500]" : "text-[#97A1BC]"}
          />
          {!collapsed && <span>Estúdio</span>}
        </button>

        <button
          onClick={() => setActiveTab("gallery")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all",
            activeTab === "gallery"
              ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
              : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
          )}
        >
          <LayoutGrid
            size={18}
            className={activeTab === "gallery" ? "text-[#FF5500]" : "text-[#97A1BC]"}
          />
          {!collapsed && <span>Galeria & Projetos</span>}
        </button>

        <button
          onClick={openConfigModal}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA] transition-all"
        >
          <Key size={18} className="text-[#97A1BC]" />
          {!collapsed && <span>Chave Runware</span>}
        </button>

        <button
          onClick={() => setActiveTab("help")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all",
            activeTab === "help"
              ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
              : "text-[#97A1BC] hover:bg-[#16203A]/60 hover:text-[#EDF1FA]"
          )}
        >
          <HelpCircle
            size={18}
            className={activeTab === "help" ? "text-[#FF5500]" : "text-[#97A1BC]"}
          />
          {!collapsed && <span>Preços & Como funciona</span>}
        </button>
      </nav>

      {/* Runware Balance Card */}
      <div className="p-3 border-t border-[#1B2540]">
        {!collapsed ? (
          <div className="rounded-xl border border-[#283456] bg-[#0F172C] p-3 shadow-inner">
            <div className="flex items-center justify-between text-xs text-[#97A1BC] mb-1.5">
              <span>Saldo Runware</span>
              <span className="flex h-2 w-2 rounded-full bg-[#4FD49B] animate-pulse" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-white font-mono">
                ${balance.toFixed(4)}
              </span>
              <button
                onClick={openConfigModal}
                className="text-[11px] font-semibold text-[#FF5500] hover:text-[#FF7A2C] transition-colors"
              >
                Gerenciar
              </button>
            </div>
            <p className="text-[11px] text-[#66708E] mt-1">
              Preço de custo por geração
            </p>
          </div>
        ) : (
          <button
            onClick={openConfigModal}
            className="flex w-full items-center justify-center py-2 text-xs font-mono font-bold text-[#4FD49B]"
            title={`Saldo: $${balance.toFixed(4)}`}
          >
            ${balance.toFixed(2)}
          </button>
        )}
      </div>
    </aside>
  );
}
