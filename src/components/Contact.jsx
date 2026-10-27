import { useState } from "react";
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

export default function Contact() {
  const [state, setState] = useState({ status: "idle", msg: "" });

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Honeypot: real visitors never fill this hidden field, bots usually do.
    if (data.get("website")) {
      form.reset();
      return setState({ status: "ok", msg: "Message sent. Thanks, I'll reply soon." });
    }
    setState({ status: "sending", msg: "" });
    try {
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
      setState({ status: "ok", msg: "Message sent. Thanks, I'll reply soon." });
    } catch (err) {
      setState({ status: "error", msg: "Couldn't send that. Please try again or email me directly." });
    }
  };

  return (
    <Section id="contact" index={notes.length ? 6 : 5} title="Contact">
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
