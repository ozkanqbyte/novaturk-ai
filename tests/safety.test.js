import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSpam, SPAM_DROP_THRESHOLD } from '../server/safety.js';

test('assessSpam: numaralı bahis alan adı eşik üstünde puan alır', () => {
  const r = assessSpam({ url: 'http://bet365-bahis123.xyz/giris', title: 'Bahis siteleri canlı casino', snippet: '', authorityScore: 0 });
  assert.ok(r.score >= SPAM_DROP_THRESHOLD, `puan ${r.score}`);
});

test('assessSpam: güvenilir haber sitesi engellenmez', () => {
  const r = assessSpam({ url: 'https://www.cumhuriyet.com.tr/turkiye/x', title: "Sakarya'da yasa dışı bahis operasyonu: 26 tutuklama", snippet: 'bahis operasyonu', authorityScore: 90 });
  assert.ok(r.score < SPAM_DROP_THRESHOLD, `puan ${r.score}`);
});
