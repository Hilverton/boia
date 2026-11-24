"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  ChevronDown,
  Check,
  Zap,
  Ratio,
  X,
  Image as ImageIcon,
  Film,
  Paperclip,
  AtSign,
  Minus,
  Plus,
  Loader2,
  Search,
} from "lucide-react";
import { AIModel, AspectRatio, ModelMode, ModelQuality } from "@/types";
import { AVAILABLE_MODELS, formatPriceBrl, formatRunwareCredits } from "@/data/models";
import { cn } from "@/lib/utils";

interface PromptComposerProps {
  onGenerate: (
    prompt: string,
    model: AIModel,
    aspect: AspectRatio,
    quality: ModelQuality,
    count: number,
    imageRef?: string
  ) => void;
  isGenerating: boolean;
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  quality: ModelQuality;
  setQuality: (q: ModelQuality) => void;
  batchCount: number;
  setBatchCount: (c: number) => void;
  mode: ModelMode;
  setMode: (m: ModelMode) => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; ratioDisplay: string }[] = [
  { value: "1:1", label: "1:1 · Quadrado", ratioDisplay: "1:1" },
  { value: "16:9", label: "16:9 · Paisagem Widescreen", ratioDisplay: "16:9" },
  { value: "9:16", label: "9:16 · Stories / Reels / TikTok", ratioDisplay: "9:16" },
  { value: "4:5", label: "4:5 · Feed Instagram", ratioDisplay: "4:5" },
  { value: "5:4", label: "5:4 · Retângulo horizontal", ratioDisplay: "5:4" },
  { value: "3:2", label: "3:2 · Fotografia 35mm", ratioDisplay: "3:2" },
  { value: "2:3", label: "2:3 · Retrato Vertical", ratioDisplay: "2:3" },
  { value: "4:3", label: "4:3 · Tela clássica", ratioDisplay: "4:3" },
  { value: "3:4", label: "3:4 · Retrato clássico", ratioDisplay: "3:4" },
  { value: "21:9", label: "21:9 · Cinema Ultrawide", ratioDisplay: "21:9" },
];

const QUALITIES: { value: ModelQuality; label: string; desc: string }[] = [
  { value: "1K", label: "1K", desc: "Padrão · Rápido e econômico" },
  { value: "2K", label: "2K", desc: "Alta Definição · Mais detalhes" },
  { value: "4K", label: "4K", desc: "Máxima Resolução · Nitidez extrema" },
];

