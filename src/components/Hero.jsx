import { FaGithub, FaLinkedin } from "react-icons/fa";
import { site } from "../content.js";
import { useTyped } from "../hooks.js";
import TerminalCard from "./hero/TerminalCard.jsx";
import CertBadges from "./hero/CertBadges.jsx";
import GithubActivity from "./hero/GithubActivity.jsx";

export default function Hero() {
  const typed = useTyped(site.roles);
  return (
    <section id="top" className="hero">
      <div className="hero-top">
        <div className="hero-main">
          <p className="mono muted">
            <span className="accent">$</span> whoami
          </p>
          <h1>{site.name}</h1>
          <p className="hero-role mono">
            {site.headline} <span className="muted">/</span>{" "}
            <span className="accent">{typed}</span>
            <span className="caret" aria-hidden="true" />
          </p>
          <p className="hero-intro">{site.intro}</p>
          <div className="hero-actions">
            <a className="btn primary" href="#projects">View projects</a>
            <a className="btn" href="#contact">Get in touch</a>
            {site.cv && <a className="btn" href={site.cv} target="_blank" rel="noreferrer">CV</a>}
            <a className="icon-btn" href={site.socials.github} aria-label="GitHub"><FaGithub /></a>
            <a className="icon-btn" href={site.socials.linkedin} aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
          <CertBadges />
          <p className="status mono">
            <span className="dot" /> {site.location} · {site.status}
          </p>
        </div>
        <TerminalCard />
      </div>
      <div className="dash">
        <GithubActivity />
      </div>
    </section>
  );
}
