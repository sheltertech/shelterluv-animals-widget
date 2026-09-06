#!/usr/bin/env node
'use strict';

/**
 * Moose (aka Alex) adoption campaign generator.
 *
 * Prints a ready-to-use promotion kit to the console and writes a shareable,
 * printable HTML flyer next to this script. Run it any time — the "days at the
 * shelter" count is computed from Moose's intake date, so it stays accurate.
 *
 *   node scripts/promote-moose.js
 *
 * The generated flyer is written to scripts/moose-adoption-flyer.html.
 */

const fs = require('fs');
const path = require('path');

const moose = {
  name: 'Moose',
  alias: 'Alex',
  animalId: 'JELP-A-1821',
  breed: 'Retriever, Chocolate Labrador',
  sex: 'Male',
  age: '4Y/6M/3W',
  intakeDate: '2024-05-17', // 5/17/2024
  shelter: 'Jelly\'s Place',
  applyUrl: 'https://jellysplace.org',
  location: 'the Bay Area',
  attributes: [
    'Active Dog',
    'Affectionate',
    'Eager to Please',
    'Intelligent',
    'Obedient',
    'Playful',
    'Rides Well in Car',
    'Shy',
    'Walks Well on Leash',
    'Gentle',
    'Likes to Play in Water or Swim',
    'Adult-Only Home Preferred',
    'Requires a yard',
    'Crate Trained',
    'Special Dietary Needs',
    'Not Good with Cats',
    'Adoption Fee Reduced',
  ],
  medical: 'neutered, microchipped and up to date on his vaccines',
  bio: [
    'If you are looking for a fun, smart, athletic dog to explore the Bay Area with, then I am your guy!',
    'I am a champion fetcher and love going to the beach. One of my favorite things is riding in a car and I can barely contain my excitement when I know I am going somewhere for a new adventure. I walk well on a leash and check in with you often during the walk. People tell me I am very smart and I know lots of tricks. I think I would love doing agility, catching Frisbees or maybe doing nose work.',
    'I can be anxious and nervous when someone I don\'t know tries to pet me. I also don\'t like my feet touched, which makes clipping my nails a bit challenging. This has to do with some stuff that happened when I was younger.',
    'My ideal home is with an active, all-adult family and a yard. No kids, please — they scare me.',
  ],
};

function daysSince(isoDate) {
  const start = new Date(isoDate + 'T00:00:00Z');
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.round((today - start) / 86400000);
}

function formatIntake(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${m}/${d}/${y}`;
}

const daysAtShelter = daysSince(moose.intakeDate);

// Highlights worth leading with in marketing copy.
const highlights = [
  'Champion fetcher & beach lover',
  'Rides well in the car — always up for an adventure',
  'Walks well on a leash and checks in with you',
  'Smart, knows lots of tricks — would love agility or nose work',
  'Loves to play in water and swim',
];

const needs = [
  'An active, all-adult home (no kids, please)',
  'A home with a yard',
  'Patience with a shy pup who is nervous around new people',
  'Gentle handling around his feet (nail trims take time)',
  'A cat-free household',
];

/* ------------------------------- Text kit -------------------------------- */

function spokenScript() {
  return `MOOSE — 60-SECOND ADOPTION SCRIPT
(Read warmly. Pause where you see [ ... ].)

Moose has been waiting at ${moose.shelter} for ${daysAtShelter} days. [ ... ]
${daysAtShelter} days is a long time to wait for a family — and this boy is more than ready.

Meet Moose, also known as Alex: a ${moose.age.split('/')[0].replace('Y', '')}-year-old chocolate Labrador retriever with a heart set on adventure.

He's a champion fetcher and a total beach lover. Say the word "car" and he can barely contain himself — every ride is a brand-new adventure. He walks beautifully on a leash and checks in with you the whole way. He's smart, he knows lots of tricks, and he'd love a job: think agility, Frisbee, or nose work.

Here's the honest part. Moose can be shy and nervous when someone new reaches to pet him, and he'd rather you skip his feet for now — that takes patience and trust that had to be earned the hard way when he was young. [ ... ]

His perfect match is an active, all-adult home with a yard, and no cats. Give him that, and you get a loyal, playful, endlessly fun best friend.

Moose is ${moose.medical}. His adoption fee is even reduced.

After ${daysAtShelter} days, let's make this the one that sticks. Apply to meet Moose at ${moose.applyUrl}.`;
}

