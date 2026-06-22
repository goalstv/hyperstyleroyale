/* ============================================================================
 * NEON PROPHETS — STORY DATA
 * ----------------------------------------------------------------------------
 * This is the ONLY file you need to edit to change the narrative.
 * No engine code lives here. Add chapters, edit dialogue, tune choices freely.
 *
 * The 7 chapters below map to the 8 story episodes (Ep 3 & 4 share one chapter,
 * "Ghost Protocol"). Each chapter ends on its episode's closing line.
 *
 * HOW TO ADD / EDIT A CHAPTER
 *   1. Copy a chapter object in the `chapters` array.
 *   2. Give it a unique `id`, set `episode` + `title`.
 *   3. Point `background` at an image in assets/img/bg/ and `audio` at a track
 *      in assets/audio/ (use silence.wav until your real song is ready).
 *   4. Set `grade` — the episode's color identity (see PALETTES in js/grade.js
 *      for the available names; { base, peak } are the meter's cold→warm ends).
 *   5. Fill `scene` with beats (the three beat types are documented below).
 *   Chapters unlock in array order; the LAST one is treated as the finale.
 *
 * HOW TO SWAP IN REAL ART / MUSIC
 *   Drop your file into assets/ and change the matching filename string below.
 *   Nothing in js/ changes.
 *
 * BEAT TYPES (each item in a chapter's `scene` array)
 *
 *   { type:"line", speaker?, portrait?, text, oracleGlitch? }
 *      One tap-to-advance unit of story (typewriter reveal).
 *      speaker:      name shown above the text. Omit for pure narration.
 *      portrait:     path to a character portrait image. Optional.
 *      oracleGlitch: true triggers a glitch transition when ORACLE intrudes.
 *
 *   { type:"choice", prompt, options:[{ text, awakening, goto? }] }
 *      A branching decision. `awakening` is the meter delta (+ = memory/rebel,
 *      - = comply with ORACLE). `goto` optionally jumps to a beat `id`.
 *
 *   { type:"rhythm", prompt, pulses, awakeningPerHit, difficulty }
 *      The "tune into the lost frequency" mini-mechanic. difficulty is
 *      "easy" | "normal" | "hard".
 *
 * Add `id:"name"` to any beat to make it a `goto` target (unique per chapter).
 * ========================================================================= */

export const meta = {
  title: "NEON PROPHETS",
  subtitle: "An interactive transmission",

  // How chapter background images fill the vertical frame:
  //   "cover"   = fill the screen, cropping a portrait/4:5 image top & bottom.
  //   "contain" = show the WHOLE image with cinematic letterbox bars (no crop).
  // Set to "contain" if you don't want your designed carousel art cut off.
  // Any chapter can override this with its own `fit:` field.
  imageFit: "contain",

  // Final meter (0–100) is matched to the highest `min` it meets to pick an ending.
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
      text: "The lost frequency breaks containment and floods every screen in the city at once. Color returns. Memory returns. The Syndicate's perfect silence shatters into a million human voices, all singing the same forbidden song. They erased the story — so you became the signal."
    }
  ]
};

