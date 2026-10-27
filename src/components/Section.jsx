import { useReveal } from "../hooks.js";

export default function Section({ id, index, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section id={id} ref={ref} className={`section reveal${shown ? " in" : ""}`}>
      <h2 className="section-title">
        <span className="mono accent">{String(index).padStart(2, "0")}</span>
        {title}
        <span className="rule" />
      </h2>
      {children}
    </section>
  );
}
