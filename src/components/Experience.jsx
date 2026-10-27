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
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
