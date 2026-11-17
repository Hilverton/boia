"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PromptComposer } from "@/components/PromptComposer";
import { MediaGallery } from "@/components/MediaGallery";
import { ImageDetailModal } from "@/components/ImageDetailModal";
import { RunwareConfigModal } from "@/components/RunwareConfigModal";
import { HelpPricingView } from "@/components/HelpPricingView";
import { AVAILABLE_MODELS, INITIAL_GENERATIONS } from "@/data/models";
import { AIModel, AspectRatio, GenerationItem } from "@/types";
import { Sparkles, Key, Zap, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"studio" | "gallery" | "help">("studio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  // Runware state
  const [apiKey, setApiKey] = useState("");
  const [balance, setBalance] = useState(5.4218);

  // Studio state
  const [selectedModel, setSelectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [generations, setGenerations] = useState<GenerationItem[]>(INITIAL_GENERATIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GenerationItem | null>(null);

  // Load saved API key on mount
  useEffect(() => {
    const saved = localStorage.getItem("boia_runware_key");
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  const handleGenerate = (
    promptText: string,
    model: AIModel,
    aspect: AspectRatio,
    imageRef?: string
  ) => {
    setIsGenerating(true);

    const cost = model.costPerGen;
    const newId = `gen-${Date.now()}`;

    // Dimensions map
    const dimensionsMap: Record<AspectRatio, string> = {
      "1:1": "1024x1024",
      "16:9": "1344x768",
      "9:16": "768x1344",
      "4:5": "896x1152",
      "3:2": "1216x832",
      "2:3": "832x1216",
    };

    // Temporary placeholder image
    const sampleImages = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    ];
    const pickedImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];

    // Deduct cost from simulated Runware balance
    setBalance((prev) => Math.max(0, prev - cost));

    // Simulate API delay
    setTimeout(() => {
      const newItem: GenerationItem = {
        id: newId,
        prompt: promptText,
        model: model.name,
        aspectRatio: aspect,
        imageUrl: pickedImage,
        status: "ready",
        cost: cost,
        createdAt: "Agora mesmo",
        dimensions: dimensionsMap[aspect],
        seed: Math.floor(Math.random() * 99999999),
        isFavorite: false,
        type: model.type,
      };

      setGenerations((prev) => [newItem, ...prev]);
      setIsGenerating(false);
    }, 1800);
  };

  const handleToggleFavorite = (id: string) => {
    setGenerations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleRemix = (promptText: string) => {
    setActiveTab("studio");
    // Scroll to prompt composer or notify
  };

  return (
    <div className="min-h-screen bg-[#060A16] text-[#EDF1FA] flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        openConfigModal={() => setIsConfigModalOpen(true)}
        balance={balance}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 p-6 md:p-8 ${
          sidebarCollapsed ? "ml-18" : "ml-64"
        }`}
      >
        {/* Top bar with quick status */}
        <header className="flex items-center justify-between pb-6 mb-6 border-b border-[#1B2540]/80">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2EDE4] flex items-center gap-2">
              {activeTab === "studio" && (
                <>
                  <Sparkles size={22} className="text-[#FF5500]" />
                  <span>Estúdio de Criação</span>
                </>
              )}
              {activeTab === "gallery" && <span>Galeria de Projetos</span>}
              {activeTab === "help" && <span>Como funciona & Preços Runware</span>}
            </h1>
            <p className="text-xs text-[#97A1BC] mt-0.5">
              Pague o preço real por imagem/vídeo direto na sua conta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#283456] bg-[#0F172C] hover:bg-[#16203A] text-xs font-medium text-[#EDF1FA] transition-colors"
            >
              <Key size={13} className="text-[#FF5500]" />
              <span className="hidden sm:inline">
                {apiKey ? "Chave Runware Conectada" : "Conectar Runware"}
              </span>
              <span className="font-mono text-[#4FD49B] font-bold ml-1">
                ${balance.toFixed(3)}
              </span>
            </button>
          </div>
        </header>

        {/* Tab Views */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            <MediaGallery
              items={generations}
              onSelectItem={(item) => setSelectedItem(item)}
              onToggleFavorite={handleToggleFavorite}
              onRemix={handleRemix}
            />

            {/* Floating Composer */}
            <PromptComposer
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
            />
          </div>
        )}

        {activeTab === "gallery" && (
          <MediaGallery
            items={generations}
            onSelectItem={(item) => setSelectedItem(item)}
            onToggleFavorite={handleToggleFavorite}
            onRemix={handleRemix}
          />
        )}

        {activeTab === "help" && (
          <HelpPricingView onOpenConfig={() => setIsConfigModalOpen(true)} />
        )}

        {/* Lightbox Modal */}
        <ImageDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRemix={handleRemix}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Runware API Config Modal */}
        <RunwareConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          apiKey={apiKey}
          setApiKey={setApiKey}
          balance={balance}
        />
      </main>
    </div>
  );
}
