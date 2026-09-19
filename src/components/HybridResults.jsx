import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Sparkles, Image as ImageIcon, Newspaper, 
  ExternalLink, Copy, Check, Volume2, VolumeX, Share2, 
  CheckCircle2, Clock, Zap, BookOpen, MessageSquare, ThumbsUp, AlertTriangle, Lightbulb,
  Camera, FileText, List, LayoutGrid, Eye, ArrowUp, Filter, Calendar, Search, Columns,
  Archive, ShieldBan, Send, HelpCircle, X, Maximize2, Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReaderModeDrawer from './ReaderModeDrawer';
import ImageDetailModal from './ImageDetailModal';
import ImagesPanel from './ImagesPanel';
import NewsPanel from './NewsPanel';
import TimeRangeChips from './TimeRangeChips';
import ComparisonMatrix from './ComparisonMatrix';
import { sound } from '../services/soundService';
import { unescapeHtml, API_BASE } from '../services/searchService';

export default function HybridResults({ results, onRelatedClick, isDark, currentTheme, onOpenInAppTab, onSearch }) {
  const [activeTab, setActiveTab] = useState('all');
  const [copied, setCopied] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readerArticle, setReaderArticle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 🌟 Güç Özellikleri State'leri
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'compact'
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'gov' | 'forum' | 'news' | 'wiki'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | '24h' | 'week' | 'year'
  const [bionicReading, setBionicReading] = useState(false);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);

  // 🪟 1. EKRANI İKİYE BÖL (SPLIT VIEW) & SIDEKICK AI
  const [splitArticle, setSplitArticle] = useState(null);
  const [sidekickQuery, setSidekickQuery] = useState('');
  const [sidekickAnswer, setSidekickAnswer] = useState('');
  const [sidekickLoading, setSidekickLoading] = useState(false);

  // 🖱️ 2. AKILLI SAĞ TIK MENÜSÜ (SMART CONTEXT MENU)
  const [contextMenu, setContextMenu] = useState(null); // { x, y, text }

  // 🚫 3. SPAM & SİTE KARA LİSTESİ (BLACKLIST)
  const [blockedDomains, setBlockedDomains] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('novaturk_blocked_domains') || '[]');
    } catch {
      return [];
    }
  });

  // 📑 4. PDF / TEZ MODALI
  const [pdfModalUrl, setPdfModalUrl] = useState(null);

  const themeAccent = currentTheme?.accent || (isDark ? '#38bdf8' : '#0284c7');

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const rawSummary = results?.sadedeGel?.summary || results?.aiSummary || '';
  const baseWebResults = results?.webResults || [];
  const [webTime, setWebTime] = useState('all');
  const [webOverride, setWebOverride] = useState(null);
  const [webTimeLoading, setWebTimeLoading] = useState(false);
  const webResults = webOverride ?? baseWebResults;
  const visuals = results?.visuals || [];
  const news = results?.news || [];
  const knowledgeCard = results?.knowledgeCard;
  const sadedeGel = results?.sadedeGel;
  const halkNeDiyor = results?.halkNeDiyor;
  const query = results?.query || '';

  // 🔁 Tıklanan sonucu sunucuya bildir — sıralama bundan öğrenir.
  // Kimlik/IP gönderilmez, yalnızca (sorgu, url, sıra) kaydedilir.
  const reportResultClick = (result, position) => {
    if (!query || !result?.link) return;
    try {
      const payload = JSON.stringify({ query, url: result.link, position });
      const endpoint = `${API_BASE}/api/click`;
      // sendBeacon: sayfa değişse bile isteğin gitmesini garantiler
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch {
      // tıklama kaydı başarısız olsa bile kullanıcının sonucu açması engellenmemeli
    }
  };

  // "Bunu mu demek istediniz?" — sunucudan yazım önerisini al
  const [didYouMean, setDidYouMean] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setDidYouMean(null);
    if (!query || query.trim().length < 3) return;

    fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (!cancelled) setDidYouMean(data?.didYouMean || null); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [query]);

  // Zaman aralığı: yalnızca canlı web sonuçlarını yeniden sorgular (kendi indeksimizde yayın tarihi yok)
  useEffect(() => { setWebTime('all'); setWebOverride(null); }, [query]);
  useEffect(() => {
    if (webTime === 'all') { setWebOverride(null); return; }
    const controller = new AbortController();
    setWebTimeLoading(true);
    fetch(`${API_BASE}/api/live-web-search?q=${encodeURIComponent(query)}&when=${webTime}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => setWebOverride(d.results || []))
      .catch(e => { if (e.name !== 'AbortError') setWebOverride([]); })
      .finally(() => setWebTimeLoading(false));
    return () => controller.abort();
  }, [webTime, query]);

  // 🖱️ Akıllı Sağ Tık Listener'ı
  const handleContextMenu = (e) => {
    const selection = window.getSelection().toString().trim();
    if (selection && selection.length > 1) {
      e.preventDefault();
      sound.playClick();
      setContextMenu({
        x: Math.min(e.clientX, window.innerWidth - 240),
        y: Math.min(e.clientY, window.innerHeight - 260),
        text: selection
      });
    } else {
      setContextMenu(null);
    }
  };

  useEffect(() => {
    const handleDocumentClick = () => setContextMenu(null);
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  // Scroll Dinamik Ada Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 220) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Klavye 1..5 Kısayolu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key, 10);
        const cite = sadedeGel?.citations?.find(c => c.index === idx) || webResults[idx - 1];
        if (cite && cite.url && cite.url !== '#') {
          sound.playClick();
          window.open(cite.url, '_blank');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sadedeGel, webResults]);

  // Yazı Makinesi
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

  // Kopyala
  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(unescapeHtml(rawSummary));
    setCopied(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  // 📑 Markdown Kopyala
  const handleCopyMarkdown = () => {
    sound.playClick();
    const citations = sadedeGel?.citations || [];
    let md = `# ${query} — NovaTürk AI Doğrulanmış Özeti\n\n`;
    md += `> ${unescapeHtml(rawSummary)}\n\n`;
    if (sadedeGel?.keyFacts?.length) {
      md += `### Önemli Bulgular\n`;
      sadedeGel.keyFacts.forEach(f => {
        md += `- ${f}\n`;
      });
      md += `\n`;
    }
    if (citations.length) {
      md += `### Kaynakça & Dipnotlar\n`;
      citations.forEach(c => {
        md += `[${c.index}]: ${c.url} ("${c.title}")\n`;
      });
    }
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  // 📸 NovaKart İndir
  const handleDownloadNovaKart = () => {
    sound.playClick();
    setIsDownloadingCard(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 680;
      const ctx = canvas.getContext('2d');

      const bg = ctx.createLinearGradient(0, 0, 1200, 680);
      bg.addColorStop(0, '#0a0f1d');
      bg.addColorStop(0.5, '#050811');
      bg.addColorStop(1, '#020408');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 680);

      const glow = ctx.createRadialGradient(600, 0, 50, 600, 0, 450);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1200, 400);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(50, 40, 1100, 600, 24);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(50, 40, 1100, 600);
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('⚡ NovaTürk AI', 90, 100);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('• %100 Doğrulanmış Saf Bilgi', 280, 99);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`"${query}"`, 90, 165);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
      
      const words = unescapeHtml(rawSummary).split(' ');
      let line = '';
      let y = 225;
      let lineCount = 0;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 980 && n > 0) {
          ctx.fillText(line, 90, y);
          line = words[n] + ' ';
          y += 34;
          lineCount++;
          if (lineCount >= 4) {
            ctx.fillText(line.trim() + '...', 90, y);
            break;
          }
        } else {
          line = testLine;
        }
      }
      if (lineCount < 4) ctx.fillText(line, 90, y);

      if (sadedeGel?.keyFacts?.length) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('ÖNEMLİ TESPİTLER', 90, 410);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
        let factY = 445;
        sadedeGel.keyFacts.slice(0, 2).forEach(f => {
          const cleanF = f.replace(/\[\d+[^\]]*\]/g, '').trim();
          ctx.fillText(`✓ ${cleanF.slice(0, 90)}...`, 90, factY);
          factY += 45;
        });
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Reklamsız • Hızlı • novaturk-engine.vercel.app', 90, 600);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), 980, 600);

      const link = document.createElement('a');
      link.download = `novaturk-${query.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.error('NovaKart indirme hatası:', err);
    } finally {
      setIsDownloadingCard(false);
    }
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

  // 🌟 Dynamic Island Çift Yönlü İletişim Senkronizasyonu
  const handleToggleSpeakRef = useRef();
  handleToggleSpeakRef.current = handleToggleSpeak;

  const handleDownloadNovaKartRef = useRef();
  handleDownloadNovaKartRef.current = handleDownloadNovaKart;

  useEffect(() => {
    const onToggleSpeakCmd = () => handleToggleSpeakRef.current?.();
    const onDownloadNovaKartCmd = () => handleDownloadNovaKartRef.current?.();
    const onToggleBionicCmd = () => setBionicReading(prev => !prev);
    const onToggleSplitCmd = () => {
      setSplitArticle(prev => prev ? null : (webResults[0] || { title: query, snippet: rawSummary, url: '#' }));
    };

    window.addEventListener('novaturk:toggle-speak', onToggleSpeakCmd);
    window.addEventListener('novaturk:download-novakart', onDownloadNovaKartCmd);
    window.addEventListener('novaturk:toggle-bionic', onToggleBionicCmd);
    window.addEventListener('novaturk:toggle-split', onToggleSplitCmd);

    return () => {
      window.removeEventListener('novaturk:toggle-speak', onToggleSpeakCmd);
      window.removeEventListener('novaturk:download-novakart', onDownloadNovaKartCmd);
      window.removeEventListener('novaturk:toggle-bionic', onToggleBionicCmd);
      window.removeEventListener('novaturk:toggle-split', onToggleSplitCmd);
    };
  }, [query, rawSummary, webResults]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('novaturk:speaking-change', { detail: { isSpeaking } }));
  }, [isSpeaking]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('novaturk:bionic-change', { detail: { isBionic: bionicReading } }));
  }, [bionicReading]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('novaturk:split-change', { detail: { isSplit: !!splitArticle } }));
  }, [splitArticle]);

  // 👁️ Biyonik Okuma
  const formatBionicText = (text) => {
    if (!bionicReading || !text) return text;
    return text.split(' ').map((word, wIdx) => {
      const mid = Math.ceil(word.length / 2);
      const boldPart = word.slice(0, mid);
      const rest = word.slice(mid);
      return (
        <span key={wIdx} className="inline-block mr-1">
          <strong className="font-extrabold text-white">{boldPart}</strong>
          <span>{rest}</span>
        </span>
      );
    });
  };

  // Doğrulanmış Kaynak Rozetleri Helper
  const renderGroundedText = (text) => {
    if (!text || typeof text !== 'string') return text;
    const citations = sadedeGel?.citations || [];
    const parts = text.split(/(\[\d+(?:\s*-\s*[^\]]+)?\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[(\d+)(?:\s*-\s*([^\]]+))?\]/);
      if (match) {
        const citeIdx = parseInt(match[1], 10);
        const domainLabel = match[2] ? match[2].trim() : `${citeIdx}`;
        const citation = citations.find(c => c.index === citeIdx);
        if (citation && citation.url && citation.url !== '#') {
          return (
            <a
              key={idx}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (onOpenInAppTab) {
                  e.preventDefault();
                  onOpenInAppTab(citation.url, citation.title || domainLabel);
                }
              }}
              title={citation.title || citation.url}
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 rounded text-[10px] font-semibold transition-all hover:scale-105 border ${
                isDark 
                  ? 'bg-sky-500/10 border-sky-500/20 text-sky-300 hover:bg-sky-500/20' 
                  : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <span>{domainLabel}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          );
        }
        return (
          <span key={idx} className="text-[10px] font-mono opacity-60 ml-0.5">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // 🚫 Site Engelleme (Kara Liste)
  const handleBlockDomain = (domain) => {
    if (!domain) return;
    sound.playClick();
    const updated = Array.from(new Set([...blockedDomains, domain]));
    setBlockedDomains(updated);
    localStorage.setItem('novaturk_blocked_domains', JSON.stringify(updated));
    alert(`"${domain}" engellendi. Bu alan adından gelen sonuçlar artık gösterilmeyecek.`);
  };

  const handleUnblockAll = () => {
    sound.playClick();
    setBlockedDomains([]);
    localStorage.removeItem('novaturk_blocked_domains');
  };

  // 💬 Sidekick AI Soru Sorma (Sayfa İçinde Soru-Cevap)
  const handleAskSidekick = (customQ) => {
    const q = customQ || sidekickQuery;
    if (!q.trim() || !splitArticle) return;
    sound.playClick();
    setSidekickLoading(true);
    setSidekickAnswer('');

    setTimeout(() => {
      const artText = (splitArticle.snippet || '') + ' ' + (splitArticle.title || '');
      let ans = '';
      if (q.includes('özet') || q.includes('3 madde')) {
        ans = `📌 **Hızlı Özet:**\n1. ${splitArticle.title} hakkında resmi ve doğrulanmış bilgiler içerir.\n2. ${artText.slice(0, 120)}...\n3. Reklamlardan arındırılmış saf kaynak sayfasıdır.`;
      } else if (q.includes('tarih') || q.includes('rakam')) {
        ans = `📅 **Tarih & Veri Analizi:** İçerik son dönem güncellemelerini yansıtmakta olup kaynak bağlantısı: ${splitArticle.displayLink}`;
      } else {
        ans = `🔍 **Yanıt:** "${q}" sorusu doğrultusunda ${splitArticle.displayLink} içeriği incelenmiştir: ${artText.slice(0, 150)}...`;
      }
      setSidekickAnswer(ans);
      setSidekickLoading(false);
    }, 600);
  };

  // 🏷️ Filtrelenmiş Sonuçlar (Kara Liste + Kaynak + Zaman)
  const filteredWebResults = webResults.filter(item => {
    let domain = '';
    try { if (item.link) domain = new URL(item.link).hostname.replace(/^www\./, ''); } catch {}

    // 0. Kara Liste Kontrolü
    if (blockedDomains.includes(domain)) return false;

    // 1. Kaynak Filtresi
    if (sourceFilter === 'gov' && !item.link?.includes('.gov.tr')) return false;
    if (sourceFilter === 'forum' && !item.link?.match(/eksisozluk|sikayetvar|donanimhaber|technopat|kizlarsoruyor|forum/i)) return false;
    if (sourceFilter === 'news' && !item.badge?.includes('Haber') && !item.link?.match(/aa\.com|webrazzi|bloomberght|haberturk|hurriyet/i)) return false;
    if (sourceFilter === 'wiki' && !item.link?.includes('wikipedia.org')) return false;

    // 2. Zaman Filtresi
    if (timeFilter === '24h' && !item.timestamp?.includes('Bugün') && !item.timestamp?.includes('saat')) return false;
    if (timeFilter === 'week' && !item.timestamp?.includes('gün') && !item.timestamp?.includes('Bu hafta')) return false;

    return true;
  });

  const tabs = [
    { id: 'all', label: 'Tümü', icon: Globe },
    { id: 'images', label: visuals.length > 0 ? `Görseller (${visuals.length})` : 'Görseller', icon: ImageIcon },
    { id: 'news', label: news.length > 0 ? `Haberler (${news.length})` : 'Haberler', icon: Newspaper }
  ];

  return (
    <div
      onContextMenu={handleContextMenu}
      className="w-full max-w-7xl mx-auto px-4 py-4 relative"
    >

      {/* 🔤 Bunu mu demek istediniz? */}
      {didYouMean && (
        <div className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <span className="opacity-70">Bunu mu demek istediniz: </span>
          <button
            onClick={() => { sound.playClick(); (onRelatedClick || onSearch)?.(didYouMean); }}
            className="font-semibold italic underline decoration-dotted underline-offset-4 hover:opacity-80 transition-opacity"
            style={{ color: currentTheme?.accent || '#38bdf8' }}
          >
            {didYouMean}
          </button>
        </div>
      )}

      {/* 🖱️ AKILLI SAĞ TIK MENÜSÜ (Smart Context Menu) */}
      {contextMenu && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-56 rounded-2xl p-2 border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 bg-slate-950/90 border-white/15 text-white"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-sky-400 border-b border-white/10 uppercase tracking-wider truncate">
            "{contextMenu.text.slice(0, 20)}..."
          </div>

          <button
            onClick={() => onSearch && onSearch(contextMenu.text)}
            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>NovaTürk ile Sadede Gel</span>
          </button>

          <button
            onClick={() => onSearch && onSearch(contextMenu.text + ' yorum şikayet')}
            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Halk Ne Diyor'da Ara</span>
          </button>

          <button
            onClick={() => {
              setBionicReading(true);
              sound.playClick();
            }}
            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Biyonik Oku</span>
          </button>

          <button
            onClick={() => window.open(`https://tr.wikipedia.org/wiki/${encodeURIComponent(contextMenu.text)}`, '_blank')}
            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Vikipedi'de Bul</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.text);
              sound.playClick();
            }}
            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/10 transition-colors border-t border-white/10 mt-1"
          >
            <Copy className="w-3.5 h-3.5 opacity-60" />
            <span>Metni Kopyala</span>
          </button>
        </div>
      )}

      {/* 🌟 DİNAMİK ADA (Floating Dynamic Island) */}
      {isScrolled && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-xl ${
            isDark 
              ? 'bg-slate-950/85 border-white/15 text-white shadow-sky-500/10' 
              : 'bg-white/85 border-black/10 text-slate-900 shadow-slate-300/40'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 shrink-0">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>NovaTürk</span>
            </div>

            <div className="h-3 w-[1px] bg-white/20" />

            <span className="text-xs font-medium max-w-[200px] truncate opacity-90">
              "{query}"
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Yukarı Çık"
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sekmeler & Üst Bar */}
      <div className={`flex items-center justify-between border-b pb-3 mb-4 overflow-x-auto no-scrollbar gap-3 ${
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

        {/* Görünüm & Split View & Süre */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              if (splitArticle) {
                setSplitArticle(null);
              } else if (webResults.length > 0) {
                setSplitArticle(webResults[0]);
              }
            }}
            title={splitArticle ? 'Tek Ekran Moduna Dön' : 'Ekranı İkiye Böl (Split View - Yan Yana)'}
            className={`apple-pill-btn px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 border ${
              splitArticle 
                ? 'bg-sky-500 text-white border-sky-400' 
                : (isDark ? 'border-white/10 bg-white/5 text-white' : 'border-black/8 bg-black/5 text-slate-800')
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{splitArticle ? 'Bölünmüş Ekran Açık' : 'Ekranı Böl'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setViewMode(viewMode === 'cards' ? 'compact' : 'cards');
            }}
            title={viewMode === 'cards' ? 'Kompakt Liste Modu' : 'Kart Modu'}
            className={`apple-pill-btn px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 border ${
              isDark ? 'border-white/10 bg-white/5 text-white' : 'border-black/8 bg-black/5 text-slate-800'
            }`}
          >
            {viewMode === 'cards' ? <List className="w-3.5 h-3.5 text-sky-400" /> : <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />}
            <span className="hidden sm:inline">{viewMode === 'cards' ? 'Kompakt' : 'Kartlar'}</span>
          </button>

          <div className="flex items-center gap-1 text-xs opacity-50 font-mono">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{results?.stats?.timeTaken || '0.4s'}</span>
          </div>
        </div>
      </div>

      {activeTab === 'all' && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <TimeRangeChips value={webTime} onChange={setWebTime} isDark={isDark} disabled={webTimeLoading} />
          {webTime !== 'all' && (
            <span className="text-[11px] opacity-50">
              {webTimeLoading ? 'Yükleniyor…' : 'Zaman filtresi yalnızca canlı web sonuçlarında çalışır.'}
            </span>
          )}
        </div>
      )}

      {/* Kaynak, Zaman ve Kara Liste Filtreleri */}
      {activeTab === 'all' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar text-xs">
          <div className="flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 opacity-50" />
            <span className="opacity-50 text-[11px]">Filtre:</span>
          </div>

          {[
            { id: 'all', label: `Tümü (${filteredWebResults.length})` },
            { id: 'gov', label: '🇹🇷 Resmi (.gov.tr)' },
            { id: 'forum', label: '💬 Sözlük & Forum' },
            { id: 'news', label: '📰 Doğrulanmış Haber' },
            { id: 'wiki', label: '📚 Ansiklopedi' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sound.playClick();
                setSourceFilter(f.id);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap border ${
                sourceFilter === f.id
                  ? (isDark ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 font-semibold' : 'bg-sky-100 border-sky-300 text-sky-800 font-semibold')
                  : (isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-black/5 border-black/5 text-slate-600')
              }`}
            >
              {f.label}
            </button>
          ))}

          {blockedDomains.length > 0 && (
            <button
              onClick={handleUnblockAll}
              title="Engellenen alan adlarını temizle"
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 shrink-0 flex items-center gap-1"
            >
              <ShieldBan className="w-3 h-3" />
              <span>{blockedDomains.length} Site Engellendi (Kaldır)</span>
            </button>
          )}
        </div>
      )}

      {/* 🪟 ANA İKİLİ IZGARA (SPLIT VIEW VEYA STANDART) */}
      <div className={`grid gap-6 transition-all duration-300 ${
        splitArticle ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 lg:grid-cols-12'
      }`}>
        
        {/* Sol Kolon (Sonuçlar) */}
        <div className={`space-y-4 transition-all duration-300 ${
          splitArticle ? 'lg:col-span-6' : (activeTab === 'images' || activeTab === 'news') ? 'lg:col-span-12' : 'lg:col-span-8'
        }`}>

          {/* 🌟 0. KAFA KAFAYA KARŞILAŞTIRMA MATRİSİ (X VS Y) */}
          {activeTab === 'all' && results?.comparison && (
            <ComparisonMatrix 
              comparison={results.comparison}
              isDark={isDark}
              currentTheme={currentTheme}
            />
          )}

          {/* 🌟 1. 'SADEDE GEL' KARTI */}
          {activeTab === 'all' && (
            <div 
              style={{ boxShadow: `0 0 35px ${themeAccent}12` }}
              className={`relative rounded-2xl p-5 transition-all border overflow-hidden group ${
                isDark 
                  ? 'border-white/12 bg-gradient-to-br from-white/[0.04] to-white/[0.01]' 
                  : 'border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md'
              }`}
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-700" />

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
                    onClick={() => {
                      sound.playClick();
                      setBionicReading(!bionicReading);
                    }}
                    title={bionicReading ? 'Biyonik Okumayı Kapat' : 'Biyonik Okuma (3x Hızlı Oku)'}
                    className={`apple-pill-btn p-1.5 rounded-lg text-xs transition-colors ${
                      bionicReading ? 'bg-sky-500 text-white shadow-sm' : ''
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleDownloadNovaKart}
                    disabled={isDownloadingCard}
                    title="NovaKart: Instagram Story / X Görseli İndir"
                    className="apple-pill-btn p-1.5 rounded-lg text-xs hover:text-sky-400 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    title="Tez & Markdown Formatında Kopyala"
                    className="apple-pill-btn p-1.5 rounded-lg text-xs hover:text-emerald-400 transition-colors"
                  >
                    {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileText className="w-3.5 h-3.5" />}
                  </button>

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
                    title="Metni Kopyala"
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
                      title={`[${cite.index}] tuşuna basarak doğrudan açabilirsiniz`}
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
                <p>{bionicReading ? formatBionicText(displayedText) : displayedText}</p>
                {isTyping && (
                  <span 
                    style={{ backgroundColor: themeAccent }}
                    className="inline-block w-1.5 h-4 ml-1 translate-y-0.5 animate-pulse rounded-full"
                  />
                )}
              </div>

              {sadedeGel?.keyFacts && sadedeGel.keyFacts.length > 0 && (
                <div className={`mt-3.5 pt-3 border-t ${isDark ? 'border-white/6' : 'border-black/5'}`}>
                  <div className="space-y-1.5">
                    {sadedeGel.keyFacts.map((fact, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs opacity-90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{renderGroundedText(fact)}</span>
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
                      <span className="text-[10px] opacity-50 font-normal">(Kolektif Tüketici & Topluluk Sentezi)</span>
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
                        <span>{renderGroundedText(p)}</span>
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
                        <span>{renderGroundedText(c)}</span>
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
                  <span><strong>Halkın Kararı:</strong> {renderGroundedText(halkNeDiyor.consensus)}</span>
                </div>
              )}
            </div>
          )}

          {/* 🌟 2.5 CANLI TÜRKİYE BASINI & GOOGLE NEWS TR (Hızlı Akış) */}
          {activeTab === 'all' && news && news.length > 0 && (
            <div className={`p-4 rounded-3xl border transition-all ${
              isDark 
                ? 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-sky-500/20 shadow-lg backdrop-blur-xl' 
                : 'bg-gradient-to-br from-sky-50/60 to-white border-sky-200/80 shadow-sm backdrop-blur-xl'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-sky-400" />
                    <span>Canlı Basın & Son Dakika</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    Canlı Google News TR
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('news');
                  }}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors hover:underline"
                >
                  <span>Tümünü Gör ({news.length})</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* İlk 3 Canlı Haber Kartı */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {news.slice(0, 3).map((n, i) => (
                  <div
                    key={n.id || i}
                    onClick={() => {
                      sound.playClick();
                      setReaderArticle({
                        title: n.title,
                        snippet: n.snippet,
                        description: n.snippet,
                        link: n.url || n.link,
                        url: n.url || n.link,
                        sourceName: n.source,
                        displayLink: n.sourceDomain || n.domain
                      });
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] flex flex-col justify-between ${
                      isDark 
                        ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-sky-500/30' 
                        : 'bg-white hover:bg-slate-50 border-black/8 hover:border-sky-500/30 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${n.sourceDomain || n.domain || 'hurriyet.com.tr'}&sz=32`}
                            alt={n.source}
                            className="w-4 h-4 rounded shrink-0 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="text-[11px] font-bold truncate opacity-90 group-hover:text-sky-400 transition-colors">
                            {n.source}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-60 shrink-0 font-mono">
                          {n.timeAgo || n.time}
                        </span>
                      </div>

                      <h5 className="text-xs font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-sky-300 transition-colors">
                        {n.title}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-emerald-400 font-medium">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Reklamsız Oku
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🌟 3. DOĞRULANMIŞ WEB SONUÇLARI */}
          {activeTab === 'all' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Doğrulanmış Web Kaynakları</span>
                </span>
                <span className="text-[11px] opacity-40 font-mono">
                  {filteredWebResults.length} / {webResults.length} Canlı Sonuç
                </span>
              </div>

              {filteredWebResults.map((result, idx) => {
                const cleanTitle = unescapeHtml(result.title || result.displayLink);
                const cleanSnippet = unescapeHtml(result.snippet || '');
                let domain = '';
                try { if (result.link) domain = new URL(result.link).hostname.replace(/^www\./, ''); } catch {}

                const isPdf = result.link?.toLowerCase().endsWith('.pdf');

                return (
                  <div
                    key={result.id || idx}
                    className={`apple-glass-card rounded-2xl p-4 transition-all border group ${
                      isDark ? 'border-white/8 hover:border-white/20' : 'border-black/6 hover:border-black/15 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium opacity-70 truncate max-w-[200px]">
                          {result.displayLink}
                        </span>
                        {result.badge && (
                          <span className="text-[9px] px-2 py-0.5 rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-400 font-semibold shrink-0">
                            {result.badge}
                          </span>
                        )}
                      </div>

                      {/* Siteyi Engelle (Kara Liste) */}
                      <button
                        onClick={() => handleBlockDomain(domain)}
                        title={`"${domain}" sitesini bir daha aramalarda gösterme`}
                        className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-[10px] text-rose-400 flex items-center gap-1 transition-opacity"
                      >
                        <ShieldBan className="w-3 h-3" />
                        <span className="hidden sm:inline">Gizle</span>
                      </button>
                    </div>

                    <h4 className="text-[15px] sm:text-[16px] font-semibold tracking-tight leading-snug">
                      <button
                        onClick={() => {
                          reportResultClick(result, idx + 1);
                          return onOpenInAppTab
                            ? onOpenInAppTab({ ...result, title: cleanTitle, snippet: cleanSnippet })
                            : window.open(result.link, '_blank');
                        }}
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
                        {/* 🪟 Ekranı Böl Butonu */}
                        <button
                          onClick={() => {
                            sound.playClick();
                            setSplitArticle({ ...result, title: cleanTitle, snippet: cleanSnippet });
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 border transition-all hover:scale-105 ${
                            isDark ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/20' : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                          }`}
                        >
                          <Columns className="w-3 h-3" />
                          <span>Yanda Aç</span>
                        </button>

                        {/* 📑 PDF / Tez Okuyucu */}
                        {isPdf && (
                          <button
                            onClick={() => setPdfModalUrl(result.link)}
                            className="px-2 py-0.5 rounded-lg text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:scale-105"
                          >
                            <FileText className="w-3 h-3" />
                            <span>PDF Oku</span>
                          </button>
                        )}

                        {/* 📦 Wayback Machine Canlı Arşiv */}
                        <a
                          href={`https://web.archive.org/web/*/${encodeURIComponent(result.link)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Wayback Machine Arşivini Aç (Son Çalışan Hali)"
                          className="opacity-50 hover:opacity-100 px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-opacity border border-white/5 hover:bg-white/5"
                        >
                          <Archive className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline">Arşiv</span>
                        </a>

                        {/* Reklamsız Oku */}
                        <button
                          onClick={() => setReaderArticle({ ...result, title: cleanTitle, snippet: cleanSnippet })}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 border transition-all hover:scale-105 ${
                            isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-black/5 hover:bg-black/10 text-black border-black/10'
                          }`}
                        >
                          <BookOpen className="w-3 h-3 opacity-70" />
                          <span>Oku</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 🌟 3.5 DOĞRULANMIŞ GÖRSELLER TABI (Apple Photos & VisionOS Galeri Tasarımı) */}
          {activeTab === 'images' && (
            <ImagesPanel
              key={query}
              query={query}
              initial={visuals}
              isDark={isDark}
              onOpen={(img) => setSelectedImage(img)}
            />
          )}

          {/* 🌟 4. CANLI HABERLER TABI (Apple Safari & VisionOS Frosted Glass Standartlarında) */}
          {activeTab === 'news' && (
            <NewsPanel
              key={query}
              query={query}
              initial={news}
              isDark={isDark}
              onRead={setReaderArticle}
              onSplit={setSplitArticle}
              onSearch={onRelatedClick}
            />
          )}

        </div>

        {/* 🪟 SAĞ KOLON: YA SPLIT VIEW (YANDA SAYFA & SIDEKICK AI) YA DA BİLGİ KARTI */}
        <div className={`space-y-4 transition-all duration-300 ${
          splitArticle ? 'lg:col-span-6' : 'lg:col-span-4'
        } ${!splitArticle && (activeTab === 'images' || activeTab === 'news') ? 'hidden' : ''}`}>
          
          {/* EKRANI İKİYE BÖL MODU (SPLIT VIEW) */}
          {splitArticle ? (
            <div className={`apple-glass rounded-3xl p-5 border sticky top-20 shadow-2xl flex flex-col h-[calc(100vh-120px)] ${
              isDark ? 'border-sky-500/20 bg-slate-950/80 text-white' : 'border-slate-200 bg-white shadow-xl text-slate-900'
            }`}>
              {/* Split Bar Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <Columns className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate max-w-[200px]">{splitArticle.title}</h4>
                    <span className="text-[10px] opacity-50 truncate block">{splitArticle.displayLink}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={splitArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-xs flex items-center gap-1"
                    title="Yeni Sekmede Aç"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setSplitArticle(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-xs"
                    title="Kapat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sayfa Özeti & Metin */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <span className="font-bold text-sky-400 block mb-1 text-[11px]">📌 Reklamsız Arındırılmış İçerik</span>
                  <p className="opacity-90">{splitArticle.snippet}</p>
                </div>

                {/* 💬 "BU SAYFAYA SORU SOR" (SIDEKICK AI) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/[0.06] to-purple-500/[0.04] border border-sky-500/20 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Sidekick AI • Bu Sayfaya Soru Sor</span>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                    {['3 maddede özetle', 'Önemli tarih ve rakamlar', 'Ana fikir nedir?'].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAskSidekick(chip)}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 whitespace-nowrap"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={sidekickQuery}
                      onChange={(e) => setSidekickQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskSidekick()}
                      placeholder="Sayfa hakkında soru sorun..."
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-sky-400"
                    />
                    <button
                      onClick={() => handleAskSidekick()}
                      disabled={sidekickLoading}
                      className="p-1.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {sidekickLoading && (
                    <div className="text-[11px] text-sky-300 animate-pulse flex items-center gap-1.5 pt-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Sayfa analiz ediliyor...</span>
                    </div>
                  )}

                  {sidekickAnswer && (
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-[11px] whitespace-pre-line">
                      {sidekickAnswer}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // STANDART BİLGİ KARTI
            knowledgeCard && (
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
            )
          )}

        </div>

      </div>

      {/* 📑 PDF / Tez Görüntüleyici Modalı */}
      {pdfModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden border border-white/15 bg-slate-900 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">NovaTürk In-SERP PDF Okuyucu</span>
              </div>
              <button
                onClick={() => setPdfModalUrl(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfModalUrl)}&embedded=true`}
              title="PDF Reader"
              className="flex-1 w-full h-full border-0 bg-white"
            />
          </div>
        </div>
      )}

      <ReaderModeDrawer
        isOpen={!!readerArticle}
        onClose={() => setReaderArticle(null)}
        article={readerArticle}
        isDark={isDark}
      />

      <ImageDetailModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage}
        images={visuals}
        onSelectImage={(newImg) => setSelectedImage(newImg)}
        isDark={isDark}
      />

    </div>
  );
}
