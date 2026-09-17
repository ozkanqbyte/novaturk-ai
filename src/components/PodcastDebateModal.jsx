import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Pause, RotateCcw, Radio, Mic, Volume2, 
  VolumeX, Sparkles, User, MessageSquare 
} from 'lucide-react';
import { sound } from '../services/soundService';

export default function PodcastDebateModal({ isOpen, onClose, query, podcastScript }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const speechRef = useRef(null);

  const script = podcastScript || [];

  useEffect(() => {
    if (!isOpen) {
      handleStop();
    }
  }, [isOpen]);

  const speakLine = (index) => {
    if (index >= script.length) {
      setIsPlaying(false);
      setCurrentLineIndex(0);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız sesli konuşmayı desteklemiyor.');
      setIsPlaying(false);
      return;
    }

    setCurrentLineIndex(index);
    const line = script[index];
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = 'tr-TR';

    // Ses karakteri ayarlama (Ajan Emre biraz daha kalın, Ajan Melis daha tiz)
    if (line.speaker === 'Ajan Emre') {
      utterance.pitch = 0.9;
      utterance.rate = 1.05;
    } else {
      utterance.pitch = 1.25;
      utterance.rate = 1.08;
    }

    utterance.onend = () => {
      if (isPlaying) {
        // Sonraki satıra geç
        setTimeout(() => {
          speakLine(index + 1);
        }, 400);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayToggle = () => {
    sound.playClick();
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakLine(currentLineIndex);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    window.speechSynthesis.cancel();
    setCurrentLineIndex(0);
    setIsPlaying(true);
    speakLine(0);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div className="vision-glass w-full max-w-2xl rounded-[36px] border border-cyan-500/40 p-6 sm:p-8 shadow-[0_25px_90px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            handleStop();
            onClose();
          }}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Podcast Studio Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-500 p-[1.5px] shadow-[0_0_25px_rgba(244,63,94,0.5)]">
            <div className="w-full h-full bg-[#050b1e] rounded-[14px] flex items-center justify-center">
              <Radio className={`w-6 h-6 text-rose-400 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
                NovaTürk AI Podcast Stüdyosu
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full bg-rose-400 ${isPlaying ? 'animate-ping' : ''}`} />
                {isPlaying ? 'CANLI YAYINDA' : 'STÜDYO'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dünyada İlk: İki Yapay Zeka Ajanının Canlı Türkçe Münazarası
            </p>
          </div>
        </div>

        {/* Topic Banner */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 flex items-center justify-between">
          <span className="text-xs text-slate-300">
            <strong className="text-white">Tartışılan Başlık:</strong> "{query}"
          </span>
          <span className="text-[11px] text-cyan-400 font-semibold font-mono">
            {script.length} Bölüm
          </span>
        </div>

        {/* Dynamic Equalizer Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-12 mb-6 px-4 py-2 rounded-2xl bg-[#020512] border border-white/5">
          {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 90, 45].map((val, idx) => (
            <span
              key={idx}
              className="w-1.5 bg-gradient-to-t from-cyan-500 to-rose-400 rounded-full transition-all duration-200"
              style={{
                height: isPlaying ? `${Math.max(15, (val * (idx % 2 === 0 ? 1 : 0.8)))}%` : '15%',
                animation: isPlaying ? `bounce 0.8s ease-in-out infinite alternate ${idx * 60}ms` : 'none'
              }}
            />
          ))}
        </div>

        {/* Dialogue Scroll Transcript */}
        <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-1">
          {script.map((item, idx) => {
            const isCurrent = currentLineIndex === idx && isPlaying;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] scale-[1.01]' 
                    : 'bg-white/[0.02] border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${item.color} flex items-center gap-1.5`}>
                    <User className="w-3 h-3" />
                    <span>{item.speaker}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.role})</span>
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <Mic className="w-3 h-3 animate-pulse" /> Konuşuyor...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Audio Player Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={handleRestart}
            title="Baştan Başlat"
            className="vision-pill-btn px-3 py-2 rounded-xl text-xs text-slate-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Baştan Dinle</span>
          </button>

          <button
            onClick={handlePlayToggle}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-emerald-400 to-rose-400 hover:opacity-90 shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlaying ? 'Duraklat' : 'Münazarayı Başlat'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
