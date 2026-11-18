import { signature } from './lettering.js';

// The marks are drawn on a 128-unit square. Cutouts leave the paper visible
// so the same outlines work in every palette, including custom colors.
function fill(d, color = 'ink') {
  return '<path fill="var(--' + color + ')" fill-rule="evenodd" d="' + d + '"/>';
}

function stroke(d, color, width, cap = 'round') {
  return '<path fill="none" stroke="var(--' + color + ')" stroke-width="' + width +
    '" stroke-linecap="' + cap + '" stroke-linejoin="round" d="' + d + '"/>';
}

function disk(x, y, radius, color) {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + radius + '" fill="var(--' + color + ')"/>';
}

function place(mark, x, y, scale = 1) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')">' + mark + '</g>';
}

function beside(id, name, mark, face, { right = false, terminal = 'ink' } = {}) {
  const emblem = place(mark, right ? 589 : 8, 9);
  const type = signature(face, right ? 12 : 156, 21, 558, { end: 'var(--' + terminal + ')' });
  return { id, name, viewBox: '0 0 728 146', paths: emblem + type };
}

function stacked(id, name, mark, face, terminal = 'ink') {
  const emblem = place(mark, 222, 0, 1.38);
  const type = signature(face, 29, 181, 564, { end: 'var(--' + terminal + ')' });
  return { id, name, viewBox: '0 0 622 292', paths: emblem + type };
}

// Solid side cheeks, visible wheel hubs and a low deck identify these as
// warehouse shuttles. Each carriage sits on its own running rail.
const shuttle = [
  fill('M33 39h57l-5 25H28z M48 44l-1 6h22l1-6z'),
  fill('M35 31h58l-2 7H32z', 'accent'),
  fill('M87 39h7l-5 25h-7z', 'detail'),
  fill('M10 62h15l6 6h61l9-7h18l-9 18h-9a10 10 0 0 0-20 0H43a10 10 0 0 0-20 0h-8z'),
  disk(33,80,6.5,'detail'), disk(92,80,6.5,'detail'),
  fill('M9 93h109l-4 6H5z')
].join('');

const twinTrack = [
  fill('M49 28h57l10 10-6 10H51l-9-9z'),
  fill('M50 28h22l-5 11H45z', 'accent'),
  fill('M59 48h8v5h-8z M95 48h8v5h-8z', 'detail'),
  fill('M28 57h91l-4 5H24z'),
  fill('M16 70h56l10 10-8 11H20L8 82z', 'accent'),
  fill('M54 70h18l10 10-8 11H58l6-12z', 'detail'),
  fill('M26 91h7v5h-7z M61 91h7v5h-7z'),
  fill('M6 100h91l-4 5H2z')
].join('');

const docked = [
  fill('M6 40h16v31l12 12h60l12-12V40h16v37l-20 22H26L6 78z'),
  fill('M5 31h20v10H5z M103 31h20v10h-20z', 'detail'),
  fill('M33 62l8-14h45l10 14-7 10H40z', 'accent'),
  fill('M45 50h21l-2 6H42z'),
  fill('M45 75h8v5h-8z M76 75h8v5h-8z', 'detail'),
  fill('M23 104h25v5H23z M80 104h25v5H80z')
].join('');

const gantry = [
  fill('M11 101V28l10-11h81l12 11v73H99V33H27v68z'),
  fill('M31 22h64v6H31z', 'detail'),
  fill('M46 17h32v15l-6 8H52l-6-8z', 'accent'),
  fill('M60 39h5v15h-5z'),
  fill('M37 76l6-15h39l7 15z', 'detail'),
  fill('M31 77h64l-5 11H36z'),
  disk(44,91,4,'accent'), disk(81,91,4,'accent'),
  fill('M4 105h118v6H4z')
].join('');

const shuttleRail = {
  id: 'shuttle-rail', name: 'Shuttle Rail',
  variations: [
    beside('original', 'Original', shuttle, 'italic'),
    beside('twin-track', 'Twin Track', twinTrack, 'wide', { terminal: 'detail' }),
    stacked('docked', 'Docked', docked, 'condensed'),
    beside('gantry', 'Gantry', gantry, 'condensed', { right: true })
  ]
};

