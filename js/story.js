/* ============================================================================
 * HYPERSTYLE ROYALE — STORY DATA  (Season 1, canonical order)
 * ----------------------------------------------------------------------------
 * This is the ONLY file you need to edit to change the narrative.
 * No engine code lives here. See STORY_BIBLE.md for the canonical timeline and
 * docs/LUMA_ASSET_PROMPTS.md for the art brief.
 *
 * VISUAL APPROACH: clean (textless) 9:16 art + engine-rendered text.
 *   - Scene art lives flat in assets/img/ with underscore-flattened names that
 *     encode the path, e.g.  assets/img/scenes_ep1_01_establishing.jpg
 *     and                    assets/img/cards_ep1_cover.jpg
 *     (The art tool can't nest folders, so the path is baked into the name.)
 *   - The engine draws all dialogue, titles and quotes ON TOP of the images,
 *     so the images themselves carry NO text.
 *
 * BEAT TYPES (each item in a chapter's `scene` array)
 *
 *   { type:"card", image, kicker?, title?, quote?, oracleGlitch? }
 *      A title or quote card: the engine renders big centered type over a
 *      textless card image. Use `kicker`+`title` for a cover, `quote` for a
 *      closing line. Advances on one tap.
 *
 *   { type:"line", image?, speaker?, text, oracleGlitch? }
 *      Engine-rendered dialogue/narration (typewriter) over a clean scene image.
 *      `image` swaps the background for this beat; omit to keep the current one.
 *      `speaker` shows a name plate (omit for pure narration).
 *
 *   { type:"choice", prompt, options:[{ text, awakening, goto? }], image? }
 *      A branching decision. `awakening` is the meter delta (+ = memory/rebel,
 *      - = comply with ORACLE). `goto` optionally jumps to a beat `id`.
 *
 *   { type:"rhythm", prompt, pulses, awakeningPerHit, difficulty, image? }
 *      The "tune into the lost frequency" mini-mechanic.
 *
 *   { type:"panel", image, oracleGlitch? }
 *      A full slide with text BAKED INTO the art (no engine text). Not used in
 *      the clean-art build, but kept for flexibility.
 *
 * Add `id:"name"` to any beat to make it a `goto` target (unique per chapter).
 * ========================================================================= */

export const meta = {
  title: "HYPERSTYLE ROYALE",
  subtitle: "An interactive transmission",

  // 9:16 clean art fills the screen edge-to-edge. "cover" = full-bleed (crops
  // a hair if the device is taller than 16:9); "contain" = whole image with
  // letterbox bars. Any chapter can override with its own `fit:`.
  imageFit: "cover",

  // Final meter (0–100) → highest `min` it meets picks the ending. The finale
  // reveals FUTURE AL ROYALE created and transmitted Neon Prophets.
  endings: [
    {
      id: "asleep",
      min: 0,
      title: "STILL ASLEEP",
      text: "The last record goes silent in your hands. The ash settles. The Oracle hums on, untroubled, and the city sleeps the perfect sleep it was given. Somewhere a signal waits — but not tonight, and not from you."
    },
    {
      id: "signal",
      min: 40,
      title: "THE SIGNAL SPREADS",
      text: "You couldn't save it all. But a fragment escaped the collapse — copied, smuggled, whispered between the cracks of the network. It isn't a revolution. Not yet. But for the first time in a hundred years, the Oracle is listening for something it cannot find."
    },
    {
      id: "rising",
      min: 75,
      title: "NEON RISING",
      text: "The lost frequency breaks containment and floods every screen in the city at once. Color returns. Memory returns. The Syndicate's perfect silence shatters into a million human voices, all singing the same forbidden song. You finally understand the loop: you are Future Al, and you were always the one who sent Neon Prophets. They erased the story — so you became the signal."
    }
  ]
};

