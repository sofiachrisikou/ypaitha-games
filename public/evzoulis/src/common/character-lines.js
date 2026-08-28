import { ASSET_KEYS } from './assets.js';

// All bear voice lines, grouped by level then by moment ("intro" today,
// gameplay moments to follow as they're added). Each line is
// { text, audioKey, durationMs } — how long it stays on screen before the
// next line (or teardown) happens.
// >>> TYPE/EDIT THE GREEK TEXT BELOW. <<<
export const CHARACTER_LINES = {
  1: {
    intro: [
      { text: 'ΣΤΑΔΙΟ 1 — Η ανάσα μου', audioKey: ASSET_KEYS.LVL1_VO_01, durationMs: 4000 },
    ],
  },
  2: {
    intro: [
      { text: 'ΣΤΑΔΙΟ 2 — Οι δύσκολες σκέψεις', audioKey: ASSET_KEYS.LVL2_VO_01, durationMs: 4000 },
      { text: 'Άγγιξε τα γκρίζα συννεφάκια με τις δύσκολες σκέψεις.', audioKey: ASSET_KEYS.LVL2_VO_02, durationMs: 4000 },
    ],
    // Random encouragement on a bubble pop (game-scene2.js #popBubble) — no
    // durationMs here, the guide character shows each line for a fixed
    // GUIDE_SPEAK_DURATION_MS (level-flow.js) instead of a per-line one.
    // Text is a short caption, not the full sentence the clip says.
    // >>> TYPE/EDIT THE GREEK TEXT BELOW. <<<
    goodMove: [
      { text: 'TODO: Μπράβο 1', audioKey: ASSET_KEYS.LVL2_VO_03 },
      { text: 'TODO: Μπράβο 2', audioKey: ASSET_KEYS.LVL2_VO_04 },
      { text: 'TODO: Μπράβο 3', audioKey: ASSET_KEYS.LVL2_VO_05 },
    ],
  },
  3: {
    intro: [
      { text: 'ΣΤΑΔΙΟ 3 — Τεντώνομαι', audioKey: ASSET_KEYS.LVL3_VO_01, durationMs: 4000 },
      { text: 'Άγγιξε τους κύκλους και τέντωσε μαζί μου!', audioKey: ASSET_KEYS.LVL3_VO_02, durationMs: 4000 },
    ],
  },
};
