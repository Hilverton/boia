"use client";

import React, { useState } from "react";
import { Star, Download, Copy, Check, Sparkles, Filter, Ratio, Zap } from "lucide-react";
import { GenerationItem } from "@/types";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  items: GenerationItem[];
  onSelectItem: (item: GenerationItem) => void;
  onToggleFavorite: (id: string) => void;
  onRemix: (prompt: string) => void;
}

export function MediaGallery({
  items,
  onSelectItem,
  onToggleFavorite,
  onRemix,
}: MediaGalleryProps) {
  const [filter, setFilter] = useState<"all" | "favorites" | "flux">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === "favorites") return item.isFavorite;
    if (filter === "flux") return item.model.toLowerCase().includes("flux");
    return true;
  });

  const handleCopy = (e: React.MouseEvent, item: GenerationItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="w-full pb-36">
      {/* Top Filter Chips */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F172C] border border-[#1B2540]">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              filter === "all"
                ? "bg-[#1E2A48] text-white shadow-sm"
                : "text-[#97A1BC] hover:text-white"
            )}
          >
            Todas ({items.length})
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              filter === "favorites"
                ? "bg-[#1E2A48] text-[#FFB01F] shadow-sm"
                : "text-[#97A1BC] hover:text-white"
            )}
          >
            <Star size={12} fill={filter === "favorites" ? "currentColor" : "none"} />
            Favoritas ({items.filter((i) => i.isFavorite).length})
          </button>
          <button
            onClick={() => setFilter("flux")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              filter === "flux"
                ? "bg-[#1E2A48] text-[#FF5500] shadow-sm"
                : "text-[#97A1BC] hover:text-white"
            )}
          >
            FLUX
          </button>
        </div>

        <div className="text-xs text-[#97A1BC] font-mono">
          Total gerado: <strong className="text-white">${items.reduce((acc, i) => acc + i.cost, 0).toFixed(4)}</strong>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-[#1B2540] bg-[#0A1022]/40 p-8 my-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16203A] text-[#97A1BC] mb-3">
            <Sparkles size={22} className="text-[#FF5500]" />
          </div>
          <h3 className="text-sm font-bold text-[#F2EDE4]">Nenhuma geração encontrada</h3>
          <p className="text-xs text-[#97A1BC] mt-1 max-w-sm mx-auto">
            {filter === "favorites"
              ? "Você ainda não favoritou nenhuma geração. Clique na estrela de qualquer imagem para salvá-la aqui."
              : "Nenhuma geração encontrada neste filtro ou projeto. Digite um prompt no Estúdio para gerar."}
          </p>
        </div>
      )}

      {/* Masonry / Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#1B2540] bg-[#0F172C] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#283456] hover:shadow-2xl hover:shadow-black/70"
          >
            {/* Image Container */}
            <div className="relative aspect-auto overflow-hidden bg-[#060A16]">
              <img
                src={item.imageUrl}
                alt={item.prompt}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{
                  aspectRatio:
                    item.aspectRatio === "16:9"
                      ? "16/9"
                      : item.aspectRatio === "9:16"
                      ? "9/16"
                      : item.aspectRatio === "4:5"
                      ? "4/5"
                      : "1/1",
                }}
              />

              {/* Top badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                <span className="flex items-center gap-1 rounded-lg bg-[#060A16]/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-white border border-white/10">
                  <Zap size={11} className="text-[#FF5500]" />
                  {item.model}
                </span>

                <span className="rounded-lg bg-[#060A16]/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-mono font-bold text-[#4FD49B] border border-white/10">
                  ${item.cost.toFixed(3)}
                </span>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                <p className="text-xs text-[#EDF1FA] line-clamp-2 mb-3 leading-relaxed drop-shadow-md">
                  {item.prompt}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/15">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCopy(e, item)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Copiar prompt"
                    >
                      {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        item.isFavorite
                          ? "bg-[#FFB01F]/30 text-[#FFB01F]"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      )}
                      title="Favoritar"
                    >
                      <Star size={14} fill={item.isFavorite ? "currentColor" : "none"} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemix(item.prompt);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-[#FF5500] text-white transition-colors"
                      title="Usar prompt no Estúdio"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>

                  <span className="text-[10px] text-[#97A1BC]">
                    {item.aspectRatio} · {item.createdAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
