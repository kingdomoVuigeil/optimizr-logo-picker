import { artwork } from './artwork.js';
import { signature } from './lettering.js';

const ink = 'var(--ink)';
const detail = 'var(--detail)';
const accent = 'var(--accent)';
const knockout = 'var(--knockout)';

function face(d, color = ink) {
  return '<path d="' + d + '" fill="' + color + '"/>';
}

function stroke(d, color, weight, cap = 'round') {
  return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + weight +
    '" stroke-linejoin="round" stroke-linecap="' + cap + '"/>';
}

function disc(cx, cy, radius, color) {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="' + color + '"/>';
}

function turn(angle, cx, cy, body) {
  return '<g transform="rotate(' + angle + ' ' + cx + ' ' + cy + ')">' + body + '</g>';
}

function translated(x, y, body) {
  return '<g transform="translate(' + x + ' ' + y + ')">' + body + '</g>';
}

function variation(id, name, width, height, parts) {
  return { id, name, viewBox: '0 0 ' + width + ' ' + height, paths: parts.join('') };
}

const reversed = { ink: knockout, end: knockout, legal: knockout };

function foldedBelt() {
  const twist = [
    // The dark upper strand crosses the return strand; their adjoining edge is the fold.
    face('M12 82 69 20Q79 9 93 15L153 44 130 70 86 49 37 102Z'),
    face('M153 44Q166 50 162 64L148 103 120 92 130 70Z', detail),
    face('M148 103 95 143Q82 152 68 145L17 120Q8 116 10 105L12 82 37 102 77 120 120 92Z', accent),
    face('M12 82 37 102 26 124 17 120Q8 116 10 105Z', detail)
  ].join('');

  const loops = [
    stroke('M70 70 50 91Q39 102 28 91L14 77Q3 66 14 55L49 20Q60 9 71 20L93 42', ink, 18),
    stroke('M72 67 94 45Q105 34 116 45L134 63Q145 74 134 85L99 120Q88 131 77 120L55 98', accent, 18),
    stroke('M47 91 82 56', detail, 18, 'butt'),
    stroke('M65 78 85 58', ink, 18, 'butt')
  ].join('');

  const splice = [
    face('M6 98 50 54Q57 47 67 49L115 59 157 14 183 31 129 91Q124 96 118 95L66 85 32 121Z'),
    face('M32 121 66 85 80 99 42 141 15 126Z', detail),
    face('M80 99 123 107Q134 109 142 101L186 53 203 67 150 128Q143 136 133 134L92 126Z', accent),
    face('M171 17 181 7 194 15 184 25Z', accent)
  ].join('');

  return [
    variation('quarter-twist', 'Quarter Twist', 745, 164, [
      translated(6, 2, twist), signature('grotesk', 199, 33, 535)
    ]),
    variation('twin-loop', 'Twin Loop', 590, 251, [
      translated(219, 2, loops), signature('humanist', 26, 144, 538)
    ]),
    variation('open-splice', 'Open Splice', 784, 165, [
      translated(3, 3, splice), signature('wide', 233, 35, 541, { end: detail })
    ])
  ];
}

function rollerBend() {
  const rim = stroke('M72 15A59 59 0 1 1 71.9 15Z M72 32A42 42 0 1 1 71.9 32Z', ink, 3);
  const radialRollers = Array.from({ length: 24 }, (_, index) => {
    const color = index >= 2 && index <= 8 ? accent : ink;
    return turn(index * 15, 72, 74, stroke('M72 19V28', color, 7));
  }).join('');
  // Reuse the approved geometric lettering from the first p onward. The turntable becomes the O.
  const tail = '<defs><clipPath id="__mark__turntable-type"><rect x="142" y="7" width="564" height="139"/></clipPath></defs>' +
    '<g clip-path="url(#__mark__turntable-type)"><svg x="142" y="7" width="564" height="139" viewBox="129 3 682 168">' +
    artwork['roller-bend'].paths + '</svg></g>';

  const straightRollers = [];
  for (const x of [89, 108, 127, 146]) {
    straightRollers.push(stroke('M' + x + ' 23v19', x === 146 ? accent : ink, 7));
    straightRollers.push(stroke('M' + x + ' 104v19', x === 127 ? detail : accent, 7));
  }
  const bendRollers = [];
  for (const angle of [0, -23, -46, -69, -92, -115, -138, -161, -180]) {
    bendRollers.push(turn(angle, 70, 73, stroke('M70 23v19', angle < -100 ? accent : ink, 7)));
  }
  const hairpin = [
    stroke('M157 18H70A55 55 0 0 0 70 128H157 M157 48H70A25 25 0 0 0 70 98H157', ink, 4),
    ...straightRollers, ...bendRollers
  ].join('');

  const deck = [
    face('M22 103H570L552 111H34Z'),
    face('M42 140H551L573 127H52Z'),
    face('M570 103 589 110 570 125 550 125Z', accent),
    face('M48 137H73L65 150H40Z'),
    face('M516 137H541L547 150H522Z')
  ];
  for (let index = 0; index < 15; index++) {
    const x = 60 + index * 34;
    deck.push(face('M' + x + ' 112h19l-12 12h-19Z', index >= 10 && index <= 12 ? accent : ink));
  }

  return [
    variation('turntable', 'Turntable', 713, 153, [rim, radialRollers, tail]),
    variation('switchback', 'Switchback', 738, 151, [
      hairpin, signature('grotesk', 190, 24, 538)
    ]),
    variation('roller-bed', 'Roller Bed', 620, 164, [
      ...deck, signature('wide', 25, 0, 566)
    ])
  ];
}

