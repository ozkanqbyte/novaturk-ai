import React, { useState, useEffect } from 'react';
import { 
  Globe, Sparkles, Image as ImageIcon, Newspaper, 
  ExternalLink, Copy, Check, Volume2, VolumeX, Share2, 
  CheckCircle2, Clock, Zap, BookOpen, MessageSquare, ThumbsUp, AlertTriangle, Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReaderModeDrawer from './ReaderModeDrawer';
import { sound } from '../services/soundService';
import { unescapeHtml } from '../services/searchService';

export default function HybridResults({ results, onRelatedClick, isDark, currentTheme, onOpenInAppTab }) {
  const [activeTab, setActiveTab] = useState('all');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readerArticle, setReaderArticle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const rawSummary = results?.sadedeGel?.summary || results?.aiSummary || '';

  useEffect(() => {
    if (!rawSummary) return;

    const fullText = unescapeHtml(rawSummary);
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const step = 8;
    const interval = setInterval(() => {
      currentIndex += step;
      if (currentIndex >= fullText.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        sound.playChime();
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, currentIndex));
      }
    }, 12);

    return () => clearInterval(interval);
  }, [rawSummary]);

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(unescapeHtml(rawSummary));
    setCopied(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    sound.playClick();
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(unescapeHtml(rawSummary));
    utterance.lang = 'tr-TR';
    utterance.rate = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShare = () => {
    sound.playClick();
    if (navigator.share) {
      navigator.share({
        title: 'NovaTürk AI: ' + (results?.query || ''),
        text: unescapeHtml(rawSummary),
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const tabs = [
    { id: 'all', label: 'Tümü', icon: Globe },
    { id: 'images', label: 'Görseller', icon: ImageIcon },
    { id: 'news', label: 'Haberler', icon: Newspaper }
  ];

  const webResults = results?.webResults || [];
  const visuals = results?.visuals || [];
  const news = results?.news || [];
  const knowledgeCard = results?.knowledgeCard;
  const sadedeGel = results?.sadedeGel;
  const halkNeDiyor = results?.halkNeDiyor;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      
      {/* 1. Sade ve Şık Sekme Çubuğu */}
      <div className={`flex items-center justify-between border-b pb-3 mb-5 overflow-x-auto no-scrollbar gap-3 ${
        isDark ? 'border-white/8' : 'border-black/8'
      }`}>
        <div className={`flex items-center gap-1 p-0.5 rounded-full border ${
          isDark ? 'bg-white/[0.03] border-white/8' : 'bg-black/[0.02] border-black/6'
        }`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                style={isActive ? {
                  backgroundColor: isDark ? '#ffffff' : '#0f172a',
                  color: isDark ? '#000000' : '#ffffff',
                  boxShadow: `0 2px 10px ${themeAccent}25`
                } : {}}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'font-semibold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs opacity-50 font-mono shrink-0">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{results?.stats?.timeTaken || '0.4s'}</span>
        </div>
      </div>

      {/* 2. Ana Izgara Düzeni (Perplexity Standardı) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sol Kolon */}
        <div className="lg:col-span-8 space-y-4">

          {/* 🌟 1. 'SADEDE GEL' KARTI (Apple Glassmorphic Design) */}
          {activeTab === 'all' && (
            <div 
              style={{
                boxShadow: isDark 
                  ? `0 16px 40px -12px rgba(0,0,0,0.6), 0 0 25px ${themeAccent}12` 
                  : `0 16px 40px -12px rgba(0,0,0,0.08), 0 0 25px ${themeAccent}10`
              }}
              className={`apple-glass rounded-2xl p-5 transition-all border ${
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/8 bg-white/70 shadow-sm'
              }`}
            >
              <div className={`flex items-center justify-between gap-3 pb-3 mb-3 border-b ${
                isDark ? 'border-white/6' : 'border-black/5'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div 
                    style={{
                      backgroundColor: `${themeAccent}18`,
                      borderColor: `${themeAccent}35`,
                      color: themeAccent
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight flex items-center gap-2 font-['Outfit',sans-serif]">
                      <span>Sadede Gel</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
                        ⚡ Doğrudan Yanıt
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleToggleSpeak}
                    title={isSpeaking ? 'Durdur' : 'Sesli Dinle'}
                    className={`apple-pill-btn p-1.5 rounded-lg text-xs transition-colors ${
                      isSpeaking ? 'bg-slate-800 text-white dark:bg-white dark:text-black' : ''
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleCopy}
                    title="Kopyala"
                    className="apple-pill-btn p-1.5 rounded-lg text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleShare}
                    title="Paylaş"
                    className="apple-pill-btn p-1.5 rounded-lg text-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tıklanabilir Kaynak Rozetleri */}
              {sadedeGel?.citations && sadedeGel.citations.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 no-scrollbar">
                  {sadedeGel.citations.map((cite) => (
                    <a
                      key={cite.index}
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`apple-glass-card rounded-xl px-2.5 py-1 text-left cursor-pointer transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 border ${
                        isDark ? 'border-white/10 hover:border-white/20 bg-white/5' : 'border-black/8 hover:border-black/15 bg-black/5'
                      }`}
                      title={cite.title}
                    >
                      <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center border ${
                        isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-black/10 border-black/10 text-slate-800'
                      }`}>
                        {cite.index}
                      </span>
                      <span className="text-[11px] font-medium max-w-[130px] truncate">
                        {cite.domain}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                    </a>
                  ))}
                </div>
              )}

              <div className={`text-sm sm:text-[15px] leading-relaxed font-normal ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}>
                <p>{displayedText}</p>
                {isTyping && (
                  <span 
                    style={{ backgroundColor: themeAccent }}
                    className="inline-block w-1.5 h-4 ml-1 translate-y-0.5 animate-pulse rounded-full"
                  />
                )}
              </div>

              {/* Önemli Maddeler */}
              {sadedeGel?.keyFacts && sadedeGel.keyFacts.length > 0 && (
                <div className={`mt-3.5 pt-3 border-t ${isDark ? 'border-white/6' : 'border-black/5'}`}>
                  <div className="space-y-1.5">
                    {sadedeGel.keyFacts.map((fact, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs opacity-90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🌟 2. 'HALK NE DİYOR?' KARTI */}
          {activeTab === 'all' && halkNeDiyor && (
            <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
              isDark 
                ? 'bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/8 shadow-md' 
                : 'bg-gradient-to-br from-slate-50 to-white border-slate-200/80 shadow-sm'
            }`}>
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1.5">
                      <span>Halk Ne Diyor?</span>
                      <span className="text-[10px] opacity-50 font-normal">(Ekşi Sözlük & Şikayetvar Sentezi)</span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {halkNeDiyor.sourcesSampled?.map((src, sIdx) => (
                    <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-md border border-white/5 bg-white/5 opacity-60 shrink-0 hidden sm:inline-block">
                      {src}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200/60'
                }`}>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mb-1.5">
                    <ThumbsUp className="w-3 h-3" /> En Çok Beğenilenler
                  </span>
                  <ul className="space-y-1 text-xs opacity-90">
                    {halkNeDiyor.pros?.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-amber-500/[0.04] border-amber-500/20' : 'bg-amber-50/50 border-amber-200/60'
                }`}>
                  <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3 h-3" /> Şikayetler & Dikkat Edilenler
                  </span>
                  <ul className="space-y-1 text-xs opacity-90">
                    {halkNeDiyor.cons?.map((c, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {halkNeDiyor.consensus && (
                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                  isDark ? 'bg-sky-500/[0.05] border-sky-500/20 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-900'
                }`}>
                  <Lightbulb className="w-4 h-4 text-sky-400 shrink-0" />
                  <span><strong>Halkın Kararı:</strong> {halkNeDiyor.consensus}</span>
                </div>
              )}
            </div>
          )}

          {/* 3. TEMİZ VE SAF WEB SONUÇLARI */}
          {activeTab === 'all' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Doğrulanmış Web Kaynakları</span>
                </span>
                <span className="text-[11px] opacity-40 font-mono">
                  {webResults.length} Canlı Sonuç
                </span>
              </div>

              {webResults.map((result, idx) => {
                const cleanTitle = unescapeHtml(result.title || result.displayLink);
                const cleanSnippet = unescapeHtml(result.snippet || '');

                return (
                  <div
                    key={result.id || idx}
                    className={`apple-glass-card rounded-2xl p-4 transition-all border ${
                      isDark ? 'border-white/8 hover:border-white/20' : 'border-black/6 hover:border-black/15 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-xs">
                      <span className="font-medium opacity-70 truncate max-w-[200px]">
                        {result.displayLink}
                      </span>
                      {result.badge && (
                        <span className="text-[9px] px-2 py-0.5 rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-400 font-semibold shrink-0">
                          {result.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="text-[15px] sm:text-[16px] font-semibold tracking-tight leading-snug">
                      <button
                        onClick={() => onOpenInAppTab ? onOpenInAppTab({ ...result, title: cleanTitle, snippet: cleanSnippet }) : window.open(result.link, '_blank')}
                        className="hover:underline text-left transition-all inline-flex items-baseline gap-1.5"
                        style={{ color: isDark ? '#38bdf8' : '#0369a1' }}
                      >
                        <span>{cleanTitle}</span>
                        <span className="text-[10px] opacity-40 font-mono no-underline">↗</span>
                      </button>
                    </h4>

                    <p className={`mt-1.5 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-2 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {cleanSnippet}
                    </p>

                    <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                      isDark ? 'border-white/5' : 'border-black/5'
                    }`}>
                      <span className="opacity-40">{result.timestamp || 'Doğrulandı'}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setReaderArticle({ ...result, title: cleanTitle, snippet: cleanSnippet })}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 border transition-all hover:scale-105 ${
                            isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-black/5 hover:bg-black/10 text-black border-black/10'
                          }`}
                        >
                          <BookOpen className="w-3 h-3 opacity-70" />
                          <span>Reklamsız Oku</span>
                        </button>

                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-50 hover:opacity-100 px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-opacity border border-white/5 hover:bg-white/5"
                          title="Resmi Sayfayı Yeni Sekmede Aç"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Görseller Tab */}
          {activeTab === 'images' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visuals.map((img, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className="group relative rounded-2xl overflow-hidden aspect-video bg-black/20 border border-white/10 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <img src={img.thumb || img.url} alt={img.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                    <span className="text-white text-xs font-semibold truncate">{img.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Haberler Tab */}
          {activeTab === 'news' && (
            <div className="space-y-3">
              {news.map((n, i) => (
                <div key={i} className="apple-glass-card rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-bold text-sky-400 block mb-1">{n.source} • {n.time}</span>
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline block mb-1">
                    {n.title}
                  </a>
                  <p className="text-xs opacity-70">{n.snippet}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Sağ Kolon: Bilgi Kartı */}
        <div className="lg:col-span-4 space-y-4">
          {knowledgeCard && (
            <div className={`apple-glass rounded-2xl p-5 border sticky top-20 ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/8 bg-white/70 shadow-sm'
            }`}>
              {knowledgeCard.thumbnail && (
                <div className="rounded-xl overflow-hidden mb-3.5 aspect-video border border-white/10 shadow-sm">
                  <img src={knowledgeCard.thumbnail} alt={knowledgeCard.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-lg font-bold tracking-tight mb-1">{knowledgeCard.title}</h3>
              {knowledgeCard.subtitle && (
                <span className="text-xs font-medium text-sky-400 block mb-2.5">{knowledgeCard.subtitle}</span>
              )}
              <p className="text-xs leading-relaxed opacity-80 mb-4 line-clamp-4">{knowledgeCard.description}</p>

              {knowledgeCard.attributes && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  {knowledgeCard.attributes.map((attr, aIdx) => (
                    <div key={aIdx} className="flex items-center justify-between text-xs">
                      <span className="opacity-50">{attr.label}</span>
                      <span className="font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <ReaderModeDrawer
        isOpen={!!readerArticle}
        onClose={() => setReaderArticle(null)}
        article={readerArticle}
        isDark={isDark}
      />

    </div>
  );
}
