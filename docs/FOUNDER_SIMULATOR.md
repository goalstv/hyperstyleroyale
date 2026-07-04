# JUNIOR — Founder Simulator

### Creative Direction Bible · v1

> **Mandate:** Build the flagship interactive experience for the **Junior**
> franchise — the definitive *Founder Simulator*. Not a Roblox tycoon. A
> decade-long platform that makes millions of people *emotionally live* the
> journey from uncertainty to opportunity, and introduces them to the Junior
> universe by letting them spend hundreds of hours inside it.

This document supersedes and absorbs the earlier
[`PROGRESSION_LOOP.md`](PROGRESSION_LOOP.md) sketch. Where that was a loop
one-pager, this is the creative bible: the thesis, the systems, the mechanics we
recommend inventing, and the hard questions we should answer before writing a
line of engine code.

It is written to be **challenged**. Every section states an opinion so we have
something concrete to argue with.

---

## Part 0 — The one sentence

**You start with $40 and a notebook, and you build a life.**

Everything below serves that sentence. If a mechanic doesn't make the player
*feel* that sentence, it's cut.

---

## Part 1 — What Junior actually is (the emotional thesis)

Junior is not a rags-to-riches fantasy. Rags-to-riches is a **lottery** fantasy —
it says *luck will save you.* Junior says the opposite:

> **No money, no connections, no blueprint — and you build it anyway, through
> persistence, relationships, creativity, and relentless execution.**

That is an *agency* fantasy, not a luck fantasy. The emotional core we are
engineering is a single, repeatable feeling:

> ### "I finally earned the chance to do something bigger."

Call this the **Elevation Beat.** It is our version of a level-up chime, a loot
drop, a boss kill. Every system in this game exists to manufacture Elevation
Beats and make each one feel *earned*, not *granted*. When we playtest, the
question is never "is it fun?" It's **"did they feel they earned it?"**

The villain of this game is not a person. It's **the closed door** — the
gatekeeper, the "you don't belong here," the invisible barrier. The whole game
is the slow, satisfying work of turning closed doors into open ones.

---

## Part 2 — Design pillars

Six pillars. Every feature must serve at least one; features that serve none are
cut no matter how cool.

1. **Opportunity, not accumulation.** The progression the player *feels* is doors
   opening, not a number rising. Money is a constraint, not a score.
2. **The world is the progression.** The city visibly grows around the player as
   they rise. Growth is *shown*, never announced in a menu.
3. **Earned, not granted.** Nothing meaningful is bought outright. It's unlocked
   by *becoming* the person who has access to it.
4. **A living city, not a wall of buttons.** Time passes, people have lives,
   places have hours, characters remember. Scarcity of time is what makes choices
   matter.
5. **Show the IP, don't lecture it.** Players meet the cast and the canon by
   *living alongside them*, never through exposition dumps.
6. **Build for a decade.** Every system is designed as a platform that new
   albums, arcs, careers, and seasons plug into — not a finished product.

---

## Part 3 — The core loop: a Conversion Economy of Six Capitals

The single biggest design decision in this document. Read it twice.

Tycoon games have **one resource** (money) and one verb (accumulate). We have
**six resources** and one meta-verb: **convert.** This is the actual model of
entrepreneurship, and it's what makes the loop deep instead of grindy.

| Capital | What it is | Real-world name |
|---------|-----------|-----------------|
| **💵 Money** | Runway. Usually the *constraint*, rarely the goal. | Financial capital |
| **🚪 Access** | Where you can physically go and who will see you. | Spatial/positional capital |
| **🤝 Relationships** | The people who know you and will vouch for you. | Social capital |
| **📚 Knowledge** | What you understand about how the world works. | Intellectual capital |
| **🛠 Skills** | What you can actually *execute*. | Human capital |
| **⭐ Reputation** | How you're perceived — per scene, not globally (see Part 8). | Symbolic capital |

**The loop is conversion, not accumulation.** Every capital can be spent to buy
another:

```
   Money ──buys──▶ Skills ──produce──▶ Work ──earns──▶ Reputation
     ▲                                                      │
     │                                                   opens
  earns                                                     ▼
     │                                                   Access
  Opportunity ◀──offer── Relationships ◀──unlock── Access
```

The player is *always* asking the founder's real question: **"I have a little of
X — what's the highest-leverage thing to convert it into right now?"** Spend your
last $40 on a laptop (skill capital) or on a networking event ticket (access)?
That tension *is* the game.

