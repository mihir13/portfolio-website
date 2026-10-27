import { site } from "../content.js";

const links = ["about", "experience", "skills", "projects", "contact"];

export default function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="logo mono">
        <span className="accent">~/</span>mt
      </a>
      <nav aria-label="Primary">
        {links.map((l) => (
          <a key={l} href={`#${l}`} className="mono">
            {l}
          </a>
        ))}
      </nav>
      <span className="sr-only">{site.name}</span>
    </header>
  );
}