// The original scan window spans the whole name. Its ray passes through an
// actual break in the barcode rather than concealing the signature.
const brackets = fill(
  'M8 22l12-12h44v9H25l-6 6v23H8z M8 99h11v21l6 6h39v10H20L8 124z ' +
  'M714 22l-12-12h-44v9h39l6 6v23h11z M714 99h-11v21l-6 6h-39v10h44l12-12z'
);

const codeBars = [[44,7],[56,4],[65,10],[80,5],[90,4],[99,9],[113,5],[123,9]];
const code = codeBars.map(([x,w]) =>
  fill('M' + x + ' 43h' + w + 'v22h-' + w + 'z M' + x + ' 78h' + w + 'v22h-' + w + 'z')
).join('');

const scanWindow = brackets + code +
  fill('M33 69h112l-8 6H33z', 'accent') +
  fill('M139 69h6l-8 6h-7z', 'detail') +
  signature('grotesk', 157, 24, 530);

const blades = ['ink','detail','accent','ink','detail','ink'];
const iris = blades.map((color, index) =>
  '<g transform="rotate(' + (index * 60) + ' 64 64)">' +
  fill('M65 11l44 25-25 35V52z',color) + '</g>'
).join('');

const scanSweep = [
  fill('M10 94l11-15 25 18-10 15-22-5z'),
  fill('M31 80l5-8 21 15-6 8z', 'detail'),
  fill('M42 70l26-47 15 6-30 50z', 'accent'),
  stroke('M59 54a48 48 0 0 1 32 36','ink',7,'butt'),
  stroke('M67 41a64 64 0 0 1 38 45','ink',6,'butt'),
  stroke('M76 28a78 78 0 0 1 42 54','detail',5,'butt'),
  disk(106,101,5,'accent')
].join('');

const lightCurtain = [
  fill('M9 21h15l5 6v70l-5 7H9z M17 31a3 3 0 1 0 .1 0z M17 91a3 3 0 1 0 .1 0z'),
  fill('M119 21h-15l-5 6v70l5 7h15z M111 31a3 3 0 1 0 .1 0z M111 91a3 3 0 1 0 .1 0z'),
  fill('M33 33h62v4H33z M33 45h62v4H33z', 'accent'),
  fill('M33 58h15v4H33z M81 58h14v4H81z M33 71h15v4H33z M81 71h14v4H81z', 'detail'),
  fill('M52 55h24v25H52z M57 59v4h12v-4z'),
  fill('M33 87h62v4H33z', 'accent')
].join('');

const scanFrame = {
  id: 'scan-frame', name: 'Scan Frame',
  variations: [
    { id: 'original', name: 'Original', viewBox: '0 0 722 146', paths: scanWindow },
    beside('iris', 'Iris', iris, 'grotesk'),
    beside('sweep', 'Sweep', scanSweep, 'italic', { right: true }),
    stacked('light-curtain', 'Light Curtain', lightCurtain, 'mono')
  ]
};

// The visible rim and handle of the tote are transparent holes. On the
// stacked version each new lip lines up with the taper of the bin above.
const tote = [
  fill('M9 37l55-27 55 27-55 27z M27 37l37 18 37-18-37-18z', 'accent'),
  fill('M12 43l49 24v48L19 94z M28 59l1 7 15 7v-6z'),
  fill('M116 43L67 67v48l42-21z M100 59l-1 7-15 7v-6z', 'detail'),
  fill('M28 38l36-18 34 17-6 3-28-13-29 15z', 'detail')
].join('');

const nestedBins = [
  fill('M8 29l56-23 56 23-56 24z M27 29l37 15 37-15-37-15z', 'accent'),
  fill('M12 34l49 21v19L17 56z'),
  fill('M116 34L67 55v19l44-18z', 'detail'),
  fill('M16 63l45 19v12L20 78z'),
  fill('M112 63L67 82v12l41-16z', 'detail'),
  fill('M21 85l40 17v13L25 99z'),
  fill('M107 85l-40 17v13l36-16z', 'detail')
].join('');

