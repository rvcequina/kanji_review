/** Lightweight romaji → hiragana converter used for typing answers (WaniKani-style IME). */

const VOWELS = ['a', 'i', 'u', 'e', 'o'] as const;

const ROWS: Record<string, readonly string[]> = {
  '': ['あ', 'い', 'う', 'え', 'お'],
  k: ['か', 'き', 'く', 'け', 'こ'],
  g: ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  s: ['さ', 'し', 'す', 'せ', 'そ'],
  z: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  t: ['た', 'ち', 'つ', 'て', 'と'],
  d: ['だ', 'ぢ', 'づ', 'で', 'ど'],
  n: ['な', 'に', 'ぬ', 'ね', 'の'],
  h: ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  b: ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  p: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
  m: ['ま', 'み', 'む', 'め', 'も'],
  r: ['ら', 'り', 'る', 'れ', 'ろ'],
  y: ['や', '', 'ゆ', '', 'よ'],
  w: ['わ', '', '', '', 'を'],
};

const SMALL: Record<string, string> = { a: 'ゃ', u: 'ゅ', o: 'ょ' };
const SMALL_VOWELS = ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ'];

function buildTable(): Map<string, string> {
  const table = new Map<string, string>();
  for (const [cons, kana] of Object.entries(ROWS)) {
    VOWELS.forEach((v, i) => {
      const k = kana[i];
      if (k) table.set(cons + v, k);
    });
  }
  // palatalised: kya, gya, nya, hya, bya, pya, mya, rya
  for (const cons of ['k', 'g', 'n', 'h', 'b', 'p', 'm', 'r']) {
    const base = ROWS[cons]?.[1] ?? '';
    for (const [v, small] of Object.entries(SMALL)) table.set(`${cons}y${v}`, base + small);
  }
  // sh / ch / j / sy / ty / zy / dy
  const palatal: Record<string, string> = { sh: 'し', sy: 'し', ch: 'ち', ty: 'ち', j: 'じ', zy: 'じ', jy: 'じ', dy: 'ぢ' };
  for (const [cons, base] of Object.entries(palatal)) {
    for (const [v, small] of Object.entries(SMALL)) table.set(cons + v, base + small);
    table.set(`${cons}i`, base);
    table.set(`${cons}e`, base + 'ぇ');
  }
  table.set('tsu', 'つ');
  table.set('fu', 'ふ');
  for (const [i, v] of VOWELS.entries()) {
    if (v !== 'u') table.set(`f${v}`, `ふ${SMALL_VOWELS[i]}`);
    table.set(`x${v}`, SMALL_VOWELS[i] ?? '');
    table.set(`l${v}`, SMALL_VOWELS[i] ?? '');
  }
  for (const [v, small] of Object.entries(SMALL)) {
    table.set(`xy${v}`, small);
    table.set(`ly${v}`, small);
  }
  for (const key of ['xtu', 'ltu', 'xtsu', 'ltsu']) table.set(key, 'っ');
  table.set('wi', 'うぃ');
  table.set('we', 'うぇ');
  table.set('-', 'ー');
  return table;
}

const TABLE = buildTable();
const CONSONANT = /^[bcdfghjklmpqrstvwxyz]$/;

/**
 * Convert romaji to hiragana. When `finalize` is false a trailing lone "n"
 * (and any incomplete syllable) is left untouched so live typing feels natural.
 */
export function romajiToKana(input: string, finalize = false): string {
  const s = input.toLowerCase();
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s.charAt(i);
    const next = s.charAt(i + 1);

    if (ch === 'n') {
      if (next === 'n' || next === "'") { out += 'ん'; i += 2; continue; }
      if (next === '') { if (finalize) out += 'ん'; else out += 'n'; i += 1; continue; }
      if (!'aiueoy'.includes(next)) { out += 'ん'; i += 1; continue; }
    }
    // sokuon: double consonant
    if (ch === next && CONSONANT.test(ch) && ch !== 'n') { out += 'っ'; i += 1; continue; }

    let matched = false;
    for (let len = 4; len >= 1; len--) {
      const chunk = s.slice(i, i + len);
      const kana = TABLE.get(chunk);
      if (kana !== undefined && chunk.length === len) { out += kana; i += len; matched = true; break; }
    }
    if (!matched) { out += ch; i += 1; }
  }
  return out;
}

export function katakanaToHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/** True when the string contains only kana, long-vowel marks and spaces. */
export function isAllKana(text: string): boolean {
  return /^[぀-ゟ゠-ヿー\s]*$/.test(text);
}
