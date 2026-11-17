"use client";

import React, { useState } from "react";
import { Key, CheckCircle, ExternalLink, ShieldAlert, X } from "lucide-react";

interface RunwareConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  balance: number;
}

export function RunwareConfigModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  balance,
}: RunwareConfigModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey);
    localStorage.setItem("boia_runware_key", tempKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-[#283456] bg-[#0F172C] p-6 shadow-2xl shadow-black/80 text-[#EDF1FA]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[#97A1BC] hover:bg-[#16203A] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Chave de API Runware</h2>
            <p className="text-xs text-[#97A1BC]">Pague apenas o preço real de custo de cada IA</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#1B2540] bg-[#060A16] p-3 text-xs leading-relaxed text-[#97A1BC]">
            <p>
              O <strong className="text-white">Boia</strong> não cobra margem ou pacotes de crédito. Todas as gerações ocorrem diretamente através da sua conta na <strong className="text-[#FF5500]">Runware</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#97A1BC] mb-1.5">
              Sua Chave de API (Runware API Key)
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Ex: rw_live_..."
              autoComplete="off"
              spellCheck={false}
              suppressHydrationWarning
              data-dashlane-ignore="true"
              data-form-type="other"
              className="w-full h-11 px-3.5 rounded-xl border border-[#283456] bg-[#16203A] text-sm text-white placeholder-[#66708E] focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all font-mono"
            />
          </div>

          {/* Current balance simulation */}
          <div className="flex items-center justify-between rounded-xl border border-[#1B2540] bg-[#16203A]/50 px-4 py-2.5">
            <span className="text-xs text-[#97A1BC]">Saldo estimado na Runware</span>
            <span className="font-mono text-sm font-bold text-[#4FD49B]">
              ${balance.toFixed(4)} USD
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://runware.ai/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#97A1BC] hover:text-[#FF5500] transition-colors"
            >
              <span>Pegar chave na Runware</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm fire-button"
            >
              {saved ? (
                <>
                  <CheckCircle size={16} />
                  <span>Salvo!</span>
                </>
              ) : (
                <span>Salvar chave</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
