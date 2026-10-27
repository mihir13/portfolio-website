import { notes } from "../content.js";
import Section from "./Section.jsx";

const fmt = (d) => {
  const date = new Date(d);
  return isNaN(date) ? d : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function Notes() {
  if (!notes.length) return null;
  return (
    <Section id="notes" index={6} title="Notes">
      <ul className="notes">
        {notes.map((n) => {
          const asLink = n.link && !n.body;
          const Tag = asLink ? "a" : "div";
          const props = asLink ? { href: n.link, target: "_blank", rel: "noreferrer" } : {};
          return (
            <li key={n.title}>
              <Tag className="card note" {...props}>
                <span className="mono muted date">{fmt(n.date)}</span>
                <div>
                  <h3>{n.title}</h3>
                  <p className="muted">{n.summary}</p>
                  {n.body && (
                    <details className="note-body">
                      <summary>Read more</summary>
                      {n.body.split(/\n\s*\n/).map((para, i) => (
                        <p key={i} className="muted">{para}</p>
                      ))}
                      {n.link && (
                        <p>
                          <a className="accent" href={n.link} target="_blank" rel="noreferrer">View the code on GitHub →</a>
                        </p>
                      )}
                    </details>
                  )}
                </div>
              </Tag>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
