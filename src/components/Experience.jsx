import { experience } from "../content.js";
import Section from "./Section.jsx";

export default function Experience() {
  return (
    <Section id="experience" index={2} title="Experience">
      <ol className="log">
        {experience.items.map((e, i) => (
          <li key={i}>
            <span className="mono muted period">{e.period}</span>
            <div>
              <h3>{e.title}</h3>
              <p className="muted">{e.company}</p>
              {e.summary && <p className="role-summary">{e.summary}</p>}
              {e.highlights?.length > 0 && (
                <ul className="highlights">
                  {e.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
