import { signature } from './lettering.js';

const ink = 'var(--ink)';
const detail = 'var(--detail)';
const accent = 'var(--accent)';
const paper = 'var(--knockout)';

function shape(d, fill = ink) {
  return '<path fill="' + fill + '" fill-rule="evenodd" d="' + d + '"/>';
}

function stroke(d, color, width, cap = 'round') {
  return '<path fill="none" stroke="' + color + '" stroke-width="' + width
    + '" stroke-linecap="' + cap + '" stroke-linejoin="round" d="' + d + '"/>';
}

function disc(x, y, radius, fill) {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + radius + '" fill="' + fill + '"/>';
}

function place(x, y, content) {
  return '<g transform="translate(' + x + ' ' + y + ')">' + content + '</g>';
}

function art(id, name, viewBox, paths) {
  return { id, name, viewBox, paths };
}

// A small hand-lettered legal designation for the two custom wordmarks.
const legalStrokes = 'M21 5C18 1 13 1 10 1C3 1 1 7 1 14S4 27 12 27C17 27 20 25 22 23V15H13'
  + 'M30 26V10M30 15Q32 9 37 9Q42 9 42 15V26M42 15Q44 9 49 9Q54 9 54 15V26'
  + 'M63 1V26M63 16Q65 9 71 9Q78 9 78 18Q78 27 71 27Q65 27 63 21'
  + 'M87 1V27M106 1V27M87 14H106';
function legalMark(x, y, scale, color = ink) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')">'
    + stroke(legalStrokes, color, 3.6, 'butt') + '</g>';
}

// Beveled stencil alphabet. Counter bridges are actual clear cuts, so the
// marks can be previewed on different substrates without a background plate.
const stencilForms = [
  [0, 'M16 0H61L77 16V68L61 84H16L0 68V16ZM22 19L18 23V61L22 65H55L59 61V23L55 19Z'],
  [84, 'M0 22H42L59 37V69L44 84H17V107H0ZM17 39V66H36L42 60V45L36 39Z'],
  [148, 'M8 8H26V22H48V38H26V60L32 66H48V84H26L8 68V38H0V22H8Z'],
  [202, 'M0 0H17V16H0ZM0 22H17V84H0Z'],
  [226, 'M0 22H52L60 28L66 22H74L88 36V84H71V42L67 38H59L54 42V84H36V42L32 38H18V84H0Z'],
  [322, 'M0 0H17V16H0ZM0 22H17V84H0Z'],
  [346, 'M0 22H55V36L24 67H57V84H0V69L30 39H0Z'],
  [410, 'M0 0H47L64 16V40L51 52L70 84H48L31 56H18V84H0ZM18 18V38H39L46 33V23L41 18Z']
];

function stencilLettering(id, bridges, paints, transform = '') {
  const mask = '__mark__stencil-' + id;
  const glyphs = stencilForms.map(([x, d], index) => place(x, 0, shape(d, paints[index] || ink))).join('');
  return '<defs><mask id="' + mask + '" maskUnits="userSpaceOnUse" x="-20" y="-20" width="540" height="155">'
    + '<rect x="-20" y="-20" width="540" height="155" fill="white"/>' + shape(bridges, 'black')
    + '</mask></defs><g transform="' + transform + '"><g mask="url(#' + mask + ')">' + glyphs + '</g></g>';
}

