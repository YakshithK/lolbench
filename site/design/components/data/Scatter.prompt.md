Score against cost, the chart the leaderboard is built around.

```jsx
<Scatter
  rule={{at:95.8, label:"best score so far: 95.8, and it costs nothing"}}
  points={[
    {label:"muse-spark-1.2", x:0, y:95.8, lo:87.5, hi:100, leader:true},
    {label:"gemini-3.1-pro", x:1.94, y:95.5, lo:89.4, hi:100, leader:true},
    {label:"gpt-5.6-sol-pro", x:1.26, y:75, lo:25, hi:100, thin:true},
  ]} />
```

Notes: never put model names inside the plot. Several models sit on the free axis and their range bars cover most of the plot height, so in-plot text always ends up struck through — the legend gutter exists for exactly that reason. Leave `yMin` unset unless you have measured the data: the axis floor is derived so that an interval running down to 25 is drawn to 25.
