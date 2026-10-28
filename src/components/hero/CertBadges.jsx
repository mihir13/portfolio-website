import { FiAward } from "react-icons/fi";
import { certifications } from "../../content.js";

export default function CertBadges() {
  if (!certifications.items?.length) return null;
  return (
    <ul className="certs" aria-label="Certifications">
      {certifications.items.map((c) => (
        <li key={c.name} className={/progress/i.test(c.detail) ? "cert pending" : "cert"}>
          <FiAward aria-hidden="true" />
          <span>{c.name}</span>
          <em className="mono">{c.detail}</em>
        </li>
      ))}
    </ul>
  );
}
