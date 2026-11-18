import { artwork } from './artwork.js';
import { classicVariations } from './classic-variations.js';
import { controlVariations } from './control-variations.js';
import { mechanismStyles } from './mechanism-styles.js';
import { signatureStyles } from './signature-styles.js';

const variationsByStyle = { ...classicVariations, ...controlVariations };
const firstStyles = [
  { id: 'folded-belt', name: 'Folded Belt' },
  { id: 'roller-bend', name: 'Roller Bend' },
  { id: 'machine-plate', name: 'Machine Plate' },
  { id: 'express', name: 'Express' },
  { id: 'precision-serif', name: 'Precision Serif' },
  { id: 'control-matrix', name: 'Control Matrix' },
  { id: 'conveyor-flow', name: 'Conveyor Flow' },
  { id: 'conveyor-flat', name: 'Conveyor Flat' },
  { id: 'conveyor-switch', name: 'Conveyor Switch' },
  { id: 'modular-r', name: 'Modular R' }
].map(style => ({
  ...style,
  variations: [
    { id: 'original', name: 'Original', ...artwork[style.id] },
    ...variationsByStyle[style.id]
  ]
}));

export const newStyles = [...mechanismStyles, ...signatureStyles];
export const styles = [...firstStyles, ...newStyles];

export const palettes = [
  ['Petrol', 'Petrol and Turquoise', '#073B56', '#00899D', '#0ECBBF'],
  ['Graphite', 'Graphite and Orange', '#292F33', '#B84A13', '#FF843D'],
  ['Cobalt', 'Cobalt and Ice Blue', '#182851', '#2F71D3', '#56A8F4'],
  ['Pine', 'Pine and Lime', '#163D31', '#317548', '#A4D84E'],
  ['Midnight', 'Midnight and Signal Yellow', '#172638', '#8A6400', '#FFD128'],
  ['Burgundy', 'Burgundy and Sand', '#641E36', '#925C43', '#EBD1B3'],
  ['Ultramarine', 'Ultramarine and Coral', '#28369E', '#BE463D', '#FF917F'],
  ['Carbon', 'Carbon and Silver', '#25282C', '#626A72', '#CFD4D8'],
  ['Aubergine', 'Aubergine and Lilac', '#4B275A', '#78529E', '#D3B0F4'],
  ['Forest', 'Forest and Copper', '#18493E', '#A45435', '#EBA579'],
  ['Vermilion', 'Vermilion and Sky Blue', '#AD3027', '#266D88', '#B3E6F3'],
  ['Chalk', 'Chalk and Racing Red', '#23272B', '#F3EDDE', '#BD2638']
].map(([short, name, ...colors]) => ({ short, name, colors }));

export const initial = { style: styles[0].id, variation: 'original', colors: palettes[6].colors };
export const styleById = new Map(styles.map(style => [style.id, style]));
const presetByColors = new Map(palettes.map(palette => [palette.colors.join('-'), palette]));

export function variationFor(pair) {
  return styleById.get(pair.style)?.variations.find(option => option.id === (pair.variation ?? 'original'));
}

export function normalizePair(value) {
  if (!value || !styleById.has(value.style) || !Array.isArray(value.colors) || value.colors.length !== 3) return null;
  if (!value.colors.every(color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))) return null;
  const variation = variationFor(value);
  if (!variation) return null;
  return { style: value.style, variation: variation.id, colors: value.colors.map(color => color.toUpperCase()) };
}

export function paletteFor(colors) {
  return presetByColors.get(colors.join('-')) || { short: 'Custom', name: 'Custom ' + colors.join(' '), colors };
}

export function pairId(pair) {
  // Originals retain the keys used by the first edition of the picker.
  const design = !pair.variation || pair.variation === 'original' ? pair.style : pair.style + '/' + pair.variation;
  return design + '/' + pair.colors.map(color => color.slice(1)).join('-');
}

export function pairName(pair) {
  const variation = variationFor(pair);
  const names = [styleById.get(pair.style).name];
  if (variation.id !== 'original') names.push(variation.name);
  names.push(paletteFor(pair.colors).name);
  return names.join(' ');
}
