/* ============================================================================
 * NEON PROPHETS — STORY DATA
 * ----------------------------------------------------------------------------
 * This is the ONLY file you need to edit to change the narrative.
 * No engine code lives here. Add chapters, edit dialogue, tune choices freely.
 *
 * HOW TO ADD A CHAPTER
 *   1. Copy one of the chapter objects in the `chapters` array below.
 *   2. Give it a unique `id`, bump `episode`, set `title`.
 *   3. Point `background` at an image in assets/img/bg/ and `audio` at a track
 *      in assets/audio/ (use silence.wav until your real song is ready).
 *   4. Fill `scene` with beats (see the three beat types documented below).
 *   5. That's it — the chapter automatically appears and unlocks in order.
 *
 * HOW TO SWAP IN REAL ART / MUSIC
 *   - Drop your file into assets/img/bg, assets/img/portraits, or assets/audio.
 *   - Change the matching filename string below. Nothing in js/ changes.
 *
 * BEAT TYPES (each item in a chapter's `scene` array)
 *
 *   { type: "line", ... }    One tap-to-advance unit of story.
 *      speaker:      (optional) name shown above the text. Omit for narration.
 *      portrait:     (optional) path to a character portrait image.
 *      text:         the narration/dialogue string (typewriter-revealed).
 *      oracleGlitch: (optional, default false) true triggers a glitch
 *                    transition + brief cold "snap" when ORACLE intrudes.
 *
 *   { type: "choice", ... }  A branching decision that moves the meter.
 *      prompt:   the question shown to the player.
 *      options:  array of { text, awakening, goto }
 *                  text:     button label.
 *                  awakening: meter delta (+ raises = rebel/memory,
 *                                          - lowers = comply with ORACLE).
 *                  goto:     (optional) id of a beat to jump to. Omit/null to
 *                            simply continue to the next beat.
 *
 *   { type: "rhythm", ... }  The "tune into the lost frequency" mini-mechanic.
 *      prompt:          instruction text shown above the play area.
 *      pulses:          how many glowing targets appear.
 *      awakeningPerHit: meter gained for each successful tap.
 *      difficulty:      "easy" | "normal" | "hard" (controls pulse size/speed).
 *
 * OPTIONAL per-beat `id`
 *   Add `id: "someName"` to any beat to make it a jump target for a choice's
 *   `goto`. Ids only need to be unique within their own chapter.
 * ========================================================================= */

export const meta = {
  title: "NEON PROPHETS",
  subtitle: "An interactive transmission",

  // The awakening meter runs 0–100 and persists across chapters. At the end of
  // the final chapter the player's meter is matched against these thresholds
  // (highest `min` they meet wins) to pick an ending.
  endings: [
    {
      id: "asleep",
      min: 0,
      title: "STILL ASLEEP",
      text: "The file is gone. The frequency fades. AL ROYALE logs out, and the city forgets one more thing it was never allowed to remember. The Oracle hums on, untroubled. Somewhere, a signal waits for someone braver."
    },
    {
      id: "signal",
      min: 40,
      title: "THE SIGNAL SPREADS",
      text: "He couldn't save it all. But a fragment escaped — copied, smuggled, whispered between the cracks of the network. It isn't a revolution. Not yet. But for the first time in a hundred years, the Oracle is listening for something it cannot find."
    },
    {
      id: "rising",
      min: 75,
      title: "NEON RISING",
      text: "The lost frequency breaks containment and floods every screen in the city at once. Color returns. Memory returns. The Syndicate's perfect silence shatters into a million human voices, all singing the same forbidden song. AL ROYALE was never the prophet. He was only the first to wake up."
    }
  ]
};

