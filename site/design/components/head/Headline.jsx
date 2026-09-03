import React from "react";

/* Display type: Bricolage Grotesque 800, near-zero leading. Write it as a setup
   and let the lede carry the punchline. */
export function Headline({ children, size }) {
  return (
    <h1 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: size || "var(--h1-size)", lineHeight: "var(--h1-leading)", letterSpacing: "var(--h1-tracking)", marginTop: "20px" }}>{children}</h1>
  );
}
