/**
 * The ScoreGauge component displays a score as a semi-circular gauge.
 * It's a space-efficient way to visually represent a score out of 100.
 * @param {object} props - The component props.
 * @param {number} props.score - The score to display, defaults to 75.
 * @returns {JSX.Element} The rendered ScoreGauge component.
 */
const ScoreGauge = ({ score = 75 }: { score?: number }) => {
  // SVG circle parameters
  const radius = 45;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2 - 5;
  const circumference = 2 * Math.PI * normalizedRadius;

  // Calculate the progress and stroke offset for a semi-circle
  const progress = score / 100;
  const strokeDashoffset = (circumference / 2) * (1 - progress);

  return (
    <div className="relative w-30 h-30">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-180 translate-y-2"
      >
        {/* Background semi-circle */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="#252e3d"
          strokeWidth={stroke}
          strokeDashoffset={circumference / 2}
          strokeDasharray={`${circumference / 2}`}
          strokeLinecap="round"
          fill="transparent"
          transform="rotate(-180 50 50)"
        />

        {/* Foreground semi-circle with gradient */}
        <defs>
          <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="20%" stopColor="#48a9f3" />
            <stop offset="80%" stopColor="#008bf6" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference / 2} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-sm">{`${score}/100`}</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