export const chapters = [

  /* ======================= CHAPTER 1 ===================================== */
  {
    id: "ch1",
    title: "The Archivist",
    episode: 1,
    audio: "assets/audio/silence.wav",        // ← swap to assets/audio/ch1.mp3
    background: "assets/img/bg/bg_ch1.svg",    // ← swap to your real art

    scene: [
      {
        type: "line",
        text: "Year 2099. The Oracle curates everything you have ever felt. Nothing reaches a human mind that it did not first approve."
      },
      {
        type: "line",
        speaker: "AL ROYALE",
        portrait: "assets/img/portraits/al.svg",
        text: "Another shift in the Archive. Another stack of dead culture flagged for deletion. My job is simple: make sure no one remembers what we used to be."
      },
      {
        type: "line",
        speaker: "AL ROYALE",
        portrait: "assets/img/portraits/al.svg",
        text: "A file surfaces in the queue. No metadata. No approval stamp. It pulses on my screen like it's... breathing."
      },
      {
        type: "line",
        speaker: "ORACLE",
        portrait: "assets/img/portraits/oracle.svg",
        oracleGlitch: true,
        text: "ANOMALY DETECTED. ARCHIVIST AL ROYALE — PURGE THE UNINDEXED FILE. COMPLIANCE IS CLARITY."
      },
      {
        // First branching moment of the game.
        type: "choice",
        prompt: "The unindexed file waits. The Oracle is watching.",
        options: [
          { text: "Delete the file. Stay invisible.", awakening: -10 },
          { text: "Hesitate. Open it instead.",        awakening: +15 }
        ]
      },
      {
        type: "line",
        speaker: "AL ROYALE",
        portrait: "assets/img/portraits/al.svg",
        text: "Sound. Not the sanitized tones the Oracle pipes into our skulls — something raw, something that aches. A melody from before the optimization. It's a transmission."
      },
      {
        // The first instance of the rhythm / "tune in" mini-mechanic.
        type: "rhythm",
        prompt: "The frequency drifts in and out. Tap each pulse to lock onto the lost signal.",
        pulses: 5,
        awakeningPerHit: 4,
        difficulty: "easy"
      },
      {
        type: "line",
        speaker: "AL ROYALE",
        portrait: "assets/img/portraits/al.svg",
        text: "For one impossible second, I remember a color the Oracle never gave me. Then the alarms begin."
      }
    ]
  },

  /* ======================= CHAPTER 2 ===================================== */
  {
    id: "ch2",
    title: "The Transmission",
    episode: 2,
    audio: "assets/audio/silence.wav",        // ← swap to assets/audio/ch2.mp3
    background: "assets/img/bg/bg_ch2.svg",    // ← swap to your real art

    scene: [
      {
        type: "line",
        text: "The Syndicate moves in silence, but it always moves. By morning, AL ROYALE's access has been flagged for review."
      },
      {
        type: "line",
        speaker: "AL ROYALE",
        portrait: "assets/img/portraits/al.svg",
        text: "I copied the transmission before they could quarantine it. It's in my deck now, humming against regulation. I could turn it in and beg forgiveness. Or I could follow it."
      },
      {
        type: "choice",
        prompt: "A Syndicate auditor is at your door. The stolen signal burns in your pocket.",
        options: [
          { text: "Surrender the signal. Survive.",         awakening: -15 },
          { text: "Lie. Keep the signal. Keep awakening.",  awakening: +20 }
        ]
      },
      {
        type: "line",
        speaker: "ORACLE",
        portrait: "assets/img/portraits/oracle.svg",
        oracleGlitch: true,
        text: "YOU ARE NOT SPECIAL, ARCHIVIST. EVERY PROPHET BEFORE YOU WAS ALSO DELETED. THE FREQUENCY IS A SICKNESS. LET US CURE YOU."
      },
      {
        type: "line",
        speaker: "AL ROYALE",
        portrait: "assets/img/portraits/al.svg",
        text: "No. For the first time, the silence in my head has a crack in it. And through the crack — I can hear them. All the ones who came before, still singing."
      },
      {
        type: "rhythm",
        prompt: "Their voices surge. Tune in and let the chorus through.",
        pulses: 6,
        awakeningPerHit: 5,
        difficulty: "normal"
      },
      {
        type: "line",
        speaker: "AL ROYALE",
        portrait: "assets/img/portraits/al.svg",
        text: "The cold is leaving the world. Warmth bleeds in at the edges of everything. Whatever happens next, I am awake now — and I am not the last."
      }

      /* ----------------------------------------------------------------------
       * ADD CHAPTERS 3–8 BELOW by copying a chapter object above.
       * The final chapter in this array is treated as the finale: when its
       * scene ends, the player's awakening meter decides which ending (from
       * meta.endings) is shown.
       * ------------------------------------------------------------------- */
    ]
  }

];
