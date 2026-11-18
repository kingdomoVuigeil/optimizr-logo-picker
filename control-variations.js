import { artwork } from './artwork.js';
import { signature } from './lettering.js';

const ink = 'var(--ink)';
const detail = 'var(--detail)';
const accent = 'var(--accent)';
const knockout = 'var(--knockout)';

const path = (d, paint = ink) => '<path fill="' + paint + '" d="' + d + '"/>';
const holes = (d, paint = ink) => '<path fill-rule="evenodd" fill="' + paint + '" d="' + d + '"/>';
const group = (transform, shapes) => '<g transform="' + transform + '">' + shapes + '</g>';
const stroke = (d, paint, width, cap = 'butt') =>
  '<path d="' + d + '" fill="none" stroke="' + paint + '" stroke-width="' + width +
  '" stroke-linecap="' + cap + '" stroke-linejoin="round"/>';

// Retain the original outlined letters, counters and GmbH wherever the variation edits the mechanism.
const flatMaster = artwork['conveyor-flat'].paths;
const letterGroup = flatMaster.slice(0, flatMaster.indexOf('</g>') + 4);
const conveyorGlyphs = letterGroup.match(/<path\b[^>]*\/>/g);
function editedLetters(replacements) {
  return '<g fill="' + ink + '" fill-rule="evenodd">' +
    conveyorGlyphs.map((glyph, index) => replacements[index] ?? glyph).join('') + '</g>';
}
const controlSuffix = artwork['control-matrix'].paths.match(/<path\b[^>]*\/>/g).slice(2).join('');
function matrixLegal(x, baseline, scale, paint) {
  return group('translate(' + x + ' ' + baseline + ') scale(' + scale + ') translate(-590 -96)',
    controlSuffix.replaceAll(ink, paint));
}

const pixels = {
  O: ['01110','10001','10001','10001','10001','10001','01110','00000','00000'],
  p: ['00000','00000','11110','10001','10001','10001','11110','10000','10000'],
  t: ['0100','0100','1111','0100','0100','0100','0011','0000','0000'],
  i: ['1','0','1','1','1','1','1','0','0'],
  m: ['0000000','0000000','1110110','1001001','1001001','1001001','1001001','0000000','0000000'],
  z: ['00000','00000','11111','00010','00100','01000','11111','00000','00000'],
  R: ['11110','10001','10001','11110','10100','10010','10001','00000','00000']
};
function matrixRuns(x, y, pitch, gap, renderRun) {
  const geometry = [];
  for (const letter of 'OptimizR') {
    const rows = pixels[letter];
    rows.forEach((bits, row) => {
      for (const run of bits.matchAll(/1+/g)) {
        geometry.push(renderRun(x + run.index * pitch, y + row * pitch, run[0].length, letter, row));
      }
    });
    x += (rows[0].length + gap) * pitch;
  }
  return geometry.join('');
}
function circleCut(x, y, r) {
  return 'M' + (x - r) + ' ' + y + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r +
    ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0z ';
}

const punchedLetters = matrixRuns(43, 43, 11, 1, (x, y, length) =>
  Array.from({length}, (_, index) => circleCut(x + index * 11, y, 4.7)).join(''));
const feedHoles = Array.from({length: 23}, (_, i) => circleCut(43 + 25 * i, 23, 2.8)).join('');
const punchedPlate = holes('M24 12H619L645 38V138L633 150H23L10 137V27Z ' + punchedLetters + feedHoles);
const scanRows = matrixRuns(13, 14, 14, 1, (x, y, count, letter, row) => {
  const paint = letter === 'z' && row >= 3 && row <= 5 ? accent : ink;
  return stroke('M' + x + ' ' + y + 'h' + ((count - 1) * 14 + 8), paint, 8.4, 'round');
});
const pinLayout = ['011110','110011','110011','111110','110100','110010','110001'];
const relayPins = pinLayout.map((bits, row) => Array.from(bits, (bit, col) => {
  if (bit === '0') return '';
  const paint = row > 3 && col > 2 ? accent : row === 3 && col > 2 ? detail : ink;
  const x = 14 + 17 * col;
  const y = 9 + 17 * row;
  return '<rect x="' + x + '" y="' + y + '" width="13.8" height="13.8" rx="4.8" fill="' + paint + '"/>';
}).join('')).join('');

