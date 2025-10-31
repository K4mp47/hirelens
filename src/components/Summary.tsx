import React from 'react'
import ScoreGauge from './ScoreGauge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

/**
 * The Category component displays a single feedback category with its title, score, and a descriptive badge.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the category.
 * @param {number} props.score - The score for the category.
 * @returns {JSX.Element} The rendered Category component.
 */
const Category = ({ title, score }: { title: string; score: number }) => {
  
  // Determine text color and badge properties based on the score
  const textColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
  const badgeLabel = score >= 75 ? 'Excellent' : score >= 50 ? 'Average' : 'Pretty Bad';
  const badgeClass = score >= 75 ? 'bg-green-400 text-green-800' : score >= 50 ? 'bg-yellow-400 text-yellow-800' : 'bg-red-400 text-red-800';

  return (
    <div className='flex bg-card p-4 rounded-lg my-4'>
      <div className='w-full items-center justify-between flex'>
        <div className='flex items-center gap-3'>
          <p className='mt-2 text-xl font-semibold'>{title}</p>
          <span className={`mt-1 px-2 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
            {badgeLabel}
          </span>
        </div>
        <div className='flex items-center text-xl font-semibold'>
          <p className={textColor}>{Math.round(score)}</p>
          <span className='ml-1 text-base font-normal'>/100</span>
        </div>
      </div>
    </div>
  )
}

/**
 * The Summary component provides an overview of the resume feedback, including an overall score gauge,
 * a collapsible section for the job description, and a list of feedback categories.
 * @param {object} props - The component props.
 * @param {Feedback} props.feedback - The feedback object containing scores and tips.
 * @param {string} props.jobDescription - The job description text.
 * @returns {JSX.Element} The rendered Summary component.
 */
const Summary = ({ feedback, jobDescription }: { feedback: Feedback, jobDescription: string }) => {

  return (
    <div className='flex-col text-left'>
      {/* Overall score gauge */}
      <div className='flex'>
        <ScoreGauge score={feedback?.overallScore || 0} />
        <div className='mt-4'>
          <h3 className="text-xl font-semibold mb-2">Resume Score</h3>
          <p className="subtitles">based on the overall score.</p>
        </div>
      </div>

      {/* Collapsible job description */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="important-notice">
          <AccordionTrigger className='font-semibold text-xl'>
            Full Job Description             
          </AccordionTrigger>
          <AccordionContent>
            <pre className="subtitles whitespace-pre-wrap font-sans">
              {jobDescription}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Feedback categories */}
      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>

  )
}

export default Summary;