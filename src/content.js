// Single place where the site reads its content. Everything here is edited
// through the CMS at /admin (or by editing the JSON files in /content).
import site from "../content/site.json";
import experience from "../content/experience.json";
import skills from "../content/skills.json";

const projectFiles = import.meta.glob("../content/projects/*.json", { eager: true });
const projects = Object.values(projectFiles)
  .map((m) => m.default ?? m)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

const noteFiles = import.meta.glob("../content/notes/*.json", { eager: true });
const notes = Object.values(noteFiles)
  .map((m) => m.default ?? m)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

// EmailJS values are public client-side keys, not secrets.
const emailjs = {
  serviceId: "service_j31adlm",
  templateId: "template_zse9x0m",
  publicKey: "z73Wi4qeSQcXaq8ax",
};

export { site, experience, skills, projects, notes, emailjs };