function gradient(id, x1, y1, x2, y2) {
  return '<defs><linearGradient id="__mark__' + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 +
    '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"><stop stop-color="' + ink +
    '"/><stop offset=".49" stop-color="' + detail + '"/><stop offset="1" stop-color="' +
    accent + '"/></linearGradient></defs>';
}
const gradientPaint = id => 'url(#__mark__' + id + ')';
const doubleRing =
  '<rect x="28" y="31" width="180" height="170" rx="70" fill="none" stroke="' + ink + '" stroke-width="20"/>' +
  '<rect x="49" y="53" width="138" height="127" rx="51" fill="none" stroke="' + ink + '" stroke-width="13"/>' +
  stroke('M50 131V105C50 73 71 54 102 54H135C166 54 187 75 187 105', gradientPaint('inner-track'), 13);
const twinStream = gradient('inner-track', 55, 121, 184, 75) + gradient('stream', 875, 172, 1015, 130) +
  editedLetters({0: doubleRing}) +
  stroke('M879 181H895C913 181 922 172 932 155L946 132C958 112 972 108 992 108H1042', gradientPaint('stream'), 12) +
  stroke('M879 201H895C923 201 939 189 952 167L967 143C975 131 984 128 996 128H1042', gradientPaint('stream'), 12);
const returnLoop = gradient('return', 869, 175, 1028, 207) + letterGroup +
  stroke('M877 191H896C914 191 921 200 932 215L942 227C954 242 969 247 986 247H994C1017 247 1030 235 1030 216C1030 197 1017 186 996 186H979C959 186 947 176 947 158C947 136 963 121 986 121H1042',
    gradientPaint('return'), 25);
const hairpin = gradient('hairpin', 27, 13, 132, 111) +
  stroke('M10 25H110C132 25 145 35 145 51C145 68 132 79 110 79H62C47 79 39 88 39 100C39 113 48 121 64 121H147',
    gradientPaint('hairpin'), 20) +
  signature('humanist', 176, 33, 448);

const doglegO = holes('M62 21H174L219 65V166L176 209H62L18 166V65Z M78 65L64 79V152L79 168H158L174 152V80L158 65Z') +
  path('M174 21L219 65V87L153 21Z', accent);
const dogleg = editedLetters({0: doglegO}) +
  path('M880 176H903V144H940V107H1042V134H969V170H932V207H880Z', accent) +
  path('M940 107H968V133H940Z', detail);
const slottedI = group('translate(484 0)', path('M2 72H44V207H2Z M9 23H27L19 59H1Z M33 23H49L41 59H25Z'));
const spliced = editedLetters({3: slottedI, 5: group('translate(261 0)', slottedI)}) +
  path('M876 175H902L923 153L939 169L905 207H876Z', detail) +
  path('M929 147L947 127L963 143L945 163Z', accent) +
  path('M953 121L971 103H1042V132H985L969 138Z', accent);
const transferDeck = signature('wide', 18, 7, 562, {end: ink}) +
  path('M26 140H211L229 122H381L400 103H577V113H405L387 131H235L217 149H26Z') +
  path('M245 104H286V116H245Z M296 104H332V116H296Z', detail) +
  path('M411 86H452V97H411Z M462 86H501V97H462Z', accent) +
  path('M31 155H178L169 162H31Z');

// Diverter emblems use three different motions: a fork, a swivelling arm and a perpendicular transfer.
const yJunction =
  path('M10 61H49C72 61 88 66 103 83L134 118H96L75 94C65 83 59 82 44 82H10Z', detail) +
  path('M10 55H48C68 55 78 47 88 33L109 7H146L115 46C95 72 81 82 49 82H10Z') +
  path('M99 21L111 7H146L134 21Z', accent) +
  signature('grotesk', 170, 26, 456);
const pivotMechanism =
  stroke('M15 70H35A41 41 0 0 1 101 32L113 21', ink, 15) +
  stroke('M114 47A42 42 0 0 1 47 98L36 110', ink, 15) +
  stroke('M116 70H143', detail, 15) +
  path('M55 78L96 35L109 48L69 93C60 103 45 95 47 85Q48 82 55 78Z', accent) +
  '<circle cx="59" cy="86" r="5.5" fill="' + ink + '"/>';
const pivotArm = group('translate(164 0) scale(.96)', pivotMechanism) +
  signature('condensed', 8, 118, 458, {end: ink});
const transferHub =
  path('M10 82L126 15L151 30L36 97Z') +
  path('M10 82L36 97V108L10 93Z M36 97L151 30V40L36 108Z', detail) +
  path('M26 34L51 19L158 81L132 96Z', accent) +
  path('M26 34L132 96V106L26 44Z', detail) +
  path('M132 96L158 81V91L132 106Z') +
  path('M66 57L91 43L115 57L90 71Z', ink);
const crossTransfer = group('translate(1 13)', transferHub) +
  signature('wide', 174, 27, 464);

