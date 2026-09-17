import React, { useState } from 'react';
import { 
  FileText, Download, Printer, Copy, Check, Sparkles, 
  RotateCw, Zap, CheckCircle2 
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function ActionExecutorWidget({ executorData, isDark }) {
  const [activeAction, setActiveAction] = useState('doc'); // doc, flashcards
  const [copied, setCopied] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  if (!executorData) return null;

  const { petitionDocument, flashcards } = executorData;

  const handleDownload = () => {
    sound.playClick();
    const element = document.createElement('a');
    const file = new Blob([petitionDocument.content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = petitionDocument.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(petitionDocument.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sound.playClick();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre style="font-family: -apple-system, BlinkMacSystemFont, monospace; white-space: pre-wrap; padding: 24px; font-size: 13px;">${petitionDocument.content}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleFlip = (id) => {
    sound.playClick();
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`apple-glass rounded-3xl p-6 transition-all ${
      isDark ? 'border-white/10' : 'border-black/8'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
        isDark ? 'border-white/8' : 'border-black/5'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
            isDark ? 'bg-white/10 border-white/15 text-white' : 'bg-black/5 border-black/10 text-slate-800'
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold tracking-tight">
              İcracı Ajan Eylem Merkezi
            </h4>
            <p className="text-[11px] opacity-60">
              Google sadece link verir; NovaTürk resmi dilekçeyi ve çalışma kartlarını üretir
            </p>
          </div>
        </div>

        {/* Minimalist Switcher */}
        <div className={`flex items-center gap-1 p-1 rounded-full border ${
          isDark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.02] border-black/8'
        }`}>
          <button
            onClick={() => {
              sound.playClick();
              setActiveAction('doc');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeAction === 'doc'
                ? isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Resmî Belge
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveAction('flashcards');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeAction === 'flashcards'
                ? isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Sınav Kartları
          </button>
        </div>
      </div>

      {/* VIEW 1: RESMİ BELGE */}
      {activeAction === 'doc' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-70 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{petitionDocument.type}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                title="Kopyala"
                className="apple-pill-btn px-2.5 py-1 rounded-lg text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>

              <button
                onClick={handlePrint}
                title="Yazdır / PDF"
                className="apple-pill-btn px-2.5 py-1 rounded-lg text-xs flex items-center gap-1"
              >
                <Printer className="w-3 h-3" />
                <span>PDF / Yazdır</span>
              </button>

              <button
                onClick={handleDownload}
                title="Metin Belgesi İndir"
                className="apple-primary-btn px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3 h-3" />
                <span>İndir</span>
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border font-mono text-xs leading-relaxed max-h-48 overflow-y-auto select-text ${
            isDark ? 'bg-black/30 border-white/10 text-slate-300' : 'bg-slate-50 border-black/5 text-slate-800'
          }`}>
            {petitionDocument.content}
          </div>
        </div>
      )}

      {/* VIEW 2: FLASHCARDS */}
      {activeAction === 'flashcards' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Soru-Cevap Çalışma Kartları</span>
            <span>Cevabı görmek için karta tıklayın</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {flashcards.map((card) => {
              const isFlipped = flippedCards[card.id];
              return (
                <div
                  key={card.id}
                  onClick={() => toggleFlip(card.id)}
                  className={`p-4 rounded-2xl border cursor-pointer min-h-[130px] flex flex-col justify-between transition-all select-none ${
                    isFlipped 
                      ? (isDark ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/15')
                      : (isDark ? 'bg-white/[0.02] border-white/8 hover:border-white/15' : 'bg-black/[0.01] border-black/6 hover:border-black/10')
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-60 font-bold uppercase tracking-wider mb-2">
                    <span>{isFlipped ? 'CEVAP' : `SORU #${card.id}`}</span>
                    <RotateCw className="w-3 h-3" />
                  </div>

                  <p className="text-xs font-medium leading-snug">
                    {isFlipped ? card.answer : card.question}
                  </p>

                  <span className="text-[9px] opacity-40 mt-2 block">
                    {isFlipped ? 'Soruya dön' : 'Cevabı gör'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
