import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { notes } from "../content.js";

const links = ["about", "experience", "work", "skills", "projects", ...(notes.length ? ["notes"] : []), "contact"];

const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

export default function Nav() {
  const [active, setActive] = useState("");
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || systemTheme()
  );

  useEffect(() => {
    const els = links.map((l) => document.getElementById(l)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  };

  return (
    <header className="nav">
      <a href="#top" className="logo mono">
        <span className="accent">~/</span>mt
      </a>
      <div className="nav-right">
        <nav aria-label="Primary">
          {links.map((l) => (
            <a key={l} href={`#${l}`} className={`mono${active === l ? " active" : ""}`}>
              {l}
            </a>
          ))}
        </nav>
        <button className="theme-btn" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
}
