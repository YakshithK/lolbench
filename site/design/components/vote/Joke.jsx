import React from "react";

/* A joke, set in Sora light italic. Nothing else on any screen is italic, so the
   typeface switch is how a reader knows this is the corpus and not our writing. */
export function Joke({ children, size = "var(--joke-size)" }) {
  return <p style={{ fontFamily: "var(--body)", fontWeight: 200, fontStyle: "italic", fontSize: size, lineHeight: "var(--joke-leading)", color: "#d6d4cf", marginTop: "6px" }}>{children}</p>;
}
