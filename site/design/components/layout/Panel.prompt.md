Wraps every chart, table and note on the page.

```jsx
<Panel size="lg" title="Score against cost" meta="lime = best in its price tier" pad={false}
  caption="Paying more has not bought a better sense of humor yet.">
  <Scatter points={points} />
</Panel>
```

Notes: if you cannot write the caption, the chart is not ready to ship. Meta carries the legend rule; caption carries the finding.
