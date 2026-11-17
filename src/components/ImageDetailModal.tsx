"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Download,
  Star,
  RefreshCw,
  Sparkles,
  Zap,
  Clock,
  Layers,
  Ratio,
} from "lucide-react";
import { GenerationItem } from "@/types";
import { cn } from "@/lib/utils";

interface ImageDetailModalProps {
  item: GenerationItem | null;
  onClose: () => void;
  onRemix: (prompt: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function ImageDetailModal({
  item,
  onClose,
  onRemix,
  onToggleFavorite,
}: ImageDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col lg:flex-row w-full max-w-5xl max-h-[90vh] rounded-3xl border border-[#283456] bg-[#0F172C] overflow-hidden shadow-2xl shadow-black">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-[#060A16]/80 p-2 text-[#97A1BC] hover:text-white border border-[#283456] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Media Preview Box */}
        <div className="relative flex-1 flex items-center justify-center bg-[#060A16] p-4 min-h-[300px] overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.prompt}
            className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>

        {/* Sidebar Info & Metadata */}
        <div className="w-full lg:w-96 flex flex-col p-6 border-t lg:border-t-0 lg:border-l border-[#1B2540] overflow-y-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4FD49B] bg-[#4FD49B]/10 px-2.5 py-1 rounded-full border border-[#4FD49B]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4FD49B]" />
              Concluído
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(item.id)}
                className={cn(
                  "p-2 rounded-xl border border-[#283456] transition-colors",
                  item.isFavorite
                    ? "bg-[#FFB01F]/20 text-[#FFB01F] border-[#FFB01F]/40"
                    : "text-[#97A1BC] hover:bg-[#16203A] hover:text-white"
                )}
                title="Favoritar"
              >
                <Star size={16} fill={item.isFavorite ? "currentColor" : "none"} />
              </button>

              <a
                href={item.imageUrl}
                download={`boia-${item.id}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-[#283456] text-[#97A1BC] hover:bg-[#16203A] hover:text-white transition-colors"
                title="Baixar imagem"
              >
                <Download size={16} />
              </a>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#97A1BC] uppercase tracking-wider">
                Prompt
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-xs text-[#FF5500] hover:text-[#FF7A2C] transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
            <p className="text-sm text-[#EDF1FA] leading-relaxed bg-[#060A16] p-3 rounded-xl border border-[#1B2540] select-all">
              {item.prompt}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
            <div className="rounded-xl border border-[#1B2540] bg-[#16203A]/40 p-2.5">
              <span className="text-[#97A1BC] block mb-0.5">Modelo</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Zap size={12} className="text-[#FF5500]" />
                {item.model}
              </span>
            </div>

            <div className="rounded-xl border border-[#1B2540] bg-[#16203A]/40 p-2.5">
              <span className="text-[#97A1BC] block mb-0.5">Proporção</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Ratio size={12} className="text-[#97A1BC]" />
                {item.aspectRatio} ({item.dimensions})
              </span>
            </div>

            <div className="rounded-xl border border-[#1B2540] bg-[#16203A]/40 p-2.5">
              <span className="text-[#97A1BC] block mb-0.5">Custo real Runware</span>
              <span className="font-mono font-bold text-[#4FD49B]">
                ${item.cost.toFixed(4)} USD
              </span>
            </div>

            <div className="rounded-xl border border-[#1B2540] bg-[#16203A]/40 p-2.5">
              <span className="text-[#97A1BC] block mb-0.5">Seed</span>
              <span className="font-mono text-white">
                {item.seed}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-auto space-y-2 pt-2">
            <button
              onClick={() => {
                onRemix(item.prompt);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs uppercase tracking-wider fire-button"
            >
              <Sparkles size={15} />
              <span>Usar este prompt no Estúdio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