const openFlaps = [
  fill('M22 56l40-20 40 20-40 23z', 'detail'),
  fill('M24 63l35 20v32L28 97z'),
  fill('M100 63L65 83v32l31-18z', 'detail'),
  fill('M24 51L9 36l34-19 18 18z', 'accent'),
  fill('M65 34l14-17 36 20-15 15z'),
  fill('M20 57L7 68l36 22 15-12z'),
  fill('M104 56l15 12-36 22-16-12z', 'accent')
].join('');

const strapped = [
  fill('M10 36L64 9l54 27-54 28z', 'accent'),
  fill('M10 40l51 26v50L10 89z'),
  fill('M118 40L67 66v50l51-27z', 'detail'),
  fill('M33 24l9-5 54 27-9 5z'),
  fill('M89 22l8 4-55 29-9-4z', 'detail'),
  fill('M32 51l10 5v50l-10-6z', 'accent'),
  fill('M87 56l10-5v49l-10 5z', 'accent'),
  fill('M16 68l11 5v7l-11-5z', 'accent')
].join('');

const isometricTote = {
  id: 'isometric-tote', name: 'Isometric Tote',
  variations: [
    beside('original', 'Original', tote, 'humanist'),
    beside('nested-bins', 'Nested Bins', nestedBins, 'humanist', { terminal: 'detail' }),
    stacked('open-flaps', 'Open Flaps', openFlaps, 'wide'),
    beside('strapped', 'Strapped', strapped, 'grotesk', { right: true })
  ]
};

// The open space between moving blade and fixed pad is intentional. The
// pivot remains connected to the feed in each of the contact diagrams.
function pivot(x, y, outer = 10, inner = 4) {
  const ring = 'M' + (x - outer) + ' ' + y + 'a' + outer + ' ' + outer + ' 0 1 0 ' +
    (2 * outer) + ' 0a' + outer + ' ' + outer + ' 0 1 0 -' + (2 * outer) + ' 0z';
  const bore = 'M' + (x - inner) + ' ' + y + 'a' + inner + ' ' + inner + ' 0 1 0 ' +
    (2 * inner) + ' 0a' + inner + ' ' + inner + ' 0 1 0 -' + (2 * inner) + ' 0z';
  return fill(ring + ' ' + bore);
}

const openContact = [
  fill('M6 80h23v9H6z'),
  stroke('M41 78l48-49', 'ink', 11, 'butt'),
  fill('M78 29l10-10 14 14-10 10z', 'accent'),
  pivot(36,84,11.5,4.5),
  fill('M86 74h16v6h20v9H91l-5-5z', 'detail'),
  fill('M85 65h18v10H85z', 'accent')
].join('');

const changeover = [
  fill('M4 61h20v7H4z'),
  stroke('M37 59l39-23', 'ink', 8, 'butt'),
  fill('M79 38l-8-10 8-5 7 10z', 'accent'),
  pivot(31,64,10,4),
  fill('M87 27h33v8H94l-5 7-7-5z'),
  fill('M87 94h33v8H85l-5-9 7-5z', 'detail'),
  disk(87,86,5,'accent')
].join('');

const twinPole = [
  fill('M6 46h19v6H6z M6 87h19v6H6z'),
  stroke('M38 45l42-23 M38 86l42-23', 'ink', 8, 'butt'),
  pivot(32,49,8,3), pivot(32,90,8,3),
  stroke('M61 39v8m0 7v8m0 7v3', 'detail', 4, 'butt'),
  fill('M82 45h37v7H82z M82 86h37v7H82z'),
  disk(83,48.5,6,'accent'), disk(83,89.5,6,'accent')
].join('');