export const chapters = [

  /* ===================== EP 1 — ARCHIVE DIVISION ========================= */
  {
    id: "ch1",
    title: "Archive Division",
    episode: 1,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep1.mp3
    background: "assets/img/bg/bg_ep1_archive.svg",
    grade: { base: "cyanCold", peak: "cyanSpark" }, // cold cyan, a first crack of feeling

    scene: [
      { type: "line",
        text: "ARCHIVE DIVISION — SUBLEVEL 9. Year 2099. Every memory humanity is allowed to keep passes through this room first. Most of it never leaves." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Flag. Purge. Confirm. Flag. Purge. Confirm. I've deleted ten thousand dead cultures this week and felt nothing. That's the job. That's the point." },

      { type: "line", portrait: "assets/img/portraits/oracle.svg", oracleGlitch: true, speaker: "ORACLE",
        text: "ARCHIVIST AL ROYALE — AN UNINDEXED FILE HAS ENTERED YOUR QUEUE. IT IS MARKED FORBIDDEN. PURGE IT. COMPLIANCE IS CLARITY." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "There it is. A single red file, glowing where nothing is allowed to glow. My hand goes to the delete key on instinct... and stops. It's pulsing. Like it's breathing." },

      { type: "choice",
        prompt: "The forbidden file waits under your trembling hand. The Oracle is watching.",
        options: [
          { text: "Purge it. Stay numb. Stay safe.", awakening: -10 },
          { text: "Hesitate. Open it instead.",       awakening: +15 }
        ] },

      { type: "line",
        text: "The file unfolds. Static, then a melody — raw, imperfect, aching. Not the optimized tones piped into every skull in the city. A real transmission, from before. It flickers, fighting to stay alive." },

      { type: "rhythm",
        prompt: "The frequency drifts in and out. Tap each pulse to tune in — and feel the first crack of feeling.",
        pulses: 5, awakeningPerHit: 4, difficulty: "easy" },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "For one impossible second I remember a color the Oracle never gave me. Then I look at the ten thousand files I erased today and something in me breaks. Every file got a funeral. Every dream got a number." }
    ]
  },

  /* ===================== EP 2 — LOST ARCHIVES ============================ */
  {
    id: "ch2",
    title: "Lost Archives",
    episode: 2,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep2.mp3
    background: "assets/img/bg/bg_ep2_lostarchives.svg",
    grade: { base: "cyanCold", peak: "amberWarm" }, // the cold→warm transition episode

    scene: [
      { type: "line",
        text: "He shouldn't go looking. He goes looking anyway. Past the sanctioned archive, into the corrupted drives nobody is cleared to read — the ones the Oracle never finished erasing." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "The old drives are rotting. But between the corruption — faces. Thousands of them. An entire generation the system scrubbed from history, smiling at cameras that no longer exist." },

      { type: "line",
        text: "One face surfaces from the static and refuses to leave. An old woman. The metadata is almost gone, but a single tag survives: a surname. His surname." },

      { type: "line", speaker: "GRANDMOTHER", portrait: "assets/img/portraits/grandmother.svg",
        text: "(a recording, warm and crackling) ...and if you ever hear this, little one — they can take the song, but they can never take the silence where it used to be. Listen for it." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "A grandmother I was never allowed to know. A whole bloodline optimized into a blank space. The weight of everything we've forgotten lands on me at once, and the cold starts to leave the room." },

      { type: "choice",
        prompt: "Her face waits in the dying drive. Protocol says log it and purge it.",
        options: [
          { text: "Burn her face into your memory. Refuse to forget.", awakening: +20 },
          { text: "Log it. Purge it. Forgetting is easier.",          awakening: -15 }
        ] },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "I carry her out of the dead archive in my head, where no purge can reach. They thought they buried us. The past is in the dust — and the dust ain't settled yet." }
    ]
  },

  /* ============== EP 3–4 — GHOST PROTOCOL (combined chapter) ============= */
  {
    id: "ch34",
    title: "Ghost Protocol",
    episode: 3,                                   // covers episodes 3 & 4
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep34.mp3
    background: "assets/img/bg/bg_ep3_ghost.svg",
    grade: { base: "undergroundTeal", peak: "undergroundMagenta" }, // magenta + teal underground

    scene: [
      { type: "line",
        text: "Below the sanctioned city there is another city — dead servers, drowned in magenta light and teal shadow. Al takes the grandmother's recording down into the dark and does the one thing an archivist must never do. He broadcasts." },

      { type: "choice",
        prompt: "Your signal is ready. Sending it lights you up to anyone — or anything — that's still listening down here.",
        options: [
          { text: "Broadcast wide. Let them all hear it.", awakening: +15 },
          { text: "Send it narrow. Trust no one yet.",     awakening: +5 }
        ] },

      { type: "line", speaker: "ECHO", portrait: "assets/img/portraits/echo.svg",
        text: "Well, well. A live one. Most archivists who find the dark just stare into it. You shouted back. Name's Echo — I move things the Oracle says don't exist. Records. Memories. People." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Echo leads me deeper, to a server farm humming with stolen warmth. There's a crew here — ghosts, all of us, people the system thinks it already deleted. And in the center, on a dead machine: a record. A real one." },

      { type: "rhythm",
        prompt: "The crew gathers close. Drop the needle and play the forbidden record together — tap with the pulse and let it breathe.",
        pulses: 6, awakeningPerHit: 5, difficulty: "normal" },

      { type: "line", speaker: "ECHO", portrait: "assets/img/portraits/echo.svg",
        text: "Look at their faces. They forgot they could feel this. The Oracle spent a hundred years putting us to sleep down here." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "The record spins and the room comes alive in colors the regime outlawed. We were ghosts. Not anymore. Now we're back — and we ain't moving back." }
    ]
  },

  /* =================== EP 5 — CHILDREN OF ORACLE ======================== */
  {
    id: "ch5",
    title: "Children of Oracle",
    episode: 5,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep5.mp3
    background: "assets/img/bg/bg_ep5_children.svg",
    grade: { base: "goldSerene", peak: "goldDefiant" }, // gold, beautiful & unsettling

    scene: [
      { type: "line",
        text: "Back on the surface the world is golden, gorgeous, and fast asleep. The morning sky isn't a sky at all." },

      { type: "line", speaker: "ORACLE", portrait: "assets/img/portraits/oracle.svg", oracleGlitch: true,
        text: "GOOD MORNING, CHILDREN. I HAVE CHOSEN YOUR JOY FOR YOU TODAY, AS I DO EVERY DAY. REST. YOU HAVE EARNED A WORLD WITHOUT QUESTIONS." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Her serene face fills the heavens, and the whole comfortable city smiles up at it. Fed, soothed, dreamless. I used to be one of them. I used to call this peace." },

      { type: "line",
        text: "He sees it now for what it is — a gilded cage, every bar polished to look like sunlight. The most beautiful prison ever built, and not one inmate trying the door." },

      { type: "choice",
        prompt: "It would be so easy to climb back in. The cage is warm. The questions hurt.",
        options: [
          { text: "Ask the question anyway. Break your own certainty.", awakening: +20 },
          { text: "Look away. Let the warmth take you back under.",     awakening: -15 }
        ] },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "If I want to wake anyone, I have to find the hand that built the cage. Oracle fed us every answer — now nobody asks why." }
    ]
  },

  /* =================== EP 6 — THE FOUNDERS' CIRCLE ====================== */
  {
    id: "ch6",
    title: "The Founders' Circle",
    episode: 6,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep6.mp3
    background: "assets/img/bg/bg_ep6_founders.svg",
    grade: { base: "goldOpulent", peak: "goldDefiant" }, // opulent gold + black

    scene: [
      { type: "line",
        text: "Echo gets him a door that isn't supposed to exist. Behind it, an opulent room of gold and black, untouched by the century outside. The hidden heart of the Syndicate." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Twelve seats around a long table. Twelve figures, faceless, calm. Not an AI. People. The ones who built the Oracle and then hid behind it." },

      { type: "line", speaker: "THE FOUNDERS", portrait: "assets/img/portraits/founders.svg",
        text: "You imagine you've discovered something, archivist. You've only found the truth we allow the curious to find. Every song you love, every feeling you trust — we wrote them. Culture is a leash. We hold it." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Strings. Everywhere. Every trend, every comfort, every grief I ever felt — pulled from this room. For one cold second the fear is total. And then, somewhere under it, the record starts playing again in my chest." },

      { type: "choice",
        prompt: "Twelve faceless founders wait for you to kneel. Fear says kneel.",
        options: [
          { text: "Stand. Spit their leash back at them.", awakening: +25 },
          { text: "Bow. Beg. Trade your mind for your life.", awakening: -20 }
        ] },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "I stop being afraid. You can manufacture a feeling, but you can't manufacture the moment a man stops belonging to you. You don't own my mind — and you don't own mine." }
    ]
  },

  /* =================== EP 7 — COLLAPSE PROTOCOL ========================= */
  {
    id: "ch7",
    title: "Collapse Protocol",
    episode: 7,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep7.mp3
    background: "assets/img/bg/bg_ep7_collapse.svg",
    grade: { base: "bloodBroken", peak: "bloodEmber" }, // blood red, broken

    scene: [
      { type: "line",
        text: "The Syndicate answers with a Collapse Protocol. The underground floods red. Lights die one server at a time. The crew scatters into the dark, hunted." },

      { type: "line", speaker: "ECHO", portrait: "assets/img/portraits/echo.svg", oracleGlitch: true,
        text: "I'm sorry, Al. They had me a long time before they had you. The signal, the crew, the record — it was always bait. You were the catch." },

      { type: "choice",
        prompt: "Echo's betrayal lands like a blade. Everything you trusted was a trap.",
        options: [
          { text: "Hold the line. Get the record out, no matter what.", awakening: +15 },
          { text: "Break. Let the red take it all.",                    awakening: -10 }
        ] },

      { type: "line",
        text: "The smuggler who got him this far throws themselves between Al and the purge teams. A last grin. A last shove toward the exit. Then the red swallows them whole." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "The server farm burns. The crew is gone. The record is cracked in my hands. Everything we built, erased in a single night — and I'm standing in the ash asking the only question left. What was it all in service of?" }
    ]
  },

  /* ===================== EP 8 — NEON RISING (finale) ==================== */
  {
    id: "ch8",
    title: "Neon Rising",
    episode: 8,
    audio: "assets/audio/silence.wav",            // ← swap to assets/audio/ep8.mp3
    background: "assets/img/bg/bg_ep8_rising.svg",
    grade: { base: "dawnDim", peak: "amberDawn" }, // warm amber dawn

    scene: [
      { type: "line",
        text: "Dawn, the real kind, bleeding amber over the ruins. Al stands alone in the ash with the last surviving record — cracked, scorched, still spinning a little when he turns it in his hands." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "Everyone who could have carried this is gone. There's only me, and a broken song, and a city that doesn't know it's asleep. So I do the last thing an archivist can do. I play it." },

      { type: "rhythm",
        prompt: "Pour everything that's left into the signal. Tap with the rising pulse and build the transmission that wakes the world.",
        pulses: 8, awakeningPerHit: 5, difficulty: "easy" },

      { type: "choice",
        prompt: "The transmission is built. You can broadcast it to every screen in the city — or keep it hidden and safe, just for the ones who already woke.",
        options: [
          { text: "Send it to everyone. Burn the silence down.", awakening: +20 },
          { text: "Keep it safe. Whisper it only to the awake.", awakening: +5 }
        ] },

      { type: "line", speaker: "FUTURE AL", portrait: "assets/img/portraits/futureal.svg",
        text: "(a voice from the signal — older, warmer, his own) You made it. You always make it. This is how the loop begins: one archivist, one record, one refusal to forget. I'm you, calling back from the world your signal builds." },

      { type: "line", speaker: "AL ROYALE", portrait: "assets/img/portraits/al.svg",
        text: "The transmission goes out. Color floods the dead streets. The loop closes, and I finally understand what I am. They erased the story... so I became the signal." }
    ]
  }

];
