// NOTE: YouTube video ids below should be verified before shipping.
// Some are well-known live streams; ids may change when streams restart.

export interface LofiPreset {
  id: string;
  label: string;
  youtubeId: string;
}

export const LOFI_PRESETS: LofiPreset[] = [
  {
    id: "lofi-girl",
    label: "Lofi Girl – beats to relax/study",
    // https://www.youtube.com/watch?v=jfKfPfyJRdk — verify id
    youtubeId: "jfKfPfyJRdk",
  },
  {
    id: "chillhop",
    label: "Chillhop Music – jazzy beats",
    // https://www.youtube.com/watch?v=7NOSDKb0HlU — verify id
    youtubeId: "7NOSDKb0HlU",
  },
  {
    id: "the-bootleg-boy",
    label: "The Bootleg Boy – lofi hip hop",
    // https://www.youtube.com/watch?v=Na0w3Mz46GA — verify id
    youtubeId: "Na0w3Mz46GA",
  },
  {
    id: "coffee-shop",
    label: "Coffee Shop Ambience – focus sounds",
    // https://www.youtube.com/watch?v=h2zkV-l_TbY — verify id
    youtubeId: "h2zkV-l_TbY",
  },
  {
    id: "lo-fi-beats",
    label: "Lofi Beats – chill study music",
    // https://www.youtube.com/watch?v=lTRiuFIWV54 — verify id
    youtubeId: "lTRiuFIWV54",
  },
];
