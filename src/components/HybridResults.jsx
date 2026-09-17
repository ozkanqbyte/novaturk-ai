import React, { useState, useEffect } from 'react';
import { 
  Globe, Sparkles, Image as ImageIcon, Newspaper, 
  ExternalLink, Copy, Check, Volume2, VolumeX, Share2, 
  Brain, CheckCircle2, ChevronRight, TrendingUp, Info, Eye,
  Radio, Zap, BookOpen, Clock, Award, Scale, Tag, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AgentSwarmVisualizer from './AgentSwarmVisualizer';
import ActionExecutorWidget from './ActionExecutorWidget';
import PodcastDebateModal from './PodcastDebateModal';
import ReaderModeDrawer from './ReaderModeDrawer';
import HybridTelemetryBar from './HybridTelemetryBar';
import DevilsAdvocateWidget from './DevilsAdvocateWidget';
import BargainHunterWidget from './BargainHunterWidget';
import VerifiedSponsoredResult from './VerifiedSponsoredResult';
import { getSponsoredAd } from '../services/sponsoredAdsService';
import { sound } from '../services/soundService';
import { unescapeHtml } from '../services/searchService';

export default function HybridResults({ results, onRelatedClick, isDark, currentTheme, onOpenInAppTab, onOpenBusinessModal }) {
  const [activeTab, setActiveTab] = useState('all');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCitation, setActiveCitation] = useState(null);
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [readerArticle, setReaderArticle] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  // Streaming Typewriter Effect
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!results?.aiSummary) return;

    const fullText = unescapeHtml(results.aiSummary);
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
    }, 16);

    return () => clearInterval(interval);
  }, [results?.aiSummary]);

  if (!results) return null;

  const { query, isDeepSearch, isUsingLiveGoogle, isUsingLiveGemini, webResults, aiSummary, relatedQuestions, visuals, news, knowledgeCard, agentData, stats } = results;
  const sponsoredAd = getSponsoredAd(query);

  const handleToggleSpeak = () => {
    sound.playClick();
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const plainText = aiSummary.replace(/[*#_\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.05;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    sound.playChime();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.25 },
      colors: isDark ? ['#ffffff', '#94a3b8', '#cbd5e1'] : ['#0f172a', '#334155', '#64748b']
    });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const tabs = [
    { id: 'all', label: 'Tümü', icon: Globe },
    { id: 'ai', label: 'Yapay Zekâ', icon: Sparkles },
    { id: 'devils', label: 'Şeytanın Avukatı', icon: Scale },
    { id: 'bargain', label: 'Fiyat & İndirim', icon: Tag },
    { id: 'actions', label: 'İcra & Belgeler', icon: Zap },
    { id: 'images', label: 'Görseller', icon: ImageIcon },
    { id: 'news', label: 'Haberler', icon: Newspaper },
  ];

  const renderFormattedAiSummary = (text) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, pIdx) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={pIdx} className="text-xs sm:text-sm font-bold mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-current rounded-full opacity-60 inline-block" />
            {paragraph.replace('### ', '')}
          </h3>
        );
      }

      const parts = paragraph.split(/(\[\d+\])/g);

      return (
        <p key={pIdx} className={`text-xs sm:text-sm leading-relaxed mb-2.5 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {parts.map((part, i) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
              const citationIndex = parseInt(match[1], 10) - 1;
              return (
                <button
                  key={i}
                  onClick={() => {
                    sound.playClick();
                    setActiveCitation(citationIndex);
                  }}
                  title={`Kaynağa Git: [${match[1]}]`}
                  style={{
                    borderColor: `${themeAccent}40`,
                    color: isDark ? '#ffffff' : '#0f172a'
                  }}
                  className={`inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 text-[10px] font-bold rounded-md border transition-all align-baseline cursor-pointer hover:scale-105 ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/20' 
                      : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  {match[1]}
                </button>
              );
            }

            const boldParts = part.split(/(\*\*.*?\*\*)/g);
            return boldParts.map((bPart, bIdx) => {
              if (bPart.startsWith('**') && bPart.endsWith('**')) {
                return <strong key={bIdx} className="font-semibold text-current">{bPart.slice(2, -2)}</strong>;
              }
              return bPart;
            });
          })}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      {/* 🌟 3 Ayaklı Hibrit Motor Telemetri Çubuğu */}
      <HybridTelemetryBar 
        hybridTelemetry={results?.hybridTelemetry} 
        isDark={isDark} 
        currentTheme={currentTheme} 
      />

      {/* 1. Ultra-Compact Minimalist Tab Bar */}
      <div className={`flex items-center justify-between border-b pb-2.5 mb-4 overflow-x-auto no-scrollbar gap-3 ${
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
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'font-semibold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Podcast Button */}
        <button
          onClick={() => {
            sound.playChime();
            setIsPodcastOpen(true);
          }}
          className="apple-pill-btn flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0"
        >
          <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
          <span>AI Podcast</span>
        </button>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Results Column */}
        <div className="lg:col-span-8 space-y-3.5">
          
          {/* Ultra-Slim Agent Swarm Bar (5 Ajan) */}
          <AgentSwarmVisualizer agentData={agentData} isDark={isDark} />

          {/* Şeytanın Avukatı / Ters Köşe Sekmesi */}
          {activeTab === 'devils' && (
            <DevilsAdvocateWidget devilsData={agentData?.devilsAdvocate} isDark={isDark} />
          )}

          {/* Pazarlıkçı & Fiyat Avcısı Sekmesi */}
          {activeTab === 'bargain' && (
            <BargainHunterWidget bargainData={agentData?.bargainHunter} isDark={isDark} />
          )}

          {/* Sadece İcra & Eylem Sekmesi */}
          {activeTab === 'actions' && (
            <ActionExecutorWidget executorData={agentData?.executor} isDark={isDark} />
          )}

          {/* AI Synthesis Box (Dynamic Apple Frosted Glass) */}
          {(activeTab === 'all' || activeTab === 'ai') && (
            <div 
              style={{
                boxShadow: isDark 
                  ? `0 12px 36px -10px rgba(0,0,0,0.5), 0 0 20px ${themeAccent}10` 
                  : `0 12px 36px -10px rgba(0,0,0,0.06), 0 0 20px ${themeAccent}08`
              }}
              className={`apple-glass rounded-2xl p-4 sm:p-5 transition-all ${
                isDark ? 'border-white/10' : 'border-black/8'
              }`}
            >
              
              {/* Header Bar */}
              <div className={`flex items-center justify-between gap-3 pb-3 mb-3 border-b ${
                isDark ? 'border-white/6' : 'border-black/5'
              }`}>
                <div className="flex items-center gap-2">
                  <div 
                    style={{
                      backgroundColor: `${themeAccent}18`,
                      borderColor: `${themeAccent}35`,
                      color: themeAccent
                    }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center border shadow-sm"
                  >
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5 font-['Outfit',sans-serif]">
                      <span>NovaTürk Sentez</span>
                      {isDeepSearch && (
                        <span 
                          style={{
                            borderColor: `${themeAccent}30`,
                            color: themeAccent
                          }}
                          className="text-[9px] px-1.5 py-0.2 rounded-full border bg-white/5 font-semibold"
                        >
                          Derin
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
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

              {/* Source Chips Carousel (Compact) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
                {webResults.slice(0, 4).map((source, idx) => (
                  <div
                    key={idx}
                    onClick={() => setReaderArticle(source)}
                    className={`apple-glass-card rounded-xl px-2.5 py-1 text-left cursor-pointer transition-all flex items-center gap-1.5 shrink-0 group ${
                      activeCitation === idx ? (isDark ? 'ring-1 ring-white/40 bg-white/10' : 'ring-1 ring-black/30 bg-black/5') : ''
                    }`}
                  >
                    <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center border ${
                      isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-black/5 border-black/10 text-slate-800'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-medium max-w-[120px] truncate">
                      {source.displayLink}
                    </span>
                    <BookOpen className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                  </div>
                ))}
              </div>

              {/* Streaming Text */}
              <div className="relative">
                {renderFormattedAiSummary(displayedText)}
                {isTyping && (
                  <span className={`inline-block w-1.5 h-3.5 ml-1 rounded-sm animate-pulse align-middle ${
                    isDark ? 'bg-white' : 'bg-slate-900'
                  }`} />
                )}
              </div>
            </div>
          )}

          {/* İcracı Ajan Eylemleri (Tek tıkla açılır/kapanır) */}
          {activeTab === 'all' && (
            <div className="pt-1">
              <button
                onClick={() => setShowActions(!showActions)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                  isDark ? 'bg-white/[0.02] border-white/8 hover:bg-white/[0.04]' : 'bg-black/[0.01] border-black/6 hover:bg-black/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 opacity-70" />
                  <span>İcracı Ajan: Hazır Dilekçe & Sınav Kartları</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">
                  {showActions ? 'Gizle' : 'Göster'}
                </span>
              </button>

              {showActions && (
                <div className="mt-2 animate-fadeIn">
                  <ActionExecutorWidget executorData={agentData?.executor} isDark={isDark} />
                </div>
              )}
            </div>
          )}

          {/* Canlı İlgili Görseller Şeridi (Google Style Canlı Görsel Galerisi) */}
          {activeTab === 'all' && visuals && visuals.length > 0 && (
            <div className={`apple-glass rounded-2xl p-3 my-2 transition-all ${
              isDark ? 'border-white/8 bg-white/[0.015]' : 'border-black/6 bg-black/[0.015]'
            }`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>İlgili Görseller & Galerisi</span>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('images');
                  }}
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>Tümünü Gör ({visuals.length})</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {visuals.slice(0, 12).map((img, i) => (
                  <div
                    key={img.id || i}
                    onClick={() => {
                      sound.playClick();
                      setSelectedImage(img);
                    }}
                    className="group/thumb relative rounded-xl overflow-hidden border border-white/10 shrink-0 w-36 sm:w-44 h-24 sm:h-28 bg-black/20 hover:scale-[1.03] transition-all cursor-pointer"
                  >
                    <img
                      src={img.thumb}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur text-[8px] text-white px-1 py-0.5 rounded font-mono">
                      HD
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5 text-[10px] text-white truncate opacity-90 font-medium">
                      {img.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Web Sonuçları (COMPACT & MINIMALIST - GOOGLE LIKE) */}
          {(activeTab === 'all' || activeTab === 'news') && (
            <div className="space-y-2.5 pt-1">
              {/* 🌟 MODEL 1: ARAMADA 1. SIRA DOĞRULANMIŞ SPONSORLU LİNK */}
              {sponsoredAd && (
                <VerifiedSponsoredResult
                  ad={sponsoredAd}
                  onOpenInAppTab={onOpenInAppTab}
                  onOpenBusinessModal={onOpenBusinessModal}
                  isDark={isDark}
                  currentTheme={currentTheme}
                />
              )}

              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                  50 Türk Sitesi & Doğrulanmış Web İndeksi
                </span>
                <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Reklamsız Saf
                </span>
              </div>

              {webResults.map((result, idx) => {
                const isCited = activeCitation === idx;
                const cleanTitle = unescapeHtml(result.title);
                const cleanSnippet = unescapeHtml(result.snippet);

                return (
                  <div
                    key={idx}
                    style={isCited ? {
                      borderColor: themeAccent,
                      boxShadow: `0 0 25px ${themeAccent}30`
                    } : {}}
                    className={`apple-glass-card rounded-2xl p-3 sm:p-3.5 transition-all duration-300 ${
                      isCited 
                        ? 'border-opacity-100' 
                        : isDark ? 'border-white/8 hover:border-white/20' : 'border-black/6 hover:border-black/15'
                    }`}
                  >
                    {/* Top Favicon, Domain & Badge */}
                    <div className="flex items-center gap-2 text-[11px] mb-1.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${result.displayLink}&sz=32`} 
                          alt="" 
                          className="w-3.5 h-3.5 object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <span className="font-semibold opacity-80 truncate max-w-[160px] text-current">
                        {result.sourceName || result.displayLink}
                      </span>
                      <span className="opacity-30">•</span>
                      <span className="font-mono text-[10px] opacity-50 truncate max-w-[200px]">
                        {result.link}
                      </span>
                      {result.badge && (
                        <span 
                          style={{
                            borderColor: `${themeAccent}35`,
                            color: themeAccent
                          }}
                          className="ml-auto text-[9px] px-2 py-0.5 rounded-md border bg-white/5 font-semibold shrink-0"
                        >
                          {result.badge}
                        </span>
                      )}
                    </div>

                    {/* Title (Click opens in-app tab or external) */}
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

                    {/* Snippet (Concise, Clean & High Contrast) */}
                    <p className={`mt-1.5 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-2 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {cleanSnippet}
                    </p>

                    {/* Bottom Minimal Actions */}
                    <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                      isDark ? 'border-white/5' : 'border-black/5'
                    }`}>
                      <span className="opacity-40">{result.timestamp}</span>

                      <div className="flex items-center gap-1.5">
                        {/* NovaTürk Sekmede Aç Butonu */}
                        {onOpenInAppTab && (
                          <button
                            onClick={() => onOpenInAppTab({ ...result, title: cleanTitle, snippet: cleanSnippet })}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all hover:scale-105"
                            title="NovaTürk Dahili Sekmesinde Güvenle Aç"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Sekmede Aç</span>
                          </button>
                        )}

                        <button
                          onClick={() => setReaderArticle({ ...result, title: cleanTitle, snippet: cleanSnippet })}
                          style={{
                            borderColor: `${themeAccent}30`
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 border transition-all hover:scale-105 ${
                            isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
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
                          title="Dış Tarayıcı Sekmesinde Aç"
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

          {/* Görseller Tab (Canlı Fotoğraf ve Görsel Galerisi) */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Canlı Görsel & Fotoğraf Galerisi</span>
                </span>
                <span className="text-[11px] text-sky-400 font-medium">
                  {visuals.length} Yüksek Çözünürlüklü Görsel
                </span>
              </div>

              {knowledgeCard?.thumbnail && (
                <div className="apple-glass rounded-2xl p-3 border border-sky-500/20 bg-sky-500/5">
                  <span className="text-[11px] font-semibold text-sky-400 block mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Öne Çıkan Resmi Portre / Ana Görsel
                  </span>
                  <a
                    href={knowledgeCard.thumbnail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-white/10 max-h-72 aspect-[16/9] bg-black/40 group relative"
                  >
                    <img
                      src={knowledgeCard.thumbnail}
                      alt={knowledgeCard.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex justify-between items-end text-white">
                      <div>
                        <h4 className="text-sm font-bold">{unescapeHtml(knowledgeCard.title)}</h4>
                        <p className="text-xs opacity-80">{unescapeHtml(knowledgeCard.subtitle)}</p>
                      </div>
                      <span className="text-[10px] bg-white/20 backdrop-blur px-2 py-1 rounded font-medium">
                        Orijinal 4K Aç ↗
                      </span>
                    </div>
                  </a>
                </div>
              )}

              {visuals.length === 0 ? (
                <div className="apple-glass rounded-2xl p-8 text-center opacity-60 text-xs">
                  Bu arama için görsel arşiv taranıyor...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {visuals.map((img, i) => (
                    <div
                      key={img.id || i}
                      onClick={() => {
                        sound.playClick();
                        setSelectedImage(img);
                      }}
                      className="apple-glass-card rounded-xl overflow-hidden group block hover:border-sky-500/40 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-900/60">
                        <img
                          src={img.thumb}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur text-[9px] text-white px-1.5 py-0.5 rounded font-mono opacity-80">
                          HD
                        </div>
                      </div>
                      <div className="p-2.5">
                        <h5 className="text-xs font-semibold line-clamp-1 group-hover:text-sky-400 transition-colors">
                          {img.title}
                        </h5>
                        <span className="text-[10px] opacity-60 block mt-0.5">{img.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Follow-up Questions (Compact) */}
          {relatedQuestions.length > 0 && (
            <div className={`pt-3 border-t ${isDark ? 'border-white/8' : 'border-black/8'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-2">
                Keşfe Devam Edin
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {relatedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playClick();
                      onRelatedClick(q);
                    }}
                    className="apple-pill-btn flex items-center justify-between p-2.5 rounded-xl text-xs text-left"
                  >
                    <span className="line-clamp-1">{q}</span>
                    <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Knowledge, Market, Trends (Compact) */}
        <div className="lg:col-span-4 space-y-3.5">
          
          {/* Knowledge Card (Google & Wikipedia Style Knowledge Panel) */}
          {knowledgeCard && (
            <div className={`apple-glass rounded-2xl p-4 transition-all ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/8 bg-black/[0.02]'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-2">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3 h-3" />
                  <span>Bilgi Paneli</span>
                </div>
                {knowledgeCard.source && (
                  <span className="text-[9px] font-mono opacity-50">{knowledgeCard.source}</span>
                )}
              </div>

              {/* Photo Thumbnail if Available (Crystal Clear Ultra-HD & Clickable) */}
              {knowledgeCard.thumbnail && (
                <a
                  href={knowledgeCard.thumbnail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 rounded-2xl overflow-hidden border border-white/10 bg-black/20 aspect-[4/3] max-h-64 flex items-center justify-center group/img relative shadow-md block cursor-zoom-in"
                  title="Orijinal 4K Portreyi Tam Boyut Aç"
                >
                  <img 
                    src={knowledgeCard.thumbnail} 
                    alt={knowledgeCard.title} 
                    className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between px-2.5 pb-2">
                    <span className="text-[10px] text-white/90 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" /> Ultra HD Orijinal
                    </span>
                    <span className="text-[9px] bg-white/20 hover:bg-white/30 text-white px-1.5 py-0.5 rounded backdrop-blur font-mono">
                      Büyüt 🔍
                    </span>
                  </div>
                </a>
              )}

              <h3 className="text-base font-bold tracking-tight font-['Outfit',sans-serif]">
                {unescapeHtml(knowledgeCard.title)}
              </h3>
              {knowledgeCard.subtitle && (
                <p className="text-[11px] opacity-60 capitalize">{unescapeHtml(knowledgeCard.subtitle)}</p>
              )}

              <div className={`mt-2.5 pt-2.5 border-t text-xs leading-relaxed ${
                isDark ? 'border-white/6 text-slate-300' : 'border-black/5 text-slate-700'
              }`}>
                {unescapeHtml(knowledgeCard.description)}
              </div>

              {knowledgeCard.attributes && knowledgeCard.attributes.length > 0 && (
                <div className={`mt-2.5 space-y-1 pt-2.5 border-t text-[11px] ${
                  isDark ? 'border-white/6' : 'border-black/5'
                }`}>
                  {knowledgeCard.attributes.map((attr, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="opacity-60">{attr.label}</span>
                      <span className="font-semibold text-right max-w-[180px] truncate">{attr.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {knowledgeCard.link && (
                <a
                  href={knowledgeCard.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <span>Vikipedi'de Tamamını İncele</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          )}

          {/* Canlı Borsa & Kurlar (Compact) */}
          <div className={`apple-glass rounded-2xl p-4 ${
            isDark ? 'border-white/8' : 'border-black/6'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>BIST 100</span>
              </span>
              <span className="text-xs font-bold text-emerald-500">
                10,480.20 (+%1.4)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {[
                { name: 'Gram Altın', val: '3,210 ₺', change: '+%0.8' },
                { name: 'USD / TRY', val: '36.85 ₺', change: '+%0.1' },
              ].map((m, i) => (
                <div key={i} className={`p-2 rounded-xl border ${
                  isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'
                }`}>
                  <span className="text-[9px] opacity-60 block">{m.name}</span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-xs font-bold">{m.val}</span>
                    <span className="text-[9px] font-semibold text-emerald-500">{m.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gündem Trendleri (Compact) */}
          <div className={`apple-glass rounded-2xl p-4 ${
            isDark ? 'border-white/8' : 'border-black/6'
          }`}>
            <span className="text-xs font-semibold block mb-2">Gündem Trendleri</span>

            <div className="space-y-1">
              {[
                { rank: '1', title: 'Türkiye Yapay Zeka Hamlesi', volume: '142K' },
                { rank: '2', title: 'BIST 100 Rekor Hacim', volume: '95K' },
                { rank: '3', title: 'Yerli Çip ve Yarı İletken', volume: '78K' },
                { rank: '4', title: 'Kuantum İnternet Atılımı', volume: '61K' },
              ].map((item) => (
                <button
                  key={item.rank}
                  onClick={() => {
                    sound.playClick();
                    onRelatedClick(item.title);
                  }}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] opacity-40 font-mono w-3">
                      #{item.rank}
                    </span>
                    <p className="text-xs font-medium line-clamp-1">
                      {item.title}
                    </p>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Podcast Modal */}
      <PodcastDebateModal 
        isOpen={isPodcastOpen}
        onClose={() => setIsPodcastOpen(false)}
        query={query}
        podcastScript={agentData?.executor?.podcastScript}
      />

      {/* Reader Mode Drawer */}
      <ReaderModeDrawer
        isOpen={!!readerArticle}
        onClose={() => setReaderArticle(null)}
        article={readerArticle}
        isDark={isDark}
      />

      {/* Google Images Tarzı Yüksek Çözünürlüklü Önizleme Modalı */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`apple-glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border shadow-2xl flex flex-col ${
              isDark ? 'bg-[#0b0e17]/95 border-white/15 text-white' : 'bg-white/95 border-black/15 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-sky-400">Google Görseller Tarzı 4K Önizleme</span>
                <span className="opacity-40">•</span>
                <span className="text-xs opacity-70 font-mono">{selectedImage.source}</span>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                title="Kapat (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50 min-h-[350px]">
              <img 
                src={selectedImage.fullImage || selectedImage.thumb} 
                alt={selectedImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="text-sm font-bold line-clamp-1">{selectedImage.title}</h4>
                <p className="text-xs opacity-60 font-mono">{selectedImage.sourceUrl || selectedImage.source}</p>
              </div>

              <div className="flex items-center gap-2">
                {selectedImage.sourceUrl && (
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      if (onOpenInAppTab) {
                        onOpenInAppTab({
                          link: selectedImage.sourceUrl,
                          title: selectedImage.title,
                          snippet: selectedImage.title
                        });
                      } else {
                        window.open(selectedImage.sourceUrl, '_blank');
                      }
                    }}
                    className="apple-pill-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Sayfaya Git</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href={selectedImage.fullImage || selectedImage.thumb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition-colors shadow-lg flex items-center gap-1.5"
                >
                  <span>Tam Boyut Aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
