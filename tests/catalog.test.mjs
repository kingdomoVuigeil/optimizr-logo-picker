import assert from 'node:assert/strict';
import test from 'node:test';
import { initial, newStyles, normalizePair, pairId, pairName, palettes, styles, variationFor } from '../catalog.js';

test('a saved like from the first release retains its label and storage key', () => {
  const saved = { style: 'folded-belt', colors: ['#28369e', '#be463d', '#ff917f'] };
  const current = normalizePair(saved);
  assert.deepEqual(current, initial);
  assert.equal(pairId(current), 'folded-belt/28369E-BE463D-FF917F');
  assert.equal(pairName(current), 'Folded Belt Ultramarine and Coral');
});

test('each design has its own artwork, storage key and clipboard line in every palette', () => {
  const ids = new Set();
  const names = new Set();
  const paths = new Set();
  assert.equal(newStyles.length, 10);
  assert.equal(styles.length, 20);
  for (const style of styles) {
    assert.equal(style.variations.length, 4, style.name);
    assert.equal(style.variations[0].id, 'original');
    for (const variation of style.variations) {
      assert.ok(!paths.has(variation.paths), style.name + ' ' + variation.name);
      paths.add(variation.paths);
      for (const palette of palettes) {
        const pair = normalizePair({ style: style.id, variation: variation.id, colors: palette.colors });
        assert.equal(variationFor(pair), variation);
        ids.add(pairId(pair));
        names.add(pairName(pair));
      }
    }
  }
  assert.equal(paths.size, 80);
  assert.equal(ids.size, paths.size * palettes.length);
  assert.equal(names.size, ids.size);
});

test('a variation and its palette survive a storage round trip, including custom colors', () => {
  const pair = normalizePair({ style: 'folded-belt', variation: 'twin-loop', colors: ['#123456', '#789abc', '#fedcba'] });
  assert.equal(pairName(pair), 'Folded Belt Twin Loop Custom #123456 #789ABC #FEDCBA');
  assert.deepEqual(normalizePair(JSON.parse(JSON.stringify(pair))), pair);
  assert.notEqual(pairId(pair), pairId({ ...pair, variation: 'original' }));
  assert.equal(normalizePair({ ...pair, style: 'scan-frame' }), null);
  assert.equal(normalizePair({ ...pair, variation: 'missing' }), null);
});
