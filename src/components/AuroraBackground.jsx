import React from 'react';

export default function AuroraBackground({ currentTheme, isDark }) {
  const theme = currentTheme || {};
  const gradient = theme.gradientStyle || 'radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 65%, rgba(6, 182, 212, 0.4) 0%, rgba(3, 10, 22, 0.98) 65%)';
  const primaryAccent = theme.accent || '#06b6d4';
  const secondaryAccent = theme.secondaryAccent || theme.accent || '#10b981';

  return (
    <div 
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-none select-none transition-all duration-700 ${
        isDark ? (theme.bg || 'bg-[#030a16]') : (theme.bg || 'bg-[#f4f7fc]')
      }`}
    >
      {/* 1. Canlı VisionOS Aurora Işık Küresi (Sol Üst) */}
      <div 
        style={{ 
          backgroundColor: primaryAccent,
          filter: 'blur(130px)'
        }}
        className="w-[650px] h-[650px] rounded-full absolute -top-48 -left-32 opacity-40 transition-all duration-1000 animate-pulse"
      />

      {/* 2. Canlı VisionOS Aurora Işık Küresi (Sağ Alt) */}
      <div 
        style={{ 
          backgroundColor: secondaryAccent,
          filter: 'blur(140px)'
        }}
        className="w-[600px] h-[600px] rounded-full absolute top-1/4 -right-28 opacity-35 transition-all duration-1000"
      />

      {/* 3. Ana Degrade Tuvali */}
      <div 
        className="absolute inset-0 transition-all duration-700 opacity-95"
        style={{
          background: gradient
        }}
      />

      {/* 4. İnce Apple VisionOS Doku Ağı */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
