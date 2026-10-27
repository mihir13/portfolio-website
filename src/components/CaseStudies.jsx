import { caseStudies } from "../content.js";
import Section from "./Section.jsx";

const parts = [
  ["problem", "Problem"],
  ["approach", "Approach"],
  ["result", "Result"],
  ["lesson", "Lesson"],
];

export default function CaseStudies() {
  if (!caseStudies.length) return null;
  return (
    <Section id="work" index={3} title="Selected work">
      <div className="cases">
        {caseStudies.map((c) => (
          <article key={c.title} className="card case">
            <p className="mono accent case-kind">{c.category}</p>
            <h3>{c.title}</h3>
            <dl>
              {parts.map(([key, label]) =>
                c[key] ? (
                  <div key={key} className={key === "result" ? "case-result" : undefined}>
                    <dt className="mono muted">{label}</dt>
                    <dd>{c[key]}</dd>
                  </div>
                ) : null
              )}
            </dl>
            {c.tags?.length > 0 && (
              <ul className="chips small">
                {c.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
