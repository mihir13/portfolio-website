import { site } from "../content.js";
import Section from "./Section.jsx";

export default function About() {
  return (
    <Section id="about" index={1} title="About">
      <div className="about">
        {site.photo && <img className="photo" src={site.photo} alt={site.name} loading="lazy" />}
        <p className="lead">{site.about}</p>
      </div>
      {site.stats?.length > 0 && (
        <dl className="stats">
          {site.stats.map((s) => (
            <div key={s.label} className="card">
              <dt className="mono accent">{s.value}</dt>
              <dd className="muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}
