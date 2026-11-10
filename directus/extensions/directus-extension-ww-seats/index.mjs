/* Wicked Workshops: plekken atomair reserveren (endpoint /ww-seats).

   POST /ww-seats/reserve  { session, n }  -> 200 { seats_taken, capacity } of 409 vol
   POST /ww-seats/release  { session, n }  -> 200 { seats_taken, capacity }

   Alleen voor beheerders (het servertoken van de Next-app). Gebruikers en
   het team boeken via de app, niet rechtstreeks. */
import { reserve, release } from "./seats.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {
  id: "ww-seats",
  handler: (router, { database }) => {
    const guard = (req, res) => {
      if (!req.accountability?.admin) {
        res.status(403).json({ errors: [{ message: "Alleen voor de server" }] });
        return null;
      }
      const session = String(req.body?.session || "");
      const n = Number(req.body?.n);
      if (!UUID.test(session) || !Number.isInteger(n) || n < 1 || n > 500) {
        res.status(400).json({ errors: [{ message: "session en n (1 tot 500) zijn verplicht" }] });
        return null;
      }
      return { session, n };
    };

    router.post("/reserve", async (req, res, next) => {
      try {
        const input = guard(req, res);
        if (!input) return;
        const row = await reserve(database, input.session, input.n);
        if (!row) return res.status(409).json({ errors: [{ message: "Niet genoeg plekken" }] });
        res.json({ data: row });
      } catch (err) {
        next(err);
      }
    });

    router.post("/release", async (req, res, next) => {
      try {
        const input = guard(req, res);
        if (!input) return;
        const row = await release(database, input.session, input.n);
        if (!row) return res.status(404).json({ errors: [{ message: "Datum niet gevonden" }] });
        res.json({ data: row });
      } catch (err) {
        next(err);
      }
    });
  },
};
