import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Newspaper, Clock, BookOpen, Columns, ExternalLink, Share2, TrendingUp, Loader2, X, Check } from 'lucide-react';
import { API_BASE } from '../services/searchService';
import { sound } from '../services/soundService';
import TimeRangeChips, { NEWS_WHEN } from './TimeRangeChips';

const TOPICS = [
  ['', 'Bu arama'], ['gundem', 'Gündem'], ['ekonomi', 'Ekonomi'], ['teknoloji', 'Teknoloji'],
  ['spor', 'Spor'], ['saglik', 'Sağlık'], ['bilim', 'Bilim'], ['magazin', 'Magazin'], ['dunya', 'Dünya']
];

const MINUTE = 60 * 1000;

export default function NewsPanel({ query, initial = [], isDark, onRead, onSplit, onSearch }) {
  const [time, setTime] = useState('all');
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('relevance'); // 'relevance' | 'newest'
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trending, setTrending] = useState([]);
  const [shared, setShared] = useState(null);
  const abortRef = useRef(null);

  // Zaman ya da konu değişince sunucudan yeniden al (ilk açılışta gelen liste kullanılır)
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError('');
    setSource('');
    const params = new URLSearchParams();
    if (topic) params.set('topic', topic); else params.set('q', query);
    if (!topic && time !== 'all') params.set('when', NEWS_WHEN[time]);
    fetch(`${API_BASE}/api/news?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error || 'Haberler alınamadı');
        setItems(d.news || []);
      })
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (abortRef.current === controller) setLoading(false); });
    return () => controller.abort();
  }, [time, topic, query]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/trending`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setTrending(d.trending || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const sources = useMemo(() => {
    const counts = new Map();
    for (const n of items) counts.set(n.source, (counts.get(n.source) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [items]);

  const visible = useMemo(() => {
    const list = source ? items.filter(n => n.source === source) : items;
    return sort === 'newest' ? [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0)) : list;
  }, [items, source, sort]);

  const panel = isDark ? 'bg-slate-900/60 border-white/10 backdrop-blur-xl' : 'bg-white/80 border-black/8 shadow-sm backdrop-blur-xl';
  const openReader = (n) => onRead({
    title: n.title, snippet: n.snippet, description: n.snippet, link: n.url, url: n.url,
    sourceName: n.source, displayLink: n.sourceDomain || n.domain
  });

  const share = async (n) => {
    sound.playClick();
    if (navigator.share) { navigator.share({ title: n.title, url: n.url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(`${n.title} - ${n.url}`); setShared(n.id); setTimeout(() => setShared(null), 1500); } catch { /* pano erişimi yok */ }
  };

  return (
    <div className="space-y-4">
      {/* Konu şeridi + zaman + sıralama */}
      <div className={`p-4 rounded-3xl border space-y-3 ${panel}`}>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px]" role="group" aria-label="Haber konusu">
          <Newspaper className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          {TOPICS.map(([id, label]) => (
            <button
              key={id || 'q'}
              aria-pressed={topic === id}
              onClick={() => { sound.playClick(); setTopic(id); }}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap border transition-all ${
                topic === id
                  ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 font-semibold'
                  : (isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-black/5 border-black/5 text-slate-600')
              }`}
            >
              {id === '' ? `“${query.length > 18 ? query.slice(0, 18) + '…' : query}”` : label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {topic === '' ? (
            <TimeRangeChips value={time} onChange={setTime} isDark={isDark} includeHour disabled={loading} />
          ) : (
            <span className="text-[11px] opacity-60">Google News Türkiye — {TOPICS.find(t => t[0] === topic)?.[1]} manşetleri</span>
          )}
          <div className="flex items-center gap-1 text-[11px]">
            {[['relevance', 'Alaka'], ['newest', 'En yeni']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => { sound.playClick(); setSort(id); }}
                className={`px-2.5 py-1 rounded-full border ${sort === id ? 'bg-white/15 border-white/25 font-semibold' : 'border-white/10 opacity-60 hover:opacity-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4">
        {/* Haber listesi */}
        <div className="space-y-3 min-w-0">
          {error && (
            <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">{error}</div>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-xs opacity-70 px-1"><Loader2 className="w-4 h-4 animate-spin" /> Haberler yükleniyor…</div>
          )}
          {!loading && visible.length === 0 && (
            <div className={`p-10 text-center rounded-3xl border ${panel}`}>
              <Newspaper className="w-9 h-9 mx-auto opacity-30 text-sky-400 mb-3" />
              <h4 className="text-sm font-semibold mb-1">Haber bulunamadı</h4>
              <p className="text-xs opacity-60 max-w-sm mx-auto">
                {time !== 'all' ? 'Bu zaman aralığında haber yok. Aralığı genişletmeyi deneyin.' : 'Bu arama için haber çıkmadı.'}
              </p>
            </div>
          )}

          {visible.map(n => {
            const fresh = n.ts && Date.now() - n.ts < 60 * MINUTE;
            return (
              <article
                key={n.id}
                className={`group rounded-3xl p-4 sm:p-5 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${panel} ${isDark ? 'text-white hover:border-sky-500/30' : 'text-slate-900 hover:border-sky-500/30'}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${n.sourceDomain || n.domain || 'news.google.com'}&sz=64`}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <button
                      onClick={() => setSource(source === n.source ? '' : n.source)}
                      title="Bu kaynağın haberlerini filtrele"
                      className="text-xs font-bold truncate hover:text-sky-400 transition-colors"
                    >
                      {n.source}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-slate-400">
                    {fresh && <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25 font-sans font-semibold">Yeni</span>}
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{n.timeAgo}</span>
                  </div>
                </div>

                <h3
                  onClick={() => { sound.playClick(); openReader(n); }}
                  className="text-base sm:text-lg font-bold leading-snug tracking-tight cursor-pointer group-hover:text-sky-300 transition-colors font-['Outfit',sans-serif]"
                >
                  {n.title}
                </h3>

                {n.related?.length > 0 && (
                  <div className="mt-2 text-[11px] opacity-70 space-y-0.5">
                    <span className="opacity-60">Aynı olay, diğer kaynaklar:</span>
                    {n.related.slice(0, 3).map(r => (
                      <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="block truncate hover:text-sky-400">
                        {r.source ? `${r.source} — ` : ''}{r.title}
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap pt-3 mt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { sound.playClick(); openReader(n); }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Okuyucu modu
                    </button>
                    <button
                      onClick={() => { sound.playClick(); onSplit({ title: n.title, snippet: n.snippet, link: n.url, displayLink: n.source }); }}
                      className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Columns className="w-3 h-3" /> <span className="hidden sm:inline">Yanda incele</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Haberi yeni sekmede aç"
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => share(n)}
                      title="Paylaş / bağlantıyı kopyala"
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                    >
                      {shared === n.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Yan panel: kaynaklar + gündem aramaları */}
        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          {sources.length > 1 && (
            <div className={`p-4 rounded-3xl border ${panel}`}>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold">Kaynaklar</h4>
                {source && (
                  <button onClick={() => setSource('')} className="text-[11px] text-sky-400 flex items-center gap-1"><X className="w-3 h-3" /> Temizle</button>
                )}
              </div>
              <div className="space-y-0.5">
                {sources.map(([name, count]) => (
                  <button
                    key={name}
                    onClick={() => { sound.playClick(); setSource(source === name ? '' : name); }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                      source === name ? 'bg-sky-500/15 text-sky-300 font-semibold' : (isDark ? 'hover:bg-white/5' : 'hover:bg-black/5')
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <span className="opacity-50 font-mono">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {trending.length > 0 && (
            <div className={`p-4 rounded-3xl border ${panel}`}>
              <h4 className="text-xs font-bold flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> NovaTürk'te gündem
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {trending.map(t => (
                  <button
                    key={t.query}
                    onClick={() => { sound.playClick(); onSearch?.(t.query); }}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                      isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
                    }`}
                  >
                    {t.query}
                  </button>
                ))}
              </div>
              <p className="text-[10px] opacity-40 mt-2">Son 24 saatte en az 2 kez aranan sorgular; kişi bilgisi tutulmaz.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