const stencil = {
  id: 'stencil-cut', name: 'Stencil Cut',
  variations: [
    art('original', 'Original', '0 0 615 142',
      place(12, 15, stencilLettering('original',
        'M35 -3H42V22H35ZM35 62H42V87H35ZM118 45H146V52H118ZM438 -3H445V21H438Z',
        { 7: detail }, 'translate(0 0)'))
      + shape('M13 130H67V134H13Z', accent) + legalMark(503, 78, .89)),
    art('bridge-cut', 'Bridge Cut', '0 0 631 150',
      place(19, 17, stencilLettering('bridge',
        'M-4 36H22V48H-4ZM55 36H81V48H55ZM112 17H122V44H112ZM112 62H122V88H112Z'
        + 'M406 25H432V34H406ZM448 22H478V33H448Z',
        { 0: detail }, 'translate(0 0)'))
      + stroke('M21 132H77M89 132H111', accent, 6, 'butt')
      + shape('M507 56H516V102H507Z', accent) + legalMark(528, 77, .82)),
    art('diagonal-gauge', 'Diagonal Gauge', '0 0 635 148',
      place(36, 17, stencilLettering('diagonal',
        'M10 -5H19L49 89H40ZM99 17H109L127 87H118ZM432 -5H441L469 91H459Z',
        { 7: detail }, 'skewX(-11)'))
      + shape('M514 26H524L511 67H501ZM530 26H540L527 67H517ZM546 26H555L542 67H533Z', accent)
      + legalMark(507, 79, .98)),
    art('crate-stamp', 'Crate Stamp', '0 0 681 164',
      stroke('M14 47V16H75M14 113V145H75M488 16H522', ink, 7, 'butt')
      + place(31, 28, stencilLettering('crate',
        'M29 -2H39V23H29ZM61 47H80V55H61ZM115 59H125V89H115ZM443 27H479V36H443Z',
        {}, 'translate(0 0)'))
      + shape('M535 28H651L669 46V112L653 128H535ZM546 37L541 41L546 46L551 41Z', ink)
      + shape('M535 28H550L535 68Z', accent) + legalMark(549, 78, .94, paper))
  ]
};

// Centerline lettering for parallel rails. The clear strip follows each
// curve, including counters and the leg of the capital R.
const roundLetters = [
  'M43 6C19 6 9 21 9 44C9 68 19 82 43 82C67 82 77 68 77 44C77 21 67 6 43 6Z',
  'M99 105V30M100 47C104 34 113 28 125 28C140 28 149 39 149 55C149 71 140 82 125 82C111 82 103 76 99 65',
  'M174 10V65Q174 80 188 80H201M159 32H197',
  'M220 33V81M220 8V12',
  'M246 81V31M247 49Q250 29 265 29Q282 29 282 48V81M282 49Q285 29 300 29Q317 29 317 48V81',
  'M342 33V81M342 8V12',
  'M365 32H412L366 79H415',
  'M440 81V8H474Q502 8 502 30Q502 51 474 51H441M471 51L507 81'
];

function doubleRail(id, paths, colors, width = 14, gap = 4) {
  const base = '__mark__inline-' + id;
  const all = paths.join('');
  return '<defs><mask id="' + base + '" maskUnits="userSpaceOnUse" x="-10" y="-12" width="566" height="148">'
    + stroke(all, 'white', width) + stroke(all, 'black', gap) + '</mask></defs>'
    + '<g mask="url(#' + base + ')"><path fill="' + ink + '" d="M-10 -12H563V139H-10Z"/>'
    + colors.map(([start, end, fill]) => shape('M' + start + ' -12H' + end + 'V139H' + start + 'Z', fill)).join('')
    + '</g>';
}

const hairpinLetters = [...roundLetters];
hairpinLetters[0] = 'M32 7H56Q78 7 78 30V59Q78 81 56 81H32Q9 81 9 59V30Q9 7 32 7Z';
hairpinLetters[6] = 'M365 31H404Q413 31 406 39L371 72Q363 80 373 80H415';
hairpinLetters[7] = 'M440 81V9H477Q501 9 501 30Q501 51 478 51H443M470 52L493 78Q503 89 511 78Q518 69 508 63';

const loopLetters = [...roundLetters];
loopLetters[0] = 'M11 47V40Q11 6 42 6Q76 6 76 40V49Q76 82 43 82Q11 82 11 47Z';
loopLetters[2] = 'M174 11V65Q174 81 190 81H203M159 32H198';
loopLetters[6] = 'M365 32H411L367 79H413Q429 79 429 95Q429 108 414 108H364';
loopLetters[7] = 'M446 81V8H477Q504 8 504 30Q504 51 477 51H446M471 51L503 82H518';

const terminalLetters = [...roundLetters];
terminalLetters[0] = 'M18 57Q13 52 13 43Q13 8 45 8Q76 8 76 44Q76 80 44 80H23';
terminalLetters[2] = 'M174 12V67Q174 81 189 81H198M160 33H195';
terminalLetters[7] = 'M440 80V8H478Q503 8 503 30Q503 51 478 51H444M474 51L497 77H528';

