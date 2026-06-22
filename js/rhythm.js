/* ============================================================================
 * rhythm.js — the "tune into the lost frequency" mini-mechanic
 * ----------------------------------------------------------------------------
 * Simple, forgiving, atmospheric — NOT Guitar Hero. Pulses appear one at a
 * time at random positions. Each grows, glows, then fades; tapping it while
 * it's visible counts as a hit and raises the awakening meter. Misses just
 * cost a little potential meter, never a game-over.
 *
 * Tuned entirely from a story.js rhythm beat:
 *   { type:"rhythm", prompt, pulses, awakeningPerHit, difficulty }
 *
 * Returns a Promise resolving to the total awakening gained, so the engine can
 * apply it to the meter and continue the scene.
 * ========================================================================= */

const DIFFICULTY = {
  // lifeMs = how long each pulse stays tappable; size = px diameter
  easy:   { lifeMs: 1600, size: 150, gapMs: 500 },
  normal: { lifeMs: 1200, size: 120, gapMs: 420 },
  hard:   { lifeMs: 850,  size: 100, gapMs: 320 }
};

/**
 * Run a rhythm sequence inside `container`.
 * @returns {Promise<number>} total awakening gained from hits.
 */
export function runRhythm(beat, container, onProgress) {
  const cfg = DIFFICULTY[beat.difficulty] || DIFFICULTY.easy;
  const total = beat.pulses;
  const perHit = beat.awakeningPerHit;

  return new Promise((resolve) => {
    let spawned = 0;
    let hits = 0;
    let gained = 0;

    const report = () => onProgress && onProgress({ spawned, total, hits, gained });

    function spawnNext() {
      if (spawned >= total) {
        // Wait for the last pulse's lifetime to elapse, then finish.
        setTimeout(() => resolve(gained), cfg.lifeMs + 100);
        return;
      }
      spawned++;
      report();

      const pulse = document.createElement("button");
      pulse.className = "pulse";
      pulse.type = "button";
      pulse.setAttribute("aria-label", "Tune in");
      pulse.style.width = pulse.style.height = cfg.size + "px";

      // Random position within the play area, keeping the pulse fully inside.
      const pad = cfg.size / 2 + 12;
      const rect = container.getBoundingClientRect();
      const x = pad + Math.random() * Math.max(1, rect.width - pad * 2);
      const y = pad + Math.random() * Math.max(1, rect.height - pad * 2);
      pulse.style.left = x + "px";
      pulse.style.top = y + "px";
      pulse.style.setProperty("--life", cfg.lifeMs + "ms");

      let resolvedThis = false;
      const expire = setTimeout(() => {
        if (resolvedThis) return;
        resolvedThis = true;
        pulse.classList.add("pulse--miss");
        setTimeout(() => pulse.remove(), 220);
      }, cfg.lifeMs);

      const hit = () => {
        if (resolvedThis) return;
        resolvedThis = true;
        clearTimeout(expire);
        hits++;
        gained += perHit;
        report();
        pulse.classList.add("pulse--hit");
        setTimeout(() => pulse.remove(), 260);
      };
      pulse.addEventListener("pointerdown", (e) => { e.preventDefault(); hit(); });

      container.appendChild(pulse);
      // Schedule the following pulse partway through this one's life.
      setTimeout(spawnNext, cfg.gapMs + cfg.lifeMs * 0.45);
    }

    report();
    spawnNext();
  });
}
