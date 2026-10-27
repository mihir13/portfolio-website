import { skills, certifications } from "../content.js";
import Section from "./Section.jsx";

export default function Skills() {
  return (
    <Section id="skills" index={4} title="Skills">
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
      <div className="card creds">
        <h3 className="mono accent">Certifications & education</h3>
        <ul>
          {certifications.items.map((c) => (
            <li key={c.name}>
              <span>{c.name}</span>
              <span className="mono muted">{c.detail}</span>
            </li>
          ))}
          {certifications.education && (
            <li>
              <span>{certifications.education.degree}, {certifications.education.school}</span>
              <span className="mono muted">{certifications.education.detail}</span>
            </li>
          )}
        </ul>
      </div>
    </Section>
  );
}
