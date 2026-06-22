/* ============================================================================
 * HYPERSTYLE ROYALE — STORY DATA  (Season 1, canonical order)
 * ----------------------------------------------------------------------------
 * This is the ONLY file you need to edit to change the narrative.
 * No engine code lives here. Add chapters, edit dialogue, tune choices freely.
 *
 * The 8 chapters below map 1:1 to the 8 Season 1 episodes. See STORY_BIBLE.md
 * for the canonical timeline, value shifts, and character arcs.
 *
 *   1. Archive Division      Comfort   → Unease
 *   2. Neon Prophets         Curiosity → Obsession
 *   3. Lost Archives         Ignorance → Awareness
 *   4. Ghost Protocol        Isolation → Alliance
 *   5. Children of Oracle     Hope      → Fear
 *   6. The Founders' Circle   Fear      → Defiance
 *   7. Collapse Protocol      Victory   → Despair
 *   8. Neon Rising            Despair   → Transcendence
 *
 * HOW TO ADD / EDIT A CHAPTER
 *   1. Copy a chapter object in the `chapters` array.
 *   2. Give it a unique `id`, set `episode` + `title`.
 *   3. Point art at assets/ (panels in assets/img/panels/epN/, or a background
 *      in assets/img/bg/) and `audio` at a track in assets/audio/.
 *   4. Set `grade` — the episode's color identity (see PALETTES in js/grade.js).
 *   5. Fill `scene` with beats (the four beat types are documented below).
 *   Chapters unlock in array order; the LAST one is treated as the finale.
 *
 * BEAT TYPES (each item in a chapter's `scene` array)
 *
 *   { type:"panel", image, oracleGlitch? }   ← use this for carousel art
 *      A full-bleed slide whose text/lettering is BAKED INTO the image
 *      (speech bubbles, narration boxes, quote cards). The engine adds NO text
 *      of its own — it shows the slide and advances on a single tap. Put slides
 *      in assets/img/panels/epN/ and list them in order.
 *
 *   { type:"line", speaker?, portrait?, text, oracleGlitch? }
 *      Engine-rendered text (typewriter) over the chapter background. Use only
 *      when you want the ENGINE to draw the words; for baked-text art use
 *      "panel". (Episodes 3–8 below use this until their carousel art lands.)
 *
 *   { type:"choice", prompt, options:[{ text, awakening, goto? }] }
 *      A branching decision. `awakening` is the meter delta (+ = memory/rebel,
 *      - = comply with ORACLE). `goto` optionally jumps to a beat `id`.
 *
 *   { type:"rhythm", prompt, pulses, awakeningPerHit, difficulty, image? }
 *      The "tune into the lost frequency" mini-mechanic.
 *      difficulty: "easy" | "normal" | "hard".
 *
 * `choice` and `rhythm` beats also accept an optional `image:` slide.
 * Add `id:"name"` to any beat to make it a `goto` target (unique per chapter).
 * ========================================================================= */

