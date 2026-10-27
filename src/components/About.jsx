import { site } from "../content.js";
import Section from "./Section.jsx";

export default function About() {
  return (
    <Section id="about" index={1} title="About">
      <div className="about">
        {site.photo && <img className="photo" src={site.photo} alt={site.name} loading="lazy" />}
        <p className="lead">{site.about}</p>
      </div>
    </Section>
  );
}
