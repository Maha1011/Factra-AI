import test from "node:test"
import assert from "node:assert/strict"
import { aggregateVerdict, scoreForVerdict } from "./verification.js"

test("false claims rise with stronger evidence but remain below the trustworthy band", () => {
  const score = scoreForVerdict("FALSE", 80)
  assert.ok(score > 0)
  assert.ok(score < 50)
})

test("majority verdict prefers the most common claim instead of any single false claim", () => {
  assert.equal(
    aggregateVerdict([
      { verdict: "TRUE" },
      { verdict: "TRUE" },
      { verdict: "FALSE" },
    ]),
    "TRUE",
  )
})

test("ties and mixed unclear claims stay misleading", () => {
  assert.equal(
    aggregateVerdict([
      { verdict: "TRUE" },
      { verdict: "FALSE" },
      { verdict: "MISLEADING" },
    ]),
    "MISLEADING",
  )
})

test("false-majority claims stay false when they outweigh the rest", () => {
  assert.equal(
    aggregateVerdict([
      { verdict: "FALSE" },
      { verdict: "FALSE" },
      { verdict: "TRUE" },
    ]),
    "FALSE",
  )
})