export function PromptComposer({
  onGenerate,
  isGenerating,
  selectedModel,
  setSelectedModel,
  aspectRatio,
  setAspectRatio,
  quality,
  setQuality,
  batchCount,
  setBatchCount,
  mode,
  setMode,
}: PromptComposerProps) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  // Models filtered by mode and search query
  const filteredModels = AVAILABLE_MODELS.filter((m) => {
    if (m.type !== mode) return false;
    if (!modelSearch.trim()) return true;
    const q = modelSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.creator.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });

  // Group models by company (creator)
  const modelsByCreator = React.useMemo(() => {
    const groups: Record<string, AIModel[]> = {};
    for (const model of filteredModels) {
      const creator = model.creator || "Outros";
      if (!groups[creator]) {
        groups[creator] = [];
      }
      groups[creator].push(model);
    }
    return groups;
  }, [filteredModels]);

  const handleModeChange = (newMode: ModelMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setShowModelMenu(false);
    // Auto-select first model of that mode
    const firstOfMode = AVAILABLE_MODELS.find((m) => m.type === newMode);
    if (firstOfMode) {
      setSelectedModel(firstOfMode);
    }
  };

  const handleAddAtTag = () => {
    const textToInsert = "@";
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || prompt.length;
      const end = textareaRef.current.selectionEnd || prompt.length;
      const nextPrompt = prompt.substring(0, start) + textToInsert + prompt.substring(end);
      setPrompt(nextPrompt);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + 1, start + 1);
        }
      }, 0);
    } else {
      setPrompt((prev) => prev + textToInsert);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReferenceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(
      prompt.trim(),
      selectedModel,
      aspectRatio,
      quality,
      batchCount,
      referenceImage || undefined
    );
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Cost calculation
  const qualityMultiplier = quality === "2K" ? 1.35 : quality === "4K" ? 2.1 : 1.0;
  const totalCostUsd = selectedModel.costPerGen * qualityMultiplier * batchCount;
  const totalCostCredits = formatRunwareCredits(totalCostUsd);
  const totalCostBrl = formatPriceBrl(totalCostUsd);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4"
      suppressHydrationWarning
      data-dashlane-ignore="true"
      data-form-type="other"
      data-lpignore="true"
      data-1p-ignore="true"
    >
      <div
        className="relative rounded-2xl composer-glass p-3 shadow-2xl transition-all border border-[#283456]/60 backdrop-blur-xl bg-[#090E1F]/90"
        suppressHydrationWarning
        data-dashlane-ignore="true"
      >
        {/* Top bar: Mode Switcher (Imagem vs Vídeo) */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1B2540]/60">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleModeChange("image")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                mode === "image"
                  ? "bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 shadow-sm"
                  : "text-[#97A1BC] hover:text-white hover:bg-[#16203A]"
              )}
            >
              <ImageIcon size={13} />
              <span>Imagem</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("video")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                mode === "video"
                  ? "bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 shadow-sm"
                  : "text-[#97A1BC] hover:text-white hover:bg-[#16203A]"
              )}
            >
              <Film size={13} />
              <span>Vídeo</span>
            </button>
          </div>

          <div className="text-[11px] text-[#66708E] font-medium hidden sm:flex items-center gap-1">
            <span>Preço direto da tabela</span>
            <span className="text-[#FF5500]">sem margem</span>
          </div>
        </div>

        {/* Reference Image Preview */}
        {referenceImage && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#060A16] p-2 border border-[#1B2540]">
            <img
              src={referenceImage}
              alt="Referência"
              className="h-10 w-10 rounded-md object-cover border border-[#283456]"
            />
            <div className="flex flex-col">
              <span className="text-xs text-[#EDF1FA] font-medium">Imagem de referência anexada</span>
              <span className="text-[10px] text-[#97A1BC]">Será usada como base para esta geração</span>
            </div>
            <button
              type="button"
              onClick={() => setReferenceImage(null)}
              className="ml-auto text-[#97A1BC] hover:text-white p-1 rounded-md hover:bg-[#1B2540]"
              title="Remover referência"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "image"
                ? "Descreva a imagem que você quer criar… (use @ para citar elementos)"
                : "Descreva a cena e o movimento do vídeo que você quer gerar…"
            }
            autoComplete="off"
            spellCheck={false}
            suppressHydrationWarning
            data-dashlane-ignore="true"
            data-form-type="other"
            data-lpignore="true"
            className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-[#EDF1FA] placeholder-[#66708E] focus:outline-none min-h-[46px] max-h-[180px] leading-relaxed font-sans"
          />
        </div>

        {/* Advanced Negative Prompt */}
        {showAdvanced && (
          <div className="mt-2 pt-2 border-t border-[#1B2540] px-3 animate-in fade-in duration-200">
            <label className="text-[11px] font-semibold text-[#97A1BC] block mb-1">
              Prompt Negativo (o que evitar)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Ex: blurry, bad anatomy, deformed, watermark, low quality, artifacts"
              autoComplete="off"
              spellCheck={false}
              className="w-full h-8 px-2.5 rounded-lg border border-[#283456] bg-[#060A16] text-xs text-white placeholder-[#66708E] focus:outline-none focus:border-[#FF5500]"
            />
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#1B2540]/80 pt-2.5 px-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Adicionar Referências (File Upload) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 h-8 px-2.5 rounded-xl border border-[#283456] bg-[#16203A]/70 text-xs font-medium text-[#97A1BC] hover:text-white hover:bg-[#1E2A48] hover:border-[#FF5500]/40 transition-all cursor-pointer"
              title="Adicionar referências visuais"
            >
              <Paperclip size={13} />
              <span className="hidden sm:inline">Referências</span>
            </button>

            {/* Elementos (@) */}
            <button
              type="button"
              onClick={handleAddAtTag}
              className="flex items-center gap-1 h-8 px-2.5 rounded-xl border border-[#283456] bg-[#16203A]/70 text-xs font-medium text-[#97A1BC] hover:text-white hover:bg-[#1E2A48] hover:border-[#FF5500]/40 transition-all cursor-pointer"
              title="Citar personagem ou cenário com @"
            >
              <AtSign size={13} />
              <span className="hidden sm:inline">Elementos</span>
            </button>

            {/* Model Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowModelMenu(!showModelMenu);
                  setShowAspectMenu(false);
                  setShowQualityMenu(false);
                }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#283456] bg-[#16203A]/70 text-xs font-medium text-[#EDF1FA] hover:bg-[#1E2A48] hover:border-[#FF5500]/50 transition-all cursor-pointer"
                title="Escolher modelo de IA"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5500]/20 text-[10px] font-bold text-[#FF5500]">
                  {selectedModel.creator.charAt(0)}
                </span>
                <span className="font-semibold">{selectedModel.name}</span>
                <ChevronDown size={11} className="text-[#97A1BC]" />
              </button>

              {/* Model Dropdown */}
              {showModelMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-84 sm:w-96 rounded-xl border border-[#283456] bg-[#0F172C] p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-96 flex flex-col">
                  {/* Dropdown Header */}
                  <div className="px-2 pb-2 text-[11px] font-semibold text-[#66708E] uppercase tracking-wider flex items-center justify-between border-b border-[#1B2540]">
                    <span>Modelos ({mode === "image" ? "Imagem" : "Vídeo"})</span>
                    <span className="font-mono text-[#FF5500]">Agrupados por empresa</span>
                  </div>

                  {/* Search Input */}
                  <div className="pt-2 pb-1.5 px-0.5">
                    <div className="relative flex items-center">
                      <Search size={13} className="absolute left-2.5 text-[#66708E]" />
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder="Buscar por nome ou empresa..."
                        className="w-full h-7 pl-8 pr-7 rounded-lg border border-[#283456] bg-[#060A16] text-xs text-white placeholder-[#66708E] focus:outline-none focus:border-[#FF5500]"
                      />
                      {modelSearch && (
                        <button
                          type="button"
                          onClick={() => setModelSearch("")}
                          className="absolute right-2 text-[#66708E] hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grouped Models List */}
                  <div className="overflow-y-auto flex-1 pr-1 space-y-3 mt-1">
                    {Object.entries(modelsByCreator).map(([creator, models]) => (
                      <div key={creator} className="space-y-1">
                        {/* Company Section Header */}
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#FF5500] uppercase tracking-wider bg-[#16203A]/70 rounded-md sticky top-0 backdrop-blur-sm border border-[#283456]/50">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5500]" />
                            {creator}
                          </span>
                          <span className="text-[10px] text-[#97A1BC] lowercase font-normal">
                            {models.length} {models.length === 1 ? "modelo" : "modelos"}
                          </span>
                        </div>

                        {/* Models in Company */}
                        <div className="space-y-1 pl-1">
                          {models.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(m);
                                setShowModelMenu(false);
                                setModelSearch("");
                              }}
                              className={cn(
                                "w-full flex flex-col items-start px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                                selectedModel.id === m.id
                                  ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/40 shadow-sm"
                                  : "hover:bg-[#16203A] text-[#EDF1FA] border border-transparent"
                              )}
                            >
                              <div className="flex w-full items-center justify-between text-xs font-semibold">
                                <div className="flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  {m.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FF5500]/20 text-[#FF5500]">
                                      {m.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[11px] text-[#4FD49B]">
                                  {formatPriceBrl(m.costPerGen)}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#97A1BC] mt-0.5 line-clamp-1">
                                {m.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.keys(modelsByCreator).length === 0 && (
                      <div className="py-6 text-center text-xs text-[#97A1BC]">
                        Nenhum modelo encontrado com "{modelSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Aspect Ratio Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAspectMenu(!showAspectMenu);
                  setShowModelMenu(false);
                  setShowQualityMenu(false);
                }}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-[#283456] bg-[#16203A]/70 text-xs font-medium text-[#EDF1FA] hover:bg-[#1E2A48] hover:border-[#FF5500]/50 transition-all cursor-pointer"
                title="Proporção da tela"
              >
                <Ratio size={13} className="text-[#97A1BC]" />
                <span className="font-mono">{aspectRatio}</span>
                <ChevronDown size={11} className="text-[#97A1BC]" />
              </button>

              {/* Aspect Ratio Dropdown */}
              {showAspectMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-60 rounded-xl border border-[#283456] bg-[#0F172C] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2 py-1 text-[11px] font-semibold text-[#66708E] uppercase tracking-wider">
                    Proporções
                  </div>
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.value}
                      type="button"
                      onClick={() => {
                        setAspectRatio(ar.value);
                        setShowAspectMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        aspectRatio === ar.value
                          ? "bg-[#FF5500]/15 text-white"
                          : "hover:bg-[#16203A] text-[#EDF1FA]"
                      )}
                    >
                      <span>{ar.label}</span>
                      {aspectRatio === ar.value && <Check size={13} className="text-[#FF5500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Selector Pill (Imagem) */}
            {mode === "image" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowModelMenu(false);
                    setShowAspectMenu(false);
                  }}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-xl border border-[#283456] bg-[#16203A]/70 text-xs font-medium text-[#EDF1FA] hover:bg-[#1E2A48] hover:border-[#FF5500]/50 transition-all cursor-pointer"
                  title="Resolução / Qualidade"
                >
                  <span className="font-bold text-[#FF5500] font-mono">{quality}</span>
                  <ChevronDown size={11} className="text-[#97A1BC]" />
                </button>

                {/* Quality Dropdown */}
                {showQualityMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-[#283456] bg-[#0F172C] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[11px] font-semibold text-[#66708E] uppercase tracking-wider">
                      Resolução
                    </div>
                    {QUALITIES.map((q) => (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => {
                          setQuality(q.value);
                          setShowQualityMenu(false);
                        }}
                        className={cn(
                          "w-full flex flex-col items-start px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                          quality === q.value
                            ? "bg-[#FF5500]/15 text-white"
                            : "hover:bg-[#16203A] text-[#EDF1FA]"
                        )}
                      >
                        <div className="flex w-full items-center justify-between text-xs font-bold">
                          <span>{q.label}</span>
                          {quality === q.value && <Check size={12} className="text-[#FF5500]" />}
                        </div>
                        <span className="text-[10px] text-[#97A1BC]">{q.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Batch Count Stepper (Menos / Mais) */}
            <div
              className="flex items-center h-8 rounded-xl border border-[#283456] bg-[#16203A]/70 px-1 text-xs text-[#EDF1FA]"
              title="Quantas gerações de uma vez"
            >
              <button
                type="button"
                onClick={() => setBatchCount(Math.max(1, batchCount - 1))}
                disabled={batchCount <= 1}
                className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-[#1E2A48] disabled:opacity-30 disabled:pointer-events-none text-[#97A1BC] hover:text-white transition-colors cursor-pointer"
                aria-label="Menos"
              >
                <Minus size={11} />
              </button>
              <span className="px-1.5 font-mono text-[11px] font-semibold text-white">
                {batchCount} <span className="text-[#66708E]">/</span> 4
              </span>
              <button
                type="button"
                onClick={() => setBatchCount(Math.min(4, batchCount + 1))}
                disabled={batchCount >= 4}
                className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-[#1E2A48] disabled:opacity-30 disabled:pointer-events-none text-[#97A1BC] hover:text-white transition-colors cursor-pointer"
                aria-label="Mais"
              >
                <Plus size={11} />
              </button>
            </div>

            {/* Advanced Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-xl border border-[#283456] text-[#97A1BC] hover:bg-[#16203A] hover:text-white transition-colors cursor-pointer",
                showAdvanced && "bg-[#16203A] text-[#FF5500] border-[#FF5500]/40"
              )}
              title="Configurações avançadas / Prompt negativo"
            >
              <Sliders size={13} />
            </button>
          </div>

          {/* Botão Oficial: GERAR ≈ créditos ≈ R$ valor */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "flex flex-col items-center justify-center h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-wider fire-button disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer min-w-[170px]"
            )}
            title={`Gera pela ${selectedModel.provider}`}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span>Gerando...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 leading-none">
                  <Sparkles size={13} />
                  <span>GERAR ≈ {totalCostCredits} ≈ {totalCostBrl}</span>
                </div>
                <span className="text-[9px] font-normal tracking-normal text-white/80 lowercase mt-0.5">
                  pela {selectedModel.provider}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