const coilDrive = [
  stroke('M7 93h19m76 0h19', 'ink',6,'butt'),
  fill('M25 77h77v32H25z M33 84v17h61V84z'),
  stroke('M45 99l8-13m4 13l8-13m4 13l8-13','detail',4,'butt'),
  stroke('M62 71V59m0-6v-9', 'detail',4,'butt'),
  stroke('M10 44h19m12-4l40-22','ink',7,'butt'),
  pivot(35,44,8,3),
  fill('M82 41h36v7H82z'),
  disk(83,44,6,'accent'),
  fill('M78 18l7-4 5 7-9 5z','accent')
].join('');

const relayContact = {
  id: 'relay-contact', name: 'Relay Contact',
  variations: [
    beside('original', 'Original', openContact, 'mono'),
    beside('changeover', 'Changeover', changeover, 'mono', { terminal: 'detail' }),
    stacked('twin-pole', 'Twin Pole', twinPole, 'condensed'),
    beside('coil-drive', 'Coil Drive', coilDrive, 'grotesk', { right: true })
  ]
};

// Curved rear turns are painted first. Each front deck or crossing has its
// own contour instead of a single stroke laid over the entire assembly.
const spiral = [
  fill('M24 37c0-14 26-25 56-25 12 0 23 2 29 7l-3 13c-9-6-18-8-31-8-20 0-38 5-48 14z', 'detail'),
  fill('M108 20v13c0 12-12 19-35 26l-26 8c-11 3-16 7-16 12V66c0-8 7-12 19-16l28-9c20-6 28-13 30-21z'),
  fill('M31 66v13c0 7 12 9 29 9 16 0 33-3 48-9l-2-12c-10 5-27 10-44 10-16 0-28-3-31-11z', 'accent'),
  fill('M108 67v13c0 11-16 20-40 27l-34 10v-14l32-10c25-8 39-16 42-26z'),
  fill('M23 34l24-7 1 9-24 8z','accent')
].join('');

const doubleHelix = [
  stroke('M26 13c5 11 19 16 39 24s37 16 37 27-15 19-37 28-33 14-39 23', 'detail',11),
  stroke('M102 13c-5 11-19 16-39 24S26 53 26 64s15 19 37 28 33 14 39 23', 'ink',11),
  stroke('M26 13c5 11 19 16 39 24l11 5', 'accent',11),
  stroke('M101 69c-4 6-13 12-23 17','accent',11)
].join('');

const landing = [
  fill('M9 69h23c11-11 25-18 52-27l7-2v11l-7 3c-21 7-39 15-47 25H9z'),
  fill('M89 40c14-5 19-9 18-15 9 9 3 17-16 25v-9z', 'detail'),
  fill('M49 26c16-9 39-12 51-9 10 2 13 6 12 10-2 7-11 12-22 16l-7 2v-8l8-3c7-3 11-5 11-7 0-4-23-6-50 6z', 'accent'),
  fill('M29 71c5 9 28 12 54 6l11-4v11l-14 4c-25 6-50 3-56-7z', 'detail'),
  fill('M83 77l16-6h20v10H99l-15 5z'),
  fill('M18 85h6v19h-6z M103 85h6v19h-6z')
].join('');

const liftTower = [
  fill('M17 109h9V19l11-9h53l11 9v90h10v8H17z M35 23v85h57V23l-5-5H40z'),
  fill('M40 29h47v9L40 59V48l34-14H40z', 'accent'),
  fill('M40 53l47-16v10L40 65z'),
  fill('M40 64c13 4 32 1 47-7v9c-16 9-34 12-47 8z', 'detail'),
  fill('M40 84l47-18v10L40 95z'),
  fill('M40 96c15 4 33 1 47-5v9c-13 5-31 8-47 5z','accent')
].join('');

const spiralLift = {
  id: 'spiral-lift', name: 'Spiral Lift',
  variations: [
    stacked('original', 'Original', spiral, 'grotesk'),
    beside('double-helix', 'Double Helix', doubleHelix, 'humanist', { terminal: 'detail' }),
    beside('landing', 'Landing', landing, 'italic'),
    beside('lift-tower', 'Lift Tower', liftTower, 'condensed')
  ]
};

export const mechanismStyles = [shuttleRail, scanFrame, isometricTote, relayContact, spiralLift];
