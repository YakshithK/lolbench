import React from "react";

/* Hairline-topped provenance row: what this is, where the code is, how much to
   trust it today. */
export function Footer({ left = "lolbench.lol", repo = "source and raw data on github", repoHref = "https://github.com/YakshithK/lolbench", right = "early results · rankings will move" }) {
  return (
    <footer className="wrap" style={{ marginTop: "34px", paddingTop: "16px", borderTop: "var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)" }}>
      <span>{left}</span>
      <a href={repoHref} style={{ color: "var(--ink-4)" }}>{repo}</a>
      <span>{right}</span>
    </footer>
  );
}