function socialPosts() {
  return `INSTAGRAM / FACEBOOK CAPTION
${daysAtShelter} days. That's how long Moose (aka Alex) has been waiting for his family at ${moose.shelter}. 💔

This ${moose.age.split('/')[0].replace('Y', '')}-year-old chocolate Lab is a champion fetcher, a beach-and-water lover, and an absolute pro in the car — every ride is a new adventure. He walks great on leash, knows tons of tricks, and would thrive doing agility or nose work. 🎾

He's shy with new people and asks for a little patience (and no touching those paws just yet). His dream home: an active, all-adult family with a yard, and no cats.

Neutered, microchipped, UTD on vaccines — and his adoption fee is reduced.

After ${daysAtShelter} days, let's find Moose his people. Apply at ${moose.applyUrl} 🐾
#AdoptDontShop #BayAreaDogs #JellysPlace #ChocolateLab #AdoptableDogs

---

X / SHORT POST
${daysAtShelter} days waiting. Meet Moose 🐾 A smart, athletic chocolate Lab who loves fetch, the beach & car rides. Shy with strangers, needs an active all-adult home w/ a yard, no cats. Fee reduced. Apply: ${moose.applyUrl}

---

EMAIL SUBJECT LINES (A/B test)
1. ${daysAtShelter} days is too long, Moose is still waiting
2. This chocolate Lab has waited ${daysAtShelter} days for you
3. Moose loves fetch, the beach & car rides — and he needs you`;
}

function textKit() {
  const line = '='.repeat(64);
  return [
    line,
    `  MOOSE (aka ${moose.alias}) — ADOPTION CAMPAIGN KIT`,
    `  ${moose.breed} · ${moose.sex} · ${moose.age} · ID ${moose.animalId}`,
    `  At ${moose.shelter} for ${daysAtShelter} days (intake ${formatIntake(moose.intakeDate)})`,
    line,
    '',
    spokenScript(),
    '',
    line,
    '',
    socialPosts(),
    '',
    line,
    `  Flyer written to: scripts/moose-adoption-flyer.html`,
    line,
  ].join('\n');
}

