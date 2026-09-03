import React from "react";
import { Joke } from "./Joke.jsx";

/* Two concealed panels stacked inside one frame, divided by a hairline. Authors
   are never shown here, only in the reveal. */
export function Bout({ a, b, labelA = "a", labelB = "b" }) {
  const tag = { fontFamily: "var(--mono)", fontSize: "var(--label-size)", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-3)" };
  return (
    <div style={{ padding: "var(--panel-body-pad)" }}>
      <div style={tag}>{labelA}</div>
      <Joke>{a}</Joke>
      <div style={{ height: "1px", background: "var(--rule)", margin: "16px 0" }} />
      <div style={tag}>{labelB}</div>
      <Joke>{b}</Joke>
    </div>
  );
}
