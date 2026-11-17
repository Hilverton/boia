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
} from "lucide-react";
import { AIModel, AspectRatio } from "@/types";
import { AVAILABLE_MODELS } from "@/data/models";
import { cn } from "@/lib/utils";

interface PromptComposerProps {
  onGenerate: (prompt: string, model: AIModel, aspect: AspectRatio, imageRef?: string) => void;
  isGenerating: boolean;
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; iconClass: string }[] = [
  { value: "1:1", label: "1:1 (Quadrado)", iconClass: "w-3 h-3 border" },
  { value: "16:9", label: "16:9 (Paisagem)", iconClass: "w-4 h-2.5 border" },
  { value: "9:16", label: "9:16 (Stories/Reels)", iconClass: "w-2.5 h-4 border" },
  { value: "4:5", label: "4:5 (Instagram)", iconClass: "w-3 h-3.5 border" },
  { value: "3:2", label: "3:2 (Fotografia)", iconClass: "w-3.5 h-2.5 border" },
];

export function PromptComposer({
  onGenerate,
  isGenerating,
  selectedModel,
  setSelectedModel,
  aspectRatio,
  setAspectRatio,
}: PromptComposerProps) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim(), selectedModel, aspectRatio, referenceImage || undefined);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

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
        className="relative rounded-2xl composer-glass p-3 shadow-2xl transition-all"
        suppressHydrationWarning
        data-dashlane-ignore="true"
      >
        {/* Reference image preview if attached */}
        {referenceImage && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#060A16] p-2 border border-[#1B2540]">
            <img
              src={referenceImage}
              alt="Referência"
              className="h-10 w-10 rounded-md object-cover border border-[#283456]"
            />
            <span className="text-xs text-[#97A1BC]">Imagem de referência anexada</span>
            <button
              type="button"
              onClick={() => setReferenceImage(null)}
              className="ml-auto text-[#97A1BC] hover:text-white p-1"
              suppressHydrationWarning
              data-dashlane-ignore="true"
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
            placeholder="Descreva a imagem que deseja gerar..."
            autoComplete="off"
            spellCheck={false}
            suppressHydrationWarning
            data-dashlane-ignore="true"
            data-form-type="other"
            data-lpignore="true"
            className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-[#EDF1FA] placeholder-[#66708E] focus:outline-none min-h-[44px] max-h-[180px] leading-relaxed"
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
              placeholder="Ex: blurry, bad anatomy, deformed, watermark, low quality"
              autoComplete="off"
              spellCheck={false}
              suppressHydrationWarning
              data-dashlane-ignore="true"
              data-form-type="other"
              className="w-full h-8 px-2.5 rounded-lg border border-[#283456] bg-[#060A16] text-xs text-white placeholder-[#66708E] focus:outline-none focus:border-[#FF5500]"
            />
          </div>
        )}

        {/* Actions Bar */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#1B2540]/80 pt-2.5 px-1">
          <div className="flex items-center gap-1.5">
            {/* Model Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowModelMenu(!showModelMenu);
                  setShowAspectMenu(false);
                }}
                suppressHydrationWarning
                data-dashlane-ignore="true"
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#283456] bg-[#16203A]/70 text-xs font-medium text-[#EDF1FA] hover:bg-[#1E2A48] hover:border-[#FF5500]/50 transition-all cursor-pointer"
              >
                <Zap size={13} className="text-[#FF5500]" />
                <span>{selectedModel.name}</span>
                <span className="text-[10px] text-[#97A1BC] font-mono">
                  ${selectedModel.costPerGen.toFixed(3)}
                </span>
                <ChevronDown size={12} className="text-[#97A1BC]" />
              </button>

              {/* Model Dropdown */}
              {showModelMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-[#283456] bg-[#0F172C] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-[#66708E] uppercase tracking-wider">
                    Modelos na Runware
                  </div>
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m);
                        setShowModelMenu(false);
                      }}
                      suppressHydrationWarning
                      data-dashlane-ignore="true"
                      className={cn(
                        "w-full flex flex-col items-start px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer",
                        selectedModel.id === m.id
                          ? "bg-[#FF5500]/15 text-white border border-[#FF5500]/30"
                          : "hover:bg-[#16203A] text-[#EDF1FA]"
                      )}
                    >
                      <div className="flex w-full items-center justify-between text-xs font-semibold">
                        <span>{m.name}</span>
                        <span className="font-mono text-[11px] text-[#4FD49B]">
                          ${m.costPerGen.toFixed(4)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#97A1BC] mt-0.5 line-clamp-1">
                        {m.description}
                      </span>
                    </button>
                  ))}
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
                }}
                suppressHydrationWarning
                data-dashlane-ignore="true"
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#283456] bg-[#16203A]/70 text-xs font-medium text-[#EDF1FA] hover:bg-[#1E2A48] hover:border-[#FF5500]/50 transition-all cursor-pointer"
              >
                <Ratio size={13} className="text-[#97A1BC]" />
                <span>{aspectRatio}</span>
                <ChevronDown size={12} className="text-[#97A1BC]" />
              </button>

              {/* Aspect Ratio Dropdown */}
              {showAspectMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-[#283456] bg-[#0F172C] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.value}
                      type="button"
                      onClick={() => {
                        setAspectRatio(ar.value);
                        setShowAspectMenu(false);
                      }}
                      suppressHydrationWarning
                      data-dashlane-ignore="true"
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

            {/* Advanced Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              suppressHydrationWarning
              data-dashlane-ignore="true"
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-xl border border-[#283456] text-[#97A1BC] hover:bg-[#16203A] hover:text-white transition-colors cursor-pointer",
                showAdvanced && "bg-[#16203A] text-[#FF5500] border-[#FF5500]/40"
              )}
              title="Configurações avançadas"
            >
              <Sliders size={13} />
            </button>
          </div>

          {/* Submit Fire Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!prompt.trim() || isGenerating}
            suppressHydrationWarning
            data-dashlane-ignore="true"
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-xl font-bold text-xs uppercase tracking-wider fire-button disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer"
            )}
          >
            {isGenerating ? (
              <>
                <div className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Gerar · ${selectedModel.costPerGen.toFixed(3)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
