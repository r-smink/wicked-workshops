import { DAY_LABELS, PART_LABELS } from "./venues";

/* Schema van vrije dagdelen zoals in het ontwerp. prefix is "locatie-d"
   (ruimte-gezocht) of "maker-d" (workshops-geven). */
export function WeekTable({ free, prefix }: { free: boolean[][]; prefix: "locatie-d" | "maker-d" }) {
  const sr = `${prefix}-sr`;
  return (
    <table className={`${prefix}-week`}>
      <caption className={sr}>Dagdelen waarop deze ruimte vaak vrij is</caption>
      <thead>
        <tr>
          <th scope="col"><span className={sr}>Dagdeel</span></th>
          {DAY_LABELS.map((d) => <th key={d} scope="col">{d}</th>)}
        </tr>
      </thead>
      <tbody>
        {PART_LABELS.map((part, p) => (
          <tr key={part}>
            <th scope="row">{part}</th>
            {DAY_LABELS.map((d, i) =>
              free[p]?.[i] ? <td key={d} className="is-vrij"><span className={sr}>vrij</span></td> : <td key={d}></td>,
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