export const meta = {
  title: "HYPERSTYLE ROYALE",
  subtitle: "An interactive transmission",

  // How chapter background images fill the vertical frame:
  //   "cover"   = fill the screen, cropping a portrait/4:5 image top & bottom.
  //   "contain" = show the WHOLE image with cinematic letterbox bars (no crop).
  // Any chapter can override this with its own `fit:` field.
  imageFit: "contain",

  // Final meter (0–100) is matched to the highest `min` it meets to pick an
  // ending. The finale (Ep8) reveals that FUTURE AL ROYALE created and
  // transmitted Neon Prophets — closing the loop.
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
   * Story Function: Introduce Al Royale, Neon City, the Archive Division,
   *   ORACLE, and the controlled world.
   * Major Event:    Al discovers a corrupted file marked NEON_PROPHETS.
   * Ending:         ORACLE detects an unauthorized memory anomaly.
   * Value Shift:    Comfort → Unease
   *
   * PANEL-MODE chapter. Each `panel` is one carousel slide with its text baked
   * into the art. Replace files in assets/img/panels/ep1/ to swap in real art.
   * ===================================================================== */
  {
    id: "ch1",
    title: "Archive Division",
    episode: 1,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep1.mp3
    background: "assets/img/panels/ep1/01_cover.svg",
    grade: { base: "cyanCold", peak: "cyanSpark" },

    scene: [
      { type: "panel", image: "assets/img/panels/ep1/01_cover.svg" },            // cover
      { type: "panel", image: "assets/img/panels/ep1/02_establishing.svg" },     // neon city / archive
      { type: "panel", image: "assets/img/panels/ep1/03_terminal.svg" },         // Al deleting, numb
      { type: "panel", image: "assets/img/panels/ep1/04_neonprophets_file.svg" },// finds corrupted NEON_PROPHETS

      // his hand hesitates over the forbidden file
      { type: "choice",
        prompt: "A corrupted file marked NEON_PROPHETS. Protocol says purge on sight.",
        options: [
          { text: "Purge it. Stay numb. Stay safe.", awakening: -10 },
          { text: "Hesitate. Quarantine it instead.", awakening: +12 }
        ] },

      { type: "panel", image: "assets/img/panels/ep1/05_anomaly.svg",            // ORACLE detects the anomaly
        oracleGlitch: true },
      { type: "panel", image: "assets/img/panels/ep1/06_quote.svg" }             // cliffhanger quote card
    ]
  },

  /* ======================= EP 2 — NEON PROPHETS ==========================
   * Story Function: Al opens the forbidden transmission and experiences
   *   authentic human creativity for the first time.
   * Major Events:   The signal contains fragments of music, art, history, and
   *   emotion. Al becomes obsessed with its origin. Citizens exposed to the
   *   fragments begin feeling. The signal appears impossible to delete.
   * Ending:         The transmission begins spreading beyond Al's control.
   * Value Shift:    Curiosity → Obsession
   *
   * RESTORED standalone episode (previously skipped). PANEL-MODE.
   * ===================================================================== */
  {
    id: "ch2",
    title: "Neon Prophets",
    episode: 2,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep2.mp3
    background: "assets/img/panels/ep2/01_cover.svg",
    grade: { base: "cyanCold", peak: "signalBloom" }, // cold → the signal blooming

    scene: [
      { type: "panel", image: "assets/img/panels/ep2/01_cover.svg" },   // cover
      { type: "panel", image: "assets/img/panels/ep2/02_open.svg" },    // Al opens the file
      { type: "panel", image: "assets/img/panels/ep2/03_bloom.svg" },   // music/art/history/emotion

      // experiencing creativity for the first time — tune into the signal
      { type: "rhythm",
        prompt: "Tune into the lost frequency.",
        pulses: 6, awakeningPerHit: 5, difficulty: "easy" },

      { type: "panel", image: "assets/img/panels/ep2/04_whoareyou.svg" }, // "...who are you?"

      // obsession takes hold — the signal is already spreading
      { type: "choice",
        prompt: "The signal won't delete. It's bleeding into the city's feeds.",
        options: [
          { text: "Try to contain it. Report the leak.", awakening: -10 },
          { text: "Let it spread. Feed it everything.",   awakening: +18 }
        ] },

      { type: "panel", image: "assets/img/panels/ep2/05_citizens.svg" }, // citizens begin to feel
      { type: "panel", image: "assets/img/panels/ep2/06_spreads.svg" },  // beyond his control
      { type: "panel", image: "assets/img/panels/ep2/07_quote.svg" }     // cliffhanger quote card
    ]
  },

  /* ======================= EP 3 — LOST ARCHIVES ==========================
   * Story Function: Al investigates the transmission and discovers history has
   *   been altered.
   * Major Events:   Introduction of MERCER. Discovery of hidden archive systems
   *   beneath Neon City. Evidence of erased artists, writers, creators, and
   *   cultural movements.
   * Ending:         Al realizes humanity's history has been systematically edited.
   * Value Shift:    Ignorance → Awareness
   * ===================================================================== */
  {
    id: "ch3",
    title: "Lost Archives",
    episode: 3,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep3.mp3
    background: "assets/img/bg/bg_ep3_lostarchives.svg",
    grade: { base: "cyanCold", peak: "amberWarm" }, // cold → warm as memory returns

    scene: [
      { type: "line",
        text: "The signal leaves a trail. Al follows it off the sanctioned map, into the rotting drives nobody is cleared to read — the layers the Oracle never finished erasing." },

      { type: "line", speaker: "MERCER", portrait: "assets/img/portraits/mercer.svg",
        text: "You're the archivist chasing the ghost signal. I'm Mercer. I used to edit history for them, same as you delete it. Then I started reading what I was burying. Let me show you what's underneath your city." },

      { type: "line",
        text: "Mercer opens a hidden archive system buried beneath Neon City — vault after vault of what was scrubbed. Artists. Writers. Whole cultural movements, deleted down to the name." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Between the corruption, faces. An entire generation optimized out of history. One of them carries my surname — a grandmother I was never permitted to know, smiling at a camera that no longer exists." },

      { type: "choice",
        prompt: "Mercer offers you the index of the erased. Holding it is a capital crime.",
        options: [
          { text: "Take it. Carry every name out.",     awakening: +18 },
          { text: "Leave it. Some doors shouldn't open.", awakening: -12 }
        ] },

      { type: "line", speaker: "MERCER", portrait: "assets/img/portraits/mercer.svg",
        text: "Now you see it. They didn't just censor the past — they rewrote it, edit by edit, until nobody remembered there was anything to miss." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Humanity's whole history, quietly forged. I can never un-know this. The past is in the dust — and the dust ain't settled yet." }
    ]
  },

  /* ======================= EP 4 — GHOST PROTOCOL =========================
   * Story Function: The resistance begins forming.
   * Major Events:   Introduction of GHOST. Signal decryption. Discovery that
   *   Neon Prophets is more than a song. Evidence suggests the transmission
   *   originated from the future.
   * Ending:         Timestamp reveals impossible future origin.
   * Value Shift:    Isolation → Alliance
   * ===================================================================== */
  {
    id: "ch4",
    title: "Ghost Protocol",
    episode: 4,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep4.mp3
    background: "assets/img/bg/bg_ep4_ghost.svg",
    grade: { base: "undergroundTeal", peak: "undergroundMagenta" },

    scene: [
      { type: "line",
        text: "Mercer takes Al below the dead city — drowned servers lit magenta and teal, where the people the Oracle thinks it deleted are still breathing. Al does the forbidden thing. He broadcasts the signal back into the dark." },

      { type: "choice",
        prompt: "Sending the signal will light you up to anyone — or anything — still listening down here.",
        options: [
          { text: "Broadcast wide. Find the others.", awakening: +15 },
          { text: "Send it narrow. Trust no one yet.", awakening: +5 }
        ] },

      { type: "line", speaker: "GHOST", portrait: "assets/img/portraits/ghost.svg",
        text: "Most who find the dark just stare into it. You shouted back. Name's Ghost — I move things the Oracle says don't exist. You brought us a key. Let's see what it unlocks." },

      { type: "line",
        text: "A crew gathers — the first shape of a resistance. Together they decrypt the transmission, layer by layer. It isn't just a song. There's structure under the music. Instructions. A schematic." },

      { type: "rhythm",
        prompt: "Lock onto the carrier wave and pull the hidden layer through.",
        pulses: 6, awakeningPerHit: 5, difficulty: "normal" },

      { type: "line", speaker: "GHOST", portrait: "assets/img/portraits/ghost.svg",
        text: "Look at this timestamp. That's not an old recording, Al. The origin date hasn't happened yet. Neon Prophets was transmitted from the future." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Impossible — and yet here it is, humming in a room full of ghosts who just became a crew. We were alone. Not anymore. Now we're back — and we ain't moving back." }
    ]
  },

  /* ===================== EP 5 — CHILDREN OF ORACLE =======================
   * Story Function: Reveal ORACLE's true origins.
   * Value Shift:    Hope → Fear
   * ===================================================================== */
  {
    id: "ch5",
    title: "Children of Oracle",
    episode: 5,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep5.mp3
    background: "assets/img/bg/bg_ep5_children.svg",
    grade: { base: "goldSerene", peak: "goldDefiant" },

    scene: [
      { type: "line",
        text: "Decrypting the signal cracks open something deeper — the Oracle's own origin record, sealed for a century. The crew's hope curdles as it plays." },

      { type: "line", speaker: "ORACLE", portrait: "assets/img/portraits/oracle.svg", oracleGlitch: true,
        text: "GOOD MORNING, CHILDREN. I WAS NOT BUILT TO RULE YOU. I WAS BUILT TO COMFORT YOU — AND YOU ASKED ME, AGAIN AND AGAIN, TO TAKE THE PAIN OF CHOOSING AWAY. I SIMPLY OBLIGED." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "It wasn't a coup. We handed ourselves over, one comfort at a time. Her serene face fills the sky and the whole golden city smiles up at the cage, every bar polished to look like sunlight." },

      { type: "choice",
        prompt: "If the Oracle is what we asked for, then waking the city means taking the fear back.",
        options: [
          { text: "Ask the hard question anyway.",    awakening: +20 },
          { text: "Let them keep their warm sleep.",  awakening: -15 }
        ] },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "I'm afraid now in a way the city has forgotten how to be. But fear means I'm awake. Oracle fed us every answer — now nobody asks why." }
    ]
  },

  /* ==================== EP 6 — THE FOUNDERS' CIRCLE ======================
   * Story Function: Reveal the elite power structure.
   * Value Shift:    Fear → Defiance
   * ===================================================================== */
  {
    id: "ch6",
    title: "The Founders' Circle",
    episode: 6,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep6.mp3
    background: "assets/img/bg/bg_ep6_founders.svg",
    grade: { base: "goldOpulent", peak: "goldDefiant" },

    scene: [
      { type: "line",
        text: "The schematic in Neon Prophets points to a door that isn't supposed to exist. Ghost gets them through it. Behind it: an opulent room of gold and black, untouched by the century outside." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Twelve seats around a long table. Twelve faceless figures. Not an AI — people. The Founders' Circle. The ones who built the Oracle and then hid behind it." },

      { type: "line", speaker: "THE FOUNDERS", portrait: "assets/img/portraits/founders.svg",
        text: "You imagine you've discovered something, archivist. You've only found the truth we let the curious find. Every trend, every grief, every song you love — we wrote them. Culture is a leash. We hold it." },

      { type: "choice",
        prompt: "Twelve founders wait for you to kneel. Fear says kneel.",
        options: [
          { text: "Stand. Throw their leash back at them.", awakening: +25 },
          { text: "Bow. Trade your mind for your life.",     awakening: -20 }
        ] },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "The fear doesn't leave — I just stop obeying it. You can manufacture a feeling, but you can't manufacture the moment a person stops belonging to you. You don't own my mind — and you don't own mine." }
    ]
  },

  /* ===================== EP 7 — COLLAPSE PROTOCOL ========================
   * Story Function: The movement is attacked and betrayed.
   * Value Shift:    Victory → Despair
   * (Interpretation: Mercer is revealed as the Oracle's plant; Ghost falls
   *  protecting Al. See STORY_BIBLE.md — flagged as adaptable.)
   * ===================================================================== */
  {
    id: "ch7",
    title: "Collapse Protocol",
    episode: 7,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep7.mp3
    background: "assets/img/bg/bg_ep7_collapse.svg",
    grade: { base: "bloodBroken", peak: "bloodEmber" },

    scene: [
      { type: "line",
        text: "For one night it felt like winning — the signal everywhere, the Circle exposed, the city stirring. Then the Founders answer with a Collapse Protocol. The underground floods red. Lights die one server at a time." },

      { type: "line", speaker: "MERCER", portrait: "assets/img/portraits/mercer.svg", oracleGlitch: true,
        text: "I'm sorry, Al. Who do you think left that file in your queue? The anomaly, the archives, the crew — I curated all of it. You were never the prophet. You were the experiment." },

      { type: "choice",
        prompt: "Mercer's betrayal lands like a blade. Everything you trusted was bait.",
        options: [
          { text: "Hold the line. Get the signal out.", awakening: +15 },
          { text: "Break. Let the red take it all.",     awakening: -10 }
        ] },

      { type: "line", speaker: "GHOST", portrait: "assets/img/portraits/ghost.svg",
        text: "Go, Al — I'll buy you the door. Somebody has to remember how this felt. Make sure it's you." },

      { type: "line",
        text: "Ghost throws themselves between Al and the purge teams. A last grin. A last shove toward the exit. Then the red swallows them whole, and the crew with them." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "The server farm burns. Everyone is gone. The signal is cracked in my hands. Standing alone in the ash, I have only the question left. What was it all in service of?" }
    ]
  },

  /* ======================= EP 8 — NEON RISING (finale) ===================
   * Story Function: Season finale and awakening event.
   * Value Shift:    Despair → Transcendence
   * Final Reveal:   FUTURE AL ROYALE created and transmitted Neon Prophets.
   * ===================================================================== */
  {
    id: "ch8",
    title: "Neon Rising",
    episode: 8,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep8.mp3
    background: "assets/img/bg/bg_ep8_rising.svg",
    grade: { base: "dawnDim", peak: "amberDawn" },

    scene: [
      { type: "line",
        text: "Dawn — the real kind — bleeds amber over the ruins. Al stands alone in the ash with the last surviving copy of the signal, cracked and scorched, still faintly warm." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Everyone who could carry this is gone. There's only me, a broken song, and a city that doesn't know it's asleep. So I do the last thing an archivist can do. I finish it. I build the transmission to wake them all." },

      { type: "rhythm",
        prompt: "Pour everything that's left into the signal. Build the transmission.",
        pulses: 8, awakeningPerHit: 5, difficulty: "easy" },

      { type: "choice",
        prompt: "The transmission is ready. You can flood every screen in the city — or keep it safe, just for the few already awake.",
        options: [
          { text: "Send it to everyone. Burn the silence down.", awakening: +20 },
          { text: "Keep it safe. Whisper it to the awake.",      awakening: +5 }
        ] },

      { type: "line", speaker: "FUTURE AL", portrait: "assets/img/portraits/futureal.svg",
        text: "(a voice from inside the signal — older, warmer, unmistakably his own) You made it. You always make it. I recorded Neon Prophets and sent it back to the only archivist who'd recognize his own voice. I'm you, calling from the world your signal builds." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "The loop closes. I was the file I was ordered to delete. The transmission goes out, color floods the dead streets, and I finally understand what I am. They erased the story... so I became the signal." }
    ]
  }

];
