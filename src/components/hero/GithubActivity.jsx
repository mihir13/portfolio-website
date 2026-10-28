import { useEffect, useState } from "react";
import { site } from "../../content.js";

const user = (() => {
  try { return new URL(site.socials?.github).pathname.split("/").filter(Boolean)[0]; } catch { return ""; }
})();

function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  if (d < 60) return `${d} days ago`;
  const m = Math.round(d / 30);
  return m < 18 ? `${m} months ago` : `${Math.round(d / 365)} yrs ago`;
}

// Reads the public repo list straight from GitHub in the visitor's browser.
// Cached for ten minutes so a refresh doesn't use up GitHub's anonymous rate limit.
async function loadRepos() {
  const key = `gh-repos-${user}`;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || "null");
    if (hit && Date.now() - hit.t < 600000) return hit.data;
  } catch {}
  const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=12`);
  if (!res.ok) throw new Error(res.status);
  const data = (await res.json())
    .filter((r) => !r.fork && !r.archived)
    .slice(0, 4)
    .map((r) => ({ name: r.name, url: r.html_url, description: r.description, language: r.language, pushed: r.pushed_at }));
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch {}
  return data;
}

export default function GithubActivity() {
  const [repos, setRepos] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return setFailed(true);
    let live = true;
    loadRepos().then((d) => live && setRepos(d)).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, []);

  return (
    <section className="card dash-card" aria-label="Recent GitHub activity">
      <div className="dash-head">
        <h3 className="mono accent">Recent on GitHub</h3>
        <a className="mono dash-link" href={site.socials?.github} target="_blank" rel="noreferrer">See all →</a>
      </div>
      {!repos && !failed && <p className="muted dash-empty">Loading…</p>}
      {failed && !repos && (
        <p className="muted dash-empty">
          Activity is unavailable right now. <a className="accent" href={site.socials?.github} target="_blank" rel="noreferrer">See GitHub →</a>
        </p>
      )}
      {repos && (
        <ul className="repos">
          {repos.map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noreferrer">
                <span className="repo-name mono">{r.name}</span>
                <span className="muted repo-desc">{r.description || r.language || "Repository"}</span>
                <span className="mono muted repo-time">pushed {ago(r.pushed)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
