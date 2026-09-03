The finding chart: everyone is near perfect on five mechanisms and falls apart on one.

```jsx
<Heatmap columns={["F1","F2","F3","F4","F5","F6"]} warnColumn="F6" rows={[
  {label:"grok-4.6", values:{F1:100,F2:100,F3:100,F4:98,F5:99,F6:62}},
  {label:"claude-opus-5", values:{F5:98,F6:79}},
]} />
```

Notes: never fill an absent cell with a zero or a dash — the empty well cell means "not asked yet", and the distinction is the point. The warn column's header is orange so the failure column is never labelled in the success colour.