// The retrofit master is a traced three-ink drawing. Its terminal R sits in a clear,
// documented gap between x=937 and the legal suffix, which begins at x=1155.
const modularMaster = artwork['modular-r'].paths;
function modularComponents(accept) {
  return Array.from(modularMaster.matchAll(/<path fill="([^"]+)" fill-rule="evenodd" d="([^"]+)"\/>/g),
    ([, paint, outline]) => {
      const contours = outline.match(/M[^M]+/g) || [];
      const selected = contours.filter(contour => accept(parseFloat(contour.slice(1))));
      return selected.length ? holes(selected.join(''), paint) : '';
    }).join('');
}
const modularPrefix = modularComponents(x => x < 941);
const modularSuffix = modularComponents(x => x >= 1152);
const dovetailO =
  path('M32 7H151L181 37V91H150L139 105H124V60L112 48H77L62 63V159L74 171H112L124 159V147H155L167 132H181V192L152 221H32L3 192V38Z') +
  path('M128 113H144L157 98H181V123L164 140H128Z', accent) +
  path('M128 113H144L157 98H165L152 119H128Z', detail);
const dovetailPrefix = dovetailO + modularComponents(x => x > 190 && x < 941);
const dovetailR = group('translate(955 7)',
  holes('M0 0H145L177 29V101L149 130H123L134 112H106L82 141H55V213H0Z M55 44V91H109L122 80V55L110 44Z') +
  path('M84 150L108 122H120L108 143H145L192 213H131L96 158H78Z', accent) +
  path('M84 150L108 122H120L108 143H125L113 156H79Z', detail));
const cartridgeEmblem =
  holes('M13 29L29 12H126L143 28V119L126 137H29L13 121Z M38 37H94L113 54V76L96 93H85L112 120H89L61 91H55V119H38Z M55 54V74H88L94 69V60L87 54Z') +
  path('M81 91H95L126 122H104Z', accent) +
  path('M121 106L138 122L131 131L115 115Z', detail);
const cartridge = cartridgeEmblem +
  group('translate(166 34) scale(.327)', modularMaster);
const splitR = group('translate(955 0)',
  path('M0 28L16 12H46V220H0Z') +
  path('M57 4H151L183 36V98L155 127H57V91H126L136 81V57L126 47H57Z', detail) +
  path('M61 141H116L196 223H132L85 175H61Z', accent));

export const controlVariations = {
  'control-matrix': [
    {
      id: 'punch-tape', name: 'Punch Tape', viewBox: '0 0 655 163',
      paths: punchedPlate + matrixLegal(514, 101, 1.11, knockout) +
        path('M611 49H629V63H611Z M611 69H629V83H611Z', accent)
    },
    {
      id: 'scan-rows', name: 'Scan Rows', viewBox: '0 0 685 145',
      paths: scanRows + matrixLegal(580, 102, 1.08, ink)
    },
    {
      id: 'pin-relay', name: 'Pin Relay', viewBox: '0 0 608 141',
      paths: relayPins + signature('mono', 148, 25, 445, {end: ink})
    }
  ],
  'conveyor-flow': [
    { id: 'twin-stream', name: 'Twin Stream', viewBox: '0 0 1440 264', paths: twinStream },
    { id: 'return-loop', name: 'Return Loop', viewBox: '0 0 1440 280', paths: returnLoop },
    { id: 'hairpin', name: 'Hairpin', viewBox: '-7 0 649 147', paths: hairpin }
  ],
  'conveyor-flat': [
    { id: 'dogleg', name: 'Dogleg', viewBox: '0 0 1440 264', paths: dogleg },
    { id: 'belt-splice', name: 'Belt Splice', viewBox: '0 0 1440 264', paths: spliced },
    { id: 'transfer-deck', name: 'Transfer Deck', viewBox: '0 0 600 177', paths: transferDeck }
  ],
  'conveyor-switch': [
    { id: 'y-junction', name: 'Y Junction', viewBox: '0 0 643 137', paths: yJunction },
    { id: 'pivot-arm', name: 'Pivot Arm', viewBox: '0 0 474 206', paths: pivotArm },
    { id: 'cross-transfer', name: 'Cross Transfer', viewBox: '0 0 652 147', paths: crossTransfer }
  ],
  'modular-r': [
    { id: 'dovetail', name: 'Dovetail', viewBox: '-20 -14 1460 296', paths: dovetailPrefix + dovetailR + modularSuffix },
    { id: 'cartridge', name: 'Cartridge', viewBox: '0 0 644 154', paths: cartridge },
    { id: 'split-assembly', name: 'Split Assembly', viewBox: '-15 -10 1198 335',
      paths: modularPrefix + splitR + group('translate(372 200) scale(.55)', modularSuffix) }
  ]
};