**Why six and not one:** a single-currency game is solved once you know the
optimal money loop. A six-capital conversion economy has no single optimum —
different builds (the Grinder, the Networker, the Craftsman, the Hustler) are all
viable, and the player's *strategy* becomes an expression of who they are. That's
replayability measured in years, not hours.

> **Opportunities** are the seventh thing, but they aren't a stockpiled resource —
> they're the *output* of the whole machine. An Opportunity is a door the world
> is currently holding open for you. Which brings us to the engine.

---

## Part 4 — The Opportunity Engine (making "doors opening" the dopamine)

If money-going-up isn't the reward, we need to engineer a reward that hits just
as hard. It's this:

**The world is covered in a fog of opportunity, and your rising capital burns
the fog away.** Doors, people, neighborhoods, and events exist on the map from
day one — but you literally **cannot see them** until you have the capital to
perceive them.

- A recording studio is *right there*, greyed and locked, labeled only "???".
- At **Reputation 3 in the music scene**, it resolves into "New Fame Studios —
  ask Leon for an intro."
- The moment a locked node **lights up**, that's an Elevation Beat. We ritualize
  it: the world literally gets brighter, a motif plays, the notebook writes a new
  line. This is our loot drop.

**Design rule: opportunities are always visible *before* they're reachable.** The
player must be able to *see* the thing they can't yet have. Aspiration is the
engine. A locked door you can see is a goal; a door you don't know exists is
nothing. The map should always show the player 2–3 tiers of locked-but-visible
future, so there is always an obvious "what I'm working toward."

This inverts the tycoon dopamine cleanly: tycoon says *"the number went up."* We
say *"the world got bigger and I can see further."* Same hit, better meaning.

---

## Part 5 — GOALS as the master system (not XP)

GOALS is the brand and it must be the *mechanical spine*, not a flavor layer.

**Core rule: goals don't reward XP. Goals restructure the world.** Completing a
goal doesn't add points — it *unlocks a possibility that did not exist before.*

Three nested tiers, all living in the **Notebook** (our diegetic UI — see Part
12):

- **Micro goals (this week):** "Save $500." "Learn the Pen Tool." "Get Uncle
  Larry to introduce you to Yvonne." Fast, tactical, completed in a session.
- **Meso goals (this chapter/location):** "Land the internship." "Release your
  first mixtape." "Get invited to a New Fame event." A location's arc.
- **Macro goals (this life):** "Start a company." "Buy The Garage." "Mentor
  someone the way you were mentored." The decade arc.

**The player authors their own goals** from a growing menu the game surfaces
based on what's now *visible* to them (you can only set a goal you can see).
Committing to a goal is a real act — it focuses the world: relevant NPCs, jobs,
and locations get emphasized; the notebook tracks it; and *the specific chapter
it unlocks becomes reachable.* Goals are how the free-form sandbox and the
authored Junior story stay married: the map unlocks the **where**, GOALS unlock
the **why**.

This is also the education hook (Part 9) and the brand hook in one system:
*everything meaningful in Junior's life began as a goal*, and now everything
meaningful in the player's game does too.

---

## Part 6 — Time and the living city (why choices hurt)

A tycoon has infinite time and one resource. We invert it: **time is the scarcest
resource, and you can never do everything.** This is what turns a wall of buttons
into a life.

