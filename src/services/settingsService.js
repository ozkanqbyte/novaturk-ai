const SETTINGS_KEY = 'novaturk_advanced_settings';

export const DEFAULT_SETTINGS = {
  searchRegion: 'turkey',
  selectedCountries: [],
  resultLanguage: 'auto',
  sourceTypes: ['official', 'news', 'academic', 'technology'],
  recency: 'any',
  searchMode: 'balanced',
  safeSearch: 'strict',
  resultsPerPage: 10,
  sqliteCacheEnabled: true,
  navigationalPinning: true,
  aiMode: 'cited-summary',
  aiDailyBudget: 'standard',
  agentVerification: true,
  agentContradiction: false,
  agentImageRights: false,
  agentCounterView: false,
  agentReport: false,
  historyEnabled: true,
  historyAutoDelete: 'never',
  telemetryEnabled: false,
  cookieIsolation: false,
  dnsPreference: 'system',
  privacyShield: 'maximum',
  sleepInactiveTabs: 'off',
  memorySaver: false,
  lowPowerMode: false,
  preloadEnabled: true,
  reducedMotion: false,
  themePreference: 'system',
  blurIntensity: 'ultra',
  textSize: 'standard',
  highContrast: false,
  showKeyboardShortcuts: true,
  speechRate: 1,
  soundEnabled: true,
  // Old settings are retained so an existing installation does not lose preferences.
  aiSynthesisMode: 'compact',
  agentDevilsAdvocate: true,
  agentBargainHunter: true,
  agentExecutor: true,
};

export function getSavedSettings() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveUserSettings(settings) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }));
}

export function updateSavedSettings(patch) {
  const next = { ...getSavedSettings(), ...patch };
  saveUserSettings(next);
  return next;
}
