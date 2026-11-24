"use client";

import React from "react";
import { Globe, Lock, Sparkles, ExternalLink, Users, Eye } from "lucide-react";
import { ProjectItem } from "@/types";

interface VitrineViewProps {
  projects: ProjectItem[];
  onOpenProject: (id: string) => void;
}

export function VitrineView({ projects, onOpenProject }: VitrineViewProps) {
  const showcaseItems = [
    {
      id: "show-1",
      title: "Spurgeon: O Príncipe dos Pregadores",
      author: "César B.",
      authorRole: "Criador",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      itemsCount: 14,
      modelUsed: "Nano Banana 2.1",
      description: "Série histórica em estilo gravura clássica séc XIX de retratos e pregações de Spurgeon em Londres.",
      views: 324,
    },
    {
      id: "show-2",
      title: "Sentido do Natal - Animação Cinematográfica",
      author: "Estúdio Boia",
      authorRole: "Destaque",
      coverUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80",
      itemsCount: 18,
      modelUsed: "Seedance 2.5",
      description: "Cenas em movimento fluido com iluminação quente de velas, neve em 24fps e texturas volumétricas.",
      views: 890,
    },
    {
      id: "show-3",
      title: "Beto & Aventuras Cyberpunk",
      author: "César B.",
      authorRole: "Criador",
      coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      itemsCount: 8,
      modelUsed: "FLUX.2 [dev]",
      description: "Personagem consistente @beto explorando metrópoles futuristas iluminadas por neon e hologramas.",
      views: 412,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1B2540]">
        <h2 className="text-xl font-bold text-[#F2EDE4] flex items-center gap-2">
          <Globe size={20} className="text-[#FF5500]" />
          <span>Vitrine Boia</span>
        </h2>
        <p className="text-xs text-[#97A1BC] mt-0.5">
          Projetos públicos criados na Boia. Inspire-se com prompts, modelos e técnicas da comunidade.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showcaseItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-[#283456] bg-[#0A1022] overflow-hidden hover:border-[#FF5500]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video w-full overflow-hidden bg-[#060A16]">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                    {item.modelUsed}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FF5500]/80 backdrop-blur-md text-[10px] font-bold text-white">
                    {item.itemsCount} arquivos
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#97A1BC]">
                  <span className="font-medium text-[#EDF1FA]">Por {item.author}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{item.views}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#F2EDE4] group-hover:text-[#FF5500] transition-colors line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-[#97A1BC] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => onOpenProject("proj-1")}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#16203A] hover:bg-[#FF5500] text-xs font-semibold text-[#EDF1FA] hover:text-white transition-all cursor-pointer"
              >
                <span>Explorar projeto</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
