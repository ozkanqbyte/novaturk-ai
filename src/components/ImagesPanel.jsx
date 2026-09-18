import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image as ImageIcon, Download, Copy, ExternalLink, Maximize2, Link2, Loader2, Check } from 'lucide-react';
import { API_BASE } from '../services/searchService';
import { sound } from '../services/soundService';
import TimeRangeChips from './TimeRangeChips';

const SIZE_OPTS = [['', 'Tüm boyutlar'], ['Large', 'Büyük'], ['Medium', 'Orta'], ['Small', 'Küçük'], ['Wallpaper', 'Duvar kağıdı']];
const TYPE_OPTS = [['', 'Tüm türler'], ['photo', 'Fotoğraf'], ['clipart', 'Çizim'], ['gif', 'GIF'], ['transparent', 'Şeffaf']];
const LAYOUT_OPTS = [['', 'Tüm yönler'], ['Wide', 'Yatay'], ['Tall', 'Dikey'], ['Square', 'Kare']];

export function downloadImage(img) {
  const src = img.fullImage || img.url || img.thumb;
  if (!src) return;
  const a = document.createElement('a');
  a.href = `${API_BASE}/api/download-image?url=${encodeURIComponent(src)}&name=${encodeURIComponent((img.title || 'novaturk-gorsel').slice(0, 60))}`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function FilterSelect({ value, onChange, options, label, isDark }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => { sound.playClick(); onChange(e.target.value); }}
      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border outline-none cursor-pointer ${
        isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-black/5 border-black/10 text-slate-700'
      }`}
    >
      {options.map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
    </select>
  );
}

function ContextMenu({ menu, onClose, onOpen, isDark }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const img = menu.img;
  const src = img.fullImage || img.url || img.thumb;

  useEffect(() => {
    const close = () => onClose();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Ekran dışına taşmasın
  const width = 236;
  const height = 250;
  const left = Math.min(menu.x, window.innerWidth - width - 8);
  const top = Math.min(menu.y, window.innerHeight - height - 8);

  const items = [
    { icon: Maximize2, label: 'Büyüt', run: () => onOpen(img) },
    { icon: Download, label: 'Görseli indir', run: () => downloadImage(img) },
    {
      icon: copied ? Check : Link2, label: copied ? 'Kopyalandı' : 'Görsel adresini kopyala', keepOpen: true,
      run: async () => {
        try { await navigator.clipboard.writeText(src); setCopied(true); setTimeout(onClose, 700); } catch { onClose(); }
      }
    },
    { icon: ExternalLink, label: 'Görseli yeni sekmede aç', run: () => window.open(src, '_blank', 'noopener,noreferrer') },
    ...(img.sourceUrl ? [{ icon: Copy, label: `Kaynak sayfa (${img.source || 'site'})`, run: () => window.open(img.sourceUrl, '_blank', 'noopener,noreferrer') }] : [])
  ];

  return (
    <div
      ref={ref}
      role="menu"
      style={{ left, top, width }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed z-[80] rounded-2xl border p-1.5 shadow-2xl backdrop-blur-2xl ${
        isDark ? 'bg-slate-900/95 border-white/10 text-slate-100' : 'bg-white/95 border-black/10 text-slate-900'
      }`}
    >
      <div className="px-3 py-1.5 text-[10px] opacity-50 truncate">{img.title}</div>
      {items.map(({ icon: Icon, label, run, keepOpen }) => (
        <button
          key={label}
          role="menuitem"
          onClick={() => { sound.playClick(); run(); if (!keepOpen) onClose(); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-colors ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
          }`}
        >
          <Icon className="w-3.5 h-3.5 opacity-70" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function ImagesPanel({ query, initial = [], isDark, onOpen }) {
  const [time, setTime] = useState('all');
  const [size, setSize] = useState('');
  const [type, setType] = useState('');
  const [layout, setLayout] = useState('');
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exhausted, setExhausted] = useState(false);
  const [menu, setMenu] = useState(null);
  const abortRef = useRef(null);
  const pressTimer = useRef(null);
  const filtersDirty = time !== 'all' || size || type || layout;

  const load = useCallback(async (pageNo, append) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ q: query, page: String(pageNo) });
      if (time !== 'all') params.set('time', time);
      if (size) params.set('size', size);
      if (type) params.set('type', type);
      if (layout) params.set('layout', layout);
      const res = await fetch(`${API_BASE}/api/live-images?${params}`, { signal: controller.signal });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Görseller alınamadı');
      const fresh = data.results || [];
      setItems(prev => {
        if (!append) return fresh;
        const seen = new Set(prev.map(p => p.fullImage));
        return [...prev, ...fresh.filter(f => !seen.has(f.fullImage))];
      });
      setExhausted(fresh.length < 20);
      setPage(pageNo);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [query, time, size, type, layout]);

  // Filtre değişince baştan yükle (ilk açılışta sunucudan gelen liste kullanılır)
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setExhausted(false);
    load(0, false);
  }, [time, size, type, layout, load]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const openMenu = (e, img) => {
    e.preventDefault();
    e.stopPropagation(); // uygulamanın genel sağ tık menüsü üstüne binmesin
    setMenu({ x: e.clientX, y: e.clientY, img });
  };

  // Dokunmatik: uzun basınca aynı menü
  const onTouchStart = (e, img) => {
    const t = e.touches[0];
    pressTimer.current = setTimeout(() => setMenu({ x: t.clientX, y: t.clientY, img }), 550);
  };
  const cancelPress = () => clearTimeout(pressTimer.current);

  const panel = isDark ? 'bg-slate-900/70 border-white/10 backdrop-blur-xl' : 'bg-white/80 border-black/8 shadow-sm backdrop-blur-xl';

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-3xl border space-y-3 ${panel}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Görseller</h3>
              <p className="text-[11px] opacity-60">Web görselleri, güvenli arama açık · sağ tıkla: indir, kopyala, kaynağa git</p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-mono font-bold border border-sky-500/20">
            {items.length} görsel
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TimeRangeChips value={time} onChange={setTime} isDark={isDark} disabled={loading} />
          <span className="w-px h-4 bg-white/10 hidden sm:block" />
          <FilterSelect label="Boyut" value={size} onChange={setSize} options={SIZE_OPTS} isDark={isDark} />
          <FilterSelect label="Tür" value={type} onChange={setType} options={TYPE_OPTS} isDark={isDark} />
          <FilterSelect label="Yön" value={layout} onChange={setLayout} options={LAYOUT_OPTS} isDark={isDark} />
          {filtersDirty && (
            <button
              onClick={() => { setTime('all'); setSize(''); setType(''); setLayout(''); }}
              className="text-[11px] text-sky-400 hover:underline"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => load(0, false)} className="underline">Tekrar dene</button>
        </div>
      )}

      {items.length === 0 && !loading ? (
        <div className={`p-12 text-center rounded-3xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10'}`}>
          <ImageIcon className="w-10 h-10 mx-auto opacity-30 text-sky-400 mb-3" />
          <h4 className="text-sm font-semibold mb-1">Görsel bulunamadı</h4>
          <p className="text-xs opacity-60 max-w-sm mx-auto">
            "{query}" için {filtersDirty ? 'bu filtrelerle' : ''} görsel çıkmadı. {filtersDirty ? 'Filtreleri gevşetmeyi deneyin.' : 'Farklı bir arama deneyin.'}
          </p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {items.map((img, i) => (
            <div
              key={img.id || i}
              onClick={() => { sound.playClick(); onOpen(img); }}
              onContextMenu={(e) => openMenu(e, img)}
              onTouchStart={(e) => onTouchStart(e, img)}
              onTouchEnd={cancelPress}
              onTouchMove={cancelPress}
              className="group relative mb-3 break-inside-avoid rounded-2xl overflow-hidden bg-black/30 border border-white/10 hover:border-sky-500/40 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300"
              style={{ aspectRatio: img.width && img.height ? `${img.width} / ${img.height}` : undefined }}
            >
              <img
                src={img.thumb || img.fullImage}
                alt={img.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                onError={(e) => { e.currentTarget.closest('div').style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end pointer-events-none">
                <span className="text-white text-[11px] font-semibold line-clamp-2 leading-snug">{img.title}</span>
                <span className="text-[10px] text-slate-300 truncate">{img.source}{img.width ? ` · ${img.width}×${img.height}` : ''}</span>
              </div>
              <button
                aria-label="Görseli indir"
                title="İndir"
                onClick={(e) => { e.stopPropagation(); sound.playClick(); downloadImage(img); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-500/70"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-1 min-h-[2.5rem]">
        {loading ? (
          <span className="flex items-center gap-2 text-xs opacity-70"><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor…</span>
        ) : items.length > 0 && !exhausted && page < 5 ? (
          <button
            onClick={() => { sound.playClick(); load(page + 1, true); }}
            className={`px-5 py-2 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${
              isDark ? 'bg-white/5 border-white/15 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
            }`}
          >
            Daha fazla görsel
          </button>
        ) : null}
      </div>

      {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} onOpen={onOpen} isDark={isDark} />}
    </div>
  );
}
