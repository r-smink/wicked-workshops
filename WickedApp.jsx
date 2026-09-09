"use client";

import React, { useState, useEffect, useRef } from "react";

/* ===========================================================================
   Wicked Workshops - front-end prototype

   Tien schermen op een gedeelde basis:
     1 Homepage met mega-menu          6 Blogartikel
     2 Aanbodpagina met filterpaneel    7 Inloggen en registreren
     3 Workshopdetail met boekblok      8 Profiel workshopgever
     4 Aanbiederprofiel                 9 Nieuwe workshop (wizard)
     5 Blogarchief                     10 Aanbiedersdashboard

   Opbouw van onder naar boven: tokens, stylesheet, iconen, primitieven,
   data, blokken, pagina's, router. Componentnamen volgen hoofdstuk 9.2 van
   de projectblauwdruk, zodat dit bestand uit elkaar te trekken is naar losse
   bestanden in de Next.js-app zonder te herschrijven.
   =========================================================================== */

export const tokens = {
  color: {
    brand: "#6C2BD9", brandDeep: "#5620B0", coral: "#FF5C6E", coralDeep: "#E8394C",
    ink: "#1B1630", slate: "#6E6A85", cloud: "#F1EAFB", mist: "#FBFAFE",
    line: "#E9E3F3", sun: "#FFB020", softCoral: "#FFE7EB", white: "#FFFFFF",
    ok: "#1F9D6B", warn: "#B8791A",
  },
  font: {
    display: "'Bricolage Grotesque', sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  radius: { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 },
  shadow: {
    card: "0 8px 18px rgba(30,20,60,.13)",
    float: "0 10px 26px rgba(30,20,60,.10)",
    lift: "0 18px 40px rgba(30,20,60,.16)",
  },
};

/* ===========================================================================
   Stylesheet
   =========================================================================== */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.ww { --brand:#6C2BD9; --brand-deep:#5620B0; --coral:#FF5C6E; --coral-deep:#E8394C;
  --ink:#1B1630; --slate:#6E6A85; --cloud:#F1EAFB; --mist:#FBFAFE; --line:#E9E3F3;
  --white:#fff; --sun:#FFB020; --soft-coral:#FFE7EB;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif; color:var(--ink);
  background:var(--mist); line-height:1.55; -webkit-font-smoothing:antialiased; }
.ww *, .ww *::before, .ww *::after { box-sizing:border-box; }
.ww h1,.ww h2,.ww h3,.ww h4 { font-family:'Bricolage Grotesque',sans-serif;
  letter-spacing:-0.02em; line-height:1.12; margin:0; font-weight:800; }
.ww p { margin:0; }
.ww button { font:inherit; color:inherit; border:0; background:none; cursor:pointer; }
.ww a { color:inherit; text-decoration:none; cursor:pointer; }
.ww ul { margin:0; padding:0; list-style:none; }
.ww :focus-visible { outline:2.5px solid var(--brand); outline-offset:2px; border-radius:6px; }

.ww-wrap { max-width:1240px; margin:0 auto; padding:0 20px; }
.ww-section { padding:44px 0; }
.ww-shead { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:22px; }
.ww-shead h2 { font-size:26px; }
.ww-shead a { font-size:14px; font-weight:700; color:var(--brand); display:inline-flex; align-items:center; gap:4px; }
.ww-eyebrow { font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--brand); }

/* ---------- primitieven ---------- */
.ww-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:48px; padding:0 22px; border-radius:14px; font-size:15px; font-weight:700;
  transition:transform .12s ease, box-shadow .12s ease, background .12s ease; white-space:nowrap; }
