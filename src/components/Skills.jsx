import { skills } from "../content.js";
import Section from "./Section.jsx";

export default function Skills() {
  return (
    <Section id="skills" index={3} title="Skills">
      <div className="skill-groups">
        {skills.groups.map((g) => (
          <div key={g.name} className="card">
            <h3 className="mono accent">{g.name}</h3>
            <ul className="chips">
              {g.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
