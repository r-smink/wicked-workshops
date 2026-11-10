/* De SQL achter /ww-seats, los van Directus zodat hij te testen is.
   Eén UPDATE met de voorwaarde in de WHERE: de database zet een rijslot,
   dus twee gelijktijdige aanroepen kunnen niet allebei de laatste plek
   krijgen (het "lezen en terugschrijven"-probleem uit de analyse). */

export async function reserve(knex, sessionId, n) {
  const rows = await knex("workshop_sessions")
    .where({ id: sessionId })
    .andWhereRaw("coalesce(seats_taken, 0) + ? <= coalesce(capacity, 0)", [n])
    .update({ seats_taken: knex.raw("coalesce(seats_taken, 0) + ?", [n]) })
    .returning(["seats_taken", "capacity"]);
  return rows[0] ?? null;
}

export async function release(knex, sessionId, n) {
  const rows = await knex("workshop_sessions")
    .where({ id: sessionId })
    .update({ seats_taken: knex.raw("greatest(coalesce(seats_taken, 0) - ?, 0)", [n]) })
    .returning(["seats_taken", "capacity"]);
  return rows[0] ?? null;
}
