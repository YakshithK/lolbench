The ranking, inside a Panel.

```jsx
<Panel title="Standings" meta="lime = best in its price tier" pad={false}>
  <Standings
    rows={[{label:"muse-spark-1.2", leader:true, score:<ScoreCell value={95.8} plusMinus={6.3} />}]}
    unranked={[{label:"qwen3.8-flash", score:<ScoreCell value={100} on={3} />}]}
    footer="qwen3.8-flash scored 100.0 on three answers: too thin to rank. Five more are still being judged."
  />
</Panel>
```

Notes: the footer is an arithmetic contract — ranked + unranked + pending must equal the model count, or a reader will catch it.
