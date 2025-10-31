import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger,  } from "./ui/accordion";
import { ThumbsDown, ThumbsUp } from "lucide-react";

/**
 * A badge that displays a score with a color indicating its level (good, average, or poor).
 * @param {object} props - The component props.
 * @param {number} props.score - The score to display.
 * @returns {JSX.Element} The rendered ScoreBadge component.
 */
const ScoreBadge = ({ score }: { score: number }) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
        // Dynamically set background color based on the score
        score > 69
          ? "bg-green-400"
          : score > 39
          ? "bg-yellow-400"
          : "bg-red-400"
      )}
    >
      <p
        className={cn(
          "text-sm font-medium",
          // Dynamically set text color based on the score
          score > 69
            ? "text-green-800"
            : score > 39
            ? "text-yellow-800"
            : "text-red-800"
        )}
      >
        {score}/100
      </p>
    </div>
  );
};

/**
 * A header for a feedback category, displaying the title and score.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the category.
 * @param {number} props.categoryScore - The score for the category.
 * @returns {JSX.Element} The rendered CategoryHeader component.
 */
const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row gap-4 items-center py-2">
      <p className="text-2xl font-semibold">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

/**
 * The content of a feedback category, displaying tips and explanations.
 * @param {object} props - The component props.
 * @param {Array<object>} props.tips - An array of tips.
 * @returns {JSX.Element} The rendered CategoryContent component.
 */
const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {/* Grid of tips with icons */}
      <div className="bg-popover w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div className="flex flex-row gap-2 items-center" key={index}>
            {tip.type === "good" ? (
              <span className="text-green-400 text-2xl"><ThumbsUp /></span>
            ) : (
              <span className="text-yellow-400 text-2xl"><ThumbsDown /></span>
            )}
            <p className="text-xl text-gray-500 ">{tip.tip}</p>
          </div>
        ))}
      </div>

      {/* Detailed explanation for each tip */}
      <div className="flex flex-col gap-4 w-full">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={cn(
              "flex flex-col gap-2 rounded-2xl p-4",
              tip.type === "good"
                ? "text-green-400"
                : "text-yellow-400"
            )}
          >
            <div className="flex flex-row gap-2 items-center">
              {tip.type === "good" ? (
                <span className="text-2xl"><ThumbsUp /></span>
              ) : (
                <span className="text-2xl"><ThumbsDown /></span>
              )}
              <p className="text-xl font-semibold">{tip.tip}</p>
            </div>
            <p className="subtitles">{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * The Details component displays detailed feedback for a resume, categorized into sections.
 * @param {object} props - The component props.
 * @param {Feedback} props.feedback - The feedback object containing scores and tips.
 * @returns {JSX.Element} The rendered Details component.
 */
const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="flex flex-col gap-4 w-full bg-card mt-4 p-4 rounded-lg">
      <Accordion type="single" collapsible className="w-full">
        {/* Tone & Style feedback section */}
        <AccordionItem value="tone-style">
          <AccordionTrigger>
            <CategoryHeader
              title="Tone & Style"
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionTrigger>
          <AccordionContent>
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>

        {/* Content feedback section */}
        <AccordionItem value="content">
          <AccordionTrigger>
            <CategoryHeader
              title="Content"
              categoryScore={feedback.content.score}
            />
          </AccordionTrigger>
          <AccordionContent>
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>

        {/* Structure feedback section */}
        <AccordionItem value="structure">
          <AccordionTrigger>
            <CategoryHeader
              title="Structure"
              categoryScore={feedback.structure.score}
            />
          </AccordionTrigger>
          <AccordionContent>
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>

        {/* Skills feedback section */}
        <AccordionItem value="skills">
          <AccordionTrigger>
            <CategoryHeader
              title="Skills"
              categoryScore={feedback.skills.score}
            />
          </AccordionTrigger>
          <AccordionContent>
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Details;