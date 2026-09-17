import React, { useState } from 'react';
import { 
  X, Check, Sparkles, ShieldCheck, TrendingUp, 
  Building2, Phone, Globe, Tag, CreditCard, Lock, 
  ArrowRight, ArrowLeft, CheckCircle2, Receipt, 
  Clock, AlertCircle, Award, Landmark, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/soundService';
import { submitBusinessAdRequest } from '../services/sponsoredAdsService';

export default function BusinessAdsModal({ isOpen, onClose, isDark = true, currentTheme }) {
  // Adım Yönetimi: 1 = Paket & Bilgiler, 2 = Satın Alma & Ödeme, 3 = Ödeme Başarılı & Makbuz
  const [step, setStep] = useState(1);
  
  const [selectedPlan, setSelectedPlan] = useState('search_first');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'bank'

  // İşletme Bilgileri Formu
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    phone: '',
    keywords: '',
    contactName: '',
    taxOffice: '',
    taxNumber: ''
  });

  // Kart Bilgileri Formu
  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  if (!isOpen) return null;

  const plans = {
    search_first: {
      id: 'search_first',
      name: '1. Sıra Arama Sponsorluğu',
      monthlyPrice: 999,
      yearlyPrice: 8990,
      badge: 'En Popüler',
      desc: 'Hedef kelimelerinizde arama sonuçlarının en başında tek ve doğrulanmış partner olarak çıkın.',
      features: [
        'Aramada 1. Sıra Sabit Link',
        'Tek Tıkla Arama & WhatsApp Butonu',
        'Sınırsız Tıklama (Tık Başı Ücret Yok)',
        'Özel İndirim Kuponu Rozeti'
      ]
    },
    showcase_vip: {
      id: 'showcase_vip',
      name: 'Ana Ekran Prestij Vitrini',
      monthlyPrice: 4999,
      yearlyPrice: 44900,
      badge: 'Maksimum Görünürlük',
      desc: 'Her yeni sekme açıldığında milyonlarca kullanıcının gördüğü ana sayfa vitrininde yerinizi alın.',
      features: [
        'Ana Sayfada Sabit Cam Kart',
        'Özel Marka Logosu & Renk Teması',
        'Günün Fırsatı Kampanya Etiketi',
        'Doğrudan Web Sitesi Yönlendirmesi'
      ]
    },
    deal_hunter: {
      id: 'deal_hunter',
      name: 'AI Fırsat Avcısı Kupon Sponsorluğu',
      monthlyPrice: 1499,
      yearlyPrice: 13500,
      badge: 'Viral Satış Garantisi',
      desc: 'Kullanıcılar alışveriş yaparken yapay zeka kuponunuzu önersin, milyonlarca sepette yer alın.',
      features: [
        'Yapay Zeka Otomatik Kupon Önerisi',
        'Viral Sosyal Tasarruf Kalkanı',
        'Doğrudan Sepet İndirimi Entegrasyonu',
        'Canlı Tıklama ve Dönüşüm Raporu'
      ]
    }
  };

  const currentPlan = plans[selectedPlan] || plans.search_first;
  const currentAmount = billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;
  const kdvAmount = Math.round(currentAmount * 0.20);
  const totalAmount = currentAmount + kdvAmount;

  // Kart Numarası Formatlayıcı (4'lü bloklar)
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  // Son Kullanma Tarihi Formatlayıcı (AA/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardData(prev => ({ ...prev, expiry: val }));
  };

  // Adım 1'den Adım 2'ye (Ödemeye Geç)
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.phone) return;
    sound?.playClick?.();
    setStep(2);
  };

  // Adım 2'de Satın Alma & Ödeme Yap
  const handleCompletePayment = (e) => {
    e.preventDefault();
    sound?.playClick?.();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      sound?.playChime?.();

      const receipt = {
        orderId: 'NOVA-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        planName: currentPlan.name,
        billingCycle: billingCycle === 'yearly' ? '1 Yıllık Paket' : '1 Aylık Paket',
        businessName: formData.businessName,
        phone: formData.phone,
        keywords: formData.keywords || 'Genel Sektörel Aramalar',
        amount: totalAmount,
        last4: cardData.cardNumber.replace(/\s/g, '').slice(-4) || '4242'
      };

      submitBusinessAdRequest({
        ...formData,
        plan: selectedPlan,
        billingCycle,
        amount: totalAmount,
        orderId: receipt.orderId,
        paymentStatus: 'paid'
      });

      setOrderReceipt(receipt);
      setStep(3);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className={`apple-glass-card rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 border shadow-2xl relative transition-all ${
        isDark 
          ? 'bg-[#080c14]/95 border-white/10 text-slate-100 shadow-black/80' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Kapat Butonu */}
        <button
          onClick={() => {
            sound?.playClick?.();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 opacity-60 hover:opacity-100" />
        </button>

        {/* 🌟 ADIM GÖSTERGESİ (1: Paket, 2: Satın Alma & Ödeme, 3: Onay) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-400 font-bold' : 'opacity-40'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step >= 1 ? 'bg-amber-500 text-black font-bold' : 'bg-white/10'
            }`}>1</span>
            <span>Paket & Bilgiler</span>
          </div>

          <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-amber-400' : 'bg-white/10'}`} />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-400 font-bold' : 'opacity-40'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step >= 2 ? 'bg-amber-500 text-black font-bold' : 'bg-white/10'
            }`}>2</span>
            <span>Güvenli Satın Alma</span>
          </div>

          <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-emerald-400' : 'bg-white/10'}`} />

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400 font-bold' : 'opacity-40'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step >= 3 ? 'bg-emerald-500 text-white font-bold' : 'bg-white/10'
            }`}>3</span>
            <span>Canlı Yayın</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ADIM 1: PAKET SEÇİMİ VE İŞLETME BİLGİLERİ                                 */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="space-y-5 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                NovaTürk Resmi Sponsorluk Mağazası
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                İşletmenizi 1. Sıraya Taşıyın
              </h2>
              <p className="text-xs opacity-70">
                Google'ın yüksek reklam faturalarından kurtulun. Sabit TL ücretle kendi şehrinizde 1. sırada yerinizi alın.
              </p>
            </div>

            {/* Aylık / Yıllık İndirim Seçici */}
            <div className="flex items-center justify-center">
              <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-xl transition-all ${
                    billingCycle === 'monthly' ? 'bg-amber-500 text-black font-bold shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Aylık Plan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    billingCycle === 'yearly' ? 'bg-amber-500 text-black font-bold shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span>Yıllık Plan</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-white text-[9px] font-mono">
                    %25 İNDİRİM
                  </span>
                </button>
              </div>
            </div>

            {/* Paket Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(plans).map((p) => {
                const isSelected = selectedPlan === p.id;
                const price = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      sound?.playClick?.();
                      setSelectedPlan(p.id);
                    }}
                    className={`rounded-2xl p-4 border transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg ring-1 ring-amber-400/50'
                        : isDark
                          ? 'border-white/8 bg-white/[0.02] hover:border-white/20'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
                        SEÇİLDİ
                      </span>
                    )}

                    <div>
                      <span className="text-[10px] font-bold text-amber-400 font-mono block mb-1">
                        {p.badge}
                      </span>
                      <h4 className="text-xs font-bold leading-snug">{p.name}</h4>
                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-lg font-black tracking-tight text-current">{price.toLocaleString('tr-TR')} TL</span>
                        <span className="text-[10px] opacity-60 font-mono">{billingCycle === 'yearly' ? '/yıl' : '/ay'}</span>
                      </div>
                      <p className="text-[11px] opacity-70 leading-relaxed mb-3">{p.desc}</p>
                    </div>

                    <ul className="space-y-1 text-[10px] opacity-80 pt-2 border-t border-white/5">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* İşletme Bilgileri */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold tracking-tight opacity-90 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>İşletme ve Yayın Bilgileri</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">İşletme / Marka Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kadıköy Çilingir & Kilit"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">Telefon / WhatsApp Numarası *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Örn: 0532 000 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">Web Sitesi URL</label>
                  <input
                    type="text"
                    placeholder="Örn: www.isletmeniz.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">Hedef Anahtar Kelimeler</label>
                  <input
                    type="text"
                    placeholder="Örn: çilingir, kilit, oto anahtar"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Devam Butonu */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer mt-3"
            >
              <span>Ödemeye İlerle ({totalAmount.toLocaleString('tr-TR')} TL)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ADIM 2: GÜVENLİ SATIN ALMA VE ÖDEME GATEWAY                               */}
        {/* ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleCompletePayment} className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Paket Değiştir</span>
              </button>

              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit SSL Güvenli Ödeme</span>
              </div>
            </div>

            {/* Sipariş Özeti Kartı */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-amber-400 font-mono uppercase block">SİPARİŞ ÖZETİ</span>
                <h4 className="text-sm font-bold">{currentPlan.name}</h4>
                <p className="text-[11px] opacity-70">{formData.businessName} • {billingCycle === 'yearly' ? '1 Yıllık Taahhütsüz' : '1 Aylık'}</p>
              </div>

              <div className="text-right sm:border-l sm:pl-4 border-amber-500/20">
                <span className="text-[10px] opacity-60 block">+ %20 KDV Dahil</span>
                <span className="text-lg font-black text-emerald-400">{totalAmount.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>

            {/* Ödeme Yöntemi Seçimi */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Kredi / Banka Kartı</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'bank'
                    ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Havale / FAST / EFT</span>
              </button>
            </div>

            {/* Kredi Kartı Formu */}
            {paymentMethod === 'card' ? (
              <div className="space-y-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: AHMET YILMAZ"
                    value={cardData.cardName}
                    onChange={(e) => setCardData({ ...cardData, cardName: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">Kart Numarası</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="**** **** **** ****"
                      maxLength={19}
                      value={cardData.cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono tracking-wider border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1 opacity-50 text-[10px] font-mono font-bold">
                      <span>VISA</span> • <span>MC</span> • <span>TROY</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold opacity-80 mb-1">Son Kullanma (AA/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold opacity-80 mb-1">CVV / Güvenlik Kodu</label>
                    <input
                      type="password"
                      required
                      placeholder="***"
                      maxLength={3}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-amber-400 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Havale / EFT Bilgileri */
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2 text-xs">
                <p className="font-semibold text-amber-400">Banka Hesap Bilgilerimiz (FAST ile 7/24 Anında Onay):</p>
                <div className="p-2 rounded-xl bg-white/5 font-mono text-[11px] space-y-1">
                  <div><span className="opacity-50">Banka:</span> Ziraat Bankası A.Ş.</div>
                  <div><span className="opacity-50">Alıcı:</span> NovaTürk Bilişim ve Teknoloji A.Ş.</div>
                  <div><span className="opacity-50">IBAN:</span> TR12 0001 0090 1084 9204 5001 01</div>
                  <div><span className="opacity-50">Açıklama:</span> {formData.businessName || 'İşletme Adınız'}</div>
                </div>
              </div>
            )}

            {/* Fatura Bilgileri (Opsiyonel) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] opacity-70 mb-1">Vergi Dairesi (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Örn: Kadıköy V.D."
                  value={formData.taxOffice}
                  onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl text-xs border border-white/10 bg-white/5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] opacity-70 mb-1">Vergi No / TC Kimlik No</label>
                <input
                  type="text"
                  placeholder="10 veya 11 Haneli"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl text-xs border border-white/10 bg-white/5 outline-none"
                />
              </div>
            </div>

            {/* Ödeme Yap Butonu */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing ? 'Ödeme Doğrulanıyor (3D Secure)...' : `${totalAmount.toLocaleString('tr-TR')} TL Güvenle Öde & Yayına Al`}
              </span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ADIM 3: ÖDEME BAŞARILI & RESMİ DİJİTAL MAKBUZ                              */}
        {/* ========================================================================= */}
        {step === 3 && orderReceipt && (
          <div className="text-center py-5 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25 animate-bounce-gentle">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                ÖDEME BAŞARIYLA TAMAMLANDI
              </span>
              <h3 className="text-2xl font-black mt-0.5">Sponsorluğunuz Canlı Yayında! 🚀</h3>
              <p className="text-xs opacity-75 max-w-md mx-auto mt-1">
                Tebrikler! <span className="font-bold text-amber-400">{orderReceipt.businessName}</span> işletmeniz NovaTürk arama motorunda ve vitrinde 1. sırada aktif edildi.
              </p>
            </div>

            {/* Dijital Fatura / Makbuz Kartı */}
            <div className={`max-w-md mx-auto p-4 rounded-2xl border text-left text-xs font-mono space-y-2 ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold">
                <span className="flex items-center gap-1.5"><Receipt className="w-4 h-4 text-amber-400" /> DİJİTAL MAKBUZ</span>
                <span className="text-emerald-400">ÖDENDİ</span>
              </div>

              <div className="flex justify-between"><span className="opacity-50">Sipariş No:</span> <span>{orderReceipt.orderId}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Tarih:</span> <span>{orderReceipt.date}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Paket:</span> <span>{orderReceipt.planName}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Süre:</span> <span>{orderReceipt.billingCycle}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Hedef Kelimeler:</span> <span className="text-amber-400 truncate max-w-[200px]">{orderReceipt.keywords}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Ödeme Kartı:</span> <span>•••• {orderReceipt.last4}</span></div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm">
                <span>Toplam Tutar:</span>
                <span className="text-emerald-400">{orderReceipt.amount.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  sound?.playClick?.();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                Tamamla & Aramayı Canlı Gör
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
