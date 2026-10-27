import { notes } from "../content.js";
import Section from "./Section.jsx";

const fmt = (d) => {
  const date = new Date(d);
  return isNaN(date) ? d : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function Notes() {
  if (!notes.length) return null;
  return (
    <Section id="notes" index={5} title="Notes">
      <ul className="notes">
        {notes.map((n) => {
          const Tag = n.link ? "a" : "div";
          const props = n.link ? { href: n.link, target: "_blank", rel: "noreferrer" } : {};
          return (
            <li key={n.title}>
              <Tag className="card note" {...props}>
                <span className="mono muted date">{fmt(n.date)}</span>
                <div>
                  <h3>{n.title}</h3>
                  <p className="muted">{n.summary}</p>
                </div>
              </Tag>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
