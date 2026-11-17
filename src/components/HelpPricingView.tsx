"use client";

import React from "react";
import { Check, X, Zap, DollarSign, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

interface HelpPricingViewProps {
  onOpenConfig: () => void;
}

export function HelpPricingView({ onOpenConfig }: HelpPricingViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-36">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 text-xs font-semibold">
          <Zap size={13} />
          Preço real de fábrica
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#F2EDE4] tracking-tight">
          Gere mais, gaste menos.
        </h1>
        <p className="text-sm md:text-base text-[#97A1BC] max-w-xl mx-auto leading-relaxed">
          Estúdio de imagem e vídeo com IA onde você não compra pacotes de créditos inflacionados. Você conecta sua conta Runware e paga a fração de centavo que a máquina realmente gastou.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-[#1B2540] bg-[#0F172C] p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4">
          Comparação de Custos: Plataformas Tradicionais vs. Boia (Runware)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-[#1B2540] text-[#97A1BC]">
                <th className="pb-3 font-semibold">Modelo de IA</th>
                <th className="pb-3 font-semibold">Plataformas de Crédito (Midjourney/Krea/Leonardo)</th>
                <th className="pb-3 font-semibold text-[#FF5500]">No Boia (Preço Real Runware)</th>
                <th className="pb-3 font-semibold">Economia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2540]/60">
              <tr>
                <td className="py-3 font-medium text-white">FLUX.1 Schnell</td>
                <td className="py-3 text-[#FF5C6C]">~$0.05 a $0.10 / imagem</td>
                <td className="py-3 font-mono font-bold text-[#4FD49B]">$0.003 / imagem</td>
                <td className="py-3 font-semibold text-white">~96% mais barato</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">FLUX.1 Dev</td>
                <td className="py-3 text-[#FF5C6C]">~$0.15 a $0.30 / imagem</td>
                <td className="py-3 font-mono font-bold text-[#4FD49B]">$0.025 / imagem</td>
                <td className="py-3 font-semibold text-white">~88% mais barato</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">SDXL Lightning</td>
                <td className="py-3 text-[#FF5C6C]">~$0.04 a $0.08 / imagem</td>
                <td className="py-3 font-mono font-bold text-[#4FD49B]">$0.0018 / imagem</td>
                <td className="py-3 font-semibold text-white">~97% mais barato</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">1.000 imagens geradas</td>
                <td className="py-3 text-[#FF5C6C]">R$ 250 a R$ 500 / mês</td>
                <td className="py-3 font-mono font-bold text-[#4FD49B]">~ R$ 15 a R$ 25 / mês</td>
                <td className="py-3 font-semibold text-white">Até 95% de economia</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Connect Runware */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#1B2540] bg-[#0A1022] p-5 space-y-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5500]/15 text-[#FF5500] font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-sm text-white">Crie sua conta na Runware</h3>
          <p className="text-xs text-[#97A1BC] leading-relaxed">
            Acesse o portal da Runware.ai e crie sua conta para obter sua chave de desenvolvedor.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1B2540] bg-[#0A1022] p-5 space-y-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5500]/15 text-[#FF5500] font-bold text-xs">
            2
          </div>
          <h3 className="font-bold text-sm text-white">Coloque créditos na sua conta</h3>
          <p className="text-xs text-[#97A1BC] leading-relaxed">
            Adicione $5 ou $10 diretamente na sua conta da Runware. Não há mensalidades obrigatórias.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1B2540] bg-[#0A1022] p-5 space-y-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5500]/15 text-[#FF5500] font-bold text-xs">
            3
          </div>
          <h3 className="font-bold text-sm text-white">Conecte a chave no Boia</h3>
          <p className="text-xs text-[#97A1BC] leading-relaxed">
            Cole sua chave API nas configurações do Boia e comece a gerar à vontade com interface limpa.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl border border-[#283456] bg-gradient-to-r from-[#0F172C] to-[#16203A] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-white">Pronto para começar?</h3>
          <p className="text-xs text-[#97A1BC]">Insira sua chave Runware para desbloquear o estúdio completo.</p>
        </div>

        <button
          onClick={onOpenConfig}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider fire-button shrink-0"
        >
          <span>Conectar chave Runware</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
