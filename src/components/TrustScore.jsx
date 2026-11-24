import { useEffect, useState } from "react"
import { useApp } from "../context/AppContext.jsx"

// Circular trust score from 0 to 100. Verdict still matters, but stronger evidence can raise the score
// without letting false or misleading claims look fully trustworthy.
function displayScoreForVerdict(verdict, score) {
  const normalized = String(verdict || "").toUpperCase()
  const value = Math.max(0, Math.min(100, Math.round(Number(score) || 0)))
  if (normalized === "FALSE" || normalized === "RISKY") return Math.min(45, value)
  if (normalized === "MISLEADING" || normalized === "MANIPULATIVE") return Math.min(70, value)
  return value
}

export default function TrustScore({ score = 0, verdict }) {
  const { t } = useApp()
  const [shown, setShown] = useState(0)
  const displayScore = displayScoreForVerdict(verdict, score)

  useEffect(() => {
    let frame
    const start = performance.now()
    const duration = 900
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setShown(Math.round(p * displayScore))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [displayScore])

  const color =
    displayScore >= 70
      ? "var(--color-true)"
      : displayScore >= 40
        ? "var(--color-misleading)"
        : "var(--color-false)"

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (shown / 100) * circumference

  const band = displayScore >= 70 ? t("trust_band_high") : displayScore >= 40 ? t("trust_band_mid") : t("trust_band_low")

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148, 163, 184, 0.18)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-extrabold leading-none tracking-tight" style={{ color }}>
            {shown}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{t("of_100")}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">{t("trust_score")}</p>
        <span
          className="mt-2 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold"
          style={{ color, backgroundColor: "color-mix(in srgb, " + color + " 16%, rgba(15, 23, 42, 0.92))" }}
        >
          {band}
        </span>
      </div>
    </div>
  )
}