const inline = {
  id: 'inline-track', name: 'Inline Track',
  variations: [
    art('original', 'Original', '0 0 642 142',
      place(10, 14, doubleRail('original', roundLetters, [[365, 416, detail], [482, 550, ink]]))
      + disc(230, 24, 4, accent) + disc(352, 24, 4, accent) + legalMark(535, 77, .9)),
    art('hairpin', 'Hairpin', '0 0 655 147',
      place(12, 14, doubleRail('hairpin', hairpinLetters, [[0, 85, detail], [488, 545, detail]], 16, 5))
      + place(12, 14, stroke('M4 45H14M71 44H84M491 72L499 68', accent, 3, 'butt'))
      + legalMark(548, 78, .86)),
    art('passing-loop', 'Passing Loop', '0 0 650 155',
      place(11, 12, doubleRail('passing-loop', loopLetters, [[360, 437, detail]], 13, 3.5))
      + place(11, 12, stroke('M112 94H168Q176 94 184 102L191 108H341', accent, 5))
      + place(11, 12, disc(347, 108, 5, detail)) + legalMark(549, 76, .82)),
    art('terminal-stop', 'Terminal Stop', '0 0 660 146',
      place(12, 14, doubleRail('terminal', terminalLetters, [[455, 541, detail]], 12, 3.5))
      + place(12, 14, disc(18, 57, 8, accent) + disc(23, 80, 8, ink) + disc(528, 77, 9, accent)
        + disc(99, 105, 7.5, detail) + shape('M8 98H37V102H8Z', detail))
      + legalMark(554, 77, .83))
  ]
};

const datum = {
  id: 'datum-ring', name: 'Datum Ring',
  variations: [
    art('original', 'Original', '0 0 652 153',
      stroke('M67 20A54 54 0 1 0 117 98', ink, 12, 'butt')
      + stroke('M81 20A54 54 0 0 1 126 71', accent, 12, 'butt')
      + stroke('M43 76H56M72 47V61M84 76H98M72 90V104', ink, 3, 'butt')
      + disc(72, 76, 7, detail) + stroke('M116 85H136', detail, 3, 'butt')
      + signature('grotesk', 153, 30, 481)),
    art('vernier', 'Vernier', '0 0 684 142',
      stroke('M16 103A60 60 0 0 1 136 103', ink, 10, 'butt')
      + stroke('M35 101A41 41 0 0 1 117 101', detail, 3, 'butt')
      + stroke('M19 89L28 91M28 65L37 71M47 49L53 59M76 41V54M102 48L97 60M125 68L116 74', ink, 3, 'butt')
      + shape('M70 98L108 57L82 106Z', accent) + disc(76, 102, 8, ink)
      + stroke('M14 113H135', ink, 5, 'butt')
      + signature('condensed', 158, 20, 506)),
    art('true-north', 'True North', '0 0 510 238',
      stroke('M242 18A46 46 0 1 0 268 18', ink, 9, 'butt')
      + stroke('M227 99A44 44 0 0 0 283 99', detail, 5, 'butt')
      + shape('M255 7L269 32H261L255 65L249 32H241Z', accent)
      + stroke('M208 65H220M290 65H302M255 98V113', ink, 3, 'butt') + disc(255, 68, 5, detail)
      + signature('serif', 27, 126, 456)),
    art('quarter-index', 'Quarter Index', '0 0 667 153',
      shape('M21 125V22H36V108H127V125Z')
      + stroke('M43 20A91 91 0 0 1 132 108', accent, 12, 'butt')
      + stroke('M44 49A61 61 0 0 1 104 108', ink, 5, 'butt')
      + stroke('M46 107L103 50', detail, 6, 'butt') + disc(45, 106, 11, ink)
      + stroke('M51 119V126M65 119V126M80 119V126M95 119V126M110 119V126', accent, 2, 'butt')
      + signature('wide', 155, 28, 491))
  ]
};

