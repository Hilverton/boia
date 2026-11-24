"use client";

import React, { useState } from "react";
import { ShieldAlert, Lock, X, Eye, AlertCircle } from "lucide-react";

interface DeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeniedModal({ isOpen, onClose }: DeniedModalProps) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 4) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setPassword("");
    setUnlocked(false);
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#283456] bg-[#0A1022] p-6 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-[#97A1BC] hover:text-white p-1 rounded-lg hover:bg-[#16203A] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F2EDE4]">
              Gerações negadas & ocultas
            </h3>
            <p className="text-xs text-[#97A1BC]">Área de privacidade restrita</p>
          </div>
        </div>

        {!unlocked ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[#BAC3DA] leading-relaxed">
              Digite sua senha de acesso para visualizar itens ocultos ou bloqueados por segurança.
            </p>

            <div>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Senha de acesso"
                className="w-full rounded-xl border border-[#283456] bg-[#060A16] px-4 py-2.5 text-sm text-white placeholder-[#66708E] outline-none focus:border-[#FF5500]"
              />
              {error && (
                <span className="text-[11px] text-rose-400 mt-1 block">
                  Digite ao menos 4 caracteres.
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#97A1BC] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF5500] hover:bg-[#FF6A1A] text-white"
              >
                Desbloquear
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Nenhum item oculto no momento</h4>
              <p className="text-xs text-[#97A1BC] mt-1">
                Todas as suas gerações estão visíveis normalmente na galeria e projetos.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16203A] hover:bg-[#1F2C50] text-white"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
