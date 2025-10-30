const ScoreGauge = ({ score = 75 }: { score?: number }) => {
  const radius = 45;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2 - 5;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  // show only half of the circle as the gauge; offset scales with the half-length
  const strokeDashoffset = (circumference / 2) * (1 - progress);

  return (
    <div className="relative w-30 h-30">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-180 translate-y-2"
      >
        {/* Background circle */}
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
        {/* Partial semicircle with gradient */}
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

      {/* Score and issues */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-sm">{`${score}/100`}</span>
      </div>
    </div>
  );
};

export default ScoreGauge;