// Pano işlemleri. navigator.clipboard yalnızca güvenli bağlamda (HTTPS / localhost) vardır;
// düz HTTP'de (ör. IP adresiyle açılan sunucu) tanımsızdır ve sessizce hata verir.
// Bu yüzden önce modern API, olmazsa gizli textarea + execCommand yedeği kullanılır.
// Dönüş değeri işlemin gerçekten başarılı olup olmadığıdır — arayüz buna göre geri bildirim verir.

function legacyCopy(text) {
  const previous = document.activeElement;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  document.body.removeChild(ta);
  if (previous && typeof previous.focus === 'function') previous.focus();
  return ok;
}

export async function copyText(text) {
  const value = String(text ?? '');
  if (!value) return false;
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // izin reddedildi ya da belge odakta değil — yedeğe düş
    }
  }
  return legacyCopy(value);
}

// Okuma yalnızca güvenli bağlamda ve kullanıcı izniyle mümkün; olmazsa null döner.
export async function readClipboardText() {
  if (navigator.clipboard?.readText && window.isSecureContext) {
    try { return await navigator.clipboard.readText(); } catch { return null; }
  }
  return null;
}

export function insertIntoField(field, text) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  // React kontrollü input'lar için değer, yerel setter üzerinden yazılmalı
  const proto = field.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  const next = field.value.slice(0, start) + text + field.value.slice(end);
  if (setter) setter.call(field, next); else field.value = next;
  field.selectionStart = field.selectionEnd = start + text.length;
  field.dispatchEvent(new Event('input', { bubbles: true }));
}
