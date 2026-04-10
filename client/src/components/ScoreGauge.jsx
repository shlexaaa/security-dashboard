export default function ScoreGauge({ score }) {
  const radius = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * radius;
  // Show 75% of the circle (270°) for the gauge arc
  const arcFraction = 0.75;
  const arcLen = circumference * arcFraction;
  const offset = arcLen - (score / 100) * arcLen;

  const color =
    score >= 75 ? "var(--green)" : score >= 45 ? "var(--yellow)" : "var(--red)";

  const verdict =
    score >= 75
      ? "Good security posture"
      : score >= 45
      ? "Needs improvement"
      : "Critical issues found";

  // Rotate so arc starts at bottom-left and ends at bottom-right (270° sweep)
  const rotation = 135;

  return (
    <div className="score-gauge-wrap">
      <svg
        className="score-gauge-svg"
        width={140}
        height={140}
        viewBox="0 0 140 140"
      >
        {/* Track */}
        <circle
          className="score-gauge-track"
          cx={cx}
          cy={cy}
          r={radius}
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        {/* Fill */}
        <circle
          className="score-gauge-fill"
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        <text x={cx} y={cy - 6} className="score-label" fill={color}>
          {score}
        </text>
        <text x={cx} y={cy + 16} className="score-sub">
          / 100
        </text>
      </svg>
      <div className="score-verdict" style={{ color }}>
        {verdict}
      </div>
    </div>
  );
}
