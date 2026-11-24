"use client";

import React, { useState } from "react";
import { X, Lock, Globe, Users } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, isPrivate: boolean) => void;
}

export function NewProjectModal({
  isOpen,
  onClose,
  onCreate,
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = projectName.trim() || "Novo projeto";
    onCreate(finalName, isPrivate);
    setProjectName("");
    setIsPrivate(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-[470px] rounded-2xl border border-[#283456] bg-[#0A1022] p-6 shadow-2xl shadow-black/80"
        role="dialog"
        aria-modal="true"
        aria-label="Novo projeto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1B2540]">
          <h3 className="text-lg font-bold text-[#F2EDE4] tracking-tight">
            Novo projeto
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#97A1BC] hover:bg-[#16203A] hover:text-[#EDF1FA] transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
              Nome do projeto
            </label>
            <input
              type="text"
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Meu projeto"
              maxLength={80}
              className="w-full rounded-xl border border-[#283456] bg-[#060A16] px-4 py-2.5 text-sm text-[#EDF1FA] placeholder-[#66708E] outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-colors"
            />
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#97A1BC] uppercase tracking-wider mb-1.5">
              Visibilidade
            </label>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              title="Público aparece na Vitrine com link aberto"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#283456] bg-[#0F172C] hover:border-[#3E4F7C] transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isPrivate
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      : "border-blue-500/40 bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {isPrivate ? <Lock size={16} /> : <Globe size={16} />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#EDF1FA]">
                    {isPrivate ? "Projeto privado" : "Projeto público"}
                  </div>
                  <div className="text-[11px] text-[#97A1BC]">
                    {isPrivate
                      ? "Apenas você e quem você convidar podem ver"
                      : "Aparece na Vitrine com link aberto"}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-[#FF5500] group-hover:underline">
                Alternar
              </span>
            </button>
          </div>

          {/* Team Info Row */}
          <div className="rounded-xl border border-[#1B2540] bg-[#060A16]/80 p-3.5 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#16203A] text-[#97A1BC] shrink-0 mt-0.5">
              <Users size={16} />
            </div>
            <div className="space-y-0.5 text-xs">
              <strong className="text-[#EDF1FA] block font-medium">
                Deseja trabalhar com sua equipe?
              </strong>
              <span className="text-[#97A1BC] block leading-relaxed">
                Convide pelo e-mail ou pelo ID. Cada um gera com os próprios créditos.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1B2540]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#97A1BC] hover:bg-[#16203A] hover:text-[#EDF1FA] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF5500] hover:bg-[#FF6A1A] text-white shadow-lg shadow-[#FF5500]/25 transition-all"
            >
              Criar projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
