import { normalizePair, pairId, pairName, palettes, styles } from './catalog.js?v=2';

const presets = new Map();
const customDesigns = new Map();
let longestName = 0;

for (const style of styles) {
  for (const variation of style.variations) {
    const design = { style: style.id, variation: variation.id };
    const designName = variation.id === 'original' ? style.name : style.name + ' ' + variation.name;
    const customPrefix = (designName + ' Custom').toLowerCase();
    customDesigns.set(customPrefix, design);
    longestName = Math.max(longestName, customPrefix.length + ' #000000 #000000 #000000'.length);
    for (const palette of palettes) {
      const pair = { ...design, colors: palette.colors };
      const name = pairName(pair).toLowerCase();
      presets.set(name, pair);
      longestName = Math.max(longestName, name.length);
    }
  }
}

function matchName(name) {
  const preset = presets.get(name);
  if (preset) return preset;
  const match = /^(.+ custom) (#[0-9a-f]{6}) (#[0-9a-f]{6}) (#[0-9a-f]{6})$/.exec(name);
  const design = match && customDesigns.get(match[1]);
  return design ? normalizePair({ ...design, colors: match.slice(2) }) : null;
}

function emailLine(raw) {
  const unquoted = raw.normalize('NFKC').replace(/[\u200b-\u200d\ufeff]/g, '').trim().replace(/^(?:>\s*)+/, '');
  const marker = /^(?:[-*•▪‣–]|\d+[.)])\s+/.exec(unquoted);
  const text = unquoted.slice(marker?.[0].length ?? 0).trim();
  const name = text.toLowerCase().replace(/^["“‘']+|["”’'.,]+$/g, '').replace(/&/g, ' and ').replace(/\s+/g, ' ').trim();
  return { text, name, startsItem: Boolean(marker) };
}

export function parseSelection(text) {
  const lines = text.split(/\r\n|[\r\n\u2028\u2029;]/).map(emailLine);
  const pairs = new Map();
  const unmatched = [];
  let duplicates = 0;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.text) continue;
    let name = line.name;
    let end = index;
    let pair = matchName(name);
    // Mail clients can hard-wrap a name. Only consume extra lines after an exact match.
    while (!pair && name.length < longestName) {
      const next = lines[end + 1];
      if (!next?.name || next.startsItem || !name) break;
      name += ' ' + next.name;
      end++;
      if (name.length <= longestName) pair = matchName(name);
    }
    if (!pair) {
      unmatched.push(line.text);
      continue;
    }
    index = end;
    const id = pairId(pair);
    if (pairs.has(id)) duplicates++;
    else pairs.set(id, pair);
  }
  return { pairs: [...pairs.values()], duplicates, unmatched };
}
