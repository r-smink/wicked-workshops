/* Knoppen voor het team in Directus (Flows met een handmatige trigger).
   Elke knop stuurt een webhook naar /api/team/actions in Next; die route
   doet het echte werk (OPP-refund, escrow, blokkeren) en controleert de
   rol en de vier ogen. Idempotent: bestaande flows worden bijgewerkt.

   Nodig in directus/.env (of de omgeving van het seed-script):
     WEB_URL             bijvoorbeeld https://www.wickedworkshops.nl
     TEAM_ACTION_SECRET  hetzelfde geheim als in de Next-omgeving
   Ontbreekt een van beide, dan slaat de seed de flows over. */
import { api, query } from "../scripts/api.mjs";

const FLOWS = [
  {
    name: "Terugbetalen",
    icon: "payments",
    collection: "complaints",
    action: "refund",
    confirm: "Betaal het bedrag in refund_amount (of, als dat leeg is, alles wat over is) terug via OPP. Alleen als een collega de terugbetaling heeft goedgekeurd (approved_by).",
  },
  {
    name: "Uitbetaling vrijgeven",
    icon: "lock_open",
    collection: "complaints",
    action: "release",
    confirm: "De klacht is afgehandeld. Het geld gaat naar de workshopgever zodra de normale wachttijd na de workshop voorbij is.",
  },
  {
    name: "Workshopgever blokkeren",
    icon: "block",
    collection: "providers",
    action: "block_provider",
    confirm: "Zet de workshopgever op pauze en haal zijn workshops offline. Vul eerst blocked_reason in. Definitief verwijderen is een besluit van het bestuur.",
  },
];

async function findOne(path, filter) {
  const rows = await api("GET", `${path}${query({ filter, limit: 1 })}`);
  return rows[0] ?? null;
}

export async function seedFlows(env = process.env) {
  const web = (env.WEB_URL || "").replace(/\/$/, "");
  const secret = env.TEAM_ACTION_SECRET || "";
  if (!web || !secret) return { skipped: "WEB_URL of TEAM_ACTION_SECRET ontbreekt" };

  const out = [];
  for (const f of FLOWS) {
    const flowProps = {
      name: f.name,
      icon: f.icon,
      color: "#C8442F",
      status: "active",
      trigger: "manual",
      accountability: "all",
      description: `Team: ${f.name.toLowerCase()} (via /api/team/actions).`,
      options: {
        collections: [f.collection],
        location: "both",
        requireConfirmation: true,
        confirmationDescription: f.confirm,
        async: false,
      },
    };
    let flow = await findOne("/flows", { name: { _eq: f.name } });
    if (flow) await api("PATCH", `/flows/${flow.id}`, flowProps);
    else flow = await api("POST", "/flows", flowProps);

    const opProps = {
      name: "Naar Next",
      key: "naar_next",
      type: "request",
      position_x: 19,
      position_y: 1,
      flow: flow.id,
      options: {
        method: "POST",
        url: `${web}/api/team/actions`,
        headers: [
          { header: "Content-Type", value: "application/json" },
          { header: "x-team-secret", value: secret },
        ],
        body: `{"action":"${f.action}","keys":{{$trigger.body.keys}},"user":"{{$accountability.user}}"}`,
      },
    };
    let op = await findOne("/operations", { flow: { _eq: flow.id } });
    if (op) await api("PATCH", `/operations/${op.id}`, opProps);
    else op = await api("POST", "/operations", opProps);
    await api("PATCH", `/flows/${flow.id}`, { operation: op.id });
    out.push(f.name);
  }
  return { flows: out };
}
