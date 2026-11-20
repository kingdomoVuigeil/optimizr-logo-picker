import assert from 'node:assert/strict';
import test from 'node:test';
import { pairId, pairName, palettes, styles } from '../catalog.js';
import { parseSelection } from '../selection-import.js';

test('every exported combination, including custom inks, comes back in the original order', () => {
  const colors = [...palettes.map(palette => palette.colors), ['#082143', '#AB34CD', '#FED765']];
  const exported = styles.flatMap(style => style.variations.flatMap(variation =>
    colors.map(inks => ({ style: style.id, variation: variation.id, colors: inks }))));
  const result = parseSelection(exported.map(pairName).join('\r\n'));
  assert.deepEqual(result.pairs.map(pairId), exported.map(pairId));
  assert.equal(result.duplicates, 0);
  assert.deepEqual(result.unmatched, []);
});

test('quoted, numbered and wrapped mail keeps distinct variations and skips duplicates', () => {
  const email = [
    'Hi Domo,',
    '> > 1) Folded\u00a0Belt Twin Loop Ultramarine',
    '> >   & Coral',
    '> 2. “Scan Frame Iris Forest and Copper”',
    '> • Scan Frame Sweep Forest and Copper',
    '> - FOLDED BELT TWIN LOOP ULTRAMARINE AND CORAL.',
    '',
    'Sean'
  ];
  const result = parseSelection(email.join('\r\n'));
  assert.deepEqual(result.pairs.map(pairName), [
    'Folded Belt Twin Loop Ultramarine and Coral',
    'Scan Frame Iris Forest and Copper',
    'Scan Frame Sweep Forest and Copper'
  ]);
  assert.equal(result.duplicates, 1);
  assert.deepEqual(result.unmatched, ['Hi Domo,', 'Sean']);
});

test('custom ink order survives email wrapping and equivalent preset values deduplicate', () => {
  const result = parseSelection([
    'Folded Belt Custom #28369e #be463d #ff917f; Folded Belt Ultramarine and Coral',
    '> Scan Frame',
    '> Light Curtain Custom',
    '> #432112 #abcdef',
    '> #007f00'
  ].join('\n'));
  assert.deepEqual(result.pairs.map(pairName), [
    'Folded Belt Ultramarine and Coral',
    'Scan Frame Light Curtain Custom #432112 #ABCDEF #007F00'
  ]);
  assert.equal(result.duplicates, 1);
  assert.deepEqual(result.unmatched, []);
});

test('unknown colors, invalid custom values, prose and separated fragments remain unmatched', () => {
  const bad = [
    'Folded Belt Plaid',
    'Scan Frame Iris Custom #DECADE #12345G #222222',
    'I like Machine Plate Forest and Copper',
    '<b>Folded Belt Ultramarine and Coral</b>',
    'Scan Frame',
    '',
    'Iris Forest and Copper',
    '- Folded Belt',
    '- Ultramarine and Coral'
  ];
  const result = parseSelection([...bad, 'Machine Plate Forest and Copper'].join('\n'));
  assert.deepEqual(result.pairs.map(pairName), ['Machine Plate Forest and Copper']);
  assert.deepEqual(result.unmatched, bad.filter(Boolean).map(line => line.replace(/^- /, '')));
  assert.equal(result.duplicates, 0);
  assert.deepEqual(parseSelection(' \n> \r\n'), { pairs: [], duplicates: 0, unmatched: [] });
});