.ww-btn:active { transform:translateY(1px); }
.ww-btn--primary { background:var(--brand); color:#fff; box-shadow:0 6px 16px rgba(108,43,217,.28); }
.ww-btn--primary:hover { background:var(--brand-deep); }
.ww-btn--coral { background:var(--coral); color:#fff; box-shadow:0 6px 16px rgba(255,92,110,.3); }
.ww-btn--coral:hover { background:var(--coral-deep); }
.ww-btn--outline { background:#fff; border:1.5px solid var(--line); color:var(--ink); }
.ww-btn--outline:hover { border-color:var(--brand); color:var(--brand); }
.ww-btn--ghost { color:var(--brand); padding:0 12px; }
.ww-btn--block { width:100%; }
.ww-btn--lg { height:54px; font-size:16px; }

.ww-chip { display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 14px;
  border-radius:999px; font-size:13.5px; font-weight:600; background:#fff;
  border:1.5px solid var(--line); transition:all .12s ease; }
.ww-chip:hover { border-color:var(--brand); color:var(--brand); }
.ww-chip[data-on="true"] { background:var(--brand); border-color:var(--brand); color:#fff; }
.ww-chip--soft { background:var(--cloud); border-color:transparent; color:var(--brand-deep); }

.ww-badge { display:inline-flex; align-items:center; gap:4px; height:26px; padding:0 10px;
  border-radius:999px; font-size:11.5px; font-weight:700; letter-spacing:.01em; }
.ww-badge--top { background:var(--cloud); color:var(--brand-deep); }
.ww-badge--new { background:var(--soft-coral); color:var(--coral-deep); }
.ww-badge--full { background:#FFF3DC; color:#8A5A00; }
.ww-badge--verified { background:var(--cloud); color:var(--brand-deep); }

.ww-rating { display:inline-flex; align-items:center; gap:4px; font-size:13.5px; font-weight:700; }
.ww-rating span.ww-count { color:var(--slate); font-weight:500; }

.ww-card { background:#fff; border:1px solid var(--line); border-radius:20px; overflow:hidden; }

/* ---------- beeldplaceholder ---------- */
.ww-ph { position:relative; display:block; width:100%; background:var(--cloud); overflow:hidden; }
.ww-ph::after { content:""; position:absolute; inset:0;
  background:radial-gradient(120% 90% at 20% 10%, rgba(255,255,255,.75), transparent 55%),
             linear-gradient(135deg, rgba(108,43,217,.20), rgba(255,92,110,.22)); }
.ww-ph-i { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  z-index:2; color:rgba(27,22,48,.34); }
.ww-ph[data-tone="coral"]::after { background:radial-gradient(120% 90% at 80% 0%, rgba(255,255,255,.7), transparent 55%),
  linear-gradient(135deg, rgba(255,92,110,.28), rgba(108,43,217,.16)); }
.ww-ph[data-tone="ink"]::after { background:linear-gradient(140deg, rgba(27,22,48,.85), rgba(108,43,217,.6)); }

/* ---------- header ---------- */
.ww-header { position:sticky; top:0; z-index:60; background:rgba(255,255,255,.94);
  backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
.ww-header-in { display:flex; align-items:center; gap:26px; height:72px; }
.ww-logo { display:inline-flex; align-items:center; gap:10px; flex:none; }
.ww-logo-wm { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:19px; letter-spacing:-.02em; }
.ww-logo-wm b { color:var(--brand); font-weight:800; }
.ww-nav { display:none; align-items:center; gap:4px; flex:1; }
.ww-nav button, .ww-nav a { display:inline-flex; align-items:center; gap:5px; height:40px;
  padding:0 13px; border-radius:11px; font-size:14.5px; font-weight:600; }
.ww-nav button:hover, .ww-nav a:hover { background:var(--mist); color:var(--brand); }
.ww-nav button[data-on="true"] { background:var(--cloud); color:var(--brand-deep); }
.ww-head-acts { display:none; align-items:center; gap:10px; margin-left:auto; }
.ww-iconbtn { width:44px; height:44px; border-radius:13px; display:inline-flex;
  align-items:center; justify-content:center; background:var(--mist); }
.ww-iconbtn:hover { background:var(--cloud); color:var(--brand); }
@media (min-width:1024px) {
  .ww-nav { display:flex; }
  .ww-head-acts { display:flex; }
  .ww-mob-acts { display:none !important; }
}
.ww-mob-acts { display:flex; align-items:center; gap:8px; margin-left:auto; }

/* mega-menu */
.ww-mega { position:absolute; left:0; right:0; top:100%; background:#fff;
  border-bottom:1px solid var(--line); box-shadow:0 24px 40px rgba(30,20,60,.13);
  animation:ww-drop .16s ease; }
@keyframes ww-drop { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
.ww-mega-in { display:grid; gap:32px; padding:28px 0 34px; grid-template-columns:1fr; }
@media (min-width:900px) { .ww-mega-in { grid-template-columns:1fr 300px; } }
.ww-mega-grid { display:grid; gap:6px; grid-template-columns:repeat(2,1fr); }
@media (min-width:700px) { .ww-mega-grid { grid-template-columns:repeat(3,1fr); } }
.ww-mega-item { display:flex; align-items:center; gap:11px; padding:10px; border-radius:13px; }
.ww-mega-item:hover { background:var(--mist); }
.ww-mega-ico { width:38px; height:38px; border-radius:11px; background:var(--cloud);
  color:var(--brand); display:flex; align-items:center; justify-content:center; flex:none; }
.ww-mega-item strong { display:block; font-size:14px; font-weight:700; }
.ww-mega-item span { font-size:12px; color:var(--slate); }
.ww-mega-side { border-left:0; padding-left:0; }
@media (min-width:900px) { .ww-mega-side { border-left:1px solid var(--line); padding-left:32px; } }
.ww-occ-list { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
.ww-occ { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:11px; font-size:13.5px; font-weight:600; }
.ww-occ:hover { background:var(--cloud); color:var(--brand-deep); }
.ww-surprise { margin-top:18px; padding:16px; border-radius:16px; background:var(--ink); color:#fff; }
.ww-surprise p { font-size:13px; color:rgba(255,255,255,.72); margin-top:4px; }

/* ---------- hero ---------- */
.ww-hero { position:relative; margin:14px 0 0; background:var(--cloud); border-radius:28px;
  padding:52px 20px 40px; text-align:center; overflow:hidden; }
@media (min-width:768px) { .ww-hero { padding:74px 40px 56px; } }
.ww-hero h1 { font-size:clamp(32px,6vw,58px); position:relative; z-index:2; }
.ww-hero > p { color:var(--slate); font-size:16px; margin:16px auto 0; max-width:460px; position:relative; z-index:2; }
.ww-hl { position:relative; display:inline-block; color:var(--brand); white-space:nowrap; }
.ww-hl svg { position:absolute; left:0; right:0; bottom:-10px; width:100%; height:14px; color:var(--coral); }
.ww-sticker { position:absolute; width:56px; height:56px; border-radius:17px; display:flex;
  align-items:center; justify-content:center; background:#fff; box-shadow:0 8px 18px rgba(30,20,60,.13); }
.ww-st1 { top:26px; left:6%; transform:rotate(-11deg); color:var(--coral-deep); background:var(--soft-coral); }
.ww-st2 { top:34px; right:7%; transform:rotate(10deg); color:var(--brand); }
.ww-st3 { display:none; bottom:96px; left:11%; transform:rotate(7deg); color:var(--brand-deep); }
@media (min-width:1024px) { .ww-st3 { display:flex; } }
.ww-ratepill { position:absolute; top:120px; right:9%; background:#fff; border-radius:999px;
  padding:8px 14px; font-size:13px; font-weight:700; box-shadow:0 8px 18px rgba(30,20,60,.13);
  transform:rotate(6deg); display:none; align-items:center; gap:5px; }
@media (min-width:768px) { .ww-ratepill { display:flex; } }

.ww-search { position:relative; z-index:3; margin:26px auto 0; max-width:660px; display:flex;
  align-items:center; gap:10px; background:#fff; border:1.5px solid var(--line);
  border-radius:18px; padding:8px 8px 8px 18px; box-shadow:var(--shadow-float,0 10px 26px rgba(30,20,60,.10)); }
.ww-search input { flex:1; border:0; outline:0; font-size:15.5px; font-weight:500; min-width:0;
  background:transparent; color:var(--ink); height:44px; }
.ww-search input::placeholder { color:var(--slate); }
.ww-search-go { width:46px; height:46px; border-radius:13px; background:var(--brand); color:#fff;
  display:flex; align-items:center; justify-content:center; flex:none; }
.ww-search-go:hover { background:var(--brand-deep); }
.ww-quick { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-top:18px; position:relative; z-index:2; }

/* ---------- rasters ---------- */
.ww-grid { display:grid; gap:18px; grid-template-columns:1fr; }
@media (min-width:560px) { .ww-grid { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1024px) { .ww-grid { grid-template-columns:repeat(3,1fr); } }
@media (min-width:1240px) { .ww-grid--4 { grid-template-columns:repeat(4,1fr); } }
.ww-grid--cats { grid-template-columns:repeat(2,1fr); gap:12px; }
@media (min-width:700px) { .ww-grid--cats { grid-template-columns:repeat(4,1fr); } }
@media (min-width:1100px) { .ww-grid--cats { grid-template-columns:repeat(6,1fr); } }

.ww-cat { display:flex; flex-direction:column; gap:10px; padding:16px 14px; border-radius:18px;
  background:#fff; border:1px solid var(--line); transition:all .14s ease; }
.ww-cat:hover { border-color:var(--brand); transform:translateY(-2px); box-shadow:var(--shadow-card,0 8px 18px rgba(30,20,60,.13)); }
.ww-cat-ico { width:42px; height:42px; border-radius:13px; background:var(--cloud); color:var(--brand);
  display:flex; align-items:center; justify-content:center; }
.ww-cat strong { font-size:14px; font-weight:700; line-height:1.25; }
.ww-cat span { font-size:12px; color:var(--slate); }

/* ---------- workshopkaart ---------- */
.ww-wcard { display:flex; flex-direction:column; background:#fff; border:1px solid var(--line);
  border-radius:20px; overflow:hidden; transition:transform .14s ease, box-shadow .14s ease; text-align:left; }
.ww-wcard:hover { transform:translateY(-3px); box-shadow:0 18px 40px rgba(30,20,60,.16); }
.ww-wcard-img { position:relative; aspect-ratio:4/3; }
.ww-wcard-badge { position:absolute; top:12px; left:12px; z-index:3; }
.ww-wcard-fav { position:absolute; top:10px; right:10px; z-index:3; width:36px; height:36px;
  border-radius:999px; background:rgba(255,255,255,.92); display:flex; align-items:center;
  justify-content:center; color:var(--ink); }
.ww-wcard-fav:hover { color:var(--coral); }
.ww-wcard-body { padding:14px 15px 16px; display:flex; flex-direction:column; gap:7px; flex:1; }
.ww-wcard-body h3 { font-size:16.5px; font-weight:700; line-height:1.25; }
.ww-meta { font-size:13px; color:var(--slate); }
.ww-wcard-foot { display:flex; align-items:flex-end; justify-content:space-between; gap:10px; margin-top:auto; padding-top:8px; }
.ww-price b { font-family:'Bricolage Grotesque',sans-serif; font-size:19px; font-weight:800; }
.ww-price span { font-size:12px; color:var(--slate); display:block; }

/* ---------- how it works ---------- */
.ww-steps { display:grid; gap:16px; grid-template-columns:1fr; }
@media (min-width:768px) { .ww-steps { grid-template-columns:repeat(3,1fr); } }
.ww-step { background:#fff; border:1px solid var(--line); border-radius:20px; padding:24px; }
.ww-step-n { width:40px; height:40px; border-radius:13px; background:var(--brand); color:#fff;
  font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:18px;
  display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.ww-step h3 { font-size:19px; margin-bottom:7px; }
.ww-step p { font-size:14.5px; color:var(--slate); }

/* ---------- banden ---------- */
.ww-band { border-radius:26px; padding:34px 26px; }
@media (min-width:768px) { .ww-band { padding:44px 42px; } }
.ww-band--ink { background:var(--ink); color:#fff; }
.ww-band--cloud { background:var(--cloud); }
.ww-band--coral { background:var(--soft-coral); }
.ww-band h2 { font-size:clamp(24px,3.4vw,34px); }
.ww-band p { margin-top:10px; font-size:15.5px; opacity:.82; max-width:520px; }
.ww-band-split { display:grid; gap:26px; align-items:center; grid-template-columns:1fr; }
@media (min-width:900px) { .ww-band-split { grid-template-columns:1.2fr .8fr; } }
.ww-ticks { display:flex; flex-wrap:wrap; gap:16px; margin-top:20px; font-size:14px; font-weight:600; }
.ww-ticks li { display:flex; align-items:center; gap:7px; }

.ww-quotes { display:grid; gap:16px; grid-template-columns:1fr; }
@media (min-width:768px) { .ww-quotes { grid-template-columns:repeat(3,1fr); } }
.ww-quote { background:#fff; border:1px solid var(--line); border-radius:20px; padding:22px; }
.ww-quote p { font-size:15px; margin:12px 0 16px; }
.ww-who { display:flex; align-items:center; gap:11px; }
.ww-av { width:38px; height:38px; border-radius:999px; background:var(--cloud); color:var(--brand-deep);
  display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex:none; }
.ww-who strong { font-size:14px; display:block; }
.ww-who span { font-size:12.5px; color:var(--slate); }

/* ---------- footer ---------- */
.ww-footer { background:#fff; border-top:1px solid var(--line); margin-top:40px; padding:48px 0 110px; }
@media (min-width:1024px) { .ww-footer { padding-bottom:48px; } }
.ww-foot-grid { display:grid; gap:30px; grid-template-columns:1fr; }
@media (min-width:768px) { .ww-foot-grid { grid-template-columns:1.6fr 1fr 1fr 1fr; } }
.ww-foot-grid h4 { font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; font-weight:800;
  letter-spacing:.04em; text-transform:uppercase; color:var(--slate); margin-bottom:12px; }
.ww-foot-grid li { margin-bottom:9px; font-size:14.5px; }
.ww-foot-grid li a:hover { color:var(--brand); }
.ww-foot-bot { margin-top:34px; padding-top:20px; border-top:1px solid var(--line);
  font-size:13px; color:var(--slate); display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; }

/* ---------- bottom nav ---------- */
.ww-bottom { position:fixed; left:0; right:0; bottom:0; z-index:70; background:#fff;
  border-top:1px solid var(--line); display:flex; padding:8px 4px calc(8px + env(safe-area-inset-bottom)); }
@media (min-width:1024px) { .ww-bottom { display:none; } }
.ww-bottom button { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
  font-size:10.5px; font-weight:700; color:var(--slate); padding:6px 0; }
.ww-bottom button[data-on="true"] { color:var(--brand); }

/* ---------- aanbodpagina ---------- */
.ww-crumbs { display:flex; flex-wrap:wrap; align-items:center; gap:7px; font-size:13px;
  color:var(--slate); padding:18px 0 0; }
.ww-crumbs a:hover { color:var(--brand); }
.ww-filterbar { position:sticky; top:72px; z-index:40; background:var(--mist);
  border-bottom:1px solid var(--line); padding:12px 0; }
.ww-filterbar-in { display:flex; align-items:center; gap:9px; overflow-x:auto; scrollbar-width:none; }
.ww-filterbar-in::-webkit-scrollbar { display:none; }
.ww-fbtn { display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 16px; flex:none;
  border-radius:13px; background:#fff; border:1.5px solid var(--ink); font-size:14px; font-weight:700; }
.ww-fcount { min-width:22px; height:22px; padding:0 6px; border-radius:999px; background:var(--brand);
  color:#fff; font-size:12px; display:inline-flex; align-items:center; justify-content:center; }
.ww-results-head { display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between;
  gap:14px; padding:26px 0 18px; }
.ww-results-head h1 { font-size:clamp(26px,4vw,38px); }
.ww-results-head p { color:var(--slate); font-size:15px; margin-top:8px; max-width:640px; }
.ww-listing { display:grid; gap:24px; grid-template-columns:1fr; align-items:start; }
@media (min-width:1100px) { .ww-listing { grid-template-columns:1fr 400px; } }
.ww-map { display:none; position:sticky; top:140px; height:calc(100vh - 190px); border-radius:22px;
  overflow:hidden; border:1px solid var(--line); background:
  linear-gradient(0deg, rgba(108,43,217,.05), rgba(108,43,217,.05)),
  repeating-linear-gradient(0deg,#fff,#fff 34px,#F4F1FA 34px,#F4F1FA 35px),
  repeating-linear-gradient(90deg,#fff,#fff 34px,#F4F1FA 34px,#F4F1FA 35px); }
@media (min-width:1100px) { .ww-map { display:block; } }
.ww-map-pin { position:absolute; transform:translate(-50%,-50%); background:#fff; color:var(--ink);
  border:1.5px solid var(--ink); border-radius:999px; padding:6px 12px; font-size:13px; font-weight:800;
  box-shadow:0 6px 14px rgba(30,20,60,.16); }
.ww-map-pin[data-on="true"] { background:var(--ink); color:#fff; }
.ww-seo-text { padding:38px 0; border-top:1px solid var(--line); margin-top:30px; }
.ww-seo-text h2 { font-size:24px; margin-bottom:14px; }
.ww-seo-text p { color:var(--slate); font-size:15px; margin-bottom:12px; max-width:760px; }
.ww-links { display:flex; flex-wrap:wrap; gap:9px; margin-top:8px; }

/* filterpaneel */
.ww-overlay { position:fixed; inset:0; z-index:90; background:rgba(27,22,48,.42); animation:ww-fade .16s ease; }
@keyframes ww-fade { from { opacity:0; } to { opacity:1; } }
.ww-drawer { position:fixed; z-index:95; background:#fff; display:flex; flex-direction:column;
  inset:auto 0 0 0; max-height:88vh; border-radius:24px 24px 0 0; animation:ww-up .2s ease; }
@keyframes ww-up { from { transform:translateY(24px); opacity:.6; } to { transform:none; opacity:1; } }
@media (min-width:768px) { .ww-drawer { inset:0 0 0 auto; width:440px; max-height:none;
  border-radius:24px 0 0 24px; animation:ww-side .2s ease; } }
@keyframes ww-side { from { transform:translateX(24px); opacity:.6; } to { transform:none; opacity:1; } }
.ww-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:18px 20px; border-bottom:1px solid var(--line); }
.ww-drawer-head h3 { font-size:19px; }
.ww-drawer-body { overflow-y:auto; padding:6px 20px 20px; flex:1; }
.ww-fgroup { padding:18px 0; border-bottom:1px solid var(--line); }
.ww-fgroup:last-child { border-bottom:0; }
.ww-fgroup h4 { font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:800; margin-bottom:11px; }
.ww-fopts { display:flex; flex-wrap:wrap; gap:8px; }
.ww-drawer-foot { display:flex; align-items:center; gap:12px; padding:14px 20px;
  border-top:1px solid var(--line); background:#fff; }
.ww-range { display:flex; align-items:center; gap:12px; font-size:13.5px; font-weight:700; color:var(--slate); }
.ww-range input { flex:1; accent-color:var(--brand); }

/* ---------- workshopdetail ---------- */
.ww-gallery { display:grid; gap:8px; grid-template-columns:1fr; margin-top:18px; }
@media (min-width:768px) { .ww-gallery { grid-template-columns:2fr 1fr 1fr; grid-template-rows:1fr 1fr; height:420px; } }
.ww-gallery > *:first-child { grid-row:span 2; }
.ww-gallery .ww-ph { height:100%; min-height:220px; border-radius:16px; }
.ww-gallery-btn { position:absolute; right:14px; bottom:14px; z-index:3; height:38px; padding:0 15px;
  border-radius:11px; background:rgba(255,255,255,.94); font-size:13.5px; font-weight:700;
  display:inline-flex; align-items:center; gap:7px; }
.ww-detail { display:grid; gap:34px; grid-template-columns:1fr; align-items:start; padding:34px 0 0; }
@media (min-width:1024px) { .ww-detail { grid-template-columns:1fr 384px; gap:48px; } }
.ww-facts { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; padding:22px 0;
  border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
@media (min-width:640px) { .ww-facts { grid-template-columns:repeat(4,1fr); } }
.ww-fact { display:flex; align-items:center; gap:11px; }
.ww-fact-ico { width:40px; height:40px; border-radius:12px; background:var(--cloud); color:var(--brand);
  display:flex; align-items:center; justify-content:center; flex:none; }
.ww-fact strong { display:block; font-size:14.5px; font-weight:700; }
.ww-fact span { font-size:12.5px; color:var(--slate); }
.ww-block { padding:28px 0; border-bottom:1px solid var(--line); }
.ww-block h2 { font-size:23px; margin-bottom:14px; }
.ww-block p { color:var(--ink); font-size:15.5px; margin-bottom:12px; }
.ww-pull { border-left:3px solid var(--coral); padding:4px 0 4px 16px; margin:18px 0 4px;
  font-size:15px; color:var(--slate); }
.ww-inc { display:grid; gap:11px; grid-template-columns:1fr; }
@media (min-width:640px) { .ww-inc { grid-template-columns:repeat(2,1fr); } }
.ww-inc li { display:flex; align-items:flex-start; gap:10px; font-size:15px; }
.ww-inc-ico { color:var(--brand); flex:none; margin-top:2px; }
.ww-provider { display:flex; gap:16px; align-items:flex-start; background:#fff; border:1px solid var(--line);
  border-radius:20px; padding:20px; }
.ww-provider .ww-av { width:56px; height:56px; font-size:18px; }
.ww-scores { display:grid; gap:12px; grid-template-columns:1fr; margin:18px 0 24px; }
@media (min-width:640px) { .ww-scores { grid-template-columns:repeat(3,1fr); } }
.ww-score { display:flex; align-items:center; justify-content:space-between; gap:12px;
  background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px 16px; font-size:14px; font-weight:700; }
.ww-bar { height:6px; border-radius:999px; background:var(--line); flex:1; margin:0 12px; overflow:hidden; }
.ww-bar i { display:block; height:100%; background:var(--brand); border-radius:999px; }
.ww-reviews { display:grid; gap:16px; grid-template-columns:1fr; }
@media (min-width:768px) { .ww-reviews { grid-template-columns:repeat(2,1fr); } }
.ww-review { background:#fff; border:1px solid var(--line); border-radius:18px; padding:18px; }
.ww-review p { font-size:14.5px; margin:10px 0 14px; }
.ww-practical { display:grid; gap:14px; grid-template-columns:1fr; }
@media (min-width:768px) { .ww-practical { grid-template-columns:repeat(3,1fr); } }
.ww-prac { background:#fff; border:1px solid var(--line); border-radius:18px; padding:18px; }
.ww-prac strong { display:block; font-size:14.5px; margin:10px 0 5px; }
.ww-prac p { font-size:13.5px; color:var(--slate); }
.ww-faq-item { border-bottom:1px solid var(--line); }
.ww-faq-q { width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:18px 0; text-align:left; font-size:16px; font-weight:700; }
.ww-faq-a { padding:0 0 18px; font-size:15px; color:var(--slate); max-width:720px; }

/* boekblok */
.ww-booking { position:sticky; top:96px; background:#fff; border:1px solid var(--line);
  border-radius:22px; padding:22px; box-shadow:0 18px 40px rgba(30,20,60,.10); }
.ww-book-price { display:flex; align-items:flex-end; justify-content:space-between; gap:12px;
  padding-bottom:16px; border-bottom:1px solid var(--line); }
.ww-book-price b { font-family:'Bricolage Grotesque',sans-serif; font-size:30px; font-weight:800; }
.ww-book-price span { font-size:13px; color:var(--slate); }
.ww-slot { width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:13px 15px; border-radius:14px; border:1.5px solid var(--line); background:#fff;
  text-align:left; margin-bottom:9px; transition:all .12s ease; }
.ww-slot:hover { border-color:var(--brand); }
.ww-slot[data-on="true"] { border-color:var(--brand); background:var(--cloud); }
.ww-slot strong { font-size:14.5px; display:block; }
.ww-slot span { font-size:12.5px; color:var(--slate); }
.ww-seats { font-size:12px; font-weight:700; color:var(--coral-deep); white-space:nowrap; }
.ww-seats[data-low="false"] { color:var(--slate); }
.ww-stepper { display:flex; align-items:center; justify-content:space-between; gap:12px;
  border:1.5px solid var(--line); border-radius:14px; padding:9px 12px; margin:6px 0 16px; }
.ww-stepper-btn { width:36px; height:36px; border-radius:11px; background:var(--mist);
  display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; }
.ww-stepper-btn:hover { background:var(--cloud); color:var(--brand); }
.ww-stepper-btn:disabled { opacity:.4; cursor:not-allowed; }
.ww-trust { margin-top:16px; display:grid; gap:9px; }
.ww-trust li { display:flex; align-items:center; gap:9px; font-size:13.5px; color:var(--slate); }
.ww-trust svg { color:var(--brand); flex:none; }
.ww-sidecard { background:#fff; border:1px solid var(--line); border-radius:20px; padding:20px; margin-top:16px; }
.ww-sidecard h3 { font-size:17px; margin-bottom:6px; }
.ww-sidecard p { font-size:13.5px; color:var(--slate); margin-bottom:14px; }

/* mobiele boekbalk */
.ww-mobbar { position:fixed; left:0; right:0; bottom:0; z-index:80; background:#fff;
  border-top:1px solid var(--line); padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  display:flex; align-items:center; gap:14px; box-shadow:0 -8px 24px rgba(30,20,60,.10); }
@media (min-width:1024px) { .ww-mobbar { display:none; } }

.ww-note { max-width:1240px; margin:0 auto; padding:14px 20px 0; font-size:12.5px; color:var(--slate); }
.ww-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }

.ww-btn--quiet { background:var(--mist); }
.ww-btn--quiet:hover { background:var(--cloud); color:var(--brand); }
.ww-btn--sm { height:38px; font-size:13.5px; padding:0 14px; border-radius:11px; }
.ww-btn:disabled { opacity:.45; cursor:not-allowed; }
.ww-badge--live { background:#E4F6EE; color:var(--ok); }
.ww-badge--draft { background:var(--mist); color:var(--slate); }
.ww-badge--paused { background:#FFF3DC; color:var(--warn); }

/* velden */
.ww-field { display:block; margin-bottom:16px; }
.ww-field > span { display:block; font-size:13.5px; font-weight:700; margin-bottom:7px; }
.ww-input, .ww-select, .ww-textarea { width:100%; background:#fff; border:1.5px solid var(--line);
  border-radius:13px; padding:0 14px; height:50px; font-size:15px; outline:0; transition:border-color .12s ease; }
.ww-textarea { height:auto; padding:13px 14px; min-height:96px; resize:vertical; line-height:1.5; }
.ww-input:focus, .ww-select:focus, .ww-textarea:focus { border-color:var(--brand); }
.ww-input::placeholder, .ww-textarea::placeholder { color:var(--slate); }
.ww-hint { font-size:12.5px; color:var(--slate); margin-top:6px; }
.ww-row { display:grid; gap:14px; grid-template-columns:1fr; }
@media (min-width:600px) { .ww-row--2 { grid-template-columns:1fr 1fr; } }
.ww-check { display:flex; align-items:flex-start; gap:10px; font-size:14px; }
.ww-check input { margin-top:3px; accent-color:var(--brand); width:17px; height:17px; }


/* ---------- aanbiederprofiel ---------- */
.ww-phero { display:grid; gap:22px; grid-template-columns:1fr; align-items:center;
  background:var(--cloud); border-radius:26px; padding:28px; margin-top:16px; }
@media (min-width:820px) { .ww-phero { grid-template-columns:auto 1fr auto; padding:34px 38px; } }
.ww-phero h1 { font-size:clamp(28px,4vw,40px); }
.ww-phero-sub { font-size:15px; color:var(--slate); margin-top:8px; }
.ww-pstats { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:22px; }
@media (min-width:700px) { .ww-pstats { grid-template-columns:repeat(4,1fr); } }
.ww-pstat { background:#fff; border:1px solid var(--line); border-radius:16px; padding:16px; }
.ww-pstat b { font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:800;
  display:flex; align-items:center; gap:5px; }
.ww-pstat span { font-size:12.5px; color:var(--slate); }
.ww-two { display:grid; gap:34px; grid-template-columns:1fr; align-items:start; padding-top:34px; }
@media (min-width:1024px) { .ww-two { grid-template-columns:1fr 356px; gap:44px; } }
.ww-facts-list { display:grid; gap:11px; margin-top:6px; }
.ww-facts-list li { display:flex; align-items:flex-start; gap:11px; font-size:15px; }
.ww-facts-list svg { color:var(--brand); flex:none; margin-top:2px; }
.ww-strip { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
@media (min-width:640px) { .ww-strip { grid-template-columns:repeat(4,1fr); } }
.ww-strip .ww-ph { aspect-ratio:1/1; border-radius:14px; }
.ww-strip-more { position:absolute; inset:0; z-index:3; display:flex; align-items:center;
  justify-content:center; background:rgba(27,22,48,.55); color:#fff; font-weight:800; font-size:17px; }
.ww-wrow { display:flex; gap:16px; align-items:center; background:#fff; border:1px solid var(--line);
  border-radius:18px; padding:14px; margin-bottom:12px; }
.ww-wrow .ww-ph { width:96px; height:78px; border-radius:13px; flex:none; }
.ww-wrow h3 { font-size:16.5px; margin-bottom:5px; }
.ww-wrow-price { text-align:right; flex:none; }
.ww-wrow-price b { font-family:'Bricolage Grotesque',sans-serif; font-size:19px; font-weight:800; display:block; }
.ww-wrow-price span { font-size:12px; color:var(--slate); }
@media (max-width:620px) { .ww-wrow { flex-wrap:wrap; } .ww-wrow-price { text-align:left; } }
.ww-next { display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:700;
  color:var(--brand-deep); background:var(--cloud); border-radius:999px; padding:4px 10px; margin-top:7px; }
.ww-reviews { display:grid; gap:16px; grid-template-columns:1fr; }
@media (min-width:768px) { .ww-reviews { grid-template-columns:repeat(2,1fr); } }
.ww-review { background:#fff; border:1px solid var(--line); border-radius:18px; padding:18px; }
.ww-review p { font-size:14.5px; margin:10px 0 14px; }
.ww-who { display:flex; align-items:center; gap:11px; }
.ww-who strong { font-size:14px; display:block; }
.ww-who span { font-size:12.5px; color:var(--slate); }
.ww-links { display:flex; flex-wrap:wrap; gap:9px; }
.ww-trust { display:grid; gap:9px; }
.ww-trust li { display:flex; align-items:center; gap:9px; font-size:13.5px; color:var(--slate); }
.ww-trust svg { color:var(--brand); flex:none; }

/* ---------- artikel ---------- */
.ww-art { display:grid; gap:38px; grid-template-columns:1fr; align-items:start; padding-top:22px; }
@media (min-width:1024px) { .ww-art { grid-template-columns:minmax(0,1fr) 330px; gap:52px; } }
.ww-art h1 { font-size:clamp(30px,4.6vw,46px); margin:14px 0 18px; }
.ww-byline { display:flex; flex-wrap:wrap; align-items:center; gap:12px; font-size:13.5px; color:var(--slate); }
.ww-answer { background:var(--cloud); border-radius:20px; padding:22px 24px; margin:26px 0 30px; }
.ww-answer h2 { font-size:15px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800;
  letter-spacing:.04em; text-transform:uppercase; color:var(--brand); margin-bottom:9px; }
.ww-answer p { font-size:16.5px; font-weight:500; }
.ww-prose p { font-size:16.5px; margin-bottom:18px; }
.ww-prose h2 { font-size:26px; margin:34px 0 14px; scroll-margin-top:100px; }
.ww-prose a { color:var(--brand); font-weight:700; text-decoration:underline; text-underline-offset:3px; }
.ww-prose ul { margin:0 0 18px; display:grid; gap:10px; }
.ww-prose ul li { display:flex; gap:11px; font-size:16px; }
.ww-prose ul svg { color:var(--brand); flex:none; margin-top:3px; }
.ww-tip { border-left:3px solid var(--coral); background:var(--soft-coral); border-radius:0 16px 16px 0;
  padding:16px 20px; margin:0 0 20px; font-size:15.5px; }
.ww-toc { position:sticky; top:96px; background:#fff; border:1px solid var(--line);
  border-radius:20px; padding:20px; margin-bottom:16px; }
.ww-toc h3 { font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800;
  letter-spacing:.05em; text-transform:uppercase; color:var(--slate); margin-bottom:12px; }
.ww-toc a { display:flex; gap:10px; padding:8px 0; font-size:14px; font-weight:600; }
.ww-toc a:hover { color:var(--brand); }
.ww-toc i { color:var(--brand); font-style:normal; font-weight:800; }
.ww-mini { display:flex; gap:12px; align-items:center; padding:11px 0; }
.ww-mini .ww-ph { width:64px; height:56px; border-radius:12px; flex:none; }
.ww-mini strong { font-size:14.5px; display:block; line-height:1.3; }
.ww-mini span { font-size:12.5px; color:var(--slate); }
.ww-author { display:flex; gap:16px; align-items:flex-start; background:#fff; border:1px solid var(--line);
  border-radius:20px; padding:20px; margin:34px 0 20px; }
.ww-news { background:var(--ink); color:#fff; border-radius:22px; padding:26px; }
.ww-news p { font-size:14.5px; opacity:.78; margin:8px 0 18px; }
.ww-news-form { display:flex; gap:10px; flex-wrap:wrap; }
.ww-news-form input { flex:1; min-width:180px; height:50px; border-radius:13px; border:0;
  padding:0 15px; font-size:15px; }
.ww-faq-item { border-bottom:1px solid var(--line); }
.ww-faq-q { width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:17px 0; text-align:left; font-size:16.5px; font-weight:700; }
.ww-faq-a { padding:0 0 18px; font-size:15.5px; color:var(--slate); }

/* ---------- auth ---------- */
.ww-auth { min-height:100vh; display:grid; grid-template-columns:1fr; }
@media (min-width:960px) { .ww-auth { grid-template-columns:1fr 1fr; } }
.ww-auth-side { display:none; background:var(--brand); color:#fff; padding:56px 48px;
  flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; }
@media (min-width:960px) { .ww-auth-side { display:flex; } }
.ww-auth-side h2 { font-size:38px; max-width:420px; position:relative; z-index:2; }
.ww-auth-side p { font-size:16px; opacity:.8; margin-top:14px; max-width:400px; position:relative; z-index:2; }
.ww-auth-blob { position:absolute; border-radius:999px; filter:blur(2px); }
.ww-auth-quotes { display:grid; gap:14px; position:relative; z-index:2; }
.ww-auth-quotes li { display:flex; gap:11px; align-items:flex-start; font-size:15px; }
.ww-auth-main { display:flex; align-items:center; justify-content:center; padding:32px 20px 56px; background:var(--mist); }
.ww-auth-box { width:100%; max-width:460px; }
.ww-tabs { display:flex; gap:6px; background:var(--cloud); border-radius:14px; padding:5px; margin-bottom:26px; }
.ww-tabs button { flex:1; height:42px; border-radius:11px; font-size:14px; font-weight:700; color:var(--brand-deep); }
.ww-tabs button[data-on="true"] { background:#fff; box-shadow:0 3px 10px rgba(30,20,60,.1); color:var(--ink); }
.ww-social { display:grid; gap:10px; margin-bottom:20px; }
.ww-or { display:flex; align-items:center; gap:14px; color:var(--slate); font-size:12.5px;
  font-weight:700; margin:20px 0; }
.ww-or::before, .ww-or::after { content:""; height:1px; background:var(--line); flex:1; }
.ww-steps-bar { display:flex; gap:8px; margin-bottom:26px; }
.ww-steps-bar i { flex:1; height:6px; border-radius:999px; background:var(--line); }
.ww-steps-bar i[data-on="true"] { background:var(--brand); }
.ww-done { text-align:center; padding:20px 0; }
.ww-done-ico { width:72px; height:72px; border-radius:999px; background:var(--cloud); color:var(--brand);
  display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }

/* ---------- dashboard ---------- */
.ww-dash { display:grid; grid-template-columns:1fr; min-height:100vh; background:var(--mist); }
@media (min-width:1024px) { .ww-dash { grid-template-columns:252px 1fr; } }
.ww-dash-side { background:#fff; border-right:1px solid var(--line); padding:18px 14px;
  display:flex; flex-direction:column; gap:6px; }
@media (max-width:1023px) { .ww-dash-side { border-right:0; border-bottom:1px solid var(--line);
  flex-direction:row; overflow-x:auto; align-items:center; gap:8px; position:sticky; top:0; z-index:50; } }
.ww-dash-side .ww-logo { padding:6px 8px 18px; }
@media (max-width:1023px) { .ww-dash-side .ww-logo { padding:0 8px 0 4px; } }
.ww-dnav { display:flex; align-items:center; gap:11px; height:44px; padding:0 12px; border-radius:12px;
  font-size:14.5px; font-weight:600; white-space:nowrap; flex:none; }
.ww-dnav:hover { background:var(--mist); }
.ww-dnav[data-on="true"] { background:var(--cloud); color:var(--brand-deep); font-weight:700; }
.ww-dnav-dot { margin-left:auto; min-width:20px; height:20px; padding:0 6px; border-radius:999px;
  background:var(--coral); color:#fff; font-size:11px; font-weight:800; display:inline-flex;
  align-items:center; justify-content:center; }
.ww-dash-me { margin-top:auto; display:flex; align-items:center; gap:10px; padding:12px;
  border-top:1px solid var(--line); }
@media (max-width:1023px) { .ww-dash-me { display:none; } }
.ww-dash-main { padding:22px 20px 64px; max-width:1120px; width:100%; }
@media (min-width:1024px) { .ww-dash-main { padding:30px 34px 60px; } }
.ww-dash-head { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between;
  gap:14px; margin-bottom:24px; }
.ww-dash-head h1 { font-size:28px; }
.ww-dash-head p { font-size:14.5px; color:var(--slate); margin-top:5px; }
.ww-kpis { display:grid; gap:14px; grid-template-columns:repeat(2,1fr); margin-bottom:22px; }
@media (min-width:900px) { .ww-kpis { grid-template-columns:repeat(4,1fr); } }
.ww-kpi { background:#fff; border:1px solid var(--line); border-radius:18px; padding:18px; }
.ww-kpi span { font-size:12.5px; color:var(--slate); display:block; }
.ww-kpi b { font-family:'Bricolage Grotesque',sans-serif; font-size:26px; font-weight:800;
  display:block; margin:7px 0 4px; }
.ww-kpi em { font-style:normal; font-size:12.5px; font-weight:700; color:var(--ok); }
.ww-kpi em[data-dir="down"] { color:var(--coral-deep); }
.ww-panel { background:#fff; border:1px solid var(--line); border-radius:20px; margin-bottom:18px; overflow:hidden; }
.ww-panel-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:17px 20px; border-bottom:1px solid var(--line); }
.ww-panel-head h2 { font-size:18px; }
.ww-panel-body { padding:6px 20px 16px; }
.ww-tablewrap { overflow-x:auto; }
.ww-table { width:100%; border-collapse:collapse; min-width:560px; }
.ww-table th { text-align:left; font-size:12px; font-weight:800; letter-spacing:.04em;
  text-transform:uppercase; color:var(--slate); padding:12px 20px; border-bottom:1px solid var(--line); }
.ww-table td { padding:14px 20px; border-bottom:1px solid var(--line); font-size:14.5px; vertical-align:middle; }
.ww-table tr:last-child td { border-bottom:0; }
.ww-table tbody tr:hover { background:var(--mist); }
.ww-cap { display:flex; align-items:center; gap:10px; min-width:120px; }
.ww-cap-bar { flex:1; height:7px; border-radius:999px; background:var(--line); overflow:hidden; min-width:60px; }
.ww-cap-bar i { display:block; height:100%; background:var(--brand); }
.ww-cap-bar i[data-full="true"] { background:var(--coral); }
.ww-todo { display:flex; align-items:center; gap:13px; padding:14px 0; border-bottom:1px solid var(--line); }
.ww-todo:last-child { border-bottom:0; }
.ww-todo-ico { width:38px; height:38px; border-radius:12px; display:flex; align-items:center;
  justify-content:center; flex:none; background:var(--cloud); color:var(--brand); }
.ww-todo-ico[data-tone="warn"] { background:#FFF3DC; color:var(--warn); }
.ww-todo strong { display:block; font-size:14.5px; }
.ww-todo span { font-size:13px; color:var(--slate); }
.ww-empty { text-align:center; padding:34px 20px; }
.ww-empty h3 { font-size:19px; margin-bottom:8px; }
.ww-empty p { font-size:14.5px; color:var(--slate); margin-bottom:18px; }
.ww-reply { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
.ww-reply .ww-input { flex:1; min-width:200px; height:44px; }
.ww-payout { display:grid; gap:14px; grid-template-columns:1fr; }
@media (min-width:820px) { .ww-payout { grid-template-columns:1.4fr 1fr; } }

/* prototypebalk, hoort niet bij het product */
.ww-proto { background:var(--ink); color:#fff; }
.ww-proto-in { display:flex; align-items:center; gap:8px; padding:9px 20px; overflow-x:auto;
  max-width:1240px; margin:0 auto; }
.ww-proto span { font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase;
  opacity:.5; margin-right:6px; flex:none; }
.ww-proto button { height:32px; padding:0 13px; border-radius:9px; font-size:13px; font-weight:700;
  color:rgba(255,255,255,.72); flex:none; }
.ww-proto button:hover { background:rgba(255,255,255,.12); color:#fff; }
.ww-proto button[data-on="true"] { background:#fff; color:var(--ink); }



/* ---------- blogarchief ---------- */
.ww-blog-head { padding:30px 0 0; max-width:720px; }
.ww-blog-head h1 { font-size:clamp(30px,5vw,48px); margin:10px 0 14px; }
.ww-blog-head p { font-size:16.5px; color:var(--slate); }
.ww-blog-filters { display:flex; gap:9px; overflow-x:auto; padding:22px 0 4px; scrollbar-width:none; }
.ww-blog-filters::-webkit-scrollbar { display:none; }
.ww-blog-filters .ww-chip { flex:none; }
.ww-lead { display:grid; grid-template-columns:1fr; background:#fff; border:1px solid var(--line);
  border-radius:22px; overflow:hidden; margin:26px 0 34px; text-align:left; width:100%; }
@media (min-width:900px) { .ww-lead { grid-template-columns:1.15fr 1fr; } }
.ww-lead .ww-ph { aspect-ratio:16/10; height:100%; }
.ww-lead-body { padding:24px; display:flex; flex-direction:column; gap:12px; justify-content:center; }
@media (min-width:900px) { .ww-lead-body { padding:36px; } }
.ww-lead h2 { font-size:clamp(23px,3vw,32px); }
.ww-lead p { font-size:15.5px; color:var(--slate); }
.ww-lead:hover h2 { color:var(--brand); }
.ww-blog-grid { display:grid; gap:20px; grid-template-columns:1fr; }
@media (min-width:560px) { .ww-blog-grid { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1024px) { .ww-blog-grid { grid-template-columns:repeat(3,1fr); } }
.ww-acard { display:flex; flex-direction:column; background:#fff; border:1px solid var(--line);
  border-radius:20px; overflow:hidden; text-align:left;
  transition:transform .14s ease, box-shadow .14s ease; }
.ww-acard:hover { transform:translateY(-3px); box-shadow:0 18px 40px rgba(30,20,60,.16); }
.ww-acard .ww-ph { aspect-ratio:16/9; }
.ww-acard-body { padding:15px 17px 18px; display:flex; flex-direction:column; gap:8px; flex:1; }
.ww-acard h3 { font-size:17.5px; line-height:1.28; }
.ww-acard p { font-size:14.5px; color:var(--slate); }
.ww-acard-foot { margin-top:auto; padding-top:10px; display:flex; align-items:center;
  justify-content:space-between; gap:10px; font-size:12.5px; color:var(--slate); }
.ww-loadmore { display:flex; justify-content:center; padding:32px 0 6px; }


/* ---------- profielformulier aanbieder ---------- */
.ww-form-head { padding:30px 0 4px; max-width:680px; }
.ww-form-head h1 { font-size:clamp(28px,4.4vw,42px); margin:10px 0 12px; }
.ww-form-head p { font-size:16px; color:var(--slate); }
.ww-form-two { display:grid; gap:26px; grid-template-columns:1fr; align-items:start; padding:26px 0 0; }
@media (min-width:1024px) { .ww-form-two { grid-template-columns:minmax(0,1fr) 320px; gap:34px; } }
.ww-fsec { background:#fff; border:1px solid var(--line); border-radius:20px; padding:24px; margin-bottom:18px; }
.ww-fsec-head { display:flex; align-items:flex-start; gap:13px; margin-bottom:20px; }
.ww-fsec-n { width:34px; height:34px; border-radius:11px; background:var(--cloud); color:var(--brand);
  font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:15px; flex:none;
  display:flex; align-items:center; justify-content:center; }
.ww-fsec-head h2 { font-size:19px; }
.ww-fsec-head p { font-size:13.5px; color:var(--slate); margin-top:4px; }
.ww-opt { font-weight:600; font-size:12px; color:var(--slate); margin-left:6px; }
.ww-upload { display:flex; align-items:center; gap:16px; flex-wrap:wrap; padding:14px; border-radius:16px;
  border:1.5px dashed var(--line); background:var(--mist); }
.ww-switch { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 0;
  border-bottom:1px solid var(--line); }
.ww-switch:last-child { border-bottom:0; }
.ww-switch strong { display:block; font-size:14.5px; }
.ww-switch span { font-size:13px; color:var(--slate); }
.ww-switch-btn { width:50px; height:29px; border-radius:999px; background:var(--line); flex:none;
  position:relative; transition:background .14s ease; }
.ww-switch-btn i { position:absolute; top:3px; left:3px; width:23px; height:23px; border-radius:999px;
  background:#fff; box-shadow:0 2px 5px rgba(30,20,60,.2); transition:transform .14s ease; }
.ww-switch-btn[data-on="true"] { background:var(--brand); }
.ww-switch-btn[data-on="true"] i { transform:translateX(21px); }
.ww-tagpick { display:flex; flex-wrap:wrap; gap:8px; }
.ww-side-sticky { position:sticky; top:96px; }
.ww-prog { background:#fff; border:1px solid var(--line); border-radius:20px; padding:20px; margin-bottom:16px; }
.ww-prog-top { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:11px; }
.ww-prog-top b { font-family:'Bricolage Grotesque',sans-serif; font-size:26px; font-weight:800; }
.ww-prog-bar { height:8px; border-radius:999px; background:var(--line); overflow:hidden; margin-bottom:18px; }
.ww-prog-bar i { display:block; height:100%; background:var(--brand); border-radius:999px; transition:width .2s ease; }
.ww-checklist li { display:flex; align-items:center; gap:10px; font-size:13.5px; padding:7px 0; color:var(--slate); }
.ww-checklist li[data-done="true"] { color:var(--ink); font-weight:600; }
.ww-tick { width:20px; height:20px; border-radius:999px; border:1.5px solid var(--line); flex:none;
  display:flex; align-items:center; justify-content:center; color:transparent; }
.ww-checklist li[data-done="true"] .ww-tick { background:var(--brand); border-color:var(--brand); color:#fff; }
.ww-preview { background:var(--cloud); border-radius:20px; padding:20px; }
.ww-preview-card { background:#fff; border-radius:16px; padding:16px; margin-top:12px; }
.ww-savebar { position:sticky; bottom:0; z-index:40; background:rgba(255,255,255,.95);
  backdrop-filter:blur(8px); border-top:1px solid var(--line); margin-top:10px;
  padding:14px 0 calc(14px + env(safe-area-inset-bottom)); }
.ww-savebar-in { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }


/* ---------- workshopwizard ---------- */
.ww-rail { background:#fff; border:1px solid var(--line); border-radius:20px; padding:16px; margin-bottom:16px; }
.ww-rail-item { width:100%; display:flex; align-items:center; gap:11px; padding:9px 10px; border-radius:12px;
  text-align:left; font-size:14px; font-weight:600; color:var(--slate); }
.ww-rail-item:hover { background:var(--mist); }
.ww-rail-item[data-on="true"] { background:var(--cloud); color:var(--brand-deep); font-weight:700; }
.ww-rail-n { width:26px; height:26px; border-radius:999px; border:1.5px solid var(--line); flex:none;
  display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; }
.ww-rail-item[data-on="true"] .ww-rail-n { border-color:var(--brand); color:var(--brand); }
.ww-rail-item[data-done="true"] .ww-rail-n { background:var(--brand); border-color:var(--brand); color:#fff; }
.ww-listrow { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; }
.ww-listrow .ww-input, .ww-listrow .ww-textarea { flex:1; }
.ww-listrow-del { width:44px; height:50px; border-radius:12px; background:var(--mist); color:var(--slate);
  display:flex; align-items:center; justify-content:center; flex:none; }
.ww-listrow-del:hover { background:var(--soft-coral); color:var(--coral-deep); }
.ww-sesrow { display:grid; gap:10px; grid-template-columns:1fr; align-items:end; padding:14px 0;
  border-bottom:1px solid var(--line); }
@media (min-width:640px) { .ww-sesrow { grid-template-columns:1.2fr .8fr .8fr auto; } }
.ww-sesrow .ww-field { margin-bottom:0; }
.ww-mediagrid { display:grid; gap:10px; grid-template-columns:repeat(2,1fr); }
@media (min-width:640px) { .ww-mediagrid { grid-template-columns:repeat(4,1fr); } }
.ww-mediaslot { position:relative; aspect-ratio:4/3; border-radius:14px; border:1.5px dashed var(--line);
  background:var(--mist); display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:6px; color:var(--slate); font-size:12.5px; font-weight:600; }
.ww-mediaslot:hover { border-color:var(--brand); color:var(--brand); }
.ww-mediaslot[data-filled="true"] { border-style:solid; border-color:transparent; padding:0; overflow:hidden; }
.ww-mediaslot-tag { position:absolute; top:8px; left:8px; z-index:3; background:rgba(255,255,255,.94);
  border-radius:999px; padding:3px 9px; font-size:11px; font-weight:800; color:var(--ink); }
.ww-summary li { display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
  padding:11px 0; border-bottom:1px solid var(--line); font-size:14.5px; }
.ww-summary li:last-child { border-bottom:0; }
.ww-summary span { color:var(--slate); flex:none; }
.ww-summary strong { text-align:right; font-weight:700; }
.ww-alert { display:flex; gap:11px; align-items:flex-start; background:#FFF3DC; border-radius:14px;
  padding:14px 16px; font-size:14px; margin-bottom:18px; }
.ww-alert svg { color:var(--warn); flex:none; margin-top:2px; }


/* ===========================================================================
   Mobiel

   De mobiele wireframes gebruiken andere patronen dan alleen smallere
   kolommen: horizontale carrousels met scroll-snap, een zijlade voor de
   navigatie, een kaartweergave over het hele scherm, inklapbare tekst en
   vaste balken onderin. Dit blok zet die patronen aan onder 768 px.
   =========================================================================== */
@media (max-width:767px) {
  .ww-wrap { padding:0 16px; }
  .ww-section { padding:32px 0; }
  .ww-shead { margin-bottom:16px; }
  .ww-shead h2 { font-size:22px; }
  .ww-block { padding:24px 0; }
  .ww-block h2 { font-size:20px; }

  /* horizontale carrousel, rand tot rand */
  .ww-snap { display:flex !important; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory;
    margin:0 -16px; padding:2px 16px 6px; scrollbar-width:none; grid-template-columns:none !important; }
  .ww-snap::-webkit-scrollbar { display:none; }
  .ww-snap > * { flex:none; width:255px; scroll-snap-align:start; }
  .ww-snap--wide > * { width:280px; }
  .ww-snap--narrow > * { width:250px; }

  /* inklapbare tekst */
  .ww-clamp { display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; }
  .ww-more { display:inline-flex; align-items:center; gap:5px; font-size:14px; font-weight:700;
    color:var(--brand); padding:8px 0; }

  /* homepage */
  .ww-hero { padding:38px 16px 30px; border-radius:22px; }
  .ww-search { padding:6px 6px 6px 14px; border-radius:16px; }
  .ww-search input { height:42px; font-size:15px; }
  .ww-sticker { width:44px; height:44px; border-radius:14px; }
  .ww-st1 { top:14px; left:2%; } .ww-st2 { top:20px; right:2%; }
  .ww-steps { gap:12px; }
  .ww-step { padding:18px; }
  .ww-band { padding:26px 20px; border-radius:22px; }

  /* aanbodpagina */
  .ww-results-head { padding:18px 0 12px; }
  .ww-results-head h1 { font-size:24px; }
  .ww-filterbar { top:64px; padding:10px 0; }
  .ww-listing > div > .ww-grid { grid-template-columns:1fr !important; }
  .ww-seo-text { padding:26px 0; }
  .ww-seo-text h2 { font-size:20px; }

  /* workshopdetail: een omslagfoto met teller */
  .ww-gallery { grid-template-columns:1fr; height:auto; position:relative; }
  .ww-gallery > *:nth-child(n+2) { display:none; }
  .ww-gallery > *:first-child { grid-row:auto; }
  .ww-gallery .ww-ph { min-height:0; aspect-ratio:4/3; border-radius:18px; }
  .ww-gallery-count { display:flex !important; }
  .ww-facts { grid-template-columns:repeat(4,1fr); gap:8px; padding:18px 0; }
  .ww-fact { flex-direction:column; align-items:flex-start; gap:7px; }
  .ww-fact-ico { width:34px; height:34px; border-radius:10px; }
  .ww-fact strong { font-size:12.5px; line-height:1.25; }
  .ww-fact span { font-size:11px; }
  .ww-booking { position:static; padding:18px; box-shadow:none; }
  .ww-slots { display:flex; gap:9px; overflow-x:auto; margin:0 -18px; padding:2px 18px 6px;
    scrollbar-width:none; scroll-snap-type:x mandatory; }
  .ww-slots::-webkit-scrollbar { display:none; }
  .ww-slots .ww-slot { flex:none; width:152px; flex-direction:column; align-items:flex-start;
    gap:6px; scroll-snap-align:start; margin-bottom:0; }
  .ww-practical { gap:10px; }
  .ww-scores { gap:9px; }

  /* aanbiederprofiel */
  .ww-phero { padding:22px 18px; text-align:center; justify-items:center; gap:14px; }
  .ww-phero h1 { font-size:26px; }
  .ww-pstats { grid-template-columns:repeat(4,1fr); gap:8px; }
  .ww-pstat { padding:11px 8px; border-radius:13px; text-align:center; }
  .ww-pstat b { font-size:15px; justify-content:center; gap:3px; }
  .ww-pstat span { font-size:10.5px; line-height:1.25; }
  .ww-strip { grid-template-columns:repeat(4,1fr); gap:6px; }
  .ww-wrow { padding:12px; gap:12px; }
  .ww-wrow .ww-ph { width:78px; height:66px; }

  /* blogartikel: inhoudsopgave bovenaan, de rest onder het artikel */
  .ww-art > aside { display:contents; }
  .ww-art .ww-toc { order:-1; position:static; margin:0 0 24px; }
  .ww-art .ww-sidecard { order:2; }
  .ww-toc-toggle { display:flex !important; }
  .ww-toc[data-open="false"] .ww-toc-links { display:none; }
  .ww-art h1 { font-size:28px; }
  .ww-answer { padding:18px; }
  .ww-answer p { font-size:15.5px; }
  .ww-prose p, .ww-prose ul li { font-size:16px; }
  .ww-prose h2 { font-size:21px; margin:26px 0 12px; }

  /* formulieren: voortgang en stappen boven het formulier */
  .ww-form-two > aside { position:static; order:-1; }
  .ww-fsec { padding:18px; }
  .ww-form-head h1 { font-size:26px; }
  .ww-savebar-in { gap:10px; }
  .ww-savebar .ww-btn { flex:1; min-width:130px; }
  .ww-savebar .ww-meta { width:100%; }

  /* dashboard */
  .ww-dash-head h1 { font-size:23px; }
  .ww-kpi b { font-size:21px; }
}

/* zijlade voor de mobiele navigatie */
.ww-drawer-wrap { position:fixed; inset:0; z-index:95; }
.ww-drawer-bg { position:absolute; inset:0; background:rgba(27,22,48,.45); animation:ww-fade .18s ease; }
.ww-mdrawer { position:absolute; top:0; right:0; bottom:0; width:88%; max-width:352px; background:#fff;
  display:flex; flex-direction:column; animation:ww-slide .22s ease; }
@keyframes ww-slide { from { transform:translateX(100%); } to { transform:none; } }
.ww-mdrawer-top { display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:14px 16px; border-bottom:1px solid var(--line); }
.ww-mdrawer-body { flex:1; overflow-y:auto; padding:16px; }
.ww-mdrawer-body h4 { font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:800;
  letter-spacing:.06em; text-transform:uppercase; color:var(--slate); margin:22px 0 10px; }
.ww-mdrawer-body h4:first-child { margin-top:6px; }
.ww-mrow { display:flex; align-items:center; gap:12px; width:100%; padding:11px 8px; border-radius:12px;
  text-align:left; }
.ww-mrow:hover, .ww-mrow:active { background:var(--mist); }
.ww-mrow strong { display:block; font-size:14.5px; font-weight:700; }
.ww-mrow span { font-size:12px; color:var(--slate); }
.ww-mdrawer-foot { border-top:1px solid var(--line); padding:14px 16px calc(14px + env(safe-area-inset-bottom));
  display:grid; gap:9px; }
.ww-msearch { display:flex; align-items:center; gap:10px; background:var(--mist); border-radius:14px;
  padding:0 14px; height:48px; }
.ww-msearch input { flex:1; min-width:0; border:0; outline:0; background:transparent; font-size:15px; }

/* weergavewissel lijst en kaart, alleen mobiel */
.ww-viewtoggle { display:none; margin-left:auto; flex:none; background:var(--cloud); border-radius:11px; padding:3px; }
.ww-viewtoggle button { height:34px; padding:0 13px; border-radius:9px; font-size:13px; font-weight:700; color:var(--brand-deep); }
.ww-viewtoggle button[data-on="true"] { background:#fff; color:var(--ink); box-shadow:0 2px 6px rgba(30,20,60,.12); }
@media (max-width:1099px) { .ww-viewtoggle { display:flex; } }
.ww-mapfs { position:fixed; inset:0; z-index:88; background:
  repeating-linear-gradient(0deg,#fff,#fff 34px,#F4F1FA 34px,#F4F1FA 35px),
  repeating-linear-gradient(90deg,#fff,#fff 34px,#F4F1FA 34px,#F4F1FA 35px); }
.ww-mapfs-top { position:absolute; top:0; left:0; right:0; padding:12px 16px; display:flex;
  align-items:center; gap:10px; background:rgba(255,255,255,.94); backdrop-filter:blur(8px);
  border-bottom:1px solid var(--line); }
.ww-mapfs-cards { position:absolute; left:0; right:0; bottom:calc(16px + env(safe-area-inset-bottom));
  display:flex; gap:12px; overflow-x:auto; padding:0 16px; scrollbar-width:none; scroll-snap-type:x mandatory; }
.ww-mapfs-cards::-webkit-scrollbar { display:none; }
.ww-mcard { flex:none; width:270px; scroll-snap-align:start; background:#fff; border-radius:16px;
  box-shadow:0 10px 26px rgba(30,20,60,.2); padding:12px; display:flex; gap:12px; align-items:center; text-align:left; }
.ww-mcard .ww-ph { width:64px; height:58px; border-radius:12px; flex:none; }

/* vaste contactbalk op het aanbiederprofiel */
.ww-provbar { position:fixed; left:0; right:0; bottom:0; z-index:80; background:#fff;
  border-top:1px solid var(--line); display:none; align-items:center; gap:14px;
  padding:12px 16px calc(12px + env(safe-area-inset-bottom)); box-shadow:0 -8px 24px rgba(30,20,60,.10); }
@media (max-width:1023px) { .ww-provbar { display:flex; } }

.ww-gallery-count { display:none; position:absolute; right:12px; bottom:12px; z-index:4;
  align-items:center; gap:6px; background:rgba(27,22,48,.72); color:#fff; border-radius:999px;
  padding:5px 12px; font-size:12.5px; font-weight:700; }
.ww-toc-toggle { display:none; width:100%; align-items:center; justify-content:space-between; gap:12px;
  font-size:13px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:var(--ink); }
.ww-toc-links { padding-top:4px; }
@media (max-width:767px) { .ww-sr-desktop { display:none; } }

@media (prefers-reduced-motion:reduce) { .ww *, .ww *::before, .ww *::after {
  animation-duration:.001ms !important; transition-duration:.001ms !important; } }

.ww-block:last-child { border-bottom:0; }
`;

/* ===========================================================================
   Iconen
   =========================================================================== */
const P = {
  search: "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z",
  share: "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M12 15V3M8 7l4-4 4 4",
  down: "M6 9l6 6 6-6",
  right: "M9 6l6 6-6 6",
  arrow: "M4 12h15M13 6l6 6-6 6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5.2l3.4 2",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87",
  gauge: "M3.5 17a9 9 0 1 1 17 0M12 17l4-5",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z",
  check: "M20 6.5L9.2 17.3 4 12.1",
  calendar: "M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  sliders: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2M14 4v4M8 10v4M14 16v4",
  close: "M6 6l12 12M18 6L6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5 5-2z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4.5 20.5a7.5 7.5 0 0 1 15 0",
  gift: "M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M3 8h18v4H3zM12 21V8M12 8H7.5a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8zM12 8h4.5a2.5 2.5 0 1 0 0-5C13 3 12 8 12 8z",
  shield: "M12 21s7.5-3.6 7.5-9.4V5.6L12 2.8 4.5 5.6v6c0 5.8 7.5 9.4 7.5 9.4z",
  chat: "M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9z",
  spark: "M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6L12 3z",
  fork: "M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-1.5 1.5-2 3.5-2 6 0 1.5.5 2.5 2 3v9",
  bowl: "M3 11h18a9 9 0 0 1-18 0zM7 7c0-1.5 1-2.5 2.5-2.5S12 5.5 12 7",
  palette: "M12 21a9 9 0 1 1 0-18c5 0 9 3.4 9 7.5 0 2.2-1.9 3.5-4 3.5h-1.6a1.7 1.7 0 0 0-1.2 2.9c.5.6.3 1.6-.6 2a4 4 0 0 1-.6.1zM7.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM10 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14.5 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  glass: "M5 3h14l-6 8v7h3M9 18h2M13 11L5 3",
  flower: "M12 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 8V4M12 13v7M9.8 9.2L6.5 6.5M14.2 9.2l3.3-2.7M9.8 11.8L6.5 14.5M14.2 11.8l3.3 2.7",
  hammer: "M14 6l4 4M3 21l7.5-7.5M12 8l4-4 4 4-4 4-4-4zM10.5 13.5L8 11",
  camera: "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  music: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  spa: "M12 20c0-5 3.5-9 8-10-1 5-4 9-8 10zM12 20c0-5-3.5-9-8-10 1 5 4 9 8 10zM12 20v-4",
  hike: "M13 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM8 22l3-7-2.5-2.5L9 8l4 1.5 2 3M11 15l4 7M4 22l3-5",
  recycle: "M7 19h10M9 19l-2.5-4M12 3l3 5M15 8l-4.5.5M17 19l3-5M20 14l-4.5-1M4 14l3-5M7 9l1 4.5",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM6 17h13",
  car: "M5 16h14M6.5 16l1.2-5.5A2 2 0 0 1 9.6 9h4.8a2 2 0 0 1 1.9 1.5L17.5 16M4 16v3M20 16v3M4 16h16",
  wheel: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 9V3M9.5 13.5L4.5 17M14.5 13.5l5 3.5",
  train: "M8 20l-2 2M16 20l2 2M6 5h12a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1zM5 11h14M9 15h.01M15 15h.01",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  left: "M15 6l-6 6 6 6",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  euro: "M17 5.5a7 7 0 1 0 0 13M4 10h8M4 14h8",
  star: "M12 3l2.7 5.6 6.1.8-4.4 4.3 1.1 6.1L12 17l-5.5 2.8 1.1-6.1L3.2 9.4l6.1-.8L12 3z",
  bell: "M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6M13.7 20a2 2 0 0 1-3.4 0",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z",
  logout: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11",
  google: "M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.2 2.7-7.1zM12 21c2.5 0 4.6-.8 6.2-2.3l-3.1-2.4c-.8.6-1.9.9-3.1.9-2.4 0-4.5-1.6-5.2-3.8H3.6v2.4A9 9 0 0 0 12 21zM6.8 13.4a5.4 5.4 0 0 1 0-3.4V7.6H3.6a9 9 0 0 0 0 8.1l3.2-2.3zM12 6.6c1.4 0 2.6.5 3.5 1.4l2.7-2.7A9 9 0 0 0 3.6 7.6L6.8 10c.7-2.2 2.8-3.4 5.2-3.4z",
  apple: "M16.2 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.4zM14 5.4c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.7-1.3z",
};


function Icon({ name, size = 20, fill = false, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={fill ? 0 : 1.7} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" style={style}>
      <path d={P[name] || P.spark} />
    </svg>
  );
}

function Star({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={tokens.color.sun} aria-hidden="true">
      <path d="M12 2.4l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3l-5.9 3.1 1.2-6.5L2.5 9.3l6.6-.9 2.9-6z" />
    </svg>
  );
}

/* De WW-mark: een W boven, de gespiegelde W eronder, licht gekanteld */
function Logo({ size = 32, mono = false }) {
  const top = mono ? "currentColor" : tokens.color.brand;
  const bottom = mono ? "currentColor" : tokens.color.coral;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true"
      style={{ transform: "rotate(-6deg)", flex: "none" }}>
      <path d="M8 8.5L15 26 24 14.5 33 26 40 8.5" stroke={top} strokeWidth="5.4"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 39.5L19 22 28 33.5 37 22" stroke={bottom} strokeWidth="5.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Wordmark = ({ size = 19, light }) => (
  <span className="ww-logo-wm" style={{ fontSize: size, color: light ? "#fff" : undefined }}>
    <b style={light ? { color: "#fff" } : undefined}>wicked</b> workshops
  </span>
);

/* ===========================================================================
   Primitieven
   =========================================================================== */
const Button = ({ variant = "primary", size, block, icon, iconRight, children, ...rest }) => (
  <button
    className={`ww-btn ww-btn--${variant}${block ? " ww-btn--block" : ""}${size ? ` ww-btn--${size}` : ""}`}
    {...rest}>
    {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
    {children}
    {iconRight && <Icon name={iconRight} size={16} />}
  </button>
);

const Chip = ({ on, soft, children, ...rest }) => (
  <button className={`ww-chip${soft ? " ww-chip--soft" : ""}`} data-on={on ? "true" : "false"} {...rest}>
    {children}
  </button>
);

const BADGE = {
  top_rated: ["ww-badge--top", "Topbeoordeeld"],
  new: ["ww-badge--new", "Nieuw"],
  almost_full: ["ww-badge--full", "Bijna vol"],
  verified: ["ww-badge--verified", "Geverifieerd"],
  live: ["ww-badge--live", "Gepubliceerd"],
  draft: ["ww-badge--draft", "Concept"],
  paused: ["ww-badge--paused", "Gepauzeerd"],
};

const Badge = ({ kind, children }) => {
  const [cls, label] = BADGE[kind] || ["ww-badge--top", children];
  return (
    <span className={`ww-badge ${cls}`}>
      {kind === "verified" && <Icon name="shield" size={13} />}{children || label}
    </span>
  );
};

const Rating = ({ value, count, size = 15 }) => (
  <span className="ww-rating"><Star size={size} />{String(value).replace(".", ",")}
    {count != null && <span className="ww-count">({count})</span>}</span>
);

const Photo = ({ icon = "spark", tone, ratio, size = 30, style, children }) => (
  <div className="ww-ph" data-tone={tone} style={{ aspectRatio: ratio, ...style }}>
    <span className="ww-ph-i"><Icon name={icon} size={size} /></span>
    {children}
  </div>
);

const Avatar = ({ name, size }) => (
  <span className="ww-av" style={size ? { width: size, height: size, fontSize: size * 0.34 } : undefined}>
    {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
  </span>
);

const Field = ({ label, hint, children }) => (
  <label className="ww-field"><span>{label}</span>{children}{hint && <p className="ww-hint">{hint}</p>}</label>
);

/* ===========================================================================
   Data, overgenomen uit de wireframes
   =========================================================================== */
const CATEGORIES = [
  { name: "Koken & bakken", slug: "koken-en-bakken", icon: "fork", count: "140+" },
  { name: "Keramiek & klei", slug: "keramiek-en-klei", icon: "bowl", count: "90+" },
  { name: "Schilderen & kunst", slug: "schilderen-en-kunst", icon: "palette", count: "75+" },
  { name: "Drinks & proeverijen", slug: "drinks-en-proeverijen", icon: "glass", count: "60+" },
  { name: "Bloemen & groen", slug: "bloemen-en-groen", icon: "flower", count: "45+" },
  { name: "Ambacht & maken", slug: "ambacht-en-maken", icon: "hammer", count: "120+" },
  { name: "Fotografie & media", slug: "fotografie-en-media", icon: "camera", count: "38+" },
  { name: "Dans, muziek & theater", slug: "dans-muziek-en-theater", icon: "music", count: "40+" },
  { name: "Wellness & beauty", slug: "wellness-en-beauty", icon: "spa", count: "55+" },
  { name: "Actief & buiten", slug: "actief-en-buiten", icon: "hike", count: "30+" },
  { name: "Niche & onverwacht", slug: "niche-en-onverwacht", icon: "spark", count: "28+" },
  { name: "Duurzaam & repair", slug: "duurzaam-en-repair", icon: "recycle", count: "20+" },
];

const OCCASIONS = [
  { name: "Date", sub: "Met z'n tweeen", icon: "heart" },
  { name: "Vrienden", sub: "Gezellig samen", icon: "users" },
  { name: "Teamuitje", sub: "Voor bedrijven", icon: "shield" },
  { name: "Kinderfeestje", sub: "Voor de kids", icon: "spark" },
  { name: "Vrijgezellenfeest", sub: "Onvergetelijk", icon: "glass" },
  { name: "Cadeau", sub: "Geef beleving", icon: "gift" },
];

const FEATURED = [
  { slug: "italiaans-koken-met-marco", title: "Italiaans koken met Marco", city: "Utrecht", duration: "3 uur", rating: 4.9, count: 312, price: 45, badge: "top_rated", icon: "fork" },
  { slug: "draai-je-eigen-keramiek", title: "Draai je eigen keramiek", city: "Amsterdam", duration: "2,5 uur", rating: 4.8, count: 198, price: 39, badge: "new", icon: "bowl" },
  { slug: "cocktails-shaken", title: "Cocktails shaken met een mixoloog", city: "Rotterdam", duration: "2 uur", rating: 4.9, count: 146, price: 42, badge: "almost_full", icon: "glass" },
  { slug: "bloemschikken-beginners", title: "Bloemschikken voor beginners", city: "Den Haag", duration: "2 uur", rating: 4.7, count: 88, price: 35, icon: "flower" },
];

const LISTING = [
  { slug: "italiaans-koken-met-marco", title: "Italiaans koken met Marco", area: "Wittevrouwen", duration: "3 uur", km: "1,2 km", rating: 4.9, count: 312, price: 45, badge: "top_rated", icon: "fork", x: 42, y: 38 },
  { slug: "sushi-workshop-beginners", title: "Sushi workshop voor beginners", area: "Centrum", duration: "2,5 uur", km: "2,0 km", rating: 4.8, count: 207, price: 49, icon: "bowl", x: 62, y: 24 },
  { slug: "taarten-decoreren", title: "Taarten decoreren als een pro", area: "Lombok", duration: "3 uur", km: "3,1 km", rating: 4.7, count: 64, price: 39, badge: "new", icon: "spark", x: 26, y: 56 },
  { slug: "zuurdesembrood-bakken", title: "Zuurdesembrood bakken", area: "Tuindorp", duration: "4 uur", km: "4,0 km", rating: 4.9, count: 51, price: 55, icon: "fork", x: 70, y: 62 },
  { slug: "pizza-houtoven", title: "Pizza maken met houtoven", area: "Leidsche Rijn", duration: "2,5 uur", km: "5,3 km", rating: 4.8, count: 129, price: 42, icon: "fork", x: 16, y: 30 },
  { slug: "thais-koken", title: "Thais koken workshop", area: "Centrum", duration: "3 uur", km: "2,1 km", rating: 4.7, count: 96, price: 47, icon: "bowl", x: 54, y: 74 },
];

const FILTER_GROUPS = [
  { key: "wanneer", label: "Wanneer", options: ["Vandaag", "Dit weekend", "Deze maand", "Doordeweeks", "Kies datum"] },
  { key: "prijs", label: "Prijs per persoon", type: "range" },
  { key: "afstand", label: "Afstand", options: ["5 km", "10 km", "25 km", "50 km", "Heel NL"] },
  { key: "type", label: "Type workshop", options: ["Op locatie", "Bij jou thuis", "Op kantoor", "Online"] },
  { key: "duur", label: "Duur", options: ["Tot 2 uur", "2 tot 4 uur", "Hele dag", "Meerdere dagen"] },
  { key: "groep", label: "Groepsgrootte", options: ["Voor 2", "Kleine groep", "Grote groep", "Teamuitje (10+)"] },
  { key: "gelegenheid", label: "Geschikt voor", options: ["Date", "Vrienden", "Teamuitje", "Kinderfeestje", "Vrijgezellenfeest", "Familie"] },
  { key: "niveau", label: "Niveau", options: ["Beginner", "Gevorderd", "Alle niveaus"] },
  { key: "taal", label: "Taal", options: ["Nederlands", "Engels"] },
  { key: "leeftijd", label: "Geschikt voor leeftijd", options: ["Kindvriendelijk", "16+", "18+"] },
  { key: "dieet", label: "Dieetwensen", options: ["Vegetarisch", "Vegan", "Glutenvrij", "Halal"] },
  { key: "inbegrepen", label: "Inbegrepen", options: ["Materiaal", "Hapjes & drankjes", "Mee naar huis"] },
  { key: "score", label: "Beoordeling", options: ["4,5+ sterren", "4,0+ sterren"] },
  { key: "aanbieder", label: "Aanbieder", options: ["Geverifieerd", "Topbeoordeeld", "Nieuw talent"] },
  { key: "extra", label: "Extra's", options: ["Gratis annuleren", "Direct boekbaar", "Cadeaubon"] },
  { key: "bereikbaar", label: "Bereikbaarheid", options: ["Rolstoeltoegankelijk", "Gratis parkeren", "Goed met OV"] },
];

const SESSIONS = [
  { id: 1, day: "Zaterdag 8 augustus", time: "14:00 tot 17:00", seats: 4 },
  { id: 2, day: "Woensdag 12 augustus", time: "19:00 tot 22:00", seats: 2 },
  { id: 3, day: "Zaterdag 15 augustus", time: "14:00 tot 17:00", seats: 8 },
];

const REVIEWS = [
  { name: "Sanne", when: "juli 2026", body: "De pasta was heerlijk en Marco maakt er echt een feestje van. Perfect voor een date." },
  { name: "Mark", when: "juni 2026", body: "Met het hele team geweest, van begin tot eind goed geregeld. Aanrader als teamuitje." },
  { name: "Iris", when: "juni 2026", body: "Leuke sfeer, duidelijke uitleg en je leert echt iets. De tiramisu maak ik nu elke week." },
  { name: "Thomas", when: "mei 2026", body: "Als verrassing cadeau gekregen en het was een topavond. Alles tot in de puntjes verzorgd." },
];

const FAQ = [
  ["Wat als ik moet annuleren?", "Je kunt tot 48 uur van tevoren gratis annuleren, daarna betaal je 50 procent. Verzetten naar een andere datum kan altijd kosteloos."],
  ["Kan ik alleen komen?", "Zeker, je sluit aan bij de groep en werkt samen met een andere deelnemer."],
  ["Moet ik iets meenemen?", "Nee, alles is aanwezig. Kom in makkelijke kleding, een schort krijg je van Marco."],
  ["Is er parkeergelegenheid?", "Betaald parkeren op straat. De studio is 5 minuten lopen van Utrecht CS, dus met het OV kom je het makkelijkst."],
];

/* ===========================================================================
   Data pagina 4: aanbiederprofiel
   =========================================================================== */
const MARCO_WORKSHOPS = [
  { title: "Italiaans koken met Marco", meta: "3 uur · 4 tot 12 pers.", rating: 4.9, count: 312, price: 45, next: "za 8 aug", badge: "top_rated", icon: "fork" },
  { title: "Verse pasta masterclass", meta: "2,5 uur · 4 tot 10 pers.", rating: 4.8, count: 76, price: 55, next: "di 11 aug", icon: "bowl" },
  { title: "Tiramisu & dolci workshop", meta: "2 uur · 4 tot 12 pers.", rating: 4.9, count: 24, price: 39, next: "zo 16 aug", icon: "spark" },
];

const MARCO_REVIEWS = [
  { name: "Sanne", when: "juli 2026", ws: "Italiaans koken", body: "Marco maakt er echt een feestje van. Je proeft de liefde voor het vak in alles." },
  { name: "Thomas", when: "juni 2026", ws: "Pasta masterclass", body: "Dacht dat ik pasta kon maken. Bleek van niet. Nu wel, dankzij Marco." },
  { name: "Iris", when: "mei 2026", ws: "Tiramisu & dolci", body: "Gezellige avond met vriendinnen en het resultaat was verrassend goed." },
  { name: "Mark", when: "juni 2026", ws: "Italiaans koken", body: "Als teamuitje geboekt met tien collega's. Alles was perfect geregeld." },
];

function ProviderPage({ go }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a>Home</a><span>/</span><a>Aanbieders</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Marco Rossi</span>
      </nav>

      <header className="ww-phero">
        <Avatar name="Marco Rossi" size={96} />
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <Badge kind="verified" /><Badge kind="top_rated" />
          </div>
          <h1>Marco Rossi</h1>
          <p className="ww-phero-sub">Italiaanse kok · Utrecht · geeft workshops sinds 2019</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button className="ww-chip"><Icon name="share" size={15} /> Delen</button>
          <button className="ww-chip" onClick={() => setFollowing(!following)}
            style={following ? { background: tokens.color.brand, borderColor: tokens.color.brand, color: "#fff" } : undefined}>
            <Icon name="heart" size={15} fill={following} /> {following ? "Je volgt Marco" : "Volgen"}
          </button>
        </div>
      </header>

      <div className="ww-pstats">
        {[["4,9", "412 reviews", true], ["540", "deelnemers"], ["3", "workshops"], ["2 uur", "gem. reactietijd"]].map(([v, l, star]) => (
          <div className="ww-pstat" key={l}>
            <b>{star && <Star size={18} />}{v}</b><span>{l}</span>
          </div>
        ))}
      </div>

      <div className="ww-two">
        <div>
          <section className="ww-block">
            <h2>Over Marco</h2>
            <ReadMore>
            <p>
              Opgegroeid in de keuken van zijn nonna in Bologna, verhuisde Marco tien jaar geleden naar
              Utrecht. Wat begon als pastamaken voor vrienden groeide uit tot workshops voor honderden
              deelnemers per jaar.
            </p>
            <p>
              Zijn missie: laten zien dat de echte Italiaanse keuken geen sterrenkeuken is, maar handwerk
              dat iedereen kan leren. Verwacht geen strakke kookschool maar een lange tafel, opgestroopte
              mouwen en muziek uit Bologna.
            </p>
            </ReadMore>
            <ul className="ww-facts-list">
              {[["pin", "Kookstudio De Pan, Wittevrouwen, Utrecht"],
                ["globe", "Spreekt Nederlands, Italiaans en Engels"],
                ["users", "Ook beschikbaar voor teamuitjes tot 12 personen"]].map(([i, t]) => (
                <li key={t}><Icon name={i} size={19} />{t}</li>
              ))}
            </ul>
          </section>

          <section className="ww-block">
            <h2>Sfeerimpressie</h2>
            <div className="ww-strip">
              <Photo icon="fork" tone="coral" /><Photo icon="bowl" /><Photo icon="users" />
              <Photo icon="camera"><span className="ww-strip-more">+14</span></Photo>
            </div>
          </section>

          <section className="ww-block">
            <h2>Workshops van Marco</h2>
            {MARCO_WORKSHOPS.map((w) => (
              <article className="ww-wrow" key={w.title}>
                <Photo icon={w.icon} style={{ width: 96, height: 78, borderRadius: 13, flex: "none" }} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <h3>{w.title}</h3>{w.badge && <Badge kind={w.badge} />}
                  </div>
                  <p className="ww-meta">{w.meta}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    <Rating value={w.rating} count={w.count} />
                    <span className="ww-next"><Icon name="calendar" size={13} /> Eerstvolgende: {w.next}</span>
                  </div>
                </div>
                <div className="ww-wrow-price">
                  <span>vanaf</span><b>{"\u20AC"}{w.price}</b>
                  <Button variant="outline" size="sm" style={{ marginTop: 8 }}
                    onClick={() => go({ name: "workshop" })}>Bekijken</Button>
                </div>
              </article>
            ))}
          </section>

          <section className="ww-block">
            <h2>Beoordelingen</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ fontFamily: tokens.font.display, fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
                <Star size={22} />4,9
              </span>
              <span className="ww-meta">412 reviews over 3 workshops</span>
            </div>
            <div className="ww-reviews ww-snap ww-snap--wide">
              {MARCO_REVIEWS.map((r) => (
                <article className="ww-review" key={r.name + r.ws}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} />)}</span>
                    <span className="ww-chip ww-chip--soft" style={{ height: 26, fontSize: 12, pointerEvents: "none" }}>{r.ws}</span>
                  </div>
                  <p>{r.body}</p>
                  <div className="ww-who">
                    <Avatar name={r.name} /><span><strong>{r.name}</strong><span>{r.when}</span></span>
                  </div>
                </article>
              ))}
            </div>
            <div style={{ marginTop: 18 }}><Button variant="outline">Bekijk alle 412 reviews</Button></div>
          </section>

          <section className="ww-block">
            <h2>Ontdek meer</h2>
            <div className="ww-links">
              {["Kookworkshops Utrecht", "Workshops in Utrecht", "Italiaans koken", "Pasta workshops", "Teamuitjes Utrecht"].map((l) => (
                <a className="ww-chip ww-chip--soft" key={l}>{l}</a>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="ww-sidecard">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar name="Marco Rossi" size={46} />
              <div><h3 style={{ marginBottom: 2 }}>Vraag aan Marco?</h3>
                <p style={{ margin: 0 }}>Reageert gemiddeld binnen 2 uur</p></div>
            </div>
            <Button variant="primary" block icon="chat">Stel een vraag</Button>
            <ul className="ww-trust" style={{ marginTop: 16 }}>
              {[["shield", "Boeken en betalen via Wicked"], ["calendar", "Gratis annuleren tot 48 uur vooraf"],
                ["check", "Alleen reviews van echte deelnemers"]].map(([i, t]) => (
                <li key={t}><Icon name={i} size={17} />{t}</li>
              ))}
            </ul>
          </div>

          <div className="ww-sidecard">
            <h3>Teamuitje bij Marco?</h3>
            <p>Vanaf 10 personen een groepsofferte met factuur, voorstel binnen 1 werkdag.</p>
            <Button variant="outline" block>Vraag groepsofferte</Button>
          </div>
        </aside>
      </div>

      <div className="ww-provbar">
        <span style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 14.5, display: "block" }}>Vraag aan Marco?</strong>
          <span className="ww-meta" style={{ fontSize: 12.5 }}>Reageert binnen 2 uur</span>
        </span>
        <Button variant="primary" icon="chat">Stel een vraag</Button>
      </div>

      <section className="ww-section">
        <div className="ww-band ww-band--cloud ww-band-split">
          <div>
            <h2>Zelf iets te delen, net als Marco?</h2>
            <p>Van thuiskok tot keramist: start je eerste workshop op Wicked, ook zonder ervaring als docent.</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => go({ name: "auth", tab: "provider" })}>
            Word workshopgever
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ===========================================================================
   Pagina 5: blogarchief
   =========================================================================== */
const ART_CATEGORIES = ["Alles", "Koken", "Inspiratie", "Cadeau", "Ambacht", "Teamuitjes"];

const ARTICLES = [
  { cat: "Koken", title: "Zelf sushi rollen: de technieken uit een workshop", read: "5 min lezen",
    date: "3 aug 2026", icon: "bowl", lead: true,
    excerpt: "Met de juiste rijst, een beetje techniek en wat oefening rol je thuis binnen een uur je eerste maki. Dit is wat je in een workshop leert." },
  { cat: "Inspiratie", title: "Wat te doen dit weekend: 25 verse ideeen", read: "4 min lezen",
    date: "1 aug 2026", icon: "spark",
    excerpt: "Van glasblazen tot een wijnproeverij. Vijfentwintig uitjes die je zo kunt boeken." },
  { cat: "Cadeau", title: "Origineel cadeau nodig? Geef een beleving", read: "3 min lezen",
    date: "28 jul 2026", icon: "gift",
    excerpt: "Waarom een middag samen iets maken langer blijft hangen dan het zoveelste cadeaubonnetje." },
  { cat: "Koken", title: "Thuis ramen maken zoals in Japan", read: "6 min lezen",
    date: "24 jul 2026", icon: "bowl",
    excerpt: "De bouillon is het werk, de rest is montage. Zo pak je het aan zonder drie dagen in de keuken te staan." },
  { cat: "Teamuitjes", title: "Een teamuitje dat wel blijft hangen", read: "5 min lezen",
    date: "19 jul 2026", icon: "users",
    excerpt: "Waarom samen iets maken beter werkt dan het zoveelste escape room-bezoek, en waar je op let bij het kiezen." },
  { cat: "Ambacht", title: "Draaien op de pottenbakkersschijf: wat je eerste les oplevert", read: "4 min lezen",
    date: "15 jul 2026", icon: "bowl",
    excerpt: "Een scheve kom en heel veel plezier. Wat je realistisch leert in twee en een half uur klei." },
  { cat: "Inspiratie", title: "Origineel date-idee: samen koken", read: "4 min lezen",
    date: "11 jul 2026", icon: "heart",
    excerpt: "Praten gaat makkelijker met je handen in het deeg. Zeven workshops die werken als eerste of vijftigste date." },
  { cat: "Cadeau", title: "Een workshop cadeau geven: zo werkt het", read: "3 min lezen",
    date: "6 jul 2026", icon: "gift",
    excerpt: "Bon kopen, datum laten kiezen, klaar. In drie stappen uitgelegd, inclusief de kleine lettertjes." },
  { cat: "Ambacht", title: "Zilver smeden: van plaatje naar ring in een dag", read: "7 min lezen",
    date: "2 jul 2026", icon: "spark",
    excerpt: "Zagen, vijlen, solderen en polijsten. Een dag lang ambacht, en je gaat naar huis met iets dat je zelf hebt gemaakt." },
];

function BlogIndexPage({ go }) {
  const [cat, setCat] = useState("Alles");
  const [shown, setShown] = useState(6);
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);

  const filtered = ARTICLES.filter((a) => cat === "Alles" || a.cat === cat);
  const lead = cat === "Alles" ? filtered.find((a) => a.lead) : null;
  const rest = filtered.filter((a) => a !== lead);
  const visible = rest.slice(0, shown);

  const pick = (c) => { setCat(c); setShown(6); };

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Inspiratie</span>
      </nav>

      <header className="ww-blog-head">
        <span className="ww-eyebrow">Inspiratie</span>
        <h1>Ideeen voor je volgende uitje</h1>
        <p>
          Verhalen, technieken en tips van de mensen die de workshops geven. Lees je in, en boek
          daarna iets dat je nog niet eerder deed.
        </p>
      </header>

      <div className="ww-blog-filters" role="tablist" aria-label="Filter op onderwerp">
        {ART_CATEGORIES.map((c) => (
          <Chip key={c} on={cat === c} onClick={() => pick(c)} role="tab" aria-selected={cat === c}>
            {c}
          </Chip>
        ))}
      </div>

      {lead && (
        <button className="ww-lead" onClick={() => go({ name: "article" })}>
          <Photo icon={lead.icon} tone="coral" size={38} />
          <div className="ww-lead-body">
            <span className="ww-eyebrow">Uitgelicht · {lead.cat}</span>
            <h2>{lead.title}</h2>
            <p>{lead.excerpt}</p>
            <span className="ww-acard-foot" style={{ marginTop: 4, paddingTop: 0 }}>
              <span>{lead.read}</span><span>{lead.date}</span>
            </span>
            <span className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 30, alignSelf: "flex-start" }}>
              Lees het artikel <Icon name="right" size={15} />
            </span>
          </div>
        </button>
      )}

      {visible.length > 0 ? (
        <div className="ww-blog-grid">
          {visible.map((a) => (
            <button className="ww-acard" key={a.title} onClick={() => go({ name: "article" })}>
              <Photo icon={a.icon} />
              <div className="ww-acard-body">
                <span className="ww-eyebrow">{a.cat}</span>
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <span className="ww-acard-foot">
                  <span>{a.read}</span><span>{a.date}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="ww-card ww-empty" style={{ marginTop: 26 }}>
          <h3>Nog niets over {cat}</h3>
          <p>We schrijven hier binnenkort over. Kijk ondertussen bij alle artikelen.</p>
          <Button variant="outline" onClick={() => pick("Alles")}>Toon alle artikelen</Button>
        </div>
      )}

      {visible.length < rest.length && (
        <div className="ww-loadmore">
          <Button variant="outline" size="lg" onClick={() => setShown(shown + 3)}>
            Meer artikelen laden
          </Button>
        </div>
      )}

      <section className="ww-section">
        <div className="ww-news">
          <h2 style={{ fontSize: 26 }}>De leukste workshops in je mail</h2>
          <p>Elke maand nieuwe workshops en ideeen voor je volgende uitje. Geen spam, beloofd.</p>
          {sent ? (
            <p style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700 }}>
              <Icon name="check" size={20} /> Je staat op de lijst. Tot volgende maand.
            </p>
          ) : (
            <div className="ww-news-form">
              <input className="ww-input" type="email" value={mail} onChange={(e) => setMail(e.target.value)}
                placeholder="jouw@email.nl" aria-label="E-mailadres" />
              <Button variant="coral" onClick={() => mail.includes("@") && setSent(true)}>Aanmelden</Button>
            </div>
          )}
        </div>
      </section>

      <section className="ww-section" style={{ paddingTop: 0 }}>
        <div className="ww-band ww-band--cloud ww-band-split">
          <div>
            <h2>Genoeg gelezen?</h2>
            <p>Zoek een workshop bij jou in de buurt en zet het meteen in je agenda.</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => go({ name: "listing" })}>
            Bekijk het aanbod
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ===========================================================================
   Data en pagina 6: blogartikel
   =========================================================================== */
const ART_SECTIONS = [
  { id: "rijst", n: 1, h: "De rijst is het halve werk" },
  { id: "rollen", n: 2, h: "Rollen zonder knoeien" },
  { id: "thuis", n: 3, h: "Dit heb je thuis nodig" },
  { id: "vragen", n: 4, h: "Veelgestelde vragen" },
];

const ART_FAQ = [
  ["Is zelf sushi maken goedkoper dan bestellen?", "Ja, zeker als je voor meer personen maakt. De basisspullen kosten eenmalig zo'n 15 euro en de ingredienten per persoon een paar euro."],
  ["Kan ik sushi maken zonder rauwe vis?", "Absoluut. Komkommer, avocado, omelet of gerookte zalm werken net zo goed en zijn makkelijker te bewaren."],
  ["Hoe lang duurt het om het te leren?", "Na een workshop van 2,5 uur rol je zelfstandig maki en california rolls. Nigiri en sashimi vragen meer oefening."],
];

function ArticlePage({ go }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a>Home</a><span>/</span><a onClick={() => go({ name: "blog" })}>Inspiratie</a><span>/</span><a onClick={() => go({ name: "blog" })}>Koken &amp; bakken</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Zelf sushi rollen</span>
      </nav>

      <div className="ww-art">
        <article>
          <span className="ww-chip ww-chip--soft" style={{ pointerEvents: "none" }}>Koken &amp; bakken</span>
          <h1>Zelf sushi rollen: de technieken uit een workshop</h1>
          <div className="ww-byline">
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Avatar name="Lisa Wicked" /> Lisa van Wicked
            </span>
            <span>Bijgewerkt 3 augustus 2026</span>
            <span>5 min lezen</span>
            <button className="ww-chip" style={{ marginLeft: "auto" }}><Icon name="share" size={15} /> Delen</button>
          </div>

          <section className="ww-answer">
            <h2>Het korte antwoord</h2>
            <p>
              Zelf sushi rollen leer je in drie stappen: gebruik echte sushirijst op smaak met
              rijstazijn, vul dun met maximaal twee ingredienten, en rol strak op met een bamboematje.
              Na een workshop van 2,5 uur rol je zelfstandig maki.
            </p>
          </section>

          <div className="ww-prose">
            <p>
              Sushi maken lijkt moeilijker dan het is. Met de juiste rijst, een beetje techniek en wat
              oefening rol je thuis binnen een uur je eerste maki. In dit artikel delen we de technieken
              die je in een <a onClick={() => go({ name: "listing" })}>sushi workshop</a> leert, zodat je
              weet wat je te wachten staat.
            </p>

            <h2 id="rijst">1. De rijst is het halve werk</h2>
            <p>
              Goede sushi begint bij de rijst. Gebruik echte sushirijst (kortkorrelig), spoel hem tot het
              water helder is en breng hem na het koken op smaak met rijstazijn, suiker en zout. De
              verhouding luistert nauw, en precies dat is wat je in een workshop onder begeleiding leert
              aanvoelen.
            </p>
            <p className="ww-tip">
              <strong>Tip uit de workshop:</strong> laat de rijst afkoelen tot lichaamstemperatuur voor je
              gaat rollen. Te warme rijst maakt het zeewier slap.
            </p>

            <h2 id="rollen">2. Rollen zonder knoeien</h2>
            <p>
              Leg het norivel met de ruwe kant naar boven op je matje, verdeel de rijst dun en laat
              bovenaan een strook vrij. Minder vulling is meer: twee ingredienten per rol is genoeg.
            </p>
            <p>
              Rol met het matje strak op, druk zachtjes aan en snijd met een nat mes. In een workshop zie
              je dit een chef voordoen, en dat scheelt maanden zelf uitproberen.
            </p>

            <h2 id="thuis">3. Dit heb je thuis nodig</h2>
            <ul>
              {["Rolmatje van bamboe (paar euro bij de toko)", "Sushirijst, rijstazijn en norivellen",
                "Scherp mes en een kom water", "Verse vulling: zalm, komkommer of avocado"].map((t) => (
                <li key={t}><Icon name="check" size={19} />{t}</li>
              ))}
            </ul>
            <p>
              Meer keukens ontdekken? Bekijk ook onze <a onClick={() => go({ name: "listing" })}>kookworkshops
              in Utrecht</a> of een <a onClick={() => go({ name: "listing" })}>Thaise kookworkshop</a> voor
              een heel ander smakenpalet.
            </p>

            <h2 id="vragen">4. Veelgestelde vragen</h2>
            {ART_FAQ.map(([q, a], i) => (
              <div className="ww-faq-item" key={q}>
                <button className="ww-faq-q" aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {q}
                  <Icon name="down" size={19} style={{ flex: "none", transition: "transform .15s ease", transform: openFaq === i ? "rotate(180deg)" : "none" }} />
                </button>
                {openFaq === i && <p className="ww-faq-a">{a}</p>}
              </div>
            ))}
          </div>

          <div className="ww-author">
            <Avatar name="Lisa Wicked" size={52} />
            <div>
              <strong style={{ fontSize: 16 }}>Lisa van Wicked</strong>
              <p className="ww-meta" style={{ marginTop: 6 }}>
                Schrijft over workshops en uitjes, en probeerde er zelf al meer dan veertig.
                Favoriet tot nu toe: glasblazen.
              </p>
            </div>
          </div>

          <div className="ww-news">
            <h2 style={{ fontSize: 24 }}>De leukste workshops in je mail</h2>
            <p>Elke maand nieuwe workshops en ideeen voor je volgende uitje. Geen spam, beloofd.</p>
            {sent ? (
              <p style={{ display: "flex", alignItems: "center", gap: 9, opacity: 1, fontWeight: 700 }}>
                <Icon name="check" size={20} /> Je staat op de lijst. Tot volgende maand.
              </p>
            ) : (
              <div className="ww-news-form">
                <input className="ww-input" value={mail} onChange={(e) => setMail(e.target.value)}
                  placeholder="jouw@email.nl" aria-label="E-mailadres" type="email" />
                <Button variant="coral" onClick={() => mail.includes("@") && setSent(true)}>Aanmelden</Button>
              </div>
            )}
          </div>

          <section className="ww-section" style={{ paddingBottom: 0 }}>
            <div className="ww-band ww-band--cloud ww-band-split">
              <div>
                <h2>Zin gekregen?</h2>
                <p>Vind een sushi workshop bij jou in de buurt en sta binnenkort zelf te rollen.</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => go({ name: "listing" })}>
                Bekijk sushi workshops
              </Button>
            </div>
          </section>
        </article>

        <aside>
          <nav className="ww-toc" aria-label="In dit artikel" data-open={tocOpen ? "true" : "false"}>
            <h3 style={{ marginBottom: 0 }}>
              <button className="ww-toc-toggle" onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen}>
                In dit artikel
                <Icon name="down" size={17} style={{ color: tokens.color.brand,
                  transform: tocOpen ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
              </button>
              <span className="ww-sr-desktop">In dit artikel</span>
            </h3>
            <div className="ww-toc-links">
              {ART_SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} onClick={() => setTocOpen(false)}><i>{s.n}</i>{s.h}</a>
              ))}
            </div>
          </nav>

          <div className="ww-sidecard">
            <h3>Liever leren van een chef?</h3>
            {[["Sushi workshop voor beginners", "4,8 (207) · Utrecht", 49, "bowl"],
              ["Sushi masterclass met chef Ken", "4,9 (98) · Amsterdam", 65, "fork"]].map(([t, m, p, ic]) => (
              <a className="ww-mini" key={t} onClick={() => go({ name: "listing" })}>
                <Photo icon={ic} style={{ width: 64, height: 56, borderRadius: 12, flex: "none" }} />
                <span style={{ flex: 1 }}>
                  <strong>{t}</strong>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}><Star size={12} />{m}</span>
                </span>
                <span style={{ textAlign: "right", flex: "none" }}>
                  <b style={{ fontFamily: tokens.font.display, fontSize: 17 }}>{"\u20AC"}{p}</b>
                  <span style={{ display: "block", fontSize: 11.5, color: tokens.color.slate }}>p.p.</span>
                </span>
              </a>
            ))}
            <Button variant="outline" block style={{ marginTop: 12 }} onClick={() => go({ name: "listing" })}>
              Bekijk alle sushi workshops
            </Button>
          </div>

          <div className="ww-sidecard" style={{ background: tokens.color.softCoral, border: 0 }}>
            <h3>Workshop cadeau geven?</h3>
            <p style={{ color: tokens.color.ink, opacity: .72 }}>De ontvanger kiest zelf datum en workshop.</p>
            <Button variant="coral" block icon="gift">Naar de cadeaubon</Button>
          </div>
        </aside>
      </div>

      <section className="ww-section">
        <div className="ww-shead"><h2>Lees ook</h2>
          <a onClick={() => go({ name: "blog" })}>Alle artikelen <Icon name="right" size={14} /></a></div>
        <div className="ww-snap ww-snap--narrow" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {[["Koken", "Thuis ramen maken zoals in Japan", "6 min lezen", "bowl"],
            ["Inspiratie", "Origineel date-idee: samen koken", "4 min lezen", "heart"],
            ["Cadeau", "Een workshop cadeau geven: zo werkt het", "3 min lezen", "gift"]].map(([cat, t, r, ic]) => (
            <article className="ww-card" key={t} style={{ overflow: "hidden" }}>
              <Photo icon={ic} style={{ aspectRatio: "16/9" }} />
              <div style={{ padding: 16 }}>
                <span className="ww-eyebrow">{cat}</span>
                <h3 style={{ fontSize: 17, margin: "8px 0 8px" }}>{t}</h3>
                <p className="ww-meta">{r}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ===========================================================================
   Pagina 9: profiel van de workshopgever

   Dezelfde component doet twee dingen: de uitgebreide registratie na het
   aanmaken van een account (mode "signup") en het beheren van het profiel
   vanuit het dashboard (mode "edit"). Elk veld hieronder staat een op een
   op een veld uit de collectie providers in het Directus-schema.
   =========================================================================== */
const PROFILE_LANGS = ["Nederlands", "Engels", "Duits", "Frans", "Spaans", "Italiaans"];
const PROFILE_CITIES = ["Utrecht", "Amsterdam", "Rotterdam", "Den Haag", "Eindhoven", "Groningen", "Amersfoort", "Haarlem"];

/* Wat er ingevuld moet zijn voordat een profiel de deur uit kan */
const REQUIRED = [
  ["first_name", "Voornaam"], ["last_name", "Achternaam"], ["email", "E-mailadres"],
  ["phone", "Telefoonnummer"], ["street", "Straat"], ["house_number", "Huisnummer"],
  ["postal_code", "Postcode"], ["residence", "Woonplaats"],
  ["display_name", "Naam op je profiel"], ["profession", "Vakgebied"],
  ["bio_short", "Korte introductie"], ["bio_long", "Over jou"],
  ["city", "Stad"], ["iban", "Rekeningnummer"], ["account_holder", "Tenaamstelling"],
];

const EMPTY_PROFILE = {
  first_name: "", last_name: "", email: "", phone: "", birth_date: "",
  street: "", house_number: "", addition: "", postal_code: "", residence: "", country: "Nederland",
  company_name: "", kvk_number: "", vat_number: "", vat_liable: true, kor: false,
  display_name: "", profession: "", bio_short: "", bio_long: "", languages: ["Nederlands"],
  active_since: "", website: "", instagram: "",
  city: "", neighbourhood: "", location_name: "", location_same: true,
  location_street: "", location_postal: "",
  wheelchair: false, parking: false, transit: false,
  accepts_groups: true, max_group_size: "12",
  iban: "", account_holder: "", terms: false,
};

/* Een gevuld voorbeeld, zodat de weergave in het dashboard niet leeg oogt */
const MARCO_PROFILE = {
  ...EMPTY_PROFILE,
  first_name: "Marco", last_name: "Rossi", email: "marco@kookstudiodepan.nl", phone: "06 12 34 56 78",
  street: "Poortstraat", house_number: "14", postal_code: "3572 HH", residence: "Utrecht",
  company_name: "Kookstudio De Pan", kvk_number: "62817394", vat_number: "NL003456789B12",
  display_name: "Marco Rossi", profession: "Italiaanse kok",
  bio_short: "Italiaanse kookworkshops in een echte kookstudio in Wittevrouwen.",
  bio_long: "Opgegroeid in de keuken van mijn nonna in Bologna, inmiddels tien jaar in Utrecht.",
  languages: ["Nederlands", "Italiaans", "Engels"], active_since: "2019",
  city: "Utrecht", neighbourhood: "Wittevrouwen", location_name: "Kookstudio De Pan",
  wheelchair: true, transit: true, accepts_groups: true, max_group_size: "12",
  iban: "NL91 INGB 0002 4453 21", account_holder: "M. Rossi", terms: true,
};

const Switch = ({ on, onChange, title, note }) => (
  <div className="ww-switch">
    <span><strong>{title}</strong>{note && <span>{note}</span>}</span>
    <button className="ww-switch-btn" data-on={on ? "true" : "false"} role="switch"
      aria-checked={on} aria-label={title} onClick={() => onChange(!on)}><i /></button>
  </div>
);

const Optional = () => <span className="ww-opt">optioneel</span>;

function ProviderProfileForm({ go, mode = "signup" }) {
  const [f, setF] = useState(mode === "edit" ? MARCO_PROFILE : EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setSaved(false); };
  const put = (k, v) => { setF({ ...f, [k]: v }); setSaved(false); };

  const filled = REQUIRED.filter(([k]) => String(f[k]).trim() !== "");
  const pct = Math.round((filled.length / REQUIRED.length) * 100);
  const complete = pct === 100 && f.terms;

  const toggleLang = (l) => put("languages",
    f.languages.includes(l) ? f.languages.filter((x) => x !== l) : [...f.languages, l]);

  const sections = [
    "Persoonsgegevens", "Adres", "Bedrijfsgegevens", "Je profiel",
    "Waar je lesgeeft", "Groepen", "Uitbetaling",
  ];

  const body = (
    <>
      <div className="ww-form-two">
        <div>
          {/* 1. Persoonsgegevens -> directus_users + providers.display_name */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">1</span>
              <div><h2>{sections[0]}</h2>
                <p>Voor de overeenkomst en het contact met ons. Dit staat niet op je openbare profiel.</p></div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Voornaam"><input className="ww-input" value={f.first_name} onChange={set("first_name")} placeholder="Marco" autoComplete="given-name" /></Field>
              <Field label="Achternaam"><input className="ww-input" value={f.last_name} onChange={set("last_name")} placeholder="Rossi" autoComplete="family-name" /></Field>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="E-mailadres"><input className="ww-input" type="email" value={f.email} onChange={set("email")} placeholder="marco@kookstudio.nl" autoComplete="email" /></Field>
              <Field label="Telefoonnummer" hint="Zo bereiken wij je bij een vraag over een boeking.">
                <input className="ww-input" value={f.phone} onChange={set("phone")} placeholder="06 12 34 56 78" autoComplete="tel" />
              </Field>
            </div>
            <Field label={<>Geboortedatum <Optional /></>} hint="Alleen voor verificatie, nooit zichtbaar op je profiel.">
              <input className="ww-input" type="date" value={f.birth_date} onChange={set("birth_date")} />
            </Field>
          </section>

          {/* 2. Adres -> providers.address, postal_code, city */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">2</span>
              <div><h2>{sections[1]}</h2>
                <p>Je factuuradres. Deelnemers zien dit niet, tenzij je hieronder aangeeft dat je hier lesgeeft.</p></div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Straat"><input className="ww-input" value={f.street} onChange={set("street")} placeholder="Poortstraat" autoComplete="address-line1" /></Field>
              <div className="ww-row ww-row--2">
                <Field label="Huisnummer"><input className="ww-input" value={f.house_number} onChange={set("house_number")} placeholder="14" /></Field>
                <Field label={<>Toevoeging <Optional /></>}><input className="ww-input" value={f.addition} onChange={set("addition")} placeholder="bis" /></Field>
              </div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Postcode"><input className="ww-input" value={f.postal_code} onChange={set("postal_code")} placeholder="3572 HH" autoComplete="postal-code" /></Field>
              <Field label="Woonplaats"><input className="ww-input" value={f.residence} onChange={set("residence")} placeholder="Utrecht" autoComplete="address-level2" /></Field>
            </div>
            <Field label="Land">
              <select className="ww-select" value={f.country} onChange={set("country")}>
                {["Nederland", "Belgie", "Duitsland"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </section>

          {/* 3. Bedrijfsgegevens -> providers.kvk_number, vat_number */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">3</span>
              <div><h2>{sections[2]}</h2>
                <p>Heb je geen bedrijf? Laat dit leeg. Je kunt ook als particulier workshops geven.</p></div>
            </div>
            <Field label={<>Bedrijfsnaam <Optional /></>}>
              <input className="ww-input" value={f.company_name} onChange={set("company_name")} placeholder="Kookstudio De Pan" />
            </Field>
            <div className="ww-row ww-row--2">
              <Field label={<>KvK-nummer <Optional /></>} hint="Acht cijfers.">
                <input className="ww-input" value={f.kvk_number} onChange={set("kvk_number")} placeholder="62817394" inputMode="numeric" />
              </Field>
              <Field label={<>Btw-identificatienummer <Optional /></>}>
                <input className="ww-input" value={f.vat_number} onChange={set("vat_number")} placeholder="NL003456789B12" />
              </Field>
            </div>
            <Switch on={f.vat_liable} onChange={(v) => put("vat_liable", v)}
              title="Ik breng btw in rekening" note="Zet dit uit als je vrijgesteld bent." />
            <Switch on={f.kor} onChange={(v) => put("kor", v)}
              title="Ik doe mee aan de kleineondernemersregeling"
              note="Dan zetten we geen btw op de facturen die wij namens jou maken." />
            <p className="ww-hint" style={{ marginTop: 12 }}>
              Wij zijn geen belastingadviseur. Twijfel je wat voor jou geldt, vraag het na bij de
              Belastingdienst of je boekhouder voordat je je eerste workshop publiceert.
            </p>
          </section>

          {/* 4. Openbaar profiel -> providers.display_name, profession, bio, avatar, languages */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">4</span>
              <div><h2>{sections[3]}</h2>
                <p>Dit ziet iedereen op je profielpagina. Schrijf zoals je praat.</p></div>
            </div>
            <div className="ww-upload" style={{ marginBottom: 18 }}>
              <Avatar name={f.display_name || "Nieuw profiel"} size={64} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <strong style={{ fontSize: 14.5, display: "block" }}>Profielfoto</strong>
                <span className="ww-meta">Een gezicht werkt beter dan een logo. Minimaal 400 bij 400 pixels.</span>
              </div>
              <Button variant="outline" size="sm">Foto kiezen</Button>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Naam op je profiel" hint="Meestal je eigen naam.">
                <input className="ww-input" value={f.display_name} onChange={set("display_name")} placeholder="Marco Rossi" />
              </Field>
              <Field label="Vakgebied" hint="Een paar woorden, bijvoorbeeld: Italiaanse kok.">
                <input className="ww-input" value={f.profession} onChange={set("profession")} placeholder="Italiaanse kok" />
              </Field>
            </div>
            <Field label="Korte introductie" hint="Een zin. Deze staat op kaartjes en in Google.">
              <input className="ww-input" value={f.bio_short} onChange={set("bio_short")}
                placeholder="Italiaanse kookworkshops in een echte kookstudio." maxLength={140} />
            </Field>
            <Field label="Over jou" hint="Twee of drie alineas. Waarom doe je dit, en wat maakt jouw workshop anders?">
              <textarea className="ww-textarea" value={f.bio_long} onChange={set("bio_long")} rows={5}
                placeholder="Opgegroeid in de keuken van mijn nonna in Bologna..." />
            </Field>
            <Field label="Talen waarin je lesgeeft">
              <div className="ww-tagpick">
                {PROFILE_LANGS.map((l) => (
                  <Chip key={l} on={f.languages.includes(l)} onClick={() => toggleLang(l)}>{l}</Chip>
                ))}
              </div>
            </Field>
            <div className="ww-row ww-row--2" style={{ marginTop: 16 }}>
              <Field label={<>Actief sinds <Optional /></>} hint="Voedt: geeft workshops sinds ...">
                <input className="ww-input" value={f.active_since} onChange={set("active_since")} placeholder="2019" inputMode="numeric" />
              </Field>
              <Field label={<>Website <Optional /></>}>
                <input className="ww-input" value={f.website} onChange={set("website")} placeholder="kookstudiodepan.nl" />
              </Field>
            </div>
            <Field label={<>Instagram <Optional /></>} hint="Helpt mensen je te herkennen en versterkt je vindbaarheid.">
              <input className="ww-input" value={f.instagram} onChange={set("instagram")} placeholder="@kookstudiodepan" />
            </Field>
          </section>

          {/* 5. Werklocatie -> providers.city, neighbourhood, location_name, amenities */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">5</span>
              <div><h2>{sections[4]}</h2>
                <p>De plek waar deelnemers naartoe komen. Het exacte adres delen we pas na een boeking.</p></div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Stad" hint="Bepaalt in welke stadpagina je aanbod verschijnt.">
                <select className="ww-select" value={f.city} onChange={set("city")}>
                  <option value="">Kies een stad</option>
                  {PROFILE_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={<>Wijk of buurt <Optional /></>}>
                <input className="ww-input" value={f.neighbourhood} onChange={set("neighbourhood")} placeholder="Wittevrouwen" />
              </Field>
            </div>
            <Field label={<>Naam van de locatie <Optional /></>}>
              <input className="ww-input" value={f.location_name} onChange={set("location_name")} placeholder="Kookstudio De Pan" />
            </Field>
            <Switch on={f.location_same} onChange={(v) => put("location_same", v)}
              title="Ik geef les op mijn eigen adres" note="Zet dit uit als je een aparte studio of locatie gebruikt." />
            {!f.location_same && (
              <div className="ww-row ww-row--2" style={{ marginTop: 14 }}>
                <Field label="Adres van de locatie">
                  <input className="ww-input" value={f.location_street} onChange={set("location_street")} placeholder="Voorstraat 1" />
                </Field>
                <Field label="Postcode">
                  <input className="ww-input" value={f.location_postal} onChange={set("location_postal")} placeholder="3512 AA" />
                </Field>
              </div>
            )}
            <p className="ww-hint" style={{ margin: "16px 0 8px", fontWeight: 700, color: tokens.color.ink }}>
              Voorzieningen
            </p>
            <Switch on={f.wheelchair} onChange={(v) => put("wheelchair", v)} title="Rolstoeltoegankelijk" />
            <Switch on={f.parking} onChange={(v) => put("parking", v)} title="Gratis parkeren in de buurt" />
            <Switch on={f.transit} onChange={(v) => put("transit", v)} title="Goed bereikbaar met het OV" />
          </section>

          {/* 6. Groepen -> providers.accepts_groups, max_group_size */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">6</span>
              <div><h2>{sections[5]}</h2>
                <p>Teamuitjes leveren de grootste boekingen op. Je kunt dit later altijd aanzetten.</p></div>
            </div>
            <Switch on={f.accepts_groups} onChange={(v) => put("accepts_groups", v)}
              title="Ik neem groepsaanvragen aan" note="Wij sturen je de aanvraag, jij maakt de offerte." />
            {f.accepts_groups && (
              <Field label="Grootste groep die je aankunt" hint="Aantal personen.">
                <input className="ww-input" value={f.max_group_size} onChange={set("max_group_size")} placeholder="12" inputMode="numeric" />
              </Field>
            )}
          </section>

          {/* 7. Uitbetaling -> providers.payout_iban_last4, mollie_connect_id */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">7</span>
              <div><h2>{sections[6]}</h2>
                <p>Hierop maken we je omzet over, elke maandag na afloop van de workshop.</p></div>
            </div>
            <Field label="Rekeningnummer">
              <input className="ww-input" value={f.iban} onChange={set("iban")} placeholder="NL91 INGB 0002 4453 21" />
            </Field>
            <Field label="Tenaamstelling" hint="Zoals de naam bij je bank bekend staat.">
              <input className="ww-input" value={f.account_holder} onChange={set("account_holder")} placeholder="M. Rossi" />
            </Field>
            <div className="ww-sidecard" style={{ marginTop: 6, background: tokens.color.cloud, border: 0 }}>
              <h3>Wat je overhoudt</h3>
              <p style={{ color: tokens.color.ink, opacity: .75, marginBottom: 0 }}>
                Wij innen het volledige bedrag bij de deelnemer en houden 15 procent commissie in.
                Bij een workshop van 45 euro per persoon houd jij 38,25 euro per deelnemer over.
              </p>
            </div>
            <label className="ww-check" style={{ marginTop: 18 }}>
              <input type="checkbox" checked={f.terms} onChange={(e) => put("terms", e.target.checked)} />
              Ik ga akkoord met de voorwaarden voor workshopgevers en met 15 procent commissie per boeking.
            </label>
          </section>
        </div>

        <aside className="ww-side-sticky">
          <div className="ww-prog">
            <div className="ww-prog-top">
              <strong style={{ fontSize: 14.5 }}>Profiel compleet</strong>
              <b>{pct}%</b>
            </div>
            <div className="ww-prog-bar"><i style={{ width: `${pct}%` }} /></div>
            <ul className="ww-checklist">
              {REQUIRED.map(([k, label]) => (
                <li key={k} data-done={String(f[k]).trim() !== "" ? "true" : "false"}>
                  <span className="ww-tick"><Icon name="check" size={13} /></span>{label}
                </li>
              ))}
            </ul>
          </div>

          <div className="ww-preview">
            <strong style={{ fontSize: 13.5 }}>Zo ziet het eruit</strong>
            <div className="ww-preview-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={f.display_name || "Nieuw profiel"} size={44} />
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 15, display: "block" }}>{f.display_name || "Je naam"}</strong>
                  <span className="ww-meta" style={{ fontSize: 12.5 }}>
                    {[f.profession || "Je vakgebied", f.city || "Je stad"].join(" · ")}
                  </span>
                </div>
              </div>
              <p className="ww-meta" style={{ marginTop: 12 }}>
                {f.bio_short || "Hier komt je korte introductie te staan."}
              </p>
              {f.kvk_number && <p className="ww-hint" style={{ marginTop: 10 }}>KvK {f.kvk_number}</p>}
            </div>
            <p className="ww-hint" style={{ marginTop: 12 }}>
              Adres, telefoonnummer en rekeningnummer blijven altijd afgeschermd.
            </p>
          </div>
        </aside>
      </div>

      <div className="ww-savebar">
        <div className="ww-savebar-in">
          <Button variant="outline" onClick={() => setSaved(true)}>Opslaan als concept</Button>
          <Button variant="primary" disabled={!complete}
            onClick={() => { setSaved(true); if (complete && mode === "signup") go({ name: "dashboard" }); }}>
            {mode === "edit" ? "Wijzigingen opslaan" : "Profiel indienen"}
          </Button>
          <span className="ww-meta" style={{ marginLeft: "auto" }}>
            {saved
              ? "Opgeslagen. Je kunt later verder."
              : complete
                ? "Alles staat erin. We kijken je profiel binnen een werkdag na."
                : `Nog ${REQUIRED.length - filled.length} verplichte velden${f.terms ? "" : " en de voorwaarden"} te gaan.`}
          </span>
        </div>
      </div>
    </>
  );

  if (mode === "edit") return body;

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
        <a onClick={() => go({ name: "auth", tab: "provider" })}>Word workshopgever</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Je profiel</span>
      </nav>
      <header className="ww-form-head">
        <span className="ww-eyebrow">Stap 2 van 2</span>
        <h1>Maak je profiel compleet</h1>
        <p>
          Je account staat er al. Vul hieronder je gegevens aan, dan kunnen we je profiel nakijken en
          je eerste workshop online zetten. Tussendoor opslaan kan altijd.
        </p>
      </header>
      {body}
    </div>
  );
}

/* ===========================================================================
   Pagina 10: nieuwe workshop aanmaken

   Zes stappen die samen een record in de collectie workshops vullen, plus
   de bijbehorende o2m-records: workshop_inclusions, workshop_faq,
   workshop_media en workshop_sessions. Concept opslaan kan in elke stap,
   publiceren pas als het minimum compleet is.
   =========================================================================== */
const WIZ_STEPS = [
  ["Basis", "Titel, categorie en waarvoor het geschikt is"],
  ["Inhoud", "Wat deelnemers gaan doen en wat erbij zit"],
  ["Praktisch", "Duur, groepsgrootte, niveau en voorzieningen"],
  ["Beeld", "Foto's van de workshop"],
  ["Prijs", "Prijs, annuleren en groepen"],
  ["Datums", "Wanneer mensen kunnen boeken"],
];

const WIZ_CATEGORIES = [
  "Koken & bakken", "Keramiek & klei", "Schilderen & kunst", "Drinks & proeverijen",
  "Bloemen & groen", "Ambacht & maken", "Fotografie & media", "Dans, muziek & theater",
  "Wellness & beauty", "Actief & buiten", "Niche & onverwacht", "Duurzaam & repair",
];
const WIZ_OCCASIONS = ["Date", "Vrienden", "Teamuitje", "Kinderfeestje", "Vrijgezellenfeest", "Cadeau", "Familie"];
const WIZ_DIET = ["Vegetarisch", "Vegan", "Glutenvrij", "Halal"];
const WIZ_INCLUSION_TYPES = ["Materiaal inbegrepen", "Hapjes & drankjes", "Mee naar huis", "Recepten of handleiding"];

const EMPTY_WORKSHOP = {
  title: "", category: "", occasions: [],
  intro: "", description: "",
  inclusions: [""], inclusion_types: [], faq: [{ q: "", a: "" }],
  duration: "", level: "beginner", languages: ["Nederlands"],
  min_participants: "4", max_participants: "12", format: "on_location",
  diet: [], age_rating: "Alle leeftijden",
  wheelchair: false, parking: false, transit: false,
  media: [true, false, false, false],
  price: "", cancellation: "flexible_48h", instant: true, giftcard: true,
  group_quote: true, group_from: "10",
  sessions: [{ date: "", time: "14:00", capacity: "12" }],
};

/* Het minimum voordat publiceren logisch is */
const WIZ_REQUIRED = [
  ["title", "Titel"], ["category", "Categorie"], ["intro", "Korte omschrijving"],
  ["description", "Beschrijving"], ["duration", "Duur"], ["price", "Prijs per persoon"],
];

function WorkshopWizard({ go, embedded = false, onClose }) {
  const [w, setW] = useState(EMPTY_WORKSHOP);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => { setW({ ...w, [k]: e.target.value }); setSaved(false); };
  const put = (k, v) => { setW({ ...w, [k]: v }); setSaved(false); };
  const toggle = (k, v) => put(k, w[k].includes(v) ? w[k].filter((x) => x !== v) : [...w[k], v]);

  const setRow = (k, i, patch) => put(k, w[k].map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const addRow = (k, empty) => put(k, [...w[k], empty]);
  const delRow = (k, i) => put(k, w[k].filter((_, j) => j !== i));

  const missing = WIZ_REQUIRED.filter(([k]) => String(w[k]).trim() === "");
  const hasMedia = w.media.filter(Boolean).length >= 1;
  const hasSession = w.sessions.some((s) => s.date);
  const canPublish = missing.length === 0 && hasMedia && hasSession;

  const stepDone = (n) => {
    if (n === 1) return w.title && w.category;
    if (n === 2) return w.intro && w.description;
    if (n === 3) return String(w.duration).trim() !== "";
    if (n === 4) return hasMedia;
    if (n === 5) return String(w.price).trim() !== "";
    if (n === 6) return hasSession;
    return false;
  };

  const body = (
    <>
      <div className="ww-form-two">
        <div>
          {step === 1 && (
            <section className="ww-fsec">
              <div className="ww-fsec-head">
                <span className="ww-fsec-n">1</span>
                <div><h2>Basis</h2><p>Zeg wat mensen gaan doen, niet wat het is. Dat leest prettiger en zoekt beter.</p></div>
              </div>
              <Field label="Titel" hint="Maximaal 70 tekens. Bijvoorbeeld: Italiaans koken met Marco.">
                <input className="ww-input" value={w.title} onChange={set("title")} maxLength={70}
                  placeholder="Italiaans koken met Marco" />
              </Field>
              <Field label="Categorie" hint="Bepaalt in welke categorie- en stadpagina je workshop verschijnt.">
                <select className="ww-select" value={w.category} onChange={set("category")}>
                  <option value="">Kies een categorie</option>
                  {WIZ_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={<>Waarvoor is het geschikt? <Optional /></>} hint="Mensen filteren hierop, dus kies er gerust meerdere.">
                <div className="ww-tagpick">
                  {WIZ_OCCASIONS.map((o) => (
                    <Chip key={o} on={w.occasions.includes(o)} onClick={() => toggle("occasions", o)}>{o}</Chip>
                  ))}
                </div>
              </Field>
            </section>
          )}

          {step === 2 && (
            <section className="ww-fsec">
              <div className="ww-fsec-head">
                <span className="ww-fsec-n">2</span>
                <div><h2>Inhoud</h2><p>Wat gaan deelnemers doen, en wat krijgen ze ervoor?</p></div>
              </div>
              <Field label="Korte omschrijving" hint="Twee of drie zinnen. Deze staat op de kaart en in Google.">
                <textarea className="ww-textarea" value={w.intro} onChange={set("intro")} rows={2}
                  placeholder="Leer in drie uur de basis van de Italiaanse keuken, van verse pasta tot tiramisu." />
              </Field>
              <Field label="Beschrijving" hint="Vertel hoe de middag verloopt. Korte alineas lezen het makkelijkst.">
                <textarea className="ww-textarea" value={w.description} onChange={set("description")} rows={6}
                  placeholder="Je maakt verse pasta vanaf nul, een klassieke ragu en tiramisu..." />
              </Field>

              <Field label="Wat is inbegrepen" hint="Een regel per onderdeel. Dit wordt de lijst met vinkjes.">
                <div>
                  {w.inclusions.map((t, i) => (
                    <div className="ww-listrow" key={i}>
                      <input className="ww-input" value={t}
                        onChange={(e) => put("inclusions", w.inclusions.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder="Alle ingredienten en materialen" />
                      {w.inclusions.length > 1 && (
                        <button className="ww-listrow-del" aria-label="Regel verwijderen"
                          onClick={() => delRow("inclusions", i)}><Icon name="close" size={17} /></button>
                      )}
                    </div>
                  ))}
                  <Button variant="quiet" size="sm" icon="plus" onClick={() => addRow("inclusions", "")}>
                    Regel toevoegen
                  </Button>
                </div>
              </Field>

              <Field label={<>Filterlabels <Optional /></>} hint="Hiermee vind je workshop mensen die op deze dingen filteren.">
                <div className="ww-tagpick">
                  {WIZ_INCLUSION_TYPES.map((t) => (
                    <Chip key={t} on={w.inclusion_types.includes(t)} onClick={() => toggle("inclusion_types", t)}>{t}</Chip>
                  ))}
                </div>
              </Field>

              <Field label={<>Veelgestelde vragen <Optional /></>} hint="Scheelt jou mailtjes en helpt je vindbaarheid.">
                <div>
                  {w.faq.map((row, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div className="ww-listrow">
                        <input className="ww-input" value={row.q}
                          onChange={(e) => setRow("faq", i, { q: e.target.value })}
                          placeholder="Moet ik iets meenemen?" />
                        {w.faq.length > 1 && (
                          <button className="ww-listrow-del" aria-label="Vraag verwijderen"
                            onClick={() => delRow("faq", i)}><Icon name="close" size={17} /></button>
                        )}
                      </div>
                      <textarea className="ww-textarea" value={row.a} rows={2}
                        onChange={(e) => setRow("faq", i, { a: e.target.value })}
                        placeholder="Nee, alles is aanwezig. Kom in makkelijke kleding." />
                    </div>
                  ))}
                  <Button variant="quiet" size="sm" icon="plus" onClick={() => addRow("faq", { q: "", a: "" })}>
                    Vraag toevoegen
                  </Button>
                </div>
              </Field>
            </section>
          )}

          {step === 3 && (
            <section className="ww-fsec">
              <div className="ww-fsec-head">
                <span className="ww-fsec-n">3</span>
                <div><h2>Praktisch</h2><p>Dit staat in de icoonrij bovenaan je pagina en stuurt de filters.</p></div>
              </div>
              <div className="ww-row ww-row--2">
                <Field label="Duur in minuten"><input className="ww-input" value={w.duration} onChange={set("duration")} placeholder="180" inputMode="numeric" /></Field>
                <Field label="Niveau">
                  <select className="ww-select" value={w.level} onChange={set("level")}>
                    <option value="beginner">Beginner</option>
                    <option value="advanced">Gevorderd</option>
                    <option value="all_levels">Alle niveaus</option>
                  </select>
                </Field>
              </div>
              <div className="ww-row ww-row--2">
                <Field label="Minimaal aantal personen"><input className="ww-input" value={w.min_participants} onChange={set("min_participants")} inputMode="numeric" /></Field>
                <Field label="Maximaal aantal personen"><input className="ww-input" value={w.max_participants} onChange={set("max_participants")} inputMode="numeric" /></Field>
              </div>
              <Field label="Waar vindt het plaats?">
                <select className="ww-select" value={w.format} onChange={set("format")}>
                  <option value="on_location">Op mijn locatie</option>
                  <option value="at_home">Bij de deelnemer thuis</option>
                  <option value="at_office">Op kantoor</option>
                  <option value="online">Online</option>
                </select>
              </Field>
              <Field label="Talen">
                <div className="ww-tagpick">
                  {PROFILE_LANGS.map((l) => (
                    <Chip key={l} on={w.languages.includes(l)} onClick={() => toggle("languages", l)}>{l}</Chip>
                  ))}
                </div>
              </Field>
              <Field label="Geschikt voor leeftijd" hint="">
                <select className="ww-select" value={w.age_rating} onChange={set("age_rating")}>
                  {["Alle leeftijden", "Kindvriendelijk", "Vanaf 16 jaar", "Vanaf 18 jaar"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label={<>Dieetwensen die je aankunt <Optional /></>}>
                <div className="ww-tagpick">
                  {WIZ_DIET.map((d) => (
                    <Chip key={d} on={w.diet.includes(d)} onClick={() => toggle("diet", d)}>{d}</Chip>
                  ))}
                </div>
              </Field>
              <p className="ww-hint" style={{ margin: "18px 0 4px", fontWeight: 700, color: tokens.color.ink }}>
                Voorzieningen op de locatie
              </p>
              <Switch on={w.wheelchair} onChange={(v) => put("wheelchair", v)} title="Rolstoeltoegankelijk" />
              <Switch on={w.parking} onChange={(v) => put("parking", v)} title="Gratis parkeren in de buurt" />
              <Switch on={w.transit} onChange={(v) => put("transit", v)} title="Goed bereikbaar met het OV" />
            </section>
          )}

          {step === 4 && (
            <section className="ww-fsec">
              <div className="ww-fsec-head">
                <span className="ww-fsec-n">4</span>
                <div><h2>Beeld</h2><p>De eerste foto is je omslag. Echte mensen en echte momenten werken het best.</p></div>
              </div>
              <div className="ww-mediagrid">
                {w.media.map((filled, i) => (
                  <button className="ww-mediaslot" key={i} data-filled={filled ? "true" : "false"}
                    onClick={() => put("media", w.media.map((m, j) => (j === i ? !m : m)))}
                    aria-label={filled ? `Foto ${i + 1} verwijderen` : `Foto ${i + 1} toevoegen`}>
                    {filled ? (
                      <>
                        <Photo icon="camera" style={{ position: "absolute", inset: 0, height: "100%" }} />
                        <span className="ww-mediaslot-tag">{i === 0 ? "Omslag" : i + 1}</span>
                      </>
                    ) : (
                      <><Icon name="plus" size={22} />Foto toevoegen</>
                    )}
                  </button>
                ))}
              </div>
              <p className="ww-hint" style={{ marginTop: 14 }}>
                Vier foto's is het minimum dat goed oogt, meer mag. Liggend formaat, minimaal 1600 pixels
                breed. Klik een gevulde plek aan om hem weer leeg te maken.
              </p>
            </section>
          )}

          {step === 5 && (
            <section className="ww-fsec">
              <div className="ww-fsec-head">
                <span className="ww-fsec-n">5</span>
                <div><h2>Prijs en voorwaarden</h2><p>Jij bepaalt de prijs. Wij houden 15 procent commissie in.</p></div>
              </div>
              <Field label="Prijs per persoon in euro" hint="Deelnemers zien: vanaf dit bedrag.">
                <input className="ww-input" value={w.price} onChange={set("price")} placeholder="45" inputMode="numeric" />
              </Field>
              {w.price && (
                <div className="ww-sidecard" style={{ marginTop: 0, background: tokens.color.cloud, border: 0 }}>
                  <h3>Wat je overhoudt</h3>
                  <p style={{ color: tokens.color.ink, opacity: .75, marginBottom: 0 }}>
                    {"\u20AC"}{(Number(w.price) * 0.85).toFixed(2).replace(".", ",")} per deelnemer.
                    Bij een volle groep van {w.max_participants} personen is dat{" "}
                    {"\u20AC"}{(Number(w.price) * 0.85 * Number(w.max_participants || 0)).toFixed(2).replace(".", ",")} per sessie.
                  </p>
                </div>
              )}
              <Field label="Annuleringsvoorwaarden" hint="Soepel annuleren levert meetbaar meer boekingen op.">
                <select className="ww-select" value={w.cancellation} onChange={set("cancellation")}>
                  <option value="flexible_48h">Gratis annuleren tot 48 uur vooraf</option>
                  <option value="moderate_7d">Gratis annuleren tot 7 dagen vooraf</option>
                  <option value="strict">Niet annuleerbaar, wel verzetten</option>
                </select>
              </Field>
              <Switch on={w.instant} onChange={(v) => put("instant", v)} title="Direct boekbaar"
                note="Zonder jouw tussenkomst. Zet dit uit als je elke boeking eerst wilt bevestigen." />
              <Switch on={w.giftcard} onChange={(v) => put("giftcard", v)} title="Als cadeaubon te geven"
                note="De ontvanger kiest zelf een datum." />
              <Switch on={w.group_quote} onChange={(v) => put("group_quote", v)} title="Groepsaanvragen aannemen"
                note="Wij sturen de aanvraag door, jij maakt de offerte." />
              {w.group_quote && (
                <Field label="Groepsofferte vanaf" hint="Aantal personen.">
                  <input className="ww-input" value={w.group_from} onChange={set("group_from")} inputMode="numeric" />
                </Field>
              )}
            </section>
          )}

          {step === 6 && (
            <>
              <section className="ww-fsec">
                <div className="ww-fsec-head">
                  <span className="ww-fsec-n">6</span>
                  <div><h2>Datums</h2><p>Zonder datums kunnen mensen niets boeken. Zet er meteen een paar neer.</p></div>
                </div>
                {w.sessions.map((s, i) => (
                  <div className="ww-sesrow" key={i}>
                    <Field label="Datum">
                      <input className="ww-input" type="date" value={s.date}
                        onChange={(e) => setRow("sessions", i, { date: e.target.value })} />
                    </Field>
                    <Field label="Starttijd">
                      <input className="ww-input" type="time" value={s.time}
                        onChange={(e) => setRow("sessions", i, { time: e.target.value })} />
                    </Field>
                    <Field label="Plekken">
                      <input className="ww-input" value={s.capacity} inputMode="numeric"
                        onChange={(e) => setRow("sessions", i, { capacity: e.target.value })} />
                    </Field>
                    {w.sessions.length > 1 && (
                      <button className="ww-listrow-del" aria-label="Datum verwijderen"
                        onClick={() => delRow("sessions", i)}><Icon name="close" size={17} /></button>
                    )}
                  </div>
                ))}
                <Button variant="quiet" size="sm" icon="plus" style={{ marginTop: 14 }}
                  onClick={() => addRow("sessions", { date: "", time: "14:00", capacity: w.max_participants })}>
                  Datum toevoegen
                </Button>
                <p className="ww-hint" style={{ marginTop: 14 }}>
                  Het aantal plekken staat standaard op je maximale groepsgrootte. Per datum aanpassen kan,
                  bijvoorbeeld als je een kleinere ruimte gebruikt.
                </p>
              </section>

              <section className="ww-fsec">
                <h2 style={{ fontSize: 19, marginBottom: 14 }}>Klaar om te publiceren?</h2>
                {!canPublish && (
                  <div className="ww-alert">
                    <Icon name="bell" size={19} />
                    <span>
                      Nog niet compleet:{" "}
                      {[...missing.map(([, l]) => l.toLowerCase()),
                        ...(hasMedia ? [] : ["minstens een foto"]),
                        ...(hasSession ? [] : ["minstens een datum"])].join(", ")}.
                      Opslaan als concept kan wel.
                    </span>
                  </div>
                )}
                <ul className="ww-summary">
                  {[["Titel", w.title || "nog leeg"], ["Categorie", w.category || "nog leeg"],
                    ["Duur", w.duration ? `${w.duration} minuten` : "nog leeg"],
                    ["Groepsgrootte", `${w.min_participants} tot ${w.max_participants} personen`],
                    ["Prijs", w.price ? `\u20AC${w.price} per persoon` : "nog leeg"],
                    ["Foto's", `${w.media.filter(Boolean).length} van ${w.media.length}`],
                    ["Datums", `${w.sessions.filter((s) => s.date).length} ingepland`]].map(([l, v]) => (
                    <li key={l}><span>{l}</span><strong>{v}</strong></li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>

        <aside className="ww-side-sticky">
          <nav className="ww-rail" aria-label="Stappen">
            {WIZ_STEPS.map(([label], i) => (
              <button key={label} className="ww-rail-item" data-on={step === i + 1 ? "true" : "false"}
                data-done={stepDone(i + 1) ? "true" : "false"} onClick={() => setStep(i + 1)}>
                <span className="ww-rail-n">{stepDone(i + 1) ? <Icon name="check" size={13} /> : i + 1}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="ww-preview">
            <strong style={{ fontSize: 13.5 }}>Zo ziet het eruit</strong>
            <div className="ww-preview-card" style={{ padding: 0, overflow: "hidden" }}>
              <Photo icon="camera" ratio="4/3" />
              <div style={{ padding: 14 }}>
                <strong style={{ fontSize: 15.5, display: "block", lineHeight: 1.3 }}>
                  {w.title || "Titel van je workshop"}
                </strong>
                <p className="ww-meta" style={{ marginTop: 5 }}>
                  {[w.category || "Categorie", w.duration ? `${w.duration} min` : "duur"].join(" · ")}
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 10 }}>
                  <span className="ww-meta">Nieuw</span>
                  <span style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11.5, color: tokens.color.slate, display: "block" }}>vanaf</span>
                    <b style={{ fontFamily: tokens.font.display, fontSize: 18 }}>
                      {"\u20AC"}{w.price || "0"}
                    </b>
                  </span>
                </div>
              </div>
            </div>
            <p className="ww-hint" style={{ marginTop: 12 }}>
              Een concept is alleen voor jou zichtbaar. Publiceren zet hem live op je profiel en in het aanbod.
            </p>
          </div>
        </aside>
      </div>

      <div className="ww-savebar">
        <div className="ww-savebar-in">
          {step > 1 && <Button variant="outline" icon="left" onClick={() => setStep(step - 1)}>Terug</Button>}
          {step < 6 && <Button variant="primary" onClick={() => setStep(step + 1)}>Verder</Button>}
          <Button variant={step === 6 ? "outline" : "quiet"} onClick={() => setSaved(true)}>
            Opslaan als concept
          </Button>
          {step === 6 && (
            <Button variant="primary" disabled={!canPublish}
              onClick={() => { setSaved(true); onClose && onClose(); }}>
              Publiceren
            </Button>
          )}
          <span className="ww-meta" style={{ marginLeft: "auto" }}>
            {saved ? "Opgeslagen als concept." : `Stap ${step} van 6 · ${WIZ_STEPS[step - 1][1]}`}
          </span>
        </div>
      </div>
    </>
  );

  if (embedded) return body;

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "dashboard" })}>Dashboard</a><span>/</span>
        <a onClick={() => go({ name: "dashboard" })}>Workshops</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Nieuw</span>
      </nav>
      <header className="ww-form-head">
        <span className="ww-eyebrow">Nieuwe workshop</span>
        <h1>Zet je workshop online</h1>
        <p>
          Zes korte stappen. Je kunt tussendoor opslaan en later verder, en na publiceren blijft alles
          aanpasbaar.
        </p>
      </header>
      {body}
    </div>
  );
}

/* ===========================================================================
   Pagina 6: inloggen en registreren
   =========================================================================== */
const SIDE_COPY = {
  visitor: {
    h: "Bewaar wat je leuk vindt, boek in twee tikken",
    p: "Met een account zie je je boekingen terug, bewaar je favorieten en schrijf je reviews.",
    list: ["Al je boekingen op een plek", "Favorieten bewaren voor later", "Gratis annuleren tot 48 uur vooraf"],
  },
  provider: {
    h: "Deel je vak, bepaal je eigen prijs",
    p: "Van thuiskok tot keramist. Zet je workshop online en bereik heel Nederland.",
    list: ["Je eerste workshop staat binnen een dag online", "Jij bepaalt datums, prijs en groepsgrootte", "Uitbetaling na afloop, zonder gedoe"],
  },
};

function AuthPage({ go, tab: initialTab }) {
  const [tab, setTab] = useState(initialTab || "visitor");
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const copy = SIDE_COPY[tab];

  useEffect(() => { setMode("login"); setStep(1); setDone(false); }, [tab]);

  const isProviderSignup = tab === "provider" && mode === "signup";

  return (
    <div className="ww-auth">
      <div className="ww-auth-side">
        <span className="ww-auth-blob" style={{ width: 320, height: 320, background: "rgba(255,92,110,.5)", top: -80, right: -60 }} />
        <span className="ww-auth-blob" style={{ width: 220, height: 220, background: "rgba(255,255,255,.12)", bottom: 40, left: -70 }} />
        <a className="ww-logo" style={{ position: "relative", zIndex: 2 }} onClick={() => go({ name: "home" })}>
          <Logo size={34} mono /><Wordmark light />
        </a>
        <div>
          <h2>{copy.h}</h2>
          <p>{copy.p}</p>
          <ul className="ww-auth-quotes" style={{ marginTop: 26 }}>
            {copy.list.map((t) => (
              <li key={t}><Icon name="check" size={20} style={{ flex: "none", marginTop: 2 }} />{t}</li>
            ))}
          </ul>
        </div>
        <p style={{ fontSize: 13.5, opacity: .6, position: "relative", zIndex: 2 }}>
          Iets buitengewoons, dichtbij.
        </p>
      </div>

      <div className="ww-auth-main">
        <div className="ww-auth-box">
          <a className="ww-logo" style={{ marginBottom: 26 }} onClick={() => go({ name: "home" })}>
            <Logo size={30} /><Wordmark />
          </a>

          <div className="ww-tabs" role="tablist">
            <button role="tab" data-on={tab === "visitor" ? "true" : "false"} onClick={() => setTab("visitor")}>
              Ik wil boeken
            </button>
            <button role="tab" data-on={tab === "provider" ? "true" : "false"} onClick={() => setTab("provider")}>
              Ik geef workshops
            </button>
          </div>

          {done ? (
            <div className="ww-done">
              <span className="ww-done-ico"><Icon name="check" size={34} /></span>
              <h1 style={{ fontSize: 26, marginBottom: 10 }}>Je account staat klaar</h1>
              <p className="ww-meta" style={{ marginBottom: 24 }}>
                {tab === "provider"
                  ? "We kijken je profiel na en zetten je workshop binnen een werkdag online. Ondertussen kun je alvast datums toevoegen."
                  : "Je kunt nu boeken, favorieten bewaren en je boekingen terugvinden."}
              </p>
              <Button variant="primary" size="lg" block
                onClick={() => go({ name: tab === "provider" ? "signup" : "home" })}>
                {tab === "provider" ? "Profiel compleet maken" : "Verder zoeken"}
              </Button>
              {tab === "provider" && (
                <button className="ww-btn ww-btn--ghost" style={{ marginTop: 12 }}
                  onClick={() => go({ name: "dashboard" })}>
                  Later, breng me naar mijn dashboard
                </button>
              )}
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 28, marginBottom: 8 }}>
                {mode === "login"
                  ? (tab === "provider" ? "Inloggen als workshopgever" : "Welkom terug")
                  : (tab === "provider" ? "Word workshopgever" : "Maak een account")}
              </h1>
              <p className="ww-meta" style={{ marginBottom: 24 }}>
                {mode === "login"
                  ? "Log in om verder te gaan waar je gebleven was."
                  : (tab === "provider"
                    ? "Drie korte stappen en je eerste workshop staat klaar."
                    : "Even iets invullen en je kunt boeken.")}
              </p>

              {isProviderSignup && (
                <div className="ww-steps-bar" aria-label={`Stap ${step} van 3`}>
                  {[1, 2, 3].map((i) => <i key={i} data-on={i <= step ? "true" : "false"} />)}
                </div>
              )}

              {mode === "login" && (
                <>
                  <div className="ww-social">
                    <Button variant="outline" block icon="google">Verder met Google</Button>
                    <Button variant="outline" block icon="apple">Verder met Apple</Button>
                  </div>
                  <div className="ww-or">of met e-mail</div>
                  <Field label="E-mailadres">
                    <input className="ww-input" type="email" placeholder="jouw@email.nl" autoComplete="email" />
                  </Field>
                  <Field label="Wachtwoord">
                    <input className="ww-input" type="password" placeholder="Je wachtwoord" autoComplete="current-password" />
                  </Field>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "4px 0 22px" }}>
                    <label className="ww-check"><input type="checkbox" defaultChecked /> Ingelogd blijven</label>
                    <a style={{ fontSize: 13.5, fontWeight: 700, color: tokens.color.brand }}>Wachtwoord vergeten?</a>
                  </div>
                  <Button variant="primary" size="lg" block
                    onClick={() => go({ name: tab === "provider" ? "dashboard" : "home" })}>
                    Inloggen
                  </Button>
                  <p className="ww-meta" style={{ textAlign: "center", marginTop: 18 }}>
                    Nog geen account?{" "}
                    <a style={{ color: tokens.color.brand, fontWeight: 700 }} onClick={() => setMode("signup")}>
                      {tab === "provider" ? "Word workshopgever" : "Maak er een aan"}
                    </a>
                  </p>
                </>
              )}

              {mode === "signup" && tab === "visitor" && (
                <>
                  <div className="ww-social">
                    <Button variant="outline" block icon="google">Verder met Google</Button>
                  </div>
                  <div className="ww-or">of met e-mail</div>
                  <div className="ww-row ww-row--2">
                    <Field label="Voornaam"><input className="ww-input" placeholder="Sanne" /></Field>
                    <Field label="Achternaam"><input className="ww-input" placeholder="de Vries" /></Field>
                  </div>
                  <Field label="E-mailadres"><input className="ww-input" type="email" placeholder="jouw@email.nl" /></Field>
                  <Field label="Wachtwoord" hint="Minimaal 8 tekens, gebruik iets dat je onthoudt.">
                    <input className="ww-input" type="password" placeholder="Kies een wachtwoord" autoComplete="new-password" />
                  </Field>
                  <label className="ww-check" style={{ margin: "4px 0 22px" }}>
                    <input type="checkbox" /> Stuur me elke maand de leukste workshops. Geen spam, beloofd.
                  </label>
                  <Button variant="primary" size="lg" block onClick={() => setDone(true)}>Account aanmaken</Button>
                  <p className="ww-meta" style={{ textAlign: "center", marginTop: 18 }}>
                    Al een account?{" "}
                    <a style={{ color: tokens.color.brand, fontWeight: 700 }} onClick={() => setMode("login")}>Inloggen</a>
                  </p>
                </>
              )}

              {isProviderSignup && (
                <>
                  {step === 1 && (
                    <>
                      <div className="ww-row ww-row--2">
                        <Field label="Voornaam"><input className="ww-input" placeholder="Marco" /></Field>
                        <Field label="Achternaam"><input className="ww-input" placeholder="Rossi" /></Field>
                      </div>
                      <Field label="E-mailadres"><input className="ww-input" type="email" placeholder="marco@kookstudio.nl" /></Field>
                      <Field label="Wachtwoord" hint="Minimaal 8 tekens.">
                        <input className="ww-input" type="password" placeholder="Kies een wachtwoord" autoComplete="new-password" />
                      </Field>
                      <label className="ww-check" style={{ margin: "4px 0 22px" }}>
                        <input type="checkbox" /> Ik ga akkoord met de voorwaarden voor workshopgevers.
                      </label>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Field label="Wat geef je voor workshops?" hint="Een zin is genoeg, dit staat straks op je profiel.">
                        <input className="ww-input" placeholder="Italiaanse kookworkshops in een echte kookstudio" />
                      </Field>
                      <div className="ww-row ww-row--2">
                        <Field label="Stad">
                          <select className="ww-select">
                            {["Utrecht", "Amsterdam", "Rotterdam", "Den Haag", "Eindhoven", "Groningen"].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </Field>
                        <Field label="Actief sinds">
                          <select className="ww-select">
                            {["2026", "2025", "2024", "2023", "2022", "Eerder"].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Vertel kort over jezelf" hint="Waarom doe je dit, en wat maakt jouw workshop anders?">
                        <textarea className="ww-textarea" placeholder="Opgegroeid in de keuken van mijn nonna in Bologna..." />
                      </Field>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <Field label="Titel van je eerste workshop" hint="Zeg wat mensen gaan doen, niet wat het is.">
                        <input className="ww-input" placeholder="Italiaans koken met Marco" />
                      </Field>
                      <Field label="Categorie">
                        <select className="ww-select">
                          {["Koken & bakken", "Keramiek & klei", "Schilderen & kunst", "Drinks & proeverijen",
                            "Bloemen & groen", "Ambacht & maken"].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </Field>
                      <div className="ww-row ww-row--2">
                        <Field label="Prijs per persoon"><input className="ww-input" placeholder="45" inputMode="numeric" /></Field>
                        <Field label="Duur in minuten"><input className="ww-input" placeholder="180" inputMode="numeric" /></Field>
                      </div>
                      <div className="ww-row ww-row--2">
                        <Field label="Minimaal aantal"><input className="ww-input" placeholder="4" inputMode="numeric" /></Field>
                        <Field label="Maximaal aantal"><input className="ww-input" placeholder="12" inputMode="numeric" /></Field>
                      </div>
                      <p className="ww-hint" style={{ marginBottom: 22 }}>
                        Je kunt dit later allemaal nog aanpassen. Datums voeg je toe in je agenda.
                      </p>
                    </>
                  )}

                  <div style={{ display: "flex", gap: 12 }}>
                    {step > 1 && <Button variant="outline" size="lg" icon="left" onClick={() => setStep(step - 1)}>Terug</Button>}
                    <Button variant="primary" size="lg" block
                      onClick={() => (step < 3 ? setStep(step + 1) : setDone(true))}>
                      {step < 3 ? "Verder" : "Workshop klaarzetten"}
                    </Button>
                  </div>
                  <p className="ww-meta" style={{ textAlign: "center", marginTop: 18 }}>
                    Al een account?{" "}
                    <a style={{ color: tokens.color.brand, fontWeight: 700 }} onClick={() => setMode("login")}>Inloggen</a>
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   Pagina 7: aanbiedersdashboard
   =========================================================================== */
const DASH_SESSIONS = [
  { date: "za 8 aug", time: "14:00", ws: "Italiaans koken met Marco", booked: 8, cap: 12 },
  { date: "di 11 aug", time: "19:00", ws: "Verse pasta masterclass", booked: 10, cap: 10 },
  { date: "wo 12 aug", time: "19:00", ws: "Italiaans koken met Marco", booked: 10, cap: 12 },
  { date: "za 15 aug", time: "14:00", ws: "Italiaans koken met Marco", booked: 4, cap: 12 },
  { date: "zo 16 aug", time: "13:00", ws: "Tiramisu & dolci workshop", booked: 2, cap: 12 },
];

const DASH_BOOKINGS = [
  { code: "WW-8F2K4M", name: "Sanne de Vries", ws: "Italiaans koken", date: "za 8 aug", people: 2, total: 90, status: "confirmed" },
  { code: "WW-3QN7XZ", name: "Mark Janssen", ws: "Verse pasta", date: "di 11 aug", people: 6, total: 330, status: "confirmed" },
  { code: "WW-9LD2PT", name: "Iris Bakker", ws: "Italiaans koken", date: "wo 12 aug", people: 2, total: 90, status: "confirmed" },
  { code: "WW-5RB8HC", name: "Thomas Vos", ws: "Tiramisu & dolci", date: "zo 16 aug", people: 4, total: 156, status: "pending" },
  { code: "WW-1XK6VD", name: "Noor el Amrani", ws: "Italiaans koken", date: "za 1 aug", people: 2, total: 90, status: "completed" },
];

const STATUS_LABEL = {
  confirmed: ["ww-badge--live", "Bevestigd"],
  pending: ["ww-badge--paused", "Wacht op betaling"],
  completed: ["ww-badge--draft", "Afgerond"],
};

const DASH_WORKSHOPS = [
  { title: "Italiaans koken met Marco", status: "live", rating: 4.9, count: 312, price: 45, sessions: 3, icon: "fork" },
  { title: "Verse pasta masterclass", status: "live", rating: 4.8, count: 76, price: 55, sessions: 1, icon: "bowl" },
  { title: "Tiramisu & dolci workshop", status: "live", rating: 4.9, count: 24, price: 39, sessions: 1, icon: "spark" },
  { title: "Wijnproeverij Italiaans", status: "draft", rating: null, count: 0, price: 35, sessions: 0, icon: "glass" },
];

function CapBar({ booked, cap }) {
  const pct = Math.round((booked / cap) * 100);
  return (
    <span className="ww-cap">
      <span className="ww-cap-bar"><i style={{ width: `${pct}%` }} data-full={pct >= 100 ? "true" : "false"} /></span>
      <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{booked}/{cap}</span>
    </span>
  );
}

function DashOverview({ setView }) {
  return (
    <>
      <div className="ww-kpis">
        {[["Omzet deze maand", "\u20AC1.842", "+18% vs juli"],
          ["Boekingen", "27", "+4 deze week"],
          ["Bezetting komende sessies", "78%", "-6% vs juli", "down"],
          ["Gemiddelde beoordeling", "4,9", "412 reviews"]].map(([l, v, sub, dir]) => (
          <div className="ww-kpi" key={l}>
            <span>{l}</span><b>{v}</b><em data-dir={dir}>{sub}</em>
          </div>
        ))}
      </div>

      <div className="ww-panel">
        <div className="ww-panel-head">
          <h2>Actie nodig</h2>
          <Button variant="ghost" size="sm" onClick={() => setView("reviews")}>Alles bekijken</Button>
        </div>
        <div className="ww-panel-body">
          {[["chat", "Twee reviews wachten op je reactie", "Reageren binnen een week houdt je responstijd op 2 uur.", "warn"],
            ["bell", "Een vraag van Iris staat open", "Gesteld op 6 augustus over de pasta masterclass.", "warn"],
            ["calendar", "Je agenda is leeg na 16 augustus", "Zonder datums kunnen mensen niet boeken.", ""]].map(([i, t, d, tone]) => (
            <div className="ww-todo" key={t}>
              <span className="ww-todo-ico" data-tone={tone}><Icon name={i} size={19} /></span>
              <span style={{ flex: 1 }}><strong>{t}</strong><span>{d}</span></span>
              <Icon name="right" size={18} style={{ color: tokens.color.slate, flex: "none" }} />
            </div>
          ))}
        </div>
      </div>

      <div className="ww-panel">
        <div className="ww-panel-head">
          <h2>Komende sessies</h2>
          <Button variant="quiet" size="sm" icon="plus" onClick={() => setView("agenda")}>Sessie toevoegen</Button>
        </div>
        <div className="ww-tablewrap">
          <table className="ww-table">
            <thead><tr><th>Datum</th><th>Workshop</th><th>Bezetting</th><th>Status</th></tr></thead>
            <tbody>
              {DASH_SESSIONS.map((s) => (
                <tr key={s.date + s.ws}>
                  <td><strong>{s.date}</strong> <span className="ww-meta">{s.time}</span></td>
                  <td>{s.ws}</td>
                  <td><CapBar booked={s.booked} cap={s.cap} /></td>
                  <td>{s.booked >= s.cap ? <Badge kind="almost_full">Vol</Badge> : <Badge kind="live">Open</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ww-panel">
        <div className="ww-panel-head">
          <h2>Laatste boekingen</h2>
          <Button variant="ghost" size="sm" onClick={() => setView("bookings")}>Alle boekingen</Button>
        </div>
        <div className="ww-tablewrap">
          <table className="ww-table">
            <thead><tr><th>Deelnemer</th><th>Workshop</th><th>Datum</th><th>Personen</th><th>Bedrag</th></tr></thead>
            <tbody>
              {DASH_BOOKINGS.slice(0, 4).map((b) => (
                <tr key={b.code}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={b.name} /><span><strong style={{ fontSize: 14 }}>{b.name}</strong>
                      <span className="ww-meta" style={{ display: "block", fontSize: 12 }}>{b.code}</span></span>
                  </div></td>
                  <td>{b.ws}</td><td>{b.date}</td><td>{b.people}</td>
                  <td><strong>{"\u20AC"}{b.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DashWorkshops({ setView }) {
  return (
    <div className="ww-panel">
      <div className="ww-panel-head">
        <h2>Je workshops</h2>
        <Button variant="primary" size="sm" icon="plus" onClick={() => setView("wizard")}>Nieuwe workshop</Button>
      </div>
      <div className="ww-panel-body">
        {DASH_WORKSHOPS.map((w) => (
          <article className="ww-wrow" key={w.title} style={{ border: 0, borderBottom: `1px solid ${tokens.color.line}`, borderRadius: 0, padding: "14px 0", marginBottom: 0 }}>
            <Photo icon={w.icon} style={{ width: 78, height: 64, borderRadius: 12, flex: "none" }} />
            <div style={{ flex: 1, minWidth: 170 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 16 }}>{w.title}</h3><Badge kind={w.status} />
              </div>
              <p className="ww-meta" style={{ marginTop: 5 }}>
                {"\u20AC"}{w.price} p.p. · {w.sessions === 0 ? "nog geen datums" : `${w.sessions} komende ${w.sessions === 1 ? "datum" : "datums"}`}
                {w.rating ? " · " : ""}
              </p>
              {w.rating && <div style={{ marginTop: 5 }}><Rating value={w.rating} count={w.count} /></div>}
            </div>
            <div style={{ display: "flex", gap: 8, flex: "none" }}>
              <Button variant="outline" size="sm" icon="edit">Bewerken</Button>
              <Button variant="quiet" size="sm">{w.status === "draft" ? "Publiceren" : "Pauzeren"}</Button>
            </div>
          </article>
        ))}
        <p className="ww-hint" style={{ marginTop: 14 }}>
          Een concept is alleen voor jou zichtbaar. Publiceren kan zodra er beeld, een prijs en minstens
          een datum staat.
        </p>
      </div>
    </div>
  );
}

function DashAgenda() {
  return (
    <>
      <div className="ww-panel">
        <div className="ww-panel-head">
          <h2>Augustus 2026</h2>
          <Button variant="primary" size="sm" icon="plus">Sessie toevoegen</Button>
        </div>
        <div className="ww-tablewrap">
          <table className="ww-table">
            <thead><tr><th>Datum</th><th>Tijd</th><th>Workshop</th><th>Bezetting</th><th></th></tr></thead>
            <tbody>
              {DASH_SESSIONS.map((s) => (
                <tr key={s.date + s.time + s.ws}>
                  <td><strong>{s.date}</strong></td>
                  <td>{s.time}</td>
                  <td>{s.ws}</td>
                  <td><CapBar booked={s.booked} cap={s.cap} /></td>
                  <td style={{ textAlign: "right" }}>
                    <Button variant="quiet" size="sm">Bewerken</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ww-panel">
        <div className="ww-empty">
          <h3>Na 16 augustus staat er niets</h3>
          <p>Zonder datums kunnen mensen niet boeken. Zet meteen een paar weken vooruit.</p>
          <Button variant="primary" icon="plus" onClick={() => setView("agenda")}>Datums toevoegen</Button>
        </div>
      </div>
    </>
  );
}

function DashBookings() {
  const [filter, setFilter] = useState("Alles");
  const shown = filter === "Alles" ? DASH_BOOKINGS
    : DASH_BOOKINGS.filter((b) => STATUS_LABEL[b.status][1] === filter);

  return (
    <div className="ww-panel">
      <div className="ww-panel-head">
        <h2>Boekingen</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Alles", "Bevestigd", "Wacht op betaling", "Afgerond"].map((f) => (
            <button key={f} className="ww-chip" onClick={() => setFilter(f)}
              style={f === filter ? { background: tokens.color.brand, borderColor: tokens.color.brand, color: "#fff" } : undefined}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="ww-tablewrap">
        <table className="ww-table">
          <thead><tr><th>Code</th><th>Deelnemer</th><th>Workshop</th><th>Datum</th><th>Pers.</th><th>Bedrag</th><th>Status</th></tr></thead>
          <tbody>
            {shown.map((b) => {
              const [cls, label] = STATUS_LABEL[b.status];
              return (
                <tr key={b.code}>
                  <td><span className="ww-meta" style={{ fontWeight: 700 }}>{b.code}</span></td>
                  <td><strong style={{ fontSize: 14 }}>{b.name}</strong></td>
                  <td>{b.ws}</td><td>{b.date}</td><td>{b.people}</td>
                  <td><strong>{"\u20AC"}{b.total}</strong></td>
                  <td><span className={`ww-badge ${cls}`}>{label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && (
        <div className="ww-empty">
          <h3>Niets in deze status</h3>
          <p>Kies een andere status of bekijk alles.</p>
          <Button variant="outline" onClick={() => setFilter("Alles")}>Toon alles</Button>
        </div>
      )}
      <div className="ww-panel-body">
        <p className="ww-hint">
          Deelnemerslijsten met dieetwensen zie je door een boeking te openen. Contactgegevens delen we
          pas als de betaling rond is.
        </p>
      </div>
    </div>
  );
}

function DashReviews() {
  const [replied, setReplied] = useState([]);
  const open = MARCO_REVIEWS.slice(0, 2);

  return (
    <>
      <div className="ww-panel">
        <div className="ww-panel-head"><h2>Wacht op je reactie</h2><span className="ww-meta">2 reviews</span></div>
        <div className="ww-panel-body">
          {open.map((r) => (
            <div key={r.name} style={{ padding: "16px 0", borderBottom: `1px solid ${tokens.color.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Avatar name={r.name} />
                <span><strong style={{ fontSize: 14.5 }}>{r.name}</strong>
                  <span className="ww-meta" style={{ display: "block", fontSize: 12.5 }}>{r.ws} · {r.when}</span></span>
                <span style={{ marginLeft: "auto" }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} />)}</span>
              </div>
              <p style={{ fontSize: 14.5, margin: "12px 0 0" }}>{r.body}</p>
              {replied.includes(r.name) ? (
                <p style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13.5, color: tokens.color.brand, fontWeight: 700 }}>
                  <Icon name="check" size={17} /> Je reactie staat online
                </p>
              ) : (
                <div className="ww-reply">
                  <input className="ww-input" placeholder={`Bedank ${r.name} in een zin of twee`} aria-label="Reactie" />
                  <Button variant="primary" onClick={() => setReplied([...replied, r.name])}>Plaatsen</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="ww-panel">
        <div className="ww-panel-head"><h2>Alle reviews</h2><Rating value={4.9} count="412 reviews" size={16} /></div>
        <div className="ww-panel-body">
          {MARCO_REVIEWS.map((r) => (
            <div key={r.name + r.ws} className="ww-todo">
              <Avatar name={r.name} />
              <span style={{ flex: 1 }}><strong>{r.body}</strong><span>{r.name} · {r.ws} · {r.when}</span></span>
              <span style={{ flex: "none" }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} />)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function DashPayouts() {
  return (
    <div className="ww-payout">
      <div className="ww-panel" style={{ marginBottom: 0 }}>
        <div className="ww-panel-head"><h2>Uitbetalingen</h2><span className="ww-meta">Elke maandag</span></div>
        <div className="ww-tablewrap">
          <table className="ww-table">
            <thead><tr><th>Periode</th><th>Bruto</th><th>Commissie</th><th>Netto</th><th>Status</th></tr></thead>
            <tbody>
              {[["1 tot 7 aug", 640, 96, 544, "scheduled"],
                ["25 tot 31 jul", 815, 122, 693, "paid"],
                ["18 tot 24 jul", 470, 71, 399, "paid"],
                ["11 tot 17 jul", 925, 139, 786, "paid"]].map(([p, g, c, n, st]) => (
                <tr key={p}>
                  <td><strong>{p}</strong></td>
                  <td>{"\u20AC"}{g}</td>
                  <td className="ww-meta">{"\u2212"}{"\u20AC"}{c}</td>
                  <td><strong>{"\u20AC"}{n}</strong></td>
                  <td>{st === "paid" ? <Badge kind="live">Uitbetaald</Badge> : <Badge kind="paused">Ingepland</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="ww-sidecard">
          <h3>Hoe het werkt</h3>
          <p>
            Wij innen het volledige bedrag bij de deelnemer. Na afloop van de workshop gaat het bedrag
            min 15 procent commissie naar je rekening, elke maandag.
          </p>
          <ul className="ww-trust">
            {[["shield", "Uitbetaling pas na afloop"], ["euro", "15 procent commissie"], ["check", "Factuur automatisch in je mail"]].map(([i, t]) => (
              <li key={t}><Icon name={i} size={17} />{t}</li>
            ))}
          </ul>
        </div>
        <div className="ww-sidecard" style={{ background: tokens.color.cloud, border: 0 }}>
          <h3>Rekening</h3>
          <p style={{ color: tokens.color.ink, opacity: .72 }}>NL91 **** **** 4321 op naam van M. Rossi</p>
          <Button variant="outline" block size="sm">Rekening wijzigen</Button>
        </div>
      </div>
    </div>
  );
}

const DASH_NAV = [
  { key: "overview", label: "Overzicht", icon: "grid" },
  { key: "workshops", label: "Workshops", icon: "spark" },
  { key: "agenda", label: "Agenda", icon: "calendar" },
  { key: "bookings", label: "Boekingen", icon: "book", dot: 1 },
  { key: "reviews", label: "Reviews", icon: "star", dot: 2 },
  { key: "payouts", label: "Uitbetalingen", icon: "euro" },
  { key: "profile", label: "Profiel", icon: "user" },
];

const DASH_TITLES = {
  overview: ["Hoi Marco", "Hier staat je week in een oogopslag."],
  workshops: ["Workshops", "Beheer je aanbod en publiceer nieuwe workshops."],
  agenda: ["Agenda", "Voeg datums toe zodat mensen kunnen boeken."],
  bookings: ["Boekingen", "Wie komt er wanneer, en wat is er betaald."],
  reviews: ["Reviews", "Reageren houdt je responstijd laag en je profiel sterk."],
  payouts: ["Uitbetalingen", "Wat er binnenkomt en wanneer."],
  profile: ["Profiel", "Je gegevens, je openbare profiel en je uitbetaling."],
  wizard: ["Nieuwe workshop", "Zes stappen en je staat online."],
};

function Dashboard({ go }) {
  const [view, setView] = useState("overview");
  const [title, sub] = DASH_TITLES[view];

  return (
    <div className="ww-dash">
      <nav className="ww-dash-side" aria-label="Dashboardnavigatie">
        <a className="ww-logo" onClick={() => go({ name: "home" })}><Logo size={28} /><Wordmark size={17} /></a>
        {DASH_NAV.map((n) => (
          <button key={n.key} className="ww-dnav" data-on={view === n.key ? "true" : "false"}
            onClick={() => setView(n.key)}>
            <Icon name={n.icon} size={19} />{n.label}
            {n.dot && <span className="ww-dnav-dot">{n.dot}</span>}
          </button>
        ))}
        <div className="ww-dash-me">
          <Avatar name="Marco Rossi" size={38} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 13.5, display: "block" }}>Marco Rossi</strong>
            <span className="ww-meta" style={{ fontSize: 12 }}>Workshopgever</span>
          </span>
          <button className="ww-iconbtn" style={{ width: 34, height: 34 }} aria-label="Uitloggen"
            onClick={() => go({ name: "auth", tab: "provider" })}>
            <Icon name="logout" size={17} />
          </button>
        </div>
      </nav>

      <main className="ww-dash-main">
        <div className="ww-dash-head">
          <div><h1>{title}</h1><p>{sub}</p></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="ww-iconbtn" aria-label="Meldingen"><Icon name="bell" /></button>
            <Button variant="primary" icon="plus" onClick={() => setView("wizard")}>Nieuwe workshop</Button>
          </div>
        </div>

        {view === "overview" && <DashOverview setView={setView} />}
        {view === "workshops" && <DashWorkshops setView={setView} />}
        {view === "agenda" && <DashAgenda />}
        {view === "bookings" && <DashBookings />}
        {view === "reviews" && <DashReviews />}
        {view === "payouts" && <DashPayouts />}
        {view === "profile" && <ProviderProfileForm go={go} mode="edit" />}
        {view === "wizard" && <WorkshopWizard go={go} embedded onClose={() => setView("workshops")} />}
      </main>
    </div>
  );
}

/* ===========================================================================
   Mobiele hulpmiddelen
   =========================================================================== */
function useIsMobile(query = "(max-width: 767px)") {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/* Tekst die op mobiel inklapt, zoals de "Lees meer" blokken in de wireframes */
function ReadMore({ children, label = "Lees meer" }) {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);
  if (!mobile) return <>{children}</>;
  return (
    <>
      <div className={open ? undefined : "ww-clamp"}>{children}</div>
      <button className="ww-more" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Minder" : label}
        <Icon name="down" size={16} style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
    </>
  );
}

const MOBILE_CITIES = ["Amsterdam", "Utrecht", "Rotterdam", "Den Haag"];

/* De zijlade vervangt op mobiel het mega-menu */
function MobileMenu({ go, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const nav = (to) => { onClose(); go(to); };

  return (
    <div className="ww-drawer-wrap" role="dialog" aria-label="Menu">
      <div className="ww-drawer-bg" onClick={onClose} />
      <nav className="ww-mdrawer">
        <div className="ww-mdrawer-top">
          <a className="ww-logo" onClick={() => nav({ name: "home" })}><Logo size={28} /><Wordmark size={17} /></a>
          <button className="ww-iconbtn" aria-label="Sluiten" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="ww-mdrawer-body">
          <div className="ww-msearch">
            <Icon name="search" size={19} style={{ color: tokens.color.brand, flex: "none" }} />
            <input placeholder="Waar heb je zin in?" aria-label="Zoeken" />
          </div>

          <h4>Categorieen</h4>
          {CATEGORIES.map((c) => (
            <button className="ww-mrow" key={c.slug} onClick={() => nav({ name: "listing", category: c })}>
              <span className="ww-mega-ico"><Icon name={c.icon} size={18} /></span>
              <span style={{ flex: 1 }}><strong>{c.name}</strong><span>{c.count} workshops</span></span>
              <Icon name="right" size={17} style={{ color: tokens.color.slate }} />
            </button>
          ))}

          <h4>Voor welke gelegenheid</h4>
          <div className="ww-tagpick">
            {OCCASIONS.map((o) => (
              <Chip key={o.name} onClick={() => nav({ name: "listing" })}>
                <Icon name={o.icon} size={15} />{o.name}
              </Chip>
            ))}
          </div>

          <h4>Populaire steden</h4>
          <div className="ww-tagpick">
            {MOBILE_CITIES.map((c) => <Chip key={c} soft onClick={() => nav({ name: "listing" })}>{c}</Chip>)}
            <Chip soft onClick={() => nav({ name: "listing" })}>Alle steden</Chip>
          </div>

          <h4>Meer</h4>
          {[["Voor bedrijven", { name: "listing" }], ["Cadeaubon", null],
            ["Inspiratie", { name: "blog" }], ["Over ons", null]].map(([l, to]) => (
            <button className="ww-mrow" key={l} onClick={() => (to ? nav(to) : onClose())}>
              <span style={{ flex: 1 }}><strong>{l}</strong></span>
              <Icon name="right" size={17} style={{ color: tokens.color.slate }} />
            </button>
          ))}
        </div>

        <div className="ww-mdrawer-foot">
          <Button variant="outline" block onClick={() => nav({ name: "auth", tab: "provider" })}>
            Word workshopgever
          </Button>
          <Button variant="primary" block onClick={() => nav({ name: "auth", tab: "visitor" })}>
            Inloggen
          </Button>
        </div>
      </nav>
    </div>
  );
}

/* ===========================================================================
   Gedeelde navigatie
   =========================================================================== */
function Header({ go }) {
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const mobile = useIsMobile("(max-width: 1023px)");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMega(false); };
    const esc = (e) => { if (e.key === "Escape") setMega(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <header className="ww-header" ref={ref}>
      <div className="ww-wrap ww-header-in">
        <a className="ww-logo" onClick={() => go({ name: "home" })}><Logo /><Wordmark /></a>

        <nav className="ww-nav">
          <button data-on={mega ? "true" : "false"} onClick={() => setMega(!mega)}
            aria-expanded={mega} aria-haspopup="true">
            Categorieen <Icon name="down" size={15} />
          </button>
          <a onClick={() => go({ name: "listing" })}>Ontdek</a>
          <a onClick={() => go({ name: "blog" })}>Inspiratie</a>
          <a>Voor bedrijven</a>
          <a>Cadeaubon</a>
        </nav>

        <div className="ww-head-acts">
          <button className="ww-btn ww-btn--ghost" onClick={() => go({ name: "auth", tab: "provider" })}>
            Word workshopgever
          </button>
          <Button variant="outline" onClick={() => go({ name: "auth", tab: "visitor" })}>Inloggen</Button>
        </div>

        <div className="ww-mob-acts">
          <button className="ww-iconbtn" aria-label="Zoeken" onClick={() => go({ name: "listing" })}>
            <Icon name="search" />
          </button>
          <button className="ww-iconbtn" aria-label="Menu" onClick={() => setDrawer(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {mega && !mobile && (
        <div className="ww-mega">
          <div className="ww-wrap ww-mega-in">
            <div>
              <p className="ww-eyebrow" style={{ marginBottom: 14 }}>Alle categorieen</p>
              <div className="ww-mega-grid">
                {CATEGORIES.map((c) => (
                  <a key={c.slug} className="ww-mega-item"
                    onClick={() => { setMega(false); go({ name: "listing", category: c }); }}>
                    <span className="ww-mega-ico"><Icon name={c.icon} size={19} /></span>
                    <span><strong>{c.name}</strong><span>{c.count} workshops</span></span>
                  </a>
                ))}
              </div>
            </div>
            <div className="ww-mega-side">
              <p className="ww-eyebrow" style={{ marginBottom: 14 }}>Voor welke gelegenheid</p>
              <div className="ww-occ-list">
                {OCCASIONS.map((o) => (
                  <a key={o.name} className="ww-occ" onClick={() => { setMega(false); go({ name: "listing" }); }}>
                    <Icon name={o.icon} size={17} />{o.name}
                  </a>
                ))}
              </div>
              <div className="ww-surprise">
                <strong style={{ fontSize: 15 }}>Nog geen idee?</strong>
                <p>Laat je verrassen met een workshop die bij je past.</p>
                <button className="ww-btn ww-btn--coral" style={{ marginTop: 14, height: 42 }}
                  onClick={() => { setMega(false); go({ name: "workshop" }); }}>
                  Verras me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {drawer && <MobileMenu go={go} onClose={() => setDrawer(false)} />}
    </header>
  );
}

function BottomNav({ route, go }) {
  const items = [
    { key: "home", label: "Ontdek", icon: "compass", to: { name: "home" } },
    { key: "listing", label: "Zoeken", icon: "search", to: { name: "listing" } },
    { key: "fav", label: "Favorieten", icon: "heart", to: { name: "listing" } },
    { key: "profile", label: "Profiel", icon: "user", to: { name: "auth", tab: "visitor" } },
  ];
  return (
    <nav className="ww-bottom">
      {items.map((i) => (
        <button key={i.key} data-on={route === i.key ? "true" : "false"} onClick={() => go(i.to)}>
          <Icon name={i.icon} size={21} />{i.label}
        </button>
      ))}
    </nav>
  );
}

function Footer({ go }) {
  const cols = [
    ["Ontdekken", [["Categorieen", { name: "listing" }], ["Inspiratie", { name: "blog" }],
      ["Cadeaubon", null], ["Teamuitjes", null]]],
    ["Aanbieders", [["Word workshopgever", { name: "auth", tab: "provider" }],
      ["Voorbeeldprofiel", { name: "provider" }], ["Inloggen", { name: "auth", tab: "provider" }]]],
    ["Wicked", [["Over ons", null], ["Contact", null], ["Help", null]]],
  ];
  return (
    <footer className="ww-footer">
      <div className="ww-wrap">
        <div className="ww-foot-grid">
          <div>
            <a className="ww-logo" style={{ marginBottom: 12 }} onClick={() => go({ name: "home" })}>
              <Logo size={30} /><Wordmark />
            </a>
            <p style={{ fontSize: 14.5, color: tokens.color.slate, maxWidth: 320 }}>
              Iets buitengewoons, dichtbij. Het platform voor workshops en unieke uitjes in Nederland.
            </p>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <h4>{title}</h4>
              <ul>{links.map(([l, to]) => (
                <li key={l}><a onClick={() => to && go(to)}>{l}</a></li>
              ))}</ul>
            </div>
          ))}
        </div>
        <div className="ww-foot-bot">
          <span>2026 Wicked Workshops</span>
          <span>Prototype op basis van de brand guide v1.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ===========================================================================
   Gedeelde blokken
   =========================================================================== */
function WorkshopCard({ w, go, showKm }) {
  const [fav, setFav] = useState(false);
  return (
    <article className="ww-wcard">
      <a onClick={() => go({ name: "workshop", workshop: w })} className="ww-wcard-img">
        <Photo icon={w.icon} ratio="4/3" style={{ height: "100%" }} />
        {w.badge && <span className="ww-wcard-badge"><Badge kind={w.badge} /></span>}
        <button className="ww-wcard-fav" aria-label="Bewaren"
          onClick={(e) => { e.stopPropagation(); setFav(!fav); }}>
          <Icon name="heart" size={18} fill={fav} style={fav ? { color: tokens.color.coral } : undefined} />
        </button>
      </a>
      <div className="ww-wcard-body">
        <h3><a onClick={() => go({ name: "workshop", workshop: w })}>{w.title}</a></h3>
        <p className="ww-meta">
          {(showKm ? w.area : w.city)} · {w.duration}{showKm && w.km ? ` · ${w.km}` : ""}
        </p>
        <div className="ww-wcard-foot">
          <Rating value={w.rating} count={w.count} />
          <span className="ww-price" style={{ textAlign: "right" }}>
            <span>vanaf</span><b>{"\u20AC"}{w.price}</b>
          </span>
        </div>
      </div>
    </article>
  );
}

/* ===========================================================================
   Pagina 1: homepage
   =========================================================================== */
function HomePage({ go }) {
  const [q, setQ] = useState("");
  return (
    <>
      <div className="ww-wrap">
        <section className="ww-hero">
          <span className="ww-sticker ww-st1"><Icon name="fork" size={24} /></span>
          <span className="ww-sticker ww-st2"><Icon name="palette" size={24} /></span>
          <span className="ww-sticker ww-st3"><Icon name="glass" size={24} /></span>
          <span className="ww-ratepill"><Star size={14} /> 4,9 gemiddeld</span>

          <h1>
            Vind iets <span className="ww-hl">wicked
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9c34-6 74-8 124-6 26 1 48 3 70 6" stroke="currentColor" strokeWidth="5"
                  fill="none" strokeLinecap="round" />
              </svg>
            </span> om te doen
          </h1>
          <p>Ontdek en boek unieke workshops en uitjes bij jou in de buurt.</p>

          <div className="ww-search">
            <Icon name="search" size={22} style={{ color: tokens.color.brand, flex: "none" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Waar heb je zin in?" aria-label="Zoek een workshop" />
            <button className="ww-search-go" aria-label="Zoeken" onClick={() => go({ name: "listing" })}>
              <Icon name="arrow" size={20} />
            </button>
          </div>

          <div className="ww-quick">
            <Chip soft onClick={() => go({ name: "listing" })}><Icon name="pin" size={15} /> Overal</Chip>
            {["Koken", "Keramiek", "Cocktails", "Bloemschikken", "Teamuitje"].map((t) => (
              <Chip key={t} soft onClick={() => go({ name: "listing" })}>{t}</Chip>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead">
            <h2>Waar heb je zin in?</h2>
            <a onClick={() => go({ name: "listing" })}>Alles bekijken <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--cats">
            {CATEGORIES.slice(0, 12).map((c) => (
              <a key={c.slug} className="ww-cat" onClick={() => go({ name: "listing", category: c })}>
                <span className="ww-cat-ico"><Icon name={c.icon} size={20} /></span>
                <strong>{c.name}</strong>
                <span>{c.count} workshops</span>
              </a>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead"><h2>Zo werkt het</h2></div>
          <div className="ww-steps">
            {[
              ["Kies", "Vind een workshop die bij je past. Filter op plek, datum en budget."],
              ["Boek", "Reserveer direct online. Veilig betalen en meteen bevestigd."],
              ["Beleef", "Kom langs, maak iets moois en neem het mee naar huis."],
            ].map(([t, d], i) => (
              <div className="ww-step" key={t}>
                <span className="ww-step-n">{i + 1}</span>
                <h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead">
            <h2>Deze week populair</h2>
            <a onClick={() => go({ name: "listing" })}>Bekijk alles <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--4 ww-snap">
            {FEATURED.map((w) => <WorkshopCard key={w.slug} w={w} go={go} />)}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-band ww-band--ink">
            <div className="ww-band-split">
              <div>
                <h2>Iets te vieren met je team?</h2>
                <p>Van teamuitje tot personeelsfeest. Wij regelen de workshop, de facturatie en alles ertussenin.</p>
                <ul className="ww-ticks">
                  {["Voorstel binnen 1 werkdag", "Factuur met btw", "Van 5 tot 500 personen"].map((t) => (
                    <li key={t}><Icon name="check" size={17} style={{ color: tokens.color.coral }} />{t}</li>
                  ))}
                </ul>
              </div>
              <div><Button variant="coral" size="lg" block>Vraag een teamuitje aan</Button></div>
            </div>
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead"><h2>Wat deelnemers zeggen</h2></div>
          <div className="ww-quotes ww-snap ww-snap--wide">
            {[
              ["Sanne de Vries", "Keramiek workshop, Utrecht", "Zo leuk om samen iets te maken. We komen echt terug voor de volgende."],
              ["Mark Janssen", "Cocktailworkshop, Amsterdam", "Perfect teamuitje. Alles was tot in de puntjes geregeld, wij hoefden niets te doen."],
              ["Iris Bakker", "BBQ workshop, Rotterdam", "Nog nooit zo gelachen met de vriendinnen. Absolute aanrader voor een dagje uit."],
            ].map(([name, ctx, body]) => (
              <figure className="ww-quote" key={name}>
                <span aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} />)}</span>
                <p>{body}</p>
                <figcaption className="ww-who">
                  <Avatar name={name} />
                  <span><strong>{name}</strong><span>{ctx}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-grid" style={{ gridTemplateColumns: "1fr", gap: 18 }}>
            <div className="ww-band ww-band--cloud ww-band-split">
              <div>
                <h2>Heb jij een talent om te delen?</h2>
                <p>Start je eerste workshop, bepaal je eigen prijs en bereik heel Nederland.</p>
              </div>
              <Button variant="primary" size="lg">Word workshopgever</Button>
            </div>
            <div className="ww-band ww-band--coral ww-band-split">
              <div>
                <h2>Geef een workshop cadeau</h2>
                <p>Een beleving die ze niet vergeten, met de Wicked cadeaubon. De ontvanger kiest zelf de datum.</p>
              </div>
              <Button variant="coral" size="lg" icon="gift">Bekijk de cadeaubon</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ===========================================================================
   Pagina 2: aanbodpagina met filterpaneel
   =========================================================================== */
function FilterDrawer({ open, onClose, active, setActive, price, setPrice, count }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (group, option) => {
    setActive((prev) => {
      const cur = prev[group] || [];
      const next = cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option];
      const copy = { ...prev };
      if (next.length) copy[group] = next; else delete copy[group];
      return copy;
    });
  };

  return (
    <>
      <div className="ww-overlay" onClick={onClose} />
      <aside className="ww-drawer" role="dialog" aria-label="Alle filters">
        <div className="ww-drawer-head">
          <h3>Alle filters</h3>
          <button className="ww-iconbtn" aria-label="Sluiten" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="ww-drawer-body">
          {FILTER_GROUPS.map((g) => (
            <div className="ww-fgroup" key={g.key}>
              <h4>{g.label}</h4>
              {g.type === "range" ? (
                <div className="ww-range">
                  <span>{"\u20AC"}15</span>
                  <input type="range" min="15" max="120" value={price}
                    onChange={(e) => setPrice(Number(e.target.value))} aria-label="Maximale prijs per persoon" />
                  <span>{"\u20AC"}{price}{price >= 120 ? "+" : ""}</span>
                </div>
              ) : (
                <div className="ww-fopts">
                  {g.options.map((o) => (
                    <Chip key={o} on={(active[g.key] || []).includes(o)} onClick={() => toggle(g.key, o)}>
                      {o}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="ww-drawer-foot">
          <button className="ww-btn ww-btn--ghost" onClick={() => { setActive({}); setPrice(120); }}>
            Wis alles
          </button>
          <Button variant="primary" block onClick={onClose}>Toon {count} workshops</Button>
        </div>
      </aside>
    </>
  );
}

function ListingPage({ go, category }) {
  const [open, setOpen] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [active, setActive] = useState({});
  const [price, setPrice] = useState(120);
  const [hover, setHover] = useState(null);
  const [sort, setSort] = useState("Aanbevolen");

  const cat = category || CATEGORIES[0];
  const activeCount = Object.values(active).reduce((a, v) => a + v.length, 0) + (price < 120 ? 1 : 0);
  const results = LISTING.filter((w) => w.price <= price);

  const quick = ["Vandaag", "Kleine groep", "Topbeoordeeld", "Gratis annuleren", "Direct boekbaar"];

  return (
    <>
      <div className="ww-wrap">
        <nav className="ww-crumbs" aria-label="Kruimelpad">
          <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
          <a>{cat.name}</a><span>/</span><span>Utrecht</span>
        </nav>
      </div>

      <div className="ww-filterbar">
        <div className="ww-wrap ww-filterbar-in">
          <button className="ww-fbtn" onClick={() => setOpen(true)}>
            <Icon name="sliders" size={18} /> Alle filters
            {activeCount > 0 && <span className="ww-fcount">{activeCount}</span>}
          </button>
          <span className="ww-viewtoggle" role="group" aria-label="Weergave">
            <button data-on={!mapView ? "true" : "false"} onClick={() => setMapView(false)}>Lijst</button>
            <button data-on={mapView ? "true" : "false"} onClick={() => setMapView(true)}>Kaart</button>
          </span>
          {quick.map((q) => (
            <Chip key={q} on={(active.snel || []).includes(q)}
              onClick={() => setActive((p) => {
                const cur = p.snel || [];
                const next = cur.includes(q) ? cur.filter((x) => x !== q) : [...cur, q];
                const copy = { ...p };
                if (next.length) copy.snel = next; else delete copy.snel;
                return copy;
              })}>
              {q}
            </Chip>
          ))}
        </div>
      </div>

      <div className="ww-wrap">
        <div className="ww-results-head">
          <div>
            <h1>Kookworkshops in Utrecht</h1>
            <p>
              Van sushi rollen tot Italiaans koken met een chef. Boek een kookworkshop in Utrecht
              voor een date, met vrienden of als teamuitje, en bepaal zelf je datum.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="ww-meta" style={{ fontWeight: 700, color: tokens.color.ink }}>
              {results.length} resultaten
            </span>
            <select className="ww-chip" style={{ height: 42, paddingRight: 10 }}
              value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sorteren">
              {["Aanbevolen", "Prijs oplopend", "Prijs aflopend", "Beoordeling", "Afstand", "Nieuw"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ww-listing">
          <div>
            <div className="ww-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
              {results.map((w) => (
                <div key={w.slug} onMouseEnter={() => setHover(w.slug)} onMouseLeave={() => setHover(null)}>
                  <WorkshopCard w={w} go={go} showKm />
                </div>
              ))}
            </div>
            {results.length === 0 && (
              <div className="ww-card" style={{ padding: 28, textAlign: "center" }}>
                <h3 style={{ fontSize: 19, marginBottom: 8 }}>Geen workshops binnen dit budget</h3>
                <p className="ww-meta" style={{ marginBottom: 16 }}>
                  Verhoog je maximumprijs of laat je verrassen met iets anders in Utrecht.
                </p>
                <Button variant="outline" onClick={() => setPrice(120)}>Prijsfilter wissen</Button>
              </div>
            )}
          </div>

          <div className="ww-map" aria-hidden="true">
            {LISTING.map((w) => (
              <span key={w.slug} className="ww-map-pin" data-on={hover === w.slug ? "true" : "false"}
                style={{ left: `${w.x}%`, top: `${w.y}%` }}>
                {"\u20AC"}{w.price}
              </span>
            ))}
            <span style={{ position: "absolute", left: 16, bottom: 16, background: "#fff", borderRadius: 12, padding: "8px 14px", fontSize: 13, fontWeight: 700, boxShadow: tokens.shadow.card }}>
              Kaart van Utrecht
            </span>
          </div>
        </div>

        <section className="ww-seo-text">
          <h2>Over kookworkshops in Utrecht</h2>
          <ReadMore>
          <p>
            Utrecht heeft een bruisende foodscene, en dat zie je terug in het brede aanbod aan
            kookworkshops. Of je nu voor het eerst achter het fornuis staat of je techniek wilt
            aanscherpen, er is voor elk niveau iets te vinden.
          </p>
          <p>
            Kies een keuken die bij je past, van Italiaans en Frans tot Thais en Japans, en leer koken
            van ervaren chefs en enthousiaste thuiskoks. Veel workshops zijn geschikt als teamuitje of
            vrijgezellenfeest, en je kunt bij de meeste je eigen datum kiezen.
          </p>
          </ReadMore>
          <div className="ww-band ww-band--ink ww-band-split" style={{ margin: "24px 0 8px" }}>
            <div>
              <h2 style={{ fontSize: 24 }}>Kan je niet kiezen?</h2>
              <p>Laat je verrassen met een kookworkshop die bij je past.</p>
            </div>
            <Button variant="coral" onClick={() => go({ name: "workshop" })}>Verras me</Button>
          </div>

          <h3 style={{ fontSize: 17, margin: "22px 0 10px" }}>Ook interessant</h3>
          <div className="ww-links">
            {["Kookworkshops Amsterdam", "Sushi workshops", "BBQ workshops", "Cocktailworkshops Utrecht", "Teamuitjes Utrecht", "Workshops in Utrecht"].map((l) => (
              <Chip key={l} soft onClick={() => go({ name: "listing" })}>{l}</Chip>
            ))}
          </div>
        </section>
      </div>

      {mapView && (
        <div className="ww-mapfs" role="dialog" aria-label="Kaartweergave">
          <div className="ww-mapfs-top">
            <button className="ww-iconbtn" aria-label="Terug naar de lijst" onClick={() => setMapView(false)}>
              <Icon name="left" />
            </button>
            <strong style={{ fontSize: 15 }}>{results.length} workshops in Utrecht</strong>
            <Button variant="primary" size="sm" style={{ marginLeft: "auto" }} onClick={() => setMapView(false)}>
              Lijst
            </Button>
          </div>
          {results.map((w) => (
            <button key={w.slug} className="ww-map-pin" data-on={hover === w.slug ? "true" : "false"}
              style={{ left: `${w.x}%`, top: `${w.y}%` }} onClick={() => setHover(w.slug)}>
              {"\u20AC"}{w.price}
            </button>
          ))}
          <div className="ww-mapfs-cards">
            {results.map((w) => (
              <button className="ww-mcard" key={w.slug} onClick={() => go({ name: "workshop", workshop: w })}>
                <Photo icon={w.icon} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14.5, display: "block", lineHeight: 1.3 }}>{w.title}</strong>
                  <span className="ww-meta" style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={12} />{String(w.rating).replace(".", ",")} ({w.count}) · {w.duration}
                  </span>
                </span>
                <span style={{ textAlign: "right", flex: "none" }}>
                  <b style={{ fontFamily: tokens.font.display, fontSize: 17 }}>{"\u20AC"}{w.price}</b>
                  <span style={{ display: "block", fontSize: 11, color: tokens.color.slate }}>p.p.</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <FilterDrawer open={open} onClose={() => setOpen(false)} active={active} setActive={setActive}
        price={price} setPrice={setPrice} count={results.length} />
    </>
  );
}

/* ===========================================================================
   Pagina 3: workshopdetail met boekblok
   =========================================================================== */
function BookingCard({ workshop }) {
  const [session, setSession] = useState(SESSIONS[0].id);
  const [people, setPeople] = useState(2);
  const price = workshop.price;
  const chosen = SESSIONS.find((s) => s.id === session);
  const max = Math.min(12, chosen.seats);

  useEffect(() => { if (people > max) setPeople(max); }, [session, max, people]);

  return (
    <div className="ww-booking">
      <div className="ww-book-price">
        <span><b>{"\u20AC"}{price}</b> <span>per persoon</span></span>
        <Rating value={workshop.rating} count={workshop.count} />
      </div>

      <h3 style={{ fontSize: 16, margin: "18px 0 11px" }}>Kies een datum</h3>
      <div className="ww-slots">
      {SESSIONS.map((s) => (
        <button key={s.id} className="ww-slot" data-on={session === s.id ? "true" : "false"}
          onClick={() => setSession(s.id)} aria-pressed={session === s.id}>
          <span><strong>{s.day}</strong><span>{s.time}</span></span>
          <span className="ww-seats" data-low={s.seats <= 4 ? "true" : "false"}>
            {s.seats <= 4 ? `Nog ${s.seats} plekken` : `${s.seats} plekken`}
          </span>
        </button>
      ))}
      </div>
      <button className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 34 }}>
        Bekijk alle datums <Icon name="right" size={15} />
      </button>

      <h3 style={{ fontSize: 16, margin: "18px 0 4px" }}>Aantal personen</h3>
      <div className="ww-stepper">
        <span style={{ fontSize: 14, color: tokens.color.slate }}>{"\u20AC"}{price} per persoon</span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="ww-stepper-btn" onClick={() => setPeople(Math.max(1, people - 1))}
            disabled={people <= 1} aria-label="Minder personen">-</button>
          <strong style={{ minWidth: 20, textAlign: "center", fontSize: 16 }}>{people}</strong>
          <button className="ww-stepper-btn" onClick={() => setPeople(Math.min(max, people + 1))}
            disabled={people >= max} aria-label="Meer personen">+</button>
        </span>
      </div>

      <Button variant="primary" size="lg" block>Boek voor {"\u20AC"}{price * people}</Button>
      <p style={{ fontSize: 12.5, color: tokens.color.slate, textAlign: "center", marginTop: 10 }}>
        Je betaalt nog niets, eerst bevestigen
      </p>

      <ul className="ww-trust">
        {[["shield", "Gratis annuleren tot 48 uur vooraf"], ["check", "Veilig betalen via Wicked"], ["chat", "Direct contact met Marco"]].map(([i, t]) => (
          <li key={t}><Icon name={i} size={17} />{t}</li>
        ))}
      </ul>
    </div>
  );
}

function WorkshopPage({ go, workshop }) {
  const w = workshop || FEATURED[0];
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <div className="ww-wrap">
        <nav className="ww-crumbs" aria-label="Kruimelpad">
          <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
          <a onClick={() => go({ name: "listing" })}>Koken &amp; bakken</a><span>/</span>
          <a onClick={() => go({ name: "listing" })}>Utrecht</a><span>/</span>
          <span style={{ color: tokens.color.ink }}>{w.title}</span>
        </nav>

        <header style={{ paddingTop: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Badge kind="top_rated" />
            <span className="ww-chip ww-chip--soft" style={{ pointerEvents: "none" }}>Koken &amp; bakken</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,4.4vw,44px)" }}>{w.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 14 }}>
            <Rating value={w.rating} count={`${w.count} reviews`} size={16} />
            <span className="ww-meta">Utrecht, Wittevrouwen</span>
            <span className="ww-meta">540 deelnemers gingen je voor</span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Chip><Icon name="share" size={15} /> Delen</Chip>
              <Chip><Icon name="heart" size={15} /> Bewaren</Chip>
            </span>
          </div>
        </header>

        <div className="ww-gallery">
          <Photo icon={w.icon} tone="coral" />
          <Photo icon="glass" /><Photo icon="fork" />
          <Photo icon="users" />
          <Photo icon="camera">
            <button className="ww-gallery-btn"><Icon name="eye" size={16} /> Alle 12 foto's</button>
          </Photo>
          <span className="ww-gallery-count"><Icon name="camera" size={14} /> 1 / 12</span>
        </div>

        <div className="ww-detail">
          <div>
            <div className="ww-facts">
              {[["clock", "3 uur", "Duur"], ["users", "4 tot 12 personen", "Groepsgrootte"],
                ["gauge", "Beginner", "Niveau"], ["globe", "Nederlands", "Taal"]].map(([i, v, l]) => (
                <div className="ww-fact" key={l}>
                  <span className="ww-fact-ico"><Icon name={i} size={19} /></span>
                  <span><strong>{v}</strong><span>{l}</span></span>
                </div>
              ))}
            </div>

            <section className="ww-block">
              <h2>Over deze workshop</h2>
              <ReadMore>
              <p>
                Leer in drie uur de basis van de Italiaanse keuken. Je maakt verse pasta vanaf nul,
                een klassieke ragu en tiramisu zoals de nonna van Marco die maakt.
              </p>
              <p>
                Je werkt in tweetallen, alle ingredienten zijn inbegrepen en na afloop eet je samen aan
                de lange tafel. Ideaal als date, met vrienden of als teamuitje tot twaalf personen.
              </p>
              </ReadMore>
              <blockquote className="ww-pull">
                <Star size={15} /> De pasta was heerlijk en Marco maakt er echt een feestje van.
                Perfect voor een date. <strong style={{ color: tokens.color.ink }}>Sanne, juli 2026</strong>
              </blockquote>
            </section>

            <section className="ww-block">
              <h2>Wat is inbegrepen</h2>
              <ul className="ww-inc">
                {["Alle ingredienten en materialen", "Welkomstdrankje en hapjes",
                  "Samen eten na afloop", "Recepten mee naar huis"].map((t) => (
                  <li key={t}><span className="ww-inc-ico"><Icon name="check" size={19} /></span>{t}</li>
                ))}
              </ul>
            </section>

            <section className="ww-block">
              <h2>Je workshopgever</h2>
              <div className="ww-provider">
                <Avatar name="Marco Rossi" size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 17 }}>Marco Rossi</strong>
                    <Badge kind="verified" />
                  </div>
                  <p className="ww-meta" style={{ margin: "6px 0 14px" }}>
                    Geeft workshops sinds 2019 · 540 deelnemers · reageert binnen 2 uur
                  </p>
                  <Button variant="outline" onClick={() => go({ name: "provider" })}>Bekijk profiel</Button>
                </div>
              </div>
            </section>

            <section className="ww-block">
              <h2>Locatie</h2>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Kookstudio De Pan, Wittevrouwen, Utrecht</p>
              <p className="ww-meta">
                Exact adres na boeking · 5 min lopen van Utrecht CS · gratis fietsenstalling
              </p>
              <div style={{ marginTop: 16, height: 200, borderRadius: 18, border: `1px solid ${tokens.color.line}`,
                background: "repeating-linear-gradient(0deg,#fff,#fff 30px,#F4F1FA 30px,#F4F1FA 31px), repeating-linear-gradient(90deg,#fff,#fff 30px,#F4F1FA 30px,#F4F1FA 31px)",
                position: "relative" }}>
                <span className="ww-map-pin" data-on="true" style={{ left: "50%", top: "50%" }}>
                  <Icon name="pin" size={14} />
                </span>
              </div>
            </section>

            <section className="ww-block">
              <h2>Beoordelingen</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: tokens.font.display, fontSize: 34, fontWeight: 800 }}>4,9</span>
                <span className="ww-meta">op basis van 312 reviews</span>
              </div>
              <div className="ww-scores">
                {[["Sfeer", 4.9], ["Uitleg", 4.8], ["Waarde", 4.7]].map(([l, v]) => (
                  <div className="ww-score" key={l}>
                    <span>{l}</span>
                    <span className="ww-bar"><i style={{ width: `${(v / 5) * 100}%` }} /></span>
                    <span>{String(v).replace(".", ",")}</span>
                  </div>
                ))}
              </div>
              <div className="ww-reviews ww-snap ww-snap--wide">
                {REVIEWS.map((r) => (
                  <article className="ww-review" key={r.name}>
                    <span aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} />)}</span>
                    <p>{r.body}</p>
                    <div className="ww-who">
                      <Avatar name={r.name} />
                      <span><strong>{r.name}</strong><span>{r.when}</span></span>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ marginTop: 18 }}>
                <Button variant="outline">Bekijk alle 312 reviews</Button>
              </div>
            </section>

            <section className="ww-block">
              <h2>Praktisch</h2>
              <div className="ww-practical">
                {[["gift", "Als cadeau te geven", "Direct als cadeaubon te versturen, ontvanger kiest zelf de datum"],
                  ["fork", "Dieetwensen", "Vegetarisch mogelijk, geef het door bij je boeking"],
                  ["users", "Toegankelijkheid", "Studio is rolstoeltoegankelijk"]].map(([i, t, d]) => (
                  <div className="ww-prac" key={t}>
                    <span style={{ color: tokens.color.brand }}><Icon name={i} size={22} /></span>
                    <strong>{t}</strong><p>{d}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="ww-block" style={{ borderBottom: 0 }}>
              <h2>Veelgestelde vragen</h2>
              {FAQ.map(([q, a], i) => (
                <div className="ww-faq-item" key={q}>
                  <button className="ww-faq-q" aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    {q}
                    <Icon name="down" size={19} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform .15s ease", flex: "none" }} />
                  </button>
                  {openFaq === i && <p className="ww-faq-a">{a}</p>}
                </div>
              ))}
            </section>
          </div>

          <aside>
            <BookingCard workshop={w} />

            <div className="ww-sidecard">
              <h3>Met je team komen?</h3>
              <p>Vanaf 10 personen regelen we een groepsofferte met factuur, voorstel binnen 1 werkdag.</p>
              <Button variant="outline" block>Vraag groepsofferte</Button>
            </div>

            <div className="ww-sidecard" style={{ background: tokens.color.softCoral, border: 0 }}>
              <h3>Geef deze workshop cadeau</h3>
              <p style={{ color: tokens.color.ink, opacity: .7 }}>Ontvanger kiest zelf de datum.</p>
              <Button variant="coral" block icon="gift">Naar de cadeaubon</Button>
            </div>
          </aside>
        </div>

        <section className="ww-section">
          <div className="ww-shead">
            <h2>Ook leuk voor jou</h2>
            <a onClick={() => go({ name: "listing" })}>Meer in Utrecht <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--4 ww-snap">
            {LISTING.slice(1, 5).map((x) => <WorkshopCard key={x.slug} w={x} go={go} showKm />)}
          </div>
        </section>
      </div>

      <div className="ww-mobbar">
        <span className="ww-price">
          <b>{"\u20AC"}{w.price}</b><span>per persoon</span>
        </span>
        <Button variant="primary" style={{ flex: 1 }}>Kies een datum</Button>
      </div>
    </>
  );
}

/* ===========================================================================
   Router

   Een minimale statusrouter. In de Next.js-app worden dit de routes uit
   hoofdstuk 5 van de blauwdruk: /, /categorie/[c]/[stad], /workshop/[slug],
   /aanbieder/[slug], /inspiratie/[slug], /inloggen en /dashboard.
   =========================================================================== */
const SCREENS = [
  ["home", "Homepage"],
  ["listing", "Aanbod"],
  ["workshop", "Workshop"],
  ["provider", "Aanbieder"],
  ["blog", "Blogarchief"],
  ["article", "Blogartikel"],
  ["auth-visitor", "Inloggen"],
  ["auth-provider", "Registratie aanbieder"],
  ["signup", "Profiel aanbieder"],
  ["wizard", "Nieuwe workshop"],
  ["dashboard", "Dashboard"],
];

export default function App() {
  const [route, setRoute] = useState({ name: "home" });

  const go = (r) => {
    setRoute(r);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  };

  const current = route.name === "auth" ? `auth-${route.tab || "visitor"}` : route.name;
  const jump = (key) => {
    if (key === "auth-visitor") return go({ name: "auth", tab: "visitor" });
    if (key === "auth-provider") return go({ name: "auth", tab: "provider" });
    return go({ name: key });
  };

  /* Auth en dashboard hebben hun eigen shell, de rest deelt header en footer */
  const publicChrome = !["auth", "dashboard"].includes(route.name);

  return (
    <div className="ww">
      <style>{css}</style>

      {/* Deze balk hoort niet bij het product, alleen bij het prototype */}
      <div className="ww-proto">
        <div className="ww-proto-in">
          <span>Prototype</span>
          {SCREENS.map(([key, label]) => (
            <button key={key} data-on={current === key ? "true" : "false"} onClick={() => jump(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {publicChrome && <Header go={go} />}

      {route.name === "home" && <HomePage go={go} />}
      {route.name === "listing" && <ListingPage go={go} category={route.category} />}
      {route.name === "workshop" && <WorkshopPage go={go} workshop={route.workshop} />}
      {route.name === "provider" && <ProviderPage go={go} />}
      {route.name === "blog" && <BlogIndexPage go={go} />}
      {route.name === "article" && <ArticlePage go={go} />}
      {route.name === "signup" && <ProviderProfileForm go={go} />}
      {route.name === "wizard" && <WorkshopWizard go={go} />}
      {route.name === "auth" && <AuthPage go={go} tab={route.tab} />}
      {route.name === "dashboard" && <Dashboard go={go} />}

      {publicChrome && <Footer go={go} />}
      {publicChrome && !["signup", "wizard"].includes(route.name) && <BottomNav route={route.name} go={go} />}
    </div>
  );
}
