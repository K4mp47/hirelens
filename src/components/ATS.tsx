import Image from "next/image";
import { cn } from "@/lib/utils";
import { Biohazard, BrainCircuit, Microscope } from "lucide-react";

/**
 * The ATS component displays the Applicant Tracking System (ATS) score and suggestions for a resume.
 * It provides feedback on how well the resume is likely to perform with automated screening systems.
 * @param {object} props - The component props.
 * @param {number} props.score - The ATS score, out of 100.
 * @param {Array<object>} props.suggestions - An array of suggestions for improvement.
 * @param {"good" | "improve"} props.suggestions[].type - The type of suggestion.
 * @param {string} props.suggestions[].tip - The suggestion text.
 * @returns {JSX.Element} The rendered ATS component.
 */
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
        // Dynamically set the background color based on the score
        score > 69
          ? "from-green-100"
          : score > 49
          ? "from-yellow-100"
          : "from-red-100"
      )}
    >
      {/* Header with ATS score */}
      <div className="flex flex-row gap-4 items-center">
        <span className="text-primary"><Microscope /></span><p className="text-2xl font-semibold"> ATS Score - {score}/100</p>
      </div>

      {/* Suggestions section */}
      <div className="flex flex-col gap-2">
        <p className="font-medium text-xl">
          How well does your resume pass through Applicant Tracking Systems?
        </p>
        <p className="text-lg subtitles">
          Your resume was scanned like an employer would. Here&apos;s how it
          performed:
        </p>

        {/* Map through suggestions and display them */}
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

        {/* Call to action */}
        <i className="text-lg mt-2">
          Want a better score? Improve your resume by applying the suggestions
          listed!!
        </i>
      </div>
    </div>
  );
};

export default ATS;