- The day runs on **time blocks** (Persona's model): morning / afternoon /
  evening / late. Each meaningful action costs a block. You cannot grind the
  studio *and* attend the networking event *and* study Photoshop in one day. You
  choose, and the choices you didn't make become the ghost of the road not taken
  (Part 12).
- **NPCs have schedules.** Uncle Larry is at The House on weekday evenings; Yvonne
  is at New Fame during events; a coworker is only at the office on shift. Missing
  someone has a cost. Catching them at the right moment is a small win.
- **The world runs whether you're watching or not:** businesses open and close,
  the subway runs on a timetable, weather changes, concerts and networking events
  appear on the calendar with **deadlines that pass you by if you're not ready.**
- **Internships and opportunities expire.** A closing window is the strongest
  motivator in games. If the New Fame internship deadline is Friday and you're not
  qualified yet, you feel it.

The emotional point: a founder's life is defined by opportunity cost. By making
time genuinely scarce, every "yes" is also a "no," and that's what makes the wins
land.

---

## Part 7 — Relationships: the network IS the game

Steal Persona's Confidant system and re-point it at a *career*. In most games the
map is the world. **In Junior, the relationship graph is the real map** — the
city is just where you go to grow it.

- Every important person is a **relationship track** with ranks. Ranks don't
  unlock dialogue flavor — they unlock **capabilities**: an intro you couldn't get,
  a job you couldn't apply for, a skill they teach you, a place they let you into,
  a warning that saves you from a bad deal.
- **Characters remember.** They reference past conversations, past favors, past
  failures. This is non-negotiable and it's the whole feeling of a living world.
- **Relationships decay if neglected.** The cost of pure hustle is that people
  drift. A founder who only grinds and never calls anyone back hits a ceiling.
  This makes the "spend a time block on a person, not on work" choice real.
- **Warm intros, not cold approaches.** You usually *can't* just walk up to a
  top-tier person. You need a path through your existing graph — someone who
  knows them and will vouch for you. Access to people is literally shortest-path
  through your network. This models real networking and it's a fantastic gating
  mechanic: it makes relationships *structurally* valuable, not just nice.

The cast enters here, as gameplay, never as cutscene (Part 11): **Leon** as a
peer/rival whose track runs parallel to yours; **Uncle Larry** as the first door
and the anchor to The House; **Yvonne** as a mentor/partner whose track gates the
music scene; coworkers, mentors, rivals, and future partners each a track with
its own capabilities.

---

## Part 8 — Reputation is contextual, not a global number

A subtle but crucial call. Reputation is **not** one bar. It's **per scene**:

| Scene | Example currency of respect |
|-------|-----------------------------|
| The Streets | "you're solid, you show up" |
| The Music scene | "your stuff is actually good" |
| The Corporate/Internship world | "you're reliable and sharp" |
| The Tech/Founder world | "you can build and ship" |

You can be a legend in music and a nobody in tech. **Crossing scenes is one of
the hardest and most satisfying moves in the game** — bringing your music-scene
reputation into the corporate world, or your corporate polish into the streets.
This mirrors the real Junior story (a kid who had to earn credibility in rooms
that didn't know him) and it gives us endless late-game content: every new scene
is a fresh reputation to earn from near-zero, with your existing capitals as
leverage.

The old **Founder Reputation ladder** (Hustler → Creator → Intern → Strategist →
Creative Director → Executive → Founder → Mentor → Legend) still exists — but as
your **overall standing**, a weighted read across scenes, and each title gates
real platform-level capabilities (hiring, opening a business, mentoring others).

---

## Part 9 — Skills, knowledge, and the education intersection

Here is a genuinely differentiating, slightly dangerous idea worth serious
debate: **the skills in this game can be real skills.**

When Junior "learns Photoshop," that can be a stylized-but-real micro-lesson in
layers and masking. "Learn to negotiate" can teach the actual anatomy of a
negotiation. "Read a P&L" can teach what a P&L is. We are not building a
textbook — we're building a game where the *fiction of mastery* is backed by
*fragments of real mastery*, the way *Kerbal* accidentally taught a generation
orbital mechanics.

**Why this is the killer app:** no other progression game can honestly say "you
played for 100 hours and you actually learned things a founder needs." That's the
pitch that gets us into schools, gets press no tycoon game gets, and makes the
game *matter*. It's where gameplay + education + entrepreneurship intersect —
exactly the intersection the mandate asked for.

**The risk (stated honestly):** education is where fun goes to die if we're
clumsy. Rule: **the lesson must always be the shortest path to a gameplay reward
the player already wants.** They study negotiation because there's a deal on the
line *tonight*, not because a menu told them to. Learning is always in service of
an opportunity, never homework. If we can't make a skill fun as a mechanic, it
stays abstract (a bar that fills) and we don't force the lesson.

---

## Part 10 — Locations as life chapters (the world as progression)

The map is not a set of levels you pay to unlock. Each place is a **phase of
becoming**, and you unlock it by *becoming the person who belongs there.* The
canonical Junior locations, designed as emotional chapters:

| Location | Life phase | Emotional register | Design intent |
|----------|-----------|--------------------|---------------|
| **The House** | Origin / family | Warmth, limitation | Where you start and always can return. Safe, small, loving, not enough. |
| **The Swamp** | The grind / South FL roots | Restlessness | The world you have to leave to grow — and miss once you have. |
| **The Attic** | First creative space | Scrappy hope | Where you make your first real thing with nothing. |
| **Baisley Park** | Proving ground | Tested, alive | Where reputation is earned in public, in the scene. |
| **New Fame** | First taste of the industry | Awe, intimidation | Doors that were invisible now open — and you feel out of your depth. |
| **The City** | The arena | Overwhelm → command | The big stage; you arrive small and must grow into it. |
| **Volt** | Momentum / the machine | Velocity, risk | Where things move fast and you can win or blow up. |
| **The Garage** | Legacy / founding | Earned peace, authorship | The endgame place you *build*, where you mentor the next kid. |

**Two mechanics that make places emotional, not just functional:**

1. **You outgrow places, and it's bittersweet.** When you return to The House
   after making it in The City, it's smaller than you remembered. NPCs react to
   who you've become. That ache is the point — it's what "building a life"
   actually feels like. No tycoon has ever made a player *miss a location.*
2. **Places remember you.** The Attic still has the marks of your first project.
   Baisley Park's regulars recall your come-up. Locations accumulate your history
   the way people do.

---

## Part 11 — Introducing the IP by living it (show, don't lecture)

The game is onboarding millions of people into the Junior universe. **Never** via
lore dump. The rule:

> **Every character enters as a gameplay function; every location earns its
> meaning through hours spent; every piece of canon is discovered, never
> explained.**

- **Leon** doesn't get an intro cutscene — he's the guy grinding next to you, one
  step ahead, and the relationship (rival? brother? both?) forms through a hundred
  small interactions.
- **Uncle Larry** is *mechanically* your first door — he gives you the first job —
  so players bond with him because he mattered to their progress, not because a
  bio told them to.
- **Yvonne** gates a scene you desperately want into, so the player *earns* the
  relationship and remembers her.
- **The music** is diegetic: album tracks are the radio in the world, the songs
  playing at New Fame, the thing you're trying to make. Future albums enter the
  same way (Part 14) — the IP's canon and the game's content are the same
  substance.

By the time a player has spent 40 hours here, they don't "know the Junior lore" —
they have *memories* of these people and places. That's the difference between an
audience and a fanbase, and it's why the game is the top of the franchise funnel.

---

## Part 12 — Mechanics we recommend inventing

The mandate asked for mechanics you haven't considered. Here are the strongest,
ranked by how much they'd differentiate us:

1. **The Notebook (diegetic UI, zero abstract HUD).** Goals, contacts, ideas,
   money, and skills all live in Junior's physical notebook — the same notebook
   he starts with. No floating menus. Opening the notebook *is* pausing to think.
   It ties the entire interface to the brand's "wrote his own blueprint" ethos and
   it's instantly iconic and merchandisable.

2. **The Compounding Curve (honest difficulty design).** Deliberately make the
   early game slow and hard — surviving the first week should be a genuine
   grind — so that the mid-late acceleration *feels like compound interest.* The
   emotional arc of the difficulty curve should mirror a real career: flat, flat,
   flat, then hockey-stick. Most games front-load dopamine; we back-load it, and
   the payoff is a feeling no instant-gratification game can sell.

3. **The Ghost of the Path Not Taken.** Because time is scarce, every choice
   kills an alternative. Occasionally, the game shows you a glimpse of what the
   *other* choice would have become — the internship you skipped, the friend you
   didn't call. Not to punish — to make choices weigh something. Reflection as a
   mechanic. Nobody does this.

4. **The Pay-It-Forward Ledger.** Helping people — especially when it costs you —
   quietly writes to a ledger that *returns later, in unexpected ways and at
   unexpected times.* A karmic economy that mechanically encodes the Junior value:
   you rise by lifting others. It also seeds the mentorship endgame.

5. **Warm-intro pathfinding** (from Part 7) — access to people as shortest-path
   through your social graph. Worth listing as its own headline mechanic; it's
   the most novel gating system here.

6. **Scene-crossing** (from Part 8) — reputation as a per-scene value you must
   port across worlds — is a whole progression axis no tycoon has.

7. **Seasons of life (aging + windows).** In-game time really passes; you age
   through phases; some windows close forever. Mortality-of-opportunity, à la
   BitLife, but in service of a single meaningful arc rather than randomized
   lives.

---

## Part 13 — Where AI genuinely earns its place

AI should be a *scalpel, not a coat of paint.* Four places it earns its keep, and
one place it must be kept out:

- **Living, remembering NPCs.** LLM-backed conversation for the core cast, tightly
  constrained by each character's canon, goals, and memory of your shared history.
  This is how we deliver "characters remember previous conversations" at a depth
  scripted dialogue can't reach. **Guardrail:** characters must stay *in canon* —
  the AI improvises *within* a hard character bible, never inventing lore.
- **An endless Opportunity generator.** Procedurally surface fresh, sensible
  opportunities (gigs, deals, side hustles) so the living city never runs dry
  between content drops — but authored story beats stay hand-crafted. AI fills the
  connective tissue, humans write the spine.
- **A reflective Mentor AI.** A voice (in-fiction, a mentor) that reads *your
  actual play patterns* and reflects them back — "you always choose the grind over
  the room; here's what that's costing you." Turns the game into a mirror. This is
  the education/self-awareness intersection, done as character, not menu.
- **Community safety & curation** for the creator/mentorship layers (Part 14).
- **Where AI must NOT go:** the authored emotional beats and the canon. The core
  Junior story is *written*, always. AI extends the world; it never authors the
  soul of it. A game about a *specific* person's *specific* journey cannot have its
  meaning generated on the fly.

---

## Part 14 — Designing for a decade (the platform)

The mandate is a franchise that lives ten years. That's an architecture decision
made now, not a roadmap for later. Design these as **first-class systems from day
one**, even if they ship empty:

- **Albums as playable seasons.** Every future Junior album drops as a **playable
  chapter + map expansion.** The album is the season's soundtrack, its story is the
  season's arc, its era is a new district. The music release *is* the content
  release — marketing and product become one motion. This is the killer platform
  loop no other game franchise has, because no other game *is* an artist's
  catalog.
- **Careers as parallel progression trees.** Music, media, fashion, tech, film —
  each a full path with its own skills, scenes, reputation, and endgame. New
  careers ship as new trees. A player can spend a year in one and never touch
  another.
- **The Mentorship Endgame (the whole point).** Veteran players become **mentors
  to new players** — real people, not NPCs. Junior was mentored; the game's
  highest status is to mentor. Mechanically: a Legend can "adopt" newcomers, unlock
  content by growing *them*, and earn a reputation currency only spendable on
  others. This closes the franchise's thematic loop *and* creates a self-sustaining
  social flywheel that retains both cohorts. It is the most important long-term
  system in this document.
- **Creator economy.** Late-game players *build* businesses (studios, labels,
  agencies) that *other players* can visit, work at, and be mentored in. Player
  Garages become real destinations in a shared world. UGC, but on-brand: everything
  players build is a *founder's venture*, which is exactly the fantasy.
- **Seasonal events** celebrating Junior-universe milestones (album anniversaries,
  key story dates) — recurring reasons to return that deepen canon rather than
  bolt-on holiday skins.

---

## Part 15 — Engineering the Elevation Beat (emotional design)

The feeling from Part 1 doesn't happen by accident. We manufacture it with a
repeatable ritual. Every real elevation — first paycheck, first mixtape, first
intro to someone who was untouchable, first employee, buying The Garage — fires
the same designed sequence:

1. **The struggle is visible first** (the compounding curve made it hard to get
   here).
2. **The door was visible before it opened** (the fog showed you this exact
   locked node for hours).
3. **The moment of opening is ritualized:** the world grade shifts warmer/brighter
   (borrow HYPERSTYLE ROYALE's cold→warm grade engine), a musical motif resolves,
   the Notebook writes the milestone in the player's own storyline, and an NPC who
   watched you struggle *acknowledges it.*
4. **A bigger locked door immediately becomes visible.** The ceiling becomes the
   floor. The aspiration never ends.

That four-beat ritual, fired hundreds of times across a playthrough at escalating
stakes, IS the game. Everything else is the machinery that makes each firing
feel earned.

---

## Part 16 — Challenging the assumptions (the hard questions)

The mandate said challenge every assumption. Here are the ones I'd force us to
decide, with my recommendation on each:

- **Should money even be a visible number?** *Recommendation: mostly hide it.* Show
  runway as a feeling (can I eat this week?) more than a precise balance. A visible
  money counter drags players back into accumulation-brain, which is the exact
  fantasy we're rejecting. Radical, on-thesis, worth prototyping both ways.

- **Is Roblox the right home?** *Recommendation: yes for reach and the mentorship
  social layer, but eyes open.* Roblox gives us the accessibility and the built-in
  young audience the franchise wants — but its aesthetic and systems ceilings work
  against the cinematic, emotional depth in Parts 10 and 15. The honest options:
  **(a)** build the deep single-player emotional arc as a **companion app / premium
  standalone**, and the living shared-city + mentorship layer on **Roblox**, linked
  by one account and one canon; or **(b)** go all-in on Roblox and fight its
  ceilings. Don't paper over this — it's the biggest strategic fork in the project.

- **Single-player soul vs. multiplayer world — which wins the tie?** They pull
  against each other: a remembered, authored, emotional story wants to be
  single-player; a living city with real mentors wants to be shared.
  *Recommendation:* the **emotional arc is single-player-shaped and sacred**; the
  **shared world is a layer you graduate into**, not the default first experience.
  You live your come-up mostly solo, then step into the shared city as you rise —
  which is *itself* true to the story.

- **The grind risk.** A game about "relentless execution" can become an actual
  chore. *Recommendation:* the antidote is the six-capital conversion economy
  (Part 3) — because there's never one optimal loop, "grinding" is always
  *strategizing*, and the living-city time scarcity (Part 6) keeps sessions about
  choices, not repetition. If a system reduces to "click the same button to make
  the number go up," it has failed the thesis and gets redesigned.

- **Monetization must model the philosophy.** A game about earning your way up
  *cannot* sell shortcuts up — pay-to-skip-the-grind would betray the entire
  thesis, and players would feel it. *Recommendation:* monetize **expression and
  expansion** (cosmetics, new career seasons, album chapters, creator tools),
  **never advancement.** You can buy a new *chapter of life*; you can never buy
  your way *past* one. This is both ethical and, not coincidentally, the more
  durable business.

---

## Part 17 — The North Star

One metric to rally the team, chosen to keep us honest:

> **Elevation Beats per hour that players describe as "earned."**

Not session length, not revenue, not DAU — those follow. We win when a player
puts the controller down and says *"I earned that,"* and means it. If we optimize
that number and protect it from cheapening (no bought elevations, no hollow
ones), the franchise-defining outcomes follow.

**What winning looks like in five years:** a teenager in South Florida with $40 to
their name plays this, learns three real things a founder needs, meets Leon and
Uncle Larry and Yvonne as if they were people they knew, and — this is the whole
point — *starts to believe the door could open for them too.* That belief is the
product. The game is how we deliver it at the scale of millions.

---

## Part 18 — A sane build order (so this is buildable, not just visionary)

Ambition without a first step is a mood board. Recommended phasing:

- **Vertical slice — "The First Week."** One location (**The House** → first job
  via **Uncle Larry**), the six-capital loop, the Notebook UI, the time-block day,
  one relationship track, one skill, and **one perfectly-tuned Elevation Beat**
  (first paycheck). If the first week doesn't make testers feel the thesis, no
  amount of scope fixes it. *Prove the feeling before building the world.*
- **The first chapter arc.** Add The Swamp/The Attic, a second scene, warm-intro
  pathfinding, goal authoring, the fog-of-opportunity map. Ship the compounding
  curve end-to-end through one Elevation crescendo.
- **The living city.** NPC schedules, calendar/deadlines, decay, scene-crossing,
  the reflective Mentor AI.
- **The platform layer.** Album-as-season pipeline, career trees, creator economy,
  and the mentorship endgame — the systems that turn a game into a decade.

Each phase is independently shippable and independently *lovable*. We never build
the whole iceberg before proving the tip.

---

## Part 19 — Decisions we need from you

To move from bible to spec, these are the forks only the franchise owners can
call:

1. **Platform fork** (Part 16): companion-app + Roblox split, or all-in Roblox?
2. **Money visibility** (Part 16): hide the number, or keep it?
3. **How real is the education** (Part 9): real micro-skills, or stylized
   abstractions?
4. **Canon guardrails for AI NPCs** (Part 13): how much may an AI-driven Leon
   improvise, and who owns the character bibles that constrain it?
5. **The cast & location canon:** this bible used the names and places you gave
   (Leon, Uncle Larry, Yvonne; The House, The Swamp, The Attic, Baisley Park, New
   Fame, The City, Volt, The Garage). Confirm/expand the roster and each
   location's canonical meaning so we can design their arcs 1:1.

---

*Every section above is an opinion on purpose. Tell me where I'm wrong and I'll
push the design further.*
