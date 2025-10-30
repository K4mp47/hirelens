import Image from "next/image";
import { cn } from "@/lib/utils";
import { Biohazard, BrainCircuit, Microscope } from "lucide-react";

const ATS = ({
  score,
  suggestions,
}: {
  score: number;
  suggestions: { type: "good" | "improve"; tip: string }[];
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl shadow-md w-full bg-card p-8 flex flex-col gap-4",
        score > 69
          ? "from-green-100"
          : score > 49
          ? "from-yellow-100"
          : "from-red-100"
      )}
    >
      <div className="flex flex-row gap-4 items-center">
        <span className="text-primary"><Microscope /></span><p className="text-2xl font-semibold"> ATS Score - {score}/100</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-medium text-xl">
          How well does your resume pass through Applicant Tracking Systems?
        </p>
        <p className="text-lg subtitles">
          Your resume was scanned like an employer would. Here&apos;s how it
          performed:
        </p>
        {suggestions.map((suggestion, index) => (
          <div className="flex flex-row gap-2 items-center" key={index}>
            {suggestion.type === "good" ? (
              <span className="text-green-500 text-xl"><BrainCircuit /></span>
            ) : (
              <span className="text-red-500 text-xl"><Biohazard /></span>
            )}
            <p className="text-lg text-gray-500">{suggestion.tip}</p>
          </div>
        ))}
        <i className="text-lg mt-2">
          Want a better score? Improve your resume by applying the suggestions
          listed!!
        </i>
      </div>
    </div>
  );
};

export default ATS;