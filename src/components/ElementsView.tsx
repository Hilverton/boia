"use client";

import React, { useState } from "react";
import { ElementTag } from "@/types";
import {
  Plus,
  UploadCloud,
  Search,
  Filter,
  LayoutGrid,
  Tag,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { CreateElementModal } from "@/components/CreateElementModal";

interface ElementsViewProps {
  elements: ElementTag[];
  onUseElement: (triggerTag: string) => void;
  onCreateElement: (elem: ElementTag) => void;
  onUpdateElement?: (elem: ElementTag) => void;
  onDeleteElement?: (id: string) => void;
}

export function ElementsView({
  elements,
  onUseElement,
  onCreateElement,
  onUpdateElement,
  onDeleteElement,
}: ElementsViewProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "personagens" | "locacoes" | "objetos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<ElementTag | null>(null);

  const filterMap: Record<string, string | null> = {
    todos: null,
    personagens: "personagem",
    locacoes: "local",
    objetos: "adereco",
  };

  const targetKind = filterMap[activeTab];

  const filtered = elements.filter((el) => {
    const matchesKind = targetKind ? el.kind === targetKind : true;
    const matchesSearch =
      el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.triggerTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (el.description && el.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesKind && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingElement(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (el: ElementTag) => {
    setEditingElement(el);
    setIsModalOpen(true);
  };

  const handleSave = (saved: ElementTag) => {
    if (editingElement) {
      if (onUpdateElement) onUpdateElement(saved);
      else onCreateElement(saved);
    } else {
      onCreateElement(saved);
    }
    setIsModalOpen(false);
    setEditingElement(null);
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case "personagem":
        return "Personagem";
      case "local":
        return "Locação";
      case "adereco":
        return "Objeto";
      default:
        return "Elemento";
    }
  };

  const getActiveTabLabel = () => {
    switch (activeTab) {
      case "personagens":
        return "Personagens";
      case "locacoes":
        return "Locações";
      case "objetos":
        return "Objetos";
      default:
        return "Todos";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-24">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs md:text-sm text-[#97A1BC]">
          <span>Meus elementos</span>
          <ChevronRight size={14} className="text-[#66708E]" />
          <span className="text-[#EDF1FA] font-semibold">{getActiveTabLabel()}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#283456] bg-[#0F172C] hover:bg-[#16203A] text-xs font-semibold text-[#BAC3DA] hover:text-white transition-all cursor-pointer"
          >
            <UploadCloud size={14} />
            <span>Importar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6A1A] text-xs font-bold text-white shadow-lg shadow-[#FF5500]/25 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Adicionar novo</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A1022] border border-[#1B2540]">
          {(
            [
              { key: "todos", label: "Todos" },
              { key: "personagens", label: "Personagens" },
              { key: "locacoes", label: "Locações" },
              { key: "objetos", label: "Objetos" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#1E2A48] text-white shadow-sm"
                  : "text-[#97A1BC] hover:text-white hover:bg-[#16203A]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66708E]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-40 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl border border-[#283456] bg-[#0A1022] text-xs text-[#EDF1FA] placeholder-[#66708E] outline-none focus:border-[#FF5500]/70 transition-colors"
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#283456] bg-[#0A1022] text-xs font-semibold text-[#BAC3DA] hover:text-white hover:bg-[#16203A] transition-colors cursor-pointer"
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filtrar</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#283456] bg-[#0A1022] text-xs font-semibold text-[#BAC3DA] hover:text-white hover:bg-[#16203A] transition-colors cursor-pointer"
          >
            <LayoutGrid size={13} />
            <span className="hidden sm:inline">Visualizar</span>
          </button>
        </div>
      </div>

      {/* Elements Grid matching boia.space cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenEdit(item)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#1B2540] bg-[#0A1022] shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#283456] hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
          >
            {/* Card Thumbnail Area */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#060A16]">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#070D1E] text-2xl font-bold text-[#FF5500]">
                  {item.name.charAt(0)}
                </div>
              )}

              {/* Quick Tag Button overlay on hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUseElement(item.triggerTag);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-[#FF5500] hover:text-white hover:bg-[#FF5500] transition-all cursor-pointer"
                title="Inserir tag no prompt"
              >
                <Tag size={12} />
              </button>
            </div>

            {/* Card Footer Info (Exactly matching Boia screenshot) */}
            <div className="p-3">
              <span className="text-[11px] text-[#8490B0] font-medium block truncate">
                {getKindLabel(item.kind)} • {item.triggerTag}
              </span>
              <h4 className="text-sm font-bold text-[#F2EDE4] truncate mt-0.5 group-hover:text-[#FF5500] transition-colors">
                {item.name}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-[#1B2540] bg-[#0A1022]/40 p-8 my-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16203A] text-[#97A1BC] mb-3">
            <Sparkles size={22} className="text-[#FF5500]" />
          </div>
          <h3 className="text-sm font-bold text-[#F2EDE4]">Nenhum elemento encontrado</h3>
          <p className="text-xs text-[#97A1BC] mt-1 max-w-sm mx-auto">
            Clique em &quot;Adicionar novo&quot; para cadastrar personagens, cenários ou objetos de referência consistente.
          </p>
        </div>
      )}

      {/* Modal matching user screenshot */}
      <CreateElementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingElement(null);
        }}
        onSave={handleSave}
        editingElement={editingElement}
        onDelete={onDeleteElement}
      />
    </div>
  );
}