function machinePlate() {
  const corners = [[32, 28], [615, 28], [32, 124], [615, 124]];
  const fasteners = corners.map(([x, y]) => disc(x, y, 7.5, detail) +
    stroke('M' + (x - 3) + ' ' + (y + 2) + 'l6-4', knockout, 1.8)).join('');
  const hole = 'M57 65a13 13 0 1 0 0 26a13 13 0 1 0 0-26Z';
  const tag = '<path fill="' + ink + '" fill-rule="evenodd" d="M89 8H695L718 31V124L696 146H89L13 78Z ' + hole + '"/>';

  return [
    variation('rivet-frame', 'Rivet Frame', 648, 153, [
      stroke('M22 10H625L638 23V130L625 143H22L10 131V23Z', ink, 5),
      stroke('M52 21H202 M447 132H596', accent, 4, 'butt'), fasteners,
      signature('condensed', 59, 24, 530)
    ]),
    variation('inspection-tag', 'Inspection Tag', 728, 155, [
      tag, stroke('M85 28 30 78l55 51', accent, 4, 'butt'),
      face('M677 9H695L718 32V52Z', accent),
      signature('condensed', 111, 26, 532, reversed)
    ]),
    variation('rail-mount', 'Rail Mount', 705, 184, [
      face('M64 21H186L178 35H59Z M516 21H641L646 35H524Z', detail),
      face('M58 147H157L148 171H75Z M550 147H649L631 171H559Z', ink),
      face('M9 62H29V123H9Z M676 62H696V123H676Z', accent),
      face('M45 38H659L672 51V135L657 150H48L32 135V51Z'),
      face('M48 55H61V132H48Z M69 55H75V132H69Z', accent),
      signature('mono', 99, 44, 532, reversed)
    ])
  ];
}

function express() {
  const wake = [
    face('M8 62C52 58 94 55 139 34L130 51C99 63 54 70 8 62Z', detail),
    face('M5 83C51 76 79 74 121 63L111 81C70 89 35 91 5 83Z', accent),
    face('M36 103C65 94 85 94 104 90L98 103C76 107 59 109 36 103Z', ink)
  ].join('');
  const turnMark = [
    stroke('M9 105H41Q56 105 68 88L98 44Q109 28 126 28H164', ink, 16, 'butt'),
    stroke('M15 72H39Q51 72 63 56L73 42Q82 30 91 25', accent, 11, 'butt'),
    stroke('M79 114H103Q121 114 132 96L146 74Q152 64 165 64H179', detail, 10, 'butt')
  ].join('');
  const checks = [
    face('M626 24H655L649 44H620Z M613 66H642L636 86H607Z M600 108H629L623 128H594Z', detail),
    face('M649 44H679L673 65H643Z M635 87H665L658 108H629Z', accent)
  ].join('');

  return [
    variation('slipstream', 'Slipstream', 743, 154, [
      wake, signature('italic', 118, 13, 604, { end: detail }),
      face('M443 126 559 116H662L641 124Z', accent)
    ]),
    variation('chicane', 'Chicane', 752, 148, [
      turnMark, signature('italic', 196, 21, 548)
    ]),
    variation('photo-finish', 'Photo Finish', 695, 152, [
      face('M53 24H627L595 128H16L40 101H19L44 75H28L54 48H32Z'),
      checks, signature('italic', 80, 24, 497, reversed)
    ])
  ];
}

function precisionSerif() {
  const seal = [
    stroke('M73 6C114 17 135 43 135 75S114 130 73 144C33 130 11 104 11 75S33 17 73 6Z', ink, 3),
    stroke('M73 14C110 27 125 49 125 75S110 121 73 135C38 123 21 101 21 75S38 27 73 14Z', detail, 1.75),
    face('M75 25C53 27 37 49 37 74C37 99 50 118 72 124C54 106 48 85 51 63C53 46 59 32 75 25Z'),
    face('M74 123C96 121 111 101 111 76C111 52 98 31 77 26C94 45 101 67 98 87C96 103 89 116 74 123Z'),
    face('M74 48 83 72 74 99 65 74Z', accent)
  ].join('');
  const swash = [
    face('M485 83C506 91 503 113 475 122C414 141 306 110 239 115C198 117 173 126 141 141C158 125 181 111 211 104C283 86 391 117 450 110C473 107 487 100 485 83Z', detail),
    face('M145 138C127 140 108 145 96 156C102 139 117 130 134 129Z', accent)
  ].join('');
  const printRules = [
    stroke('M32 30H262 M344 30H574 M33 159H573', ink, 2, 'butt'),
    stroke('M56 36H244 M362 36H550', detail, 1.5, 'butt'),
    face('M276 30 299 25 303 16 308 25 331 30 308 35 303 44 299 35Z', accent),
    face('M18 30l6-4 6 4-6 4Z M576 30l6-4 6 4-6 4Z', ink),
    face('M32 159l-6-5-6 5 6 5Z M574 159l6-5 6 5-6 5Z', detail)
  ].join('');

  return [
    variation('engraved-seal', 'Engraved Seal', 753, 153, [
      seal, signature('serif', 167, 21, 573)
    ]),
    variation('italic-swash', 'Italic Swash', 648, 165, [
      swash, signature('serif-italic', 23, 0, 606)
    ]),
    variation('folio-rule', 'Folio Rule', 607, 180, [
      printRules, signature('serif', 43, 43, 521)
    ])
  ];
}

export const classicVariations = {
  'folded-belt': foldedBelt(),
  'roller-bend': rollerBend(),
  'machine-plate': machinePlate(),
  'express': express(),
  'precision-serif': precisionSerif()
};
