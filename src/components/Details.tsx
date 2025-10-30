import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger,  } from "./ui/accordion";
import { ThumbsDown, ThumbsUp } from "lucide-react";


const ScoreBadge = ({ score }: { score: number }) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
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

const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
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

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="flex flex-col gap-4 w-full bg-card mt-4 p-4 rounded-lg">
      <Accordion type="single" collapsible className="w-full">
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