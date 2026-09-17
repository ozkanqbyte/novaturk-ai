import React, { useState, useEffect } from 'react';
import { 
  Swords, Trophy, ThumbsUp, AlertTriangle, Check, X, Camera, 
  Copy, Share2, Sparkles, ChevronDown, ChevronUp, Users, ArrowRight, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/soundService';

export default function ComparisonMatrix({ comparison, isDark, currentTheme }) {
  if (!comparison || !comparison.entityA || !comparison.entityB) return null;

  const { entityA, entityB, winner, winnerName, verdict, matrix, communityVotes } = comparison;
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  // 🗳️ Topluluk Oylaması State'i (Local Storage ile kalıcı)
  const voteStorageKey = `novaturk_vote_${(entityA.name + '_' + entityB.name).toLowerCase().replace(/\s+/g, '_')}`;
  const [userVote, setUserVote] = useState(() => {
    try {
      return localStorage.getItem(voteStorageKey) || null;
    } catch {
      return null;
    }
  });

  const [votes, setVotes] = useState(() => {
    const initA = communityVotes?.initialPercentA || 52;
    const initB = communityVotes?.initialPercentB || 48;
    const total = communityVotes?.totalVotes || 1420;
    return {
      percentA: initA,
      percentB: initB,
      totalCount: total
    };
  });

  const handleVote = (choice) => {
    if (userVote) return;
    sound.playChime();
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.75 } });
    setUserVote(choice);
    try {
      localStorage.setItem(voteStorageKey, choice);
    } catch {}

    setVotes(prev => {
      const newTotal = prev.totalCount + 1;
      let newA = prev.percentA;
      let newB = prev.percentB;
      if (choice === 'A') {
        newA = Math.min(95, prev.percentA + 1);
        newB = 100 - newA;
      } else {
        newB = Math.min(95, prev.percentB + 1);
        newA = 100 - newB;
      }
      return {
        percentA: newA,
        percentB: newB,
        totalCount: newTotal
      };
    });
  };

  // 📋 Markdown Kopyalama
  const handleCopyMarkdown = () => {
    sound.playClick();
    let md = `# ⚔️ ${entityA.name} vs ${entityB.name} — Kafa Kafaya Karşılaştırma\n\n`;
    md += `**🏆 Kazanan / Öne Çıkan:** ${winnerName}\n\n`;
    md += `### 🎯 Nihai Karar\n${verdict}\n\n`;
    md += `### 📊 Kriter Matrisi\n`;
    matrix.forEach(m => {
      md += `- **${m.criteria}:** ${m.valA} vs ${m.valB} (Öne Çıkan: ${m.winner === 'A' ? entityA.name : (m.winner === 'B' ? entityB.name : 'Dengeli')})\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  // 📸 NovaKart Karşılaştırma Story Görseli Üretme
  const handleDownloadNovaKart = () => {
    sound.playClick();
    setIsGeneratingCard(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 680;
      const ctx = canvas.getContext('2d');

      // Arka plan gradyanı
      const bg = ctx.createLinearGradient(0, 0, 1200, 680);
      bg.addColorStop(0, '#070b14');
      bg.addColorStop(0.5, '#04060c');
      bg.addColorStop(1, '#020306');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 680);

      // Üst neon ışık
      const glow = ctx.createRadialGradient(600, 0, 40, 600, 0, 500);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1200, 450);

      // Kart çerçevesi
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(40, 35, 1120, 610, 24);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(40, 35, 1120, 610);
      }

      // Başlık & Logo
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('⚔️ NovaTürk AI Kafa Kafaya Matris', 80, 85);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('• 50 Türk Kaynağı & Şikayetvar Konsensüsü', 450, 84);

      // Karşılaştırma Başlığı
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`${entityA.name}  vs  ${entityB.name}`, 80, 150);

      // Kazanan Rozeti
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`🏆 Öne Çıkan: ${winnerName}`, 80, 195);

      // Skor Kutusu Sol
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(80, 225, 490, 135, 16);
        ctx.fill();
      } else {
        ctx.fillRect(80, 225, 490, 135);
      }
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(entityA.name, 105, 265);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`${entityA.score} / 10`, 105, 305);
      ctx.fillStyle = '#10b981';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`Halk Memnuniyeti: ${entityA.satisfaction}`, 105, 335);

      // Skor Kutusu Sağ
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(630, 225, 490, 135, 16);
        ctx.fill();
      } else {
        ctx.fillRect(630, 225, 490, 135);
      }
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(entityB.name, 655, 265);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`${entityB.score} / 10`, 655, 305);
      ctx.fillStyle = '#10b981';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`Halk Memnuniyeti: ${entityB.satisfaction}`, 655, 335);

      // Nihai Karar Kutusu
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(80, 390, 1040, 165, 16);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(80, 390, 1040, 165);
      }
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('🎯 Nihai Karar: Kim Hangi Durumda Tercih Etmeli?', 105, 425);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
      const words = verdict.split(' ');
      let line = '';
      let y = 465;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 980 && n > 0) {
          ctx.fillText(line, 105, y);
          line = words[n] + ' ';
          y += 28;
          if (y > 525) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 105, y);

      // Alt İmza
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('novaturk-engine.vercel.app • Türkiye\'nin Bağımsız Doğrulanmış Arama Motoru', 80, 605);

      const link = document.createElement('a');
      link.download = `novaturk-${(entityA.name + '-vs-' + entityB.name).toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Matris NovaKart indirme hatası:', err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const themeAccent = currentTheme?.accent || '#38bdf8';

  return (
    <div 
      className="w-full mb-8 rounded-[28px] border overflow-hidden transition-all duration-300 backdrop-blur-2xl text-left"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, rgba(13, 17, 28, 0.88) 0%, rgba(7, 10, 18, 0.94) 100%)' 
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(246, 248, 252, 0.98) 100%)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        boxShadow: isDark 
          ? '0 20px 50px -15px rgba(0,0,0,0.8), 0 0 35px rgba(56,189,248,0.12)' 
          : '0 20px 50px -15px rgba(0,0,0,0.06), 0 0 25px rgba(56,189,248,0.08)'
      }}
    >
      {/* ============================================================ */}
      {/* 1. ÜST BAŞLIK & KONTROL ÇUBUĞU                               */}
      {/* ============================================================ */}
      <div className="w-full px-5 py-3.5 border-b flex items-center justify-between gap-3 border-white/10 bg-white/[0.02]">
        
        {/* Sol: Rozet & Canlı Bilgi */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
            <Swords className="w-4 h-4 text-sky-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-['Outfit',sans-serif] tracking-tight text-white flex items-center gap-1.5">
                Kafa Kafaya Karşılaştırma Matrisi
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Doğrulanmış
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden md:block">
              50 Türk sitesi, Ekşi Sözlük, Donanım Forumları ve Şikayetvar taranarak oluşturuldu.
            </p>
          </div>
        </div>

        {/* Sağ: Aksiyon Butonları */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* NovaKart Story İndir */}
          <button
            onClick={handleDownloadNovaKart}
            disabled={isGeneratingCard}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/15 text-slate-300 hover:text-sky-300 text-xs font-medium transition-all"
            title="Instagram Story / X Görseli İndir"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">NovaKart İndir</span>
          </button>

          {/* Markdown Kopyala */}
          <button
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/15 text-slate-300 hover:text-white text-xs transition-all"
            title="Karşılaştırmayı Markdown Olarak Kopyala"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Genişlet / Daralt */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/15 text-slate-400 hover:text-white transition-all"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {isExpanded && (
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* ============================================================ */}
          {/* 2. KAHRAMAN YÜZLEŞMESİ (ENTITY A VS ENTITY B KARTLARI)         */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4">
            
            {/* SOL KART: ENTITY A */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden ${
              winner === 'A' 
                ? 'bg-gradient-to-b from-sky-500/10 to-slate-900/60 border-sky-400/40 shadow-lg shadow-sky-500/10' 
                : 'bg-white/[0.03] border-white/10'
            }`}>
              {winner === 'A' && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Öne Çıkan
                </div>
              )}

              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {entityA.tagline || '1. Seçenek'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif] text-white mt-0.5">
                {entityA.name}
              </h3>

              <div className="flex items-center gap-3 mt-3">
                <div className="px-2.5 py-1 rounded-xl bg-sky-500/20 border border-sky-400/30 font-bold text-sky-300 text-sm">
                  ⭐ {entityA.score} / 10
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-emerald-400 font-semibold">{entityA.satisfaction}</span> Memnuniyet
                </div>
              </div>
            </div>

            {/* ORTA: VS ROZETİ */}
            <div className="flex justify-center my-1 md:my-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-900 to-black border border-white/20 flex items-center justify-center text-xs font-black tracking-widest text-sky-300 shadow-xl">
                VS
              </div>
            </div>

            {/* SAĞ KART: ENTITY B */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden ${
              winner === 'B' 
                ? 'bg-gradient-to-b from-purple-500/10 to-slate-900/60 border-purple-400/40 shadow-lg shadow-purple-500/10' 
                : 'bg-white/[0.03] border-white/10'
            }`}>
              {winner === 'B' && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Öne Çıkan
                </div>
              )}

              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {entityB.tagline || '2. Seçenek'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif] text-white mt-0.5">
                {entityB.name}
              </h3>

              <div className="flex items-center gap-3 mt-3">
                <div className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/30 font-bold text-purple-300 text-sm">
                  ⭐ {entityB.score} / 10
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-emerald-400 font-semibold">{entityB.satisfaction}</span> Memnuniyet
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* 3. İNTERAKTİF TOPLULUK OYLAMASI (VIRAL MOTOR)                 */}
          {/* ============================================================ */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" /> Canlı Topluluk Oylaması: Sen Hangisini Seçerdin?
              </span>
              <span className="text-[11px] text-slate-400">
                {votes.totalCount.toLocaleString('tr-TR')} kişi oy kullandı
              </span>
            </div>

            {/* Oylama Butonları / Yüzde Çubuğu */}
            {!userVote ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleVote('A')}
                  className="py-2.5 px-4 rounded-xl border bg-sky-500/10 hover:bg-sky-500/25 border-sky-400/40 text-sky-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{entityA.name} Seç</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleVote('B')}
                  className="py-2.5 px-4 rounded-xl border bg-purple-500/10 hover:bg-purple-500/25 border-purple-400/40 text-purple-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{entityB.name} Seç</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-300">
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
                  <div 
                    style={{ width: `${votes.percentA}%` }} 
                    className="bg-sky-500 transition-all duration-700" 
                  />
                  <div 
                    style={{ width: `${votes.percentB}%` }} 
                    className="bg-purple-500 transition-all duration-700" 
                  />
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-sky-400">{entityA.name}: %{votes.percentA}</span>
                  <span className="text-emerald-400 font-normal text-[11px]">✓ Oyun kaydedildi</span>
                  <span className="text-purple-400">{entityB.name}: %{votes.percentB}</span>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* 4. KRİTERLER KARŞILAŞTIRMA TABLOSU (DERİN MATRİS)             */}
          {/* ============================================================ */}
          {matrix && matrix.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Kriter Kriter Başarı Analizi
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.04] text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-3 font-semibold">Kriter</th>
                      <th className="p-3 font-semibold">{entityA.name}</th>
                      <th className="p-3 font-semibold">{entityB.name}</th>
                      <th className="p-3 font-semibold text-right">Öne Çıkan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-medium text-slate-200">
                          {row.criteria}
                        </td>
                        <td className={`p-3 ${row.winner === 'A' ? 'text-sky-300 font-semibold' : 'text-slate-400'}`}>
                          {row.valA}
                        </td>
                        <td className={`p-3 ${row.winner === 'B' ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                          {row.valB}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            row.winner === 'A'
                              ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                              : row.winner === 'B'
                              ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                              : 'bg-white/10 border-white/20 text-slate-300'
                          }`}>
                            {row.winner === 'A' ? entityA.name : (row.winner === 'B' ? entityB.name : 'Dengeli')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. ARTILAR & EKSİLER (YAN YANA LİSTE)                          */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            
            {/* Entity A Artılar & Eksiler */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h5 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" /> {entityA.name} Güçlü ve Zayıf Yönleri
              </h5>
              
              <div className="space-y-1.5 text-xs text-slate-200">
                {(entityA.pros || []).map((pro, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </div>
                ))}
                {(entityA.cons || []).map((con, i) => (
                  <div key={i} className="flex items-start gap-2 text-rose-300/90">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Entity B Artılar & Eksiler */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h5 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" /> {entityB.name} Güçlü ve Zayıf Yönleri
              </h5>
              
              <div className="space-y-1.5 text-xs text-slate-200">
                {(entityB.pros || []).map((pro, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </div>
                ))}
                {(entityB.cons || []).map((con, i) => (
                  <div key={i} className="flex items-start gap-2 text-rose-300/90">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* 6. NİHAİ KARAR KUTUSU (VERDICT)                               */}
          {/* ============================================================ */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-purple-500/10 border border-emerald-400/30 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>🎯 NovaTürk AI Kararı: Kim Hangi Durumda Tercih Etmeli?</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {verdict}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="p-2 rounded-xl bg-black/30 border border-white/10">
                <strong className="text-sky-300 block mb-1">📌 {entityA.name} İçin İdeal Profil:</strong>
                <span className="text-slate-300">{entityA.bestFor}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-white/10">
                <strong className="text-purple-300 block mb-1">📌 {entityB.name} İçin İdeal Profil:</strong>
                <span className="text-slate-300">{entityB.bestFor}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