const pallet = {
  id: 'pallet-stack', name: 'Pallet Stack',
  variations: [
    art('original', 'Original', '0 0 677 148',
      shape('M16 50L75 19L95 27L36 58ZM43 61L102 31L122 40L63 70ZM71 73L130 43L149 51L90 82Z', ink)
      + shape('M16 57L90 88L149 58V71L90 101L16 70Z', detail)
      + shape('M19 74L37 82V94L19 86ZM66 94L86 102V115L66 107ZM125 85L145 75V88L125 98Z', accent)
      + shape('M16 91L90 121L149 91V100L90 131L16 100Z', ink)
      + signature('wide', 169, 25, 489)),
    art('cross-stack', 'Cross Stack', '0 0 665 158',
      shape('M17 100L92 63L141 82L66 121Z', detail)
      + shape('M17 100L66 121V136L17 116ZM66 121L141 82V95L66 136Z', ink)
      + shape('M29 65L78 45L139 72L91 94Z', accent)
      + shape('M29 65L91 94V105L29 78ZM91 94L139 72V84L91 105Z', detail)
      + shape('M16 49L90 15L137 32L65 68Z', ink)
      + shape('M16 49L65 68V82L16 64ZM65 68L137 32V45L65 82Z', detail)
      + stroke('M40 49L108 20M64 58L128 29', accent, 3, 'butt')
      + signature('humanist', 165, 31, 480)),
    art('fork-pocket', 'Fork Pocket', '0 0 700 142',
      shape('M16 32H163V49H16ZM16 58H163V85H151V102H126V85H102V106H77V85H50V102H26V85H16Z')
      + shape('M12 110H167V120H12Z', detail)
      + shape('M37 95H72V105H37ZM107 95H142V105H107Z', accent)
      + signature('condensed', 187, 24, 492)),
    art('double-deck', 'Double Deck', '0 0 500 240',
      shape('M157 18H343V29H157ZM164 34H200V46H164ZM234 34H267V46H234ZM301 34H336V46H301ZM157 50H343V61H157Z', ink)
      + shape('M143 70H327V81H143ZM150 85H185V99H150ZM219 85H251V99H219ZM288 85H321V99H288Z', detail)
      + shape('M142 101H328V111H142Z', accent)
      + signature('grotesk', 28, 127, 444))
  ]
};

const pennant = {
  id: 'signal-pennant', name: 'Signal Pennant',
  variations: [
    art('original', 'Original', '0 0 651 153',
      shape('M28 27Q48 19 70 28Q94 39 127 28L106 54L126 72Q98 85 72 71Q48 59 28 67Z')
      + shape('M67 28Q92 39 127 28L106 54L122 71Q92 76 70 65Z', accent)
      + shape('M87 49L106 54L121 71Q103 74 87 69Z', detail)
      + stroke('M25 21V124', ink, 7, 'butt') + disc(25, 20, 6, detail)
      + signature('humanist', 149, 31, 486)),
    art('semaphore', 'Semaphore', '0 0 663 156',
      stroke('M25 33L113 124M125 22L35 121', ink, 7, 'butt')
      + shape('M27 30L59 9L82 35L50 53Z', ink)
      + shape('M27 30L44 19L67 45L50 53Z', accent)
      + shape('M123 19L150 42L130 66L100 44Z', detail)
      + shape('M123 19L150 42L140 54L111 32Z', accent)
      + disc(75, 82, 11, ink) + disc(75, 82, 4.6, accent)
      + signature('grotesk', 166, 32, 478)),
    art('swallowtail', 'Swallowtail', '0 0 530 244',
      shape('M150 30Q197 10 243 25Q287 41 358 12L328 54L361 75Q310 105 248 81Q201 61 150 86Z', ink)
      + shape('M234 22Q284 41 358 12L328 54Q282 77 239 56Z', accent)
      + shape('M239 56Q282 77 328 54L361 75Q310 105 248 81Z', detail)
      + stroke('M144 23V108', ink, 6, 'butt')
      + signature('serif-italic', 26, 127, 478)),
    art('code-hoist', 'Code Hoist', '0 0 661 164',
      stroke('M30 17V146', ink, 7, 'butt') + disc(30, 16, 6, detail)
      + shape('M38 24H132L111 43L130 55H38Z', ink)
      + shape('M70 24H88L72 55H54Z', accent)
      + shape('M38 64H103L118 81L102 97H38Z', detail)
      + shape('M38 64H57V97H38Z', accent)
      + shape('M38 107H123L85 135H38Z', ink)
      + signature('italic', 149, 38, 492))
  ]
};

export const signatureStyles = [stencil, inline, datum, pallet, pennant];
