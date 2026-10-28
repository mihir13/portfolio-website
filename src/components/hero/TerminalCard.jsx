import { useEffect, useState } from "react";
import { site } from "../../content.js";

const COMMAND = "cat profile.json";

// Builds the JSON the "terminal" prints, straight from the content files.
function buildLines() {
  const lines = [{ indent: 0, parts: [["p", "{"]] }];
  const rows = [
    ["name", site.name],
    ["role", site.headline],
    ["location", site.location],
    ["focus", site.roles || []],
    ["now", site.now || []],
    ["status", site.status],
  ].filter(([, v]) => v && (!Array.isArray(v) || v.length));
  rows.forEach(([key, value], i) => {
    const comma = i < rows.length - 1 ? "," : "";
    if (Array.isArray(value)) {
      lines.push({ indent: 1, parts: [["k", `"${key}"`], ["p", ": ["]] });
      value.forEach((item, j) =>
        lines.push({ indent: 2, parts: [["s", `"${item}"`], ["p", j < value.length - 1 ? "," : ""]] })
      );
      lines.push({ indent: 1, parts: [["p", `]${comma}`]] });
    } else {
      lines.push({ indent: 1, parts: [["k", `"${key}"`], ["p", ": "], ["s", `"${value}"`], ["p", comma]] });
    }
  });
  lines.push({ indent: 0, parts: [["p", "}"]] });
  return lines;
}

export default function TerminalCard() {
  const lines = buildLines();
  const total = COMMAND.length + lines.length;
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Hidden on phones, so skip the typing animation there.
    if (window.matchMedia("(max-width: 720px)").matches) return setStep(total);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStep(total);
    const id = setInterval(() => setStep((s) => (s >= total ? s : s + 1)), 55);
    return () => clearInterval(id);
  }, [total]);

  const typed = COMMAND.slice(0, Math.min(step, COMMAND.length));
  const shown = lines.slice(0, Math.max(0, step - COMMAND.length));
  const done = step >= total;

  return (
    <figure className="term" aria-hidden="true">
      <div className="term-bar">
        <span /><span /><span />
        <b className="mono">profile — zsh</b>
      </div>
      <div className="term-body mono">
        <div>
          <span className="t-prompt">$</span> {typed}
          {!shown.length && <i className="t-caret" />}
        </div>
        {shown.map((l, i) => (
          <div key={i} className="t-line" style={{ paddingLeft: `${l.indent * 2}ch` }}>
            {l.parts.map(([kind, text], j) => (
              <span key={j} className={`t-${kind}`}>{text}</span>
            ))}
            {i === shown.length - 1 && <i className={`t-caret${done ? " idle" : ""}`} />}
          </div>
        ))}
      </div>
    </figure>
  );
}
