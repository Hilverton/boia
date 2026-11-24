"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  Plus,
  Image as ImageIcon,
  Star,
  Trash2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { ElementTag, ElementImage } from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (element: ElementTag) => void;
  editingElement?: ElementTag | null;
  onDelete?: (id: string) => void;
}

export function CreateElementModal({
  isOpen,
  onClose,
  onSave,
  editingElement,
  onDelete,
}: CreateElementModalProps) {
  const [category, setCategory] = useState<"personagem" | "local" | "adereco">(
    editingElement?.kind || "personagem"
  );
  const [name, setName] = useState(editingElement?.name || "");
  const [version, setVersion] = useState(editingElement?.version || "01");
  const [handle, setHandle] = useState(editingElement?.handle || "");
  const [isHandleCustom, setIsHandleCustom] = useState(Boolean(editingElement?.handle));
  const [description, setDescription] = useState(editingElement?.description || "");
  const [status, setStatus] = useState<"Sem status" | "andamento" | "aprovado" | "">(
    editingElement?.status || ""
  );

  const [images, setImages] = useState<ElementImage[]>(
    editingElement?.images ||
      (editingElement?.avatarUrl
        ? [{ id: "img-0", original: editingElement.avatarUrl, thumb: editingElement.avatarUrl }]
        : [])
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync when editingElement changes
  useEffect(() => {
    if (editingElement) {
      setCategory(editingElement.kind);
      setName(editingElement.name);
      setVersion(editingElement.version || "01");
      setHandle(editingElement.handle || editingElement.triggerTag.replace(/^@/, ""));
      setIsHandleCustom(true);
      setDescription(editingElement.description || "");
      setStatus(editingElement.status);
      setImages(
        editingElement.images ||
          (editingElement.avatarUrl
            ? [{ id: "img-0", original: editingElement.avatarUrl, thumb: editingElement.avatarUrl }]
            : [])
      );
      setActiveImageIndex(0);
    } else {
      setCategory("personagem");
      setName("");
      setVersion("01");
      setHandle("");
      setIsHandleCustom(false);
      setDescription("");
      setStatus("");
      setImages([]);
      setActiveImageIndex(0);
    }
  }, [editingElement, isOpen]);

  // Auto-generate handle when name or version changes, unless user edited it
  useEffect(() => {
    if (!isHandleCustom) {
      const cleanName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^\w\s-]/g, "")
        .trim();

      const combined = cleanName ? `${cleanName}${version ? version : ""}`.replace(/\s+/g, "") : "";
      setHandle(combined);
    }
  }, [name, version, isHandleCustom]);

  if (!isOpen) return null;

  const handleFileUpload = (files: FileList | File[]) => {
    const newImgs: ElementImage[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file, idx) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const url = e.target.result as string;
          setImages((prev) => [
            ...prev,
            { id: `img-${Date.now()}-${idx}`, original: url, thumb: url },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    setActiveImageIndex(0);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activeImageIndex >= index && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalHandle = handle.trim() || name.replace(/\s+/g, "") || "elemento";
    const triggerTag = `@${finalHandle}`;
    const avatarUrl = images[0]?.thumb || images[0]?.original || undefined;

    const elementPayload: ElementTag = {
      id: editingElement?.id || `elem-${Date.now()}`,
      name: name.trim() || "Novo elemento",
      version: version.trim() || undefined,
      handle: finalHandle,
      triggerTag,
      kind: category,
      status: status || "Sem status",
      description: description.trim() || undefined,
      avatarUrl,
      images,
      createdAt: editingElement?.createdAt || new Date().toISOString(),
    };

    onSave(elementPayload);
    onClose();
  };

  const activeImage = images[activeImageIndex];

  const categoryItems = [
    { value: "personagem", label: "Personagem" },
    { value: "local", label: "Locações" },
    { value: "adereco", label: "Objetos" },
  ];

  const statusItems = [
    { value: "Sem status", label: "Sem status" },
    { value: "andamento", label: "Em andamento" },
    { value: "aprovado", label: "Aprovado" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1080px] rounded-2xl border border-[#283456] bg-[#0A1022] shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editingElement ? "Editar elemento" : "Criar elemento"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B2540] shrink-0">
          <h2 className="text-base font-bold text-[#F2EDE4] tracking-tight">
            {editingElement ? "Editar elemento" : "Criar elemento"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#97A1BC] hover:bg-[#16203A] hover:text-[#EDF1FA] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[460px]">
          {/* LEFT COLUMN: Visual Dropzone & Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl border border-[#1B2540] bg-[#060A16] p-3.5 overflow-hidden">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />

            {/* Preview Stage / Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative flex-1 min-h-[300px] lg:min-h-[360px] rounded-xl flex items-center justify-center overflow-hidden transition-all select-none ${
                isDragOver
                  ? "border-2 border-dashed border-[#FF5500] bg-[#FF5500]/10"
                  : "border border-[#1B2540]/60 bg-[#070D1E]"
              }`}
            >
              {activeImage ? (
                <img
                  src={activeImage.original}
                  alt={name || "Elemento"}
                  className="w-full h-full object-contain max-h-[360px]"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer hover:bg-[#0B132B]/50 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16203A]/80 text-[#97A1BC]">
                    <UploadCloud size={26} className="text-[#97A1BC]" />
                  </div>
                  <span className="text-xs font-medium text-[#97A1BC]">
                    Arraste imagens aqui ou clique para escolher
                  </span>
                </button>
              )}
            </div>

            {/* Bottom Strip: Thumbnails & Action Controls */}
            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[#1B2540]/60">
              {/* Thumbnails list */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-[calc(100%-140px)] py-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-11 w-11 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#FF5500] ring-2 ring-[#FF5500]/40"
                        : "border-[#283456] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.thumb || img.original}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-[#FF5500]/90 text-[8px] font-bold text-white text-center leading-tight">
                        Capa
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Add buttons */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#283456] bg-[#16203A] text-[#97A1BC] hover:text-white hover:border-[#FF5500]/50 transition-all cursor-pointer"
                title="Do computador"
              >
                <Plus size={16} />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#283456] bg-[#16203A] text-[#97A1BC] hover:text-white hover:border-[#FF5500]/50 transition-all cursor-pointer"
                title="Das gerações e uploads"
              >
                <ImageIcon size={15} />
              </button>

              {/* Action Buttons for active image */}
              {activeImage && (
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSetCover(activeImageIndex)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1B2540] text-[#97A1BC] hover:text-[#FF5500] hover:bg-[#16203A] transition-colors cursor-pointer"
                    title="Usar como capa"
                  >
                    <Star size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(activeImageIndex)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1B2540] text-[#97A1BC] hover:text-rose-400 hover:bg-[#16203A] transition-colors cursor-pointer"
                    title="Tirar esta imagem"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Form Fields (5 cols) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    if (val) setCategory(val as any);
                  }}
                  items={categoryItems}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categoryItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
                  Nome
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  autoFocus={!editingElement}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Rick, Anna, Rua do velho"
                  className="w-full rounded-xl border border-[#283456] bg-[#060A16] px-3.5 py-2.5 text-xs sm:text-sm text-[#EDF1FA] placeholder-[#66708E] outline-none focus:border-[#FF5500] transition-colors"
                  required
                />
              </div>

              {/* Versão */}
              <div>
                <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
                  Versão
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="Ex.: 01"
                  className="w-full rounded-xl border border-[#283456] bg-[#060A16] px-3.5 py-2.5 text-xs sm:text-sm text-[#EDF1FA] placeholder-[#66708E] outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>

              {/* ID do elemento */}
              <div>
                <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
                  ID do elemento
                </label>
                <div className="relative flex items-center rounded-xl border border-[#283456] bg-[#060A16] px-3 py-1.5 focus-within:border-[#FF5500] transition-colors">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FF5500]/15 text-[#FF5500] font-bold text-xs shrink-0 mr-2">
                    @
                  </span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => {
                      setHandle(e.target.value.replace(/\s+/g, ""));
                      setIsHandleCustom(true);
                    }}
                    placeholder="Rick01"
                    className="w-full bg-transparent text-xs sm:text-sm text-[#EDF1FA] placeholder-[#66708E] outline-none font-mono"
                  />
                  {isHandleCustom && (
                    <button
                      type="button"
                      onClick={() => setIsHandleCustom(false)}
                      className="p-1 rounded text-[#97A1BC] hover:text-white"
                      title="Voltar ao automático"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
                <small className="block text-[11px] text-[#66708E] mt-1.5">
                  É assim que você chama no prompt:{" "}
                  <strong className="text-[#FF5500] font-mono">@{handle || "id"}</strong>
                </small>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Opcional. Ajuda o modelo: idade, roupa, estilo, época..."
                  className="w-full rounded-xl border border-[#283456] bg-[#060A16] px-3.5 py-2.5 text-xs sm:text-sm text-[#EDF1FA] placeholder-[#66708E] outline-none focus:border-[#FF5500] transition-colors resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <Select
                  value={status || "Sem status"}
                  onValueChange={(val) => {
                    if (val) setStatus(val as any);
                  }}
                  items={statusItems}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1B2540] shrink-0">
              {editingElement && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Excluir @${editingElement.handle || editingElement.name}?`)) {
                      onDelete(editingElement.id);
                      onClose();
                    }
                  }}
                  className="mr-auto text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Excluir
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#BAC3DA] hover:text-white hover:bg-[#16203A] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl text-xs font-bold bg-[#FF5500] hover:bg-[#FF6A1A] text-white shadow-lg shadow-[#FF5500]/25 transition-all cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
