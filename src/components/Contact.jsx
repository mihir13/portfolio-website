import { useEffect, useRef, useState } from "react";
import emailjsLib from "@emailjs/browser";
import { FaGithub, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { site, notes, emailjs } from "../content.js";
import Section from "./Section.jsx";

const icons = {
  github: FaGithub,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  twitter: FaXTwitter,
  youtube: FaYoutube,
};

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SENT = "Message sent. Thanks, I'll reply soon.";

// Loads Cloudflare's Turnstile script once and resolves when window.turnstile is ready.
let turnstileLoading;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileLoading ||= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = () => { turnstileLoading = null; reject(new Error("turnstile")); };
    document.head.appendChild(s);
  });
  return turnstileLoading;
}

export default function Contact() {
  const [state, setState] = useState({ status: "idle", msg: "" });
  // With a Turnstile site key set (Site settings in the editor) the form is checked on the
  // server by /.netlify/functions/contact. Without one it keeps sending straight via EmailJS.
  const siteKey = site.turnstileSiteKey;
  const widgetBox = useRef(null);
  const widgetId = useRef(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!siteKey || !widgetBox.current) return;
    let gone = false;
    loadTurnstile()
      .then((ts) => {
        if (gone || !widgetBox.current || widgetId.current !== null) return;
        widgetId.current = ts.render(widgetBox.current, {
          sitekey: siteKey,
          theme: "auto",
          callback: (t) => setToken(t),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => setState({ status: "error", msg: "The spam check couldn't load. Please email me directly." }));
    return () => {
      gone = true;
      if (widgetId.current !== null && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Honeypot: real visitors never fill this hidden field, bots usually do.
    if (data.get("website")) {
      form.reset();
      return setState({ status: "ok", msg: SENT });
    }
    if (siteKey && !token) {
      return setState({ status: "error", msg: "Please complete the spam check first." });
    }
    setState({ status: "sending", msg: "" });
    try {
      if (siteKey) {
        const res = await fetch("/.netlify/functions/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"),
            email: data.get("email"),
            message: data.get("message"),
            website: data.get("website"),
            token,
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) {
          // The token is single-use, so get a fresh one for the next attempt.
          if (window.turnstile && widgetId.current !== null) window.turnstile.reset(widgetId.current);
          setToken("");
          throw new Error(out.error || "failed");
        }
        form.reset();
        if (window.turnstile && widgetId.current !== null) window.turnstile.reset(widgetId.current);
        setToken("");
        return setState({ status: "ok", msg: SENT });
      }
      await emailjsLib.send(
        emailjs.serviceId,
        emailjs.templateId,
        {
          from_name: data.get("email"),
          user_name: data.get("name"),
          to_name: site.email,
          message: data.get("message"),
        },
        { publicKey: emailjs.publicKey }
      );
      form.reset();
      setState({ status: "ok", msg: SENT });
    } catch (err) {
      setState({ status: "error", msg: "Couldn't send that. Please try again or email me directly." });
    }
  };

  return (
    <Section id="contact" index={notes.length ? 7 : 6} title="Contact">
      <div className="contact">
        <div>
          <p className="lead">{site.contact_blurb}</p>
          <p className="mono">
            <a className="accent" href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          {site.cv && (
            <p>
              <a className="btn" href={site.cv} target="_blank" rel="noreferrer">Download CV</a>
            </p>
          )}
          <div className="socials">
            {Object.entries(site.socials).map(([k, url]) => {
              const Icon = icons[k];
              return Icon && url ? (
                <a key={k} className="icon-btn" href={url} aria-label={k} target="_blank" rel="noreferrer">
                  <Icon />
                </a>
              ) : null;
            })}
          </div>
        </div>
        <form onSubmit={submit} className="card form">
          <input className="hp" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Message<textarea name="message" rows="5" required /></label>
          {siteKey && <div ref={widgetBox} className="turnstile" />}
          <button className="btn primary" disabled={state.status === "sending"}>
            {state.status === "sending" ? "Sending…" : "Send message"}
          </button>
          {state.msg && (
            <p role="status" className={state.status === "ok" ? "ok" : "err"}>{state.msg}</p>
          )}
        </form>
      </div>
    </Section>
  );
}