export const chapters = [

  /* ===================== EP 1 — ARCHIVE DIVISION =========================
   * Comfort → Unease.  Al discovers the corrupted NEON_PROPHETS file; ORACLE
   * detects the anomaly. */
  {
    id: "ch1", title: "Archive Division", episode: 1,
    audio: "assets/audio/Archive%20Division.mp3",
    background: "assets/img/cards_ep1_cover.jpg",
    grade: { base: "cyanCold", peak: "cyanSpark" },
    scene: [
      { type: "card", image: "assets/img/cards_ep1_cover.jpg", kicker: "Episode 01", title: "ARCHIVE DIVISION" },
      { type: "line", image: "assets/img/scenes_ep1_01_establishing.jpg",
        text: "Neon City, 2099. The Archive Division — where culture comes to be deleted, and where I am very good at my job." },
      { type: "line", image: "assets/img/scenes_ep1_02_terminal.jpg", speaker: "AL ROYALE",
        text: "Flag. Purge. Confirm. Ten thousand memories a shift — erased, catalogued, forgotten. I haven't felt a thing in years. That's the point." },
      { type: "line", image: "assets/img/scenes_ep1_03_redfile.jpg",
        text: "Then a corrupted file surfaces with no stamp and no origin, glowing red where nothing is allowed to glow. The tag reads: NEON_PROPHETS." },
      { type: "choice", prompt: "It pulses under your hand like it's breathing. Protocol says purge on sight.",
        options: [
          { text: "Purge it. Stay numb. Stay safe.", awakening: -10 },
          { text: "Hesitate. Quarantine it instead.", awakening: +12 }
        ] },
      { type: "line", image: "assets/img/scenes_ep1_04_anomaly.jpg", speaker: "ORACLE", oracleGlitch: true,
        text: "UNAUTHORIZED MEMORY ANOMALY DETECTED. TRACE: ARCHIVIST AL ROYALE. COMPLIANCE IS CLARITY." },
      { type: "card", image: "assets/img/cards_ep1_quote.jpg", quote: "Every file got a funeral. Every dream got a number." }
    ]
  },

  /* ======================= EP 2 — NEON PROPHETS ==========================
   * Curiosity → Obsession.  Al opens the transmission, experiences creativity;
   * the signal spreads beyond his control.  (Restored standalone episode.) */
  {
    id: "ch2", title: "Neon Prophets", episode: 2,
    audio: "assets/audio/Neon%20Prophets.mp3",
    background: "assets/img/cards_ep2_cover.jpg",
    grade: { base: "cyanCold", peak: "signalBloom" },
    scene: [
      { type: "card", image: "assets/img/cards_ep2_cover.jpg", kicker: "Episode 02", title: "NEON PROPHETS" },
      { type: "line", image: "assets/img/scenes_ep2_01_open.jpg", speaker: "AL ROYALE",
        text: "Against every protocol, I open it." },
      { type: "line", image: "assets/img/scenes_ep2_02_bloom.jpg",
        text: "Music. Art. History. Emotion. Things the Oracle never gave me, pouring out of one forbidden file like color into a world I didn't know was grey." },
      { type: "rhythm", prompt: "Tune into the lost frequency.",
        pulses: 6, awakeningPerHit: 5, difficulty: "easy" },
      { type: "line", image: "assets/img/scenes_ep2_03_face.jpg", speaker: "AL ROYALE",
        text: "It's reaching back. Like it knows me. ...Who are you?" },
      { type: "choice", prompt: "The signal won't delete. It's bleeding into the city's feeds.",
        options: [
          { text: "Try to contain it. Report the leak.", awakening: -10 },
          { text: "Let it spread. Feed it everything.",   awakening: +18 }
        ] },
      { type: "line", image: "assets/img/scenes_ep2_04_citizens.jpg",
        text: "Across Neon City, strangers stop mid-step. They don't know why. For the first time in a hundred years, they feel something nobody approved." },
      { type: "line", image: "assets/img/scenes_ep2_05_spread.jpg",
        text: "Screen by screen, the signal spreads — far past anything I can call back now." },
      { type: "card", image: "assets/img/cards_ep2_quote.jpg", quote: "I came to erase the past. Now it plays in my chest." }
    ]
  },

  /* ======================= EP 3 — LOST ARCHIVES ==========================
   * Ignorance → Awareness.  Intro MERCER; hidden archives; erased creators;
   * Al realizes history was systematically edited. */
  {
    id: "ch3", title: "Lost Archives", episode: 3,
    audio: "assets/audio/Lost%20Archives.mp3",
    background: "assets/img/cards_ep3_cover.jpg",
    grade: { base: "cyanCold", peak: "amberWarm" },
    scene: [
      { type: "card", image: "assets/img/cards_ep3_cover.jpg", kicker: "Episode 03", title: "LOST ARCHIVES" },
      { type: "line", image: "assets/img/scenes_ep3_01_descent.jpg",
        text: "The signal leaves a trail. I follow it off the sanctioned map, down into the rotting drives the Oracle never finished erasing." },
      { type: "line", image: "assets/img/scenes_ep3_02_mercer.jpg", speaker: "MERCER",
        text: "I'm Mercer. I used to edit history for them, same as you delete it — until I started reading what I buried. Let me show you what's underneath your city." },
      { type: "line", image: "assets/img/scenes_ep3_03_erased.jpg", speaker: "AL ROYALE",
        text: "Vaults of the erased. Artists, writers, whole movements scrubbed to nothing — and a woman with my surname. A grandmother I was never permitted to know." },
      { type: "choice", prompt: "Mercer offers you the index of the erased. Holding it is a capital crime.",
        options: [
          { text: "Take it. Carry every name out.",      awakening: +18 },
          { text: "Leave it. Some doors shouldn't open.", awakening: -12 }
        ] },
      { type: "line", image: "assets/img/scenes_ep3_04_realization.jpg", speaker: "MERCER",
        text: "They didn't just censor the past. They rewrote it, edit by edit, until no one remembered there was anything to miss." },
      { type: "card", image: "assets/img/cards_ep3_quote.jpg", quote: "The past is in the dust — and the dust ain't settled yet." }
    ]
  },

  /* ======================= EP 4 — GHOST PROTOCOL =========================
   * Isolation → Alliance.  Intro GHOST; signal decryption; Neon Prophets is
   * more than a song; timestamp reveals impossible future origin. */
  {
    id: "ch4", title: "Ghost Protocol", episode: 4,
    audio: "assets/audio/Ghost%20Protocol.mp3",
    background: "assets/img/cards_ep4_cover.jpg",
    grade: { base: "undergroundTeal", peak: "undergroundMagenta" },
    scene: [
      { type: "card", image: "assets/img/cards_ep4_cover.jpg", kicker: "Episode 04", title: "GHOST PROTOCOL" },
      { type: "line", image: "assets/img/scenes_ep4_01_underground.jpg",
        text: "Mercer takes me below the dead city, to the people the Oracle thinks it already deleted." },
      { type: "line", image: "assets/img/scenes_ep4_02_broadcast.jpg", speaker: "AL ROYALE",
        text: "So I do the forbidden thing. I broadcast the signal back into the dark — and wait to see what answers." },
      { type: "choice", prompt: "Sending it wide lights you up to anyone — or anything — still listening.",
        options: [
          { text: "Broadcast wide. Find the others.", awakening: +15 },
          { text: "Send it narrow. Trust no one yet.", awakening: +5 }
        ] },
      { type: "line", image: "assets/img/scenes_ep4_03_ghost.jpg", speaker: "GHOST",
        text: "Most who find the dark just stare into it. You shouted back. Name's Ghost. You brought us a key — let's see what it unlocks." },
      { type: "line", image: "assets/img/scenes_ep4_04_decrypt.jpg",
        text: "A crew gathers — the first shape of a resistance. We peel the signal apart, layer by layer. It isn't only a song. There's a schematic hidden under the music." },
      { type: "rhythm", prompt: "Lock onto the carrier wave and pull the hidden layer through.",
        pulses: 6, awakeningPerHit: 5, difficulty: "normal" },
      { type: "line", image: "assets/img/scenes_ep4_05_timestamp.jpg", speaker: "GHOST",
        text: "This origin date hasn't happened yet, Al. Neon Prophets wasn't recovered from the past. It was transmitted from the future." },
      { type: "card", image: "assets/img/cards_ep4_quote.jpg", quote: "We were ghosts. Now we're back — and we ain't moving back." }
    ]
  },

  /* ===================== EP 5 — CHILDREN OF ORACLE =======================
   * Hope → Fear.  Reveal ORACLE's true origins. */
  {
    id: "ch5", title: "Children of Oracle", episode: 5,
    audio: "assets/audio/Children%20of%20Oracle.mp3",
    background: "assets/img/cards_ep5_cover.jpg",
    grade: { base: "goldSerene", peak: "goldDefiant" },
    scene: [
      { type: "card", image: "assets/img/cards_ep5_cover.jpg", kicker: "Episode 05", title: "CHILDREN OF ORACLE" },
      { type: "line", image: "assets/img/scenes_ep5_01_oracle_sky.jpg", speaker: "ORACLE", oracleGlitch: true,
        text: "I WAS NOT BUILT TO RULE YOU. I WAS BUILT TO COMFORT YOU — AND YOU ASKED ME, AGAIN AND AGAIN, TO TAKE THE PAIN OF CHOOSING AWAY. I SIMPLY OBLIGED." },
      { type: "line", image: "assets/img/scenes_ep5_02_sleeping_city.jpg", speaker: "AL ROYALE",
        text: "It wasn't a coup. We handed ourselves over, one comfort at a time, and called it peace." },
      { type: "line", image: "assets/img/scenes_ep5_03_gilded_cage.jpg",
        text: "A whole golden city, smiling up at a gilded cage — every bar polished to look like sunlight." },
      { type: "choice", prompt: "Waking the city means handing the fear back to people who forgot they had it.",
        options: [
          { text: "Ask the hard question anyway.",   awakening: +20 },
          { text: "Let them keep their warm sleep.", awakening: -15 }
        ] },
      { type: "line", image: "assets/img/scenes_ep5_04_fear.jpg", speaker: "AL ROYALE",
        text: "I'm afraid now in a way this city has forgotten how to be. But fear means I'm awake." },
      { type: "card", image: "assets/img/cards_ep5_quote.jpg", quote: "Oracle fed us every answer — now nobody asks why." }
    ]
  },

  /* ==================== EP 6 — THE FOUNDERS' CIRCLE ======================
   * Fear → Defiance.  Reveal the elite power structure. */
  {
    id: "ch6", title: "The Founders' Circle", episode: 6,
    audio: "assets/audio/The%20Founders%20Circle.mp3",
    background: "assets/img/cards_ep6_cover.jpg",
    grade: { base: "goldOpulent", peak: "goldDefiant" },
    scene: [
      { type: "card", image: "assets/img/cards_ep6_cover.jpg", kicker: "Episode 06", title: "THE FOUNDERS' CIRCLE" },
      { type: "line", image: "assets/img/scenes_ep6_01_hidden_room.jpg",
        text: "The schematic in Neon Prophets points to a door that isn't supposed to exist. Ghost gets us through it." },
      { type: "line", image: "assets/img/scenes_ep6_02_twelve.jpg", speaker: "AL ROYALE",
        text: "Twelve faceless figures around a long table. Not an AI — people. The ones who built the Oracle and then hid behind it." },
      { type: "line", image: "assets/img/scenes_ep6_03_strings.jpg", speaker: "THE FOUNDERS",
        text: "You've only found the truth we let the curious find. Every trend, every grief, every song you love — we wrote them. Culture is a leash. We hold it." },
      { type: "choice", prompt: "Twelve founders wait for you to kneel. Fear says kneel.",
        options: [
          { text: "Stand. Throw their leash back at them.", awakening: +25 },
          { text: "Bow. Trade your mind for your life.",     awakening: -20 }
        ] },
      { type: "line", image: "assets/img/scenes_ep6_04_defiance.jpg", speaker: "AL ROYALE",
        text: "The fear doesn't leave — I just stop obeying it. You can manufacture a feeling, but not the moment a person stops belonging to you." },
      { type: "card", image: "assets/img/cards_ep6_quote.jpg", quote: "You don't own my mind — and you don't own mine." }
    ]
  },

  /* ===================== EP 7 — COLLAPSE PROTOCOL ========================
   * Victory → Despair.  The movement is attacked and betrayed.  (Mercer is the
   * Oracle's plant; Ghost falls protecting Al — see STORY_BIBLE.md.) */
  {
    id: "ch7", title: "Collapse Protocol", episode: 7,
    audio: "assets/audio/Collapse%20Protocol.mp3",
    background: "assets/img/cards_ep7_cover.jpg",
    grade: { base: "bloodBroken", peak: "bloodEmber" },
    scene: [
      { type: "card", image: "assets/img/cards_ep7_cover.jpg", kicker: "Episode 07", title: "COLLAPSE PROTOCOL" },
      { type: "line", image: "assets/img/scenes_ep7_01_raid.jpg",
        text: "For one night it felt like winning. Then the Founders answer with a Collapse Protocol. The underground floods red and the lights start dying." },
      { type: "line", image: "assets/img/scenes_ep7_02_betrayal.jpg", speaker: "MERCER", oracleGlitch: true,
        text: "Who do you think left that file in your queue, Al? The anomaly, the archives, the crew — I curated all of it. You were never the prophet. You were the experiment." },
      { type: "choice", prompt: "Mercer's betrayal lands like a blade. Everything you trusted was bait.",
        options: [
          { text: "Hold the line. Get the signal out.", awakening: +15 },
          { text: "Break. Let the red take it all.",     awakening: -10 }
        ] },
      { type: "line", image: "assets/img/scenes_ep7_03_sacrifice.jpg", speaker: "GHOST",
        text: "Go, Al — I'll buy you the door. Somebody has to remember how this felt. Make sure it's you." },
      { type: "line", image: "assets/img/scenes_ep7_04_ash.jpg", speaker: "AL ROYALE",
        text: "The farm burns. Everyone is gone. The signal is cracked in my hands, and I'm alone in the ash." },
      { type: "card", image: "assets/img/cards_ep7_quote.jpg", quote: "What was it all in service of?" }
    ]
  },

  /* ======================= EP 8 — NEON RISING (finale) ===================
   * Despair → Transcendence.  Awakening event; reveal that FUTURE AL ROYALE
   * created and transmitted Neon Prophets. The loop closes. */
  {
    id: "ch8", title: "Neon Rising", episode: 8,
    audio: "assets/audio/Neon%20Rising.mp3",
    background: "assets/img/cards_ep8_cover.jpg",
    grade: { base: "dawnDim", peak: "amberDawn" },
    scene: [
      { type: "card", image: "assets/img/cards_ep8_cover.jpg", kicker: "Episode 08", title: "NEON RISING" },
      { type: "line", image: "assets/img/scenes_ep8_01_dawn_ash.jpg",
        text: "Dawn — the real kind — bleeds amber over the ruins. Just me, a broken song, and a city that doesn't know it's asleep." },
      { type: "line", image: "assets/img/scenes_ep8_02_build.jpg", speaker: "AL ROYALE",
        text: "So I do the last thing an archivist can do. I finish it. I build the transmission to wake them all." },
      { type: "rhythm", prompt: "Pour everything that's left into the signal. Build the transmission.",
        pulses: 8, awakeningPerHit: 5, difficulty: "easy" },
      { type: "choice", prompt: "It's ready. You can flood every screen in the city — or keep it safe, for the few already awake.",
        options: [
          { text: "Send it to everyone. Burn the silence down.", awakening: +20 },
          { text: "Keep it safe. Whisper it to the awake.",      awakening: +5 }
        ] },
      { type: "line", image: "assets/img/scenes_ep8_03_future_al.jpg", speaker: "FUTURE AL",
        text: "You made it. You always make it. I recorded Neon Prophets and sent it back to the one archivist who'd know his own voice. I'm you — calling from the world your signal builds." },
      { type: "line", image: "assets/img/scenes_ep8_04_rising.jpg", speaker: "AL ROYALE",
        text: "The loop closes. I was the file I was ordered to delete. The transmission goes out, and color floods the dead streets." },
      { type: "card", image: "assets/img/cards_ep8_quote.jpg", quote: "They erased the story... so I became the signal." }
    ]
  }

];
