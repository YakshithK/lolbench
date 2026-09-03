```jsx
<Sparkline pending={5} bars={[
  {label:"qwen3.8-flash", value:100, thin:true},
  {label:"muse-spark-1.2", value:95.8, leader:true},
  {label:"deepseek-v4-flash", value:74.2},
]} />
```

Notes: a tall bar from a thin sample must be orange, or the chart contradicts the rest of the page. Always caption what each colour means.
