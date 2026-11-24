"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "@/components/Sidebar";
import { PromptComposer } from "@/components/PromptComposer";
import { MediaGallery } from "@/components/MediaGallery";
import { ImageDetailModal } from "@/components/ImageDetailModal";
import { RunwareConfigModal } from "@/components/RunwareConfigModal";
import { HelpPricingView } from "@/components/HelpPricingView";
import { NewProjectModal } from "@/components/NewProjectModal";
import { DeniedModal } from "@/components/DeniedModal";
import { ElementsView } from "@/components/ElementsView";
import { VitrineView } from "@/components/VitrineView";
import {
  AVAILABLE_MODELS,
  INITIAL_GENERATIONS,
  INITIAL_PROJECTS,
  INITIAL_ELEMENTS,
  STANDARD_SIZES,
  formatPriceBrl,
  formatRunwareCredits,
  toBrl,
} from "@/data/models";
import {
  AIModel,
  AspectRatio,
  ElementTag,
  GenerationItem,
  ModelMode,
  ModelQuality,
  ProjectItem,
} from "@/types";
import {
  Sparkles,
  Key,
  Folder,
  Lock,
  Globe,
  X,
  Plus,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("studio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isDeniedModalOpen, setIsDeniedModalOpen] = useState(false);
  const [savingsBannerVisible, setSavingsBannerVisible] = useState(true);

  // Projects & Elements state
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementTag[]>(INITIAL_ELEMENTS);

  // Runware state
  const [apiKey, setApiKey] = useState("");
  const [balance, setBalance] = useState(5.4218);

  // Studio state
  const [mode, setMode] = useState<ModelMode>("image");
  const [selectedModel, setSelectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [quality, setQuality] = useState<ModelQuality>("1K");
  const [batchCount, setBatchCount] = useState<number>(1);
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

  const handleTabChange = (tab: NavTab) => {
    if (tab === "denied") {
      setIsDeniedModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleSelectProject = (id: string | null) => {
    setActiveProjectId(id);
    setActiveTab("studio");
  };

  const handleCreateProject = (name: string, isPrivate: boolean) => {
    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      name,
      isPrivate,
      itemsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setActiveTab("studio");
  };

  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  const handleCreateElement = (elemData: ElementTag) => {
    setElements((prev) => [elemData, ...prev]);
  };

  const handleUpdateElement = (updated: ElementTag) => {
    setElements((prev) =>
      prev.map((el) => (el.id === updated.id ? updated : el))
    );
  };

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  const handleUseElement = (triggerTag: string) => {
    setActiveTab("studio");
  };

  const currentProject = projects.find((p) => p.id === activeProjectId);

  // Filter generations based on active context
  const currentProjectGenerations = activeProjectId
    ? generations.filter((g) => g.projectId === activeProjectId)
    : generations;

  const handleGenerate = (
    promptText: string,
    model: AIModel,
    aspect: AspectRatio,
    selectedQuality: ModelQuality,
    count: number,
    imageRef?: string
  ) => {
    setIsGenerating(true);

    const qualityMultiplier =
      selectedQuality === "2K" ? 1.35 : selectedQuality === "4K" ? 2.1 : 1.0;
    const unitCostUsd = model.costPerGen * qualityMultiplier;
    const totalCostUsd = unitCostUsd * count;

    // Deduct cost from simulated Runware balance
    setBalance((prev) => Math.max(0, prev - totalCostUsd));

    // Get exact dimensions based on selected quality and aspect ratio
    const dimensions =
      STANDARD_SIZES[selectedQuality]?.[aspect]?.join("x") || "1024x1024";

    const targetProjectId = activeProjectId || "proj-1";

    // Sample placeholder images and videos
    const sampleImages = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    ];

    const sampleVideos = [
      "https://assets.mixkit.co/videos/preview/mixkit-space-odyssey-animation-with-stars-and-planets-41551-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-character-with-glowing-neon-glasses-42354-large.mp4",
    ];

    // Simulate API delay
    setTimeout(() => {
      const newItems: GenerationItem[] = [];

      for (let i = 0; i < count; i++) {
        const pickedImage =
          sampleImages[(Math.floor(Math.random() * sampleImages.length) + i) % sampleImages.length];
        const pickedVideo =
          model.type === "video" ? sampleVideos[i % sampleVideos.length] : undefined;

        newItems.push({
          id: `gen-${Date.now()}-${i}`,
          prompt: promptText,
          model: model.name,
          modelKey: model.id,
          air: model.air,
          aspectRatio: aspect,
          quality: selectedQuality,
          imageUrl: pickedImage,
          videoUrl: pickedVideo,
          status: "ready",
          cost: unitCostUsd,
          costBrl: toBrl(unitCostUsd),
          createdAt: "Agora mesmo",
          dimensions: dimensions,
          seed: Math.floor(Math.random() * 99999999),
          isFavorite: false,
          type: model.type,
          projectId: targetProjectId,
        });
      }

      setGenerations((prev) => [...newItems, ...prev]);

      // Update project count
      setProjects((prev) =>
        prev.map((p) =>
          p.id === targetProjectId
            ? { ...p, itemsCount: p.itemsCount + count, updatedAt: new Date().toISOString() }
            : p
        )
      );

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
  };

  return (
    <div className="min-h-screen bg-[#060A16] text-[#EDF1FA] flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        openConfigModal={() => setIsConfigModalOpen(true)}
        balance={balance}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={() => setIsNewProjectModalOpen(true)}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 p-6 md:p-8 ${
          sidebarCollapsed ? "ml-18" : "ml-64"
        }`}
      >
        {/* Savings banner (idêntico ao oficial da Boia) */}
        {savingsBannerVisible && activeTab === "studio" && (
          <div className="mb-6 flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#4FD49B]/30 bg-[#4FD49B]/10 text-xs text-[#EDF1FA] animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4FD49B]/20 text-[#4FD49B] font-bold text-[10px]">
                $
              </span>
              <span>
                Nesses 5 vídeos você economizou <strong className="text-[#4FD49B]">R$ 55,59</strong> em comparação com o Higgsfield.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSavingsBannerVisible(false)}
              className="text-[#97A1BC] hover:text-white p-1 rounded hover:bg-[#4FD49B]/20 transition-colors cursor-pointer"
              title="Fechar aviso"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Top bar with breadcrumbs & Runware status */}
        <header className="flex items-center justify-between pb-6 mb-6 border-b border-[#1B2540]/80">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F2EDE4] flex items-center gap-2">
              {activeTab === "studio" && (
                <>
                  <Sparkles size={22} className="text-[#FF5500]" />
                  <span>
                    {activeProjectId && currentProject
                      ? `Projeto: ${currentProject.name}`
                      : "Dê vida às suas histórias"}
                  </span>
                </>
              )}
              {activeTab === "gallery" && <span>Minhas Gerações</span>}
              {activeTab === "elements" && <span>Meus Elementos</span>}
              {activeTab === "favorites" && <span>Meus Favoritos</span>}
              {activeTab === "vitrine" && <span>Vitrine Pública</span>}
              {activeTab === "help" && <span>Como funciona & Preços Runware</span>}
            </h1>
            <p className="text-xs text-[#97A1BC] mt-0.5">
              Pague o preço real de cada geração direto na sua conta da Runware, sem margem por cima.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#283456] bg-[#0F172C] hover:bg-[#16203A] text-xs font-medium text-[#EDF1FA] transition-colors cursor-pointer"
              title="Configurar chave da Runware"
            >
              <Key size={13} className="text-[#FF5500]" />
              <span className="hidden sm:inline">
                {apiKey ? "Chave Runware Conectada" : "Conectar Runware"}
              </span>
              <span className="font-mono text-[#4FD49B] font-bold ml-1">
                {formatRunwareCredits(balance)} ≈ {formatPriceBrl(balance)}
              </span>
            </button>
          </div>
        </header>

        {/* Tab Views */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            {/* Active Project Breadcrumb Header */}
            {activeProjectId && currentProject && (
              <div className="flex items-center justify-between rounded-2xl border border-[#283456] bg-[#0A1022] p-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16203A] text-[#FF5500] border border-[#283456]">
                    <Folder size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#97A1BC]">Projetos /</span>
                      <h2 className="text-base font-bold text-[#F2EDE4]">
                        {currentProject.name}
                      </h2>
                      <span className="flex items-center gap-1 rounded bg-[#16203A] px-2 py-0.5 text-[10px] text-[#97A1BC] border border-[#283456]">
                        {currentProject.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                        <span>{currentProject.isPrivate ? "Privado" : "Público"}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#97A1BC] mt-0.5">
                      {currentProjectGenerations.length}{" "}
                      {currentProjectGenerations.length === 1 ? "geração salva" : "gerações salvas"}{" "}
                      neste projeto
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveProjectId(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#283456] bg-[#0F172C] hover:bg-[#16203A] text-xs font-semibold text-[#BAC3DA] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Ver todas as gerações</span>
                </button>
              </div>
            )}

            <MediaGallery
              items={currentProjectGenerations}
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
              quality={quality}
              setQuality={setQuality}
              batchCount={batchCount}
              setBatchCount={setBatchCount}
              mode={mode}
              setMode={setMode}
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

        {activeTab === "elements" && (
          <ElementsView
            elements={elements}
            onUseElement={handleUseElement}
            onCreateElement={handleCreateElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
          />
        )}

        {activeTab === "favorites" && (
          <MediaGallery
            items={generations.filter((g) => g.isFavorite)}
            onSelectItem={(item) => setSelectedItem(item)}
            onToggleFavorite={handleToggleFavorite}
            onRemix={handleRemix}
          />
        )}

        {activeTab === "vitrine" && (
          <VitrineView
            projects={projects}
            onOpenProject={(id) => {
              setActiveProjectId(id);
              setActiveTab("studio");
            }}
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

        {/* New Project Modal */}
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />

        {/* Denied / Hidden Generations Modal */}
        <DeniedModal
          isOpen={isDeniedModalOpen}
          onClose={() => setIsDeniedModalOpen(false)}
        />
      </main>
    </div>
  );
}
