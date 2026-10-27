import { FiArrowUpRight } from "react-icons/fi";
import { projects } from "../content.js";
import Section from "./Section.jsx";

export default function Projects() {
  return (
    <Section id="projects" index={5} title="Projects">
      <div className="project-grid">
        {projects.map((p) => (
          <a key={p.title} className="card project" href={p.link} target="_blank" rel="noreferrer">
            {p.image && <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" />}
            <div className="project-body">
              <h3>
                {p.title} <FiArrowUpRight className="accent" />
              </h3>
              <p className="muted">{p.description}</p>
              {p.tags?.length > 0 && (
                <ul className="chips small">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