/* --------------------------------- Flyer --------------------------------- */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function flyerHtml() {
  const attrChips = moose.attributes
    .map((a) => `<span class="chip">${escapeHtml(a)}</span>`)
    .join('\n            ');
  const highlightItems = highlights
    .map((h) => `<li>${escapeHtml(h)}</li>`)
    .join('\n            ');
  const needItems = needs
    .map((n) => `<li>${escapeHtml(n)}</li>`)
    .join('\n            ');
  const bioParas = moose.bio
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('\n          ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Adopt Moose (aka ${escapeHtml(moose.alias)}) — ${escapeHtml(moose.shelter)}</title>
  <style>
    :root {
      --brown: #5a3921;
      --brown-light: #8a5a3b;
      --cream: #fbf5ee;
      --accent: #e07a3f;
      --ink: #2b2320;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Roboto, Arial, sans-serif;
      color: var(--ink);
      background: #ece3d8;
      padding: 24px;
    }
    .flyer {
      max-width: 820px;
      margin: 0 auto;
      background: var(--cream);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(90, 57, 33, 0.25);
    }
    .hero {
      background: linear-gradient(135deg, var(--brown), var(--brown-light));
      color: #fff;
      padding: 32px 36px;
      position: relative;
    }
    .waiting-badge {
      display: inline-block;
      background: var(--accent);
      color: #fff;
      font-weight: 700;
      letter-spacing: .3px;
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 15px;
      margin-bottom: 16px;
    }
    .hero h1 { margin: 0; font-size: 44px; line-height: 1.05; }
    .hero .alias { font-weight: 400; opacity: .85; font-size: 26px; }
    .hero .meta { margin-top: 12px; opacity: .95; font-size: 16px; }
    .body { padding: 32px 36px; }
    .tagline {
      font-size: 22px;
      font-weight: 600;
      color: var(--brown);
      margin: 0 0 20px;
    }
    .cols { display: flex; gap: 28px; flex-wrap: wrap; }
    .col { flex: 1 1 280px; }
    h2 {
      font-size: 18px;
      color: var(--accent);
      border-bottom: 2px solid #e7d7c6;
      padding-bottom: 6px;
      margin: 0 0 12px;
    }
    ul { margin: 0; padding-left: 20px; line-height: 1.6; }
    .bio p { line-height: 1.65; margin: 0 0 12px; }
    .chips { margin-top: 8px; }
    .chip {
      display: inline-block;
      background: #f0e2d3;
      color: var(--brown);
      border: 1px solid #e0cbb3;
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 13px;
      margin: 0 6px 8px 0;
    }
    .medical {
      background: #eef6ee;
      border-left: 4px solid #6fae6f;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 15px;
    }
    .cta {
      background: var(--brown);
      color: #fff;
      text-align: center;
      padding: 26px 36px;
    }
    .cta a {
      display: inline-block;
      background: var(--accent);
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      font-size: 18px;
      padding: 14px 32px;
      border-radius: 999px;
      margin-top: 10px;
    }
    .cta .id { opacity: .75; font-size: 13px; margin-top: 14px; }
    @media print {
      body { background: #fff; padding: 0; }
      .flyer { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <main class="flyer">
    <header class="hero">
      <span class="waiting-badge">Waiting ${daysAtShelter} days for a family</span>
      <h1>Adopt Moose <span class="alias">(aka ${escapeHtml(moose.alias)})</span></h1>
      <div class="meta">
        ${escapeHtml(moose.breed)} &middot; ${escapeHtml(moose.sex)} &middot; ${escapeHtml(moose.age)}
      </div>
    </header>

    <section class="body">
      <p class="tagline">Fun, smart, athletic — ready to explore ${escapeHtml(moose.location)} with you.</p>

      <div class="cols">
        <div class="col">
          <h2>What I love</h2>
          <ul>
            ${highlightItems}
          </ul>
        </div>
        <div class="col">
          <h2>My perfect home</h2>
          <ul>
            ${needItems}
          </ul>
        </div>
      </div>

      <div class="bio" style="margin-top: 24px;">
        <h2>My story</h2>
        <p><strong>Hi everyone, my name is Moose.</strong></p>
        ${bioParas}
      </div>

      <div class="medical">
        I am ${escapeHtml(moose.medical)} — and my adoption fee is reduced.
      </div>

      <div class="chips">
        <h2 style="margin-top:24px;">About me</h2>
        <div>
            ${attrChips}
        </div>
      </div>
    </section>

    <footer class="cta">
      <div>Want to meet me? Let's make day ${daysAtShelter} the last one I spend waiting.</div>
      <a href="${escapeHtml(moose.applyUrl)}">Apply to Adopt Moose &rarr;</a>
      <div class="id">${escapeHtml(moose.shelter)} &middot; Animal ID ${escapeHtml(moose.animalId)} &middot; ${escapeHtml(moose.applyUrl)}</div>
    </footer>
  </main>
</body>
</html>
`;
}

function main() {
  console.log(textKit());
  const outPath = path.join(__dirname, 'moose-adoption-flyer.html');
  fs.writeFileSync(outPath, flyerHtml(), 'utf8');
}

main();
