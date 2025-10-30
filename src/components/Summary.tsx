import React from 'react'
import ScoreGauge from './ScoreGauge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const Category = ({ title, score }: { title: string; score: number }) => {
  
  const textColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

  const badgeLabel =
    score >= 75 ? 'Excellent' : score >= 50 ? 'Average' : 'Pretty Bad';

  const badgeClass =
    score >= 75
      ? 'bg-green-400 text-green-800'
      : score >= 50
      ? 'bg-yellow-400 text-yellow-800'
      : 'bg-red-400 text-red-800';

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

const Summary = ({ feedback, jobDescription }: { feedback: Feedback, jobDescription: string }) => {

  return (
    <div className='flex-col text-left'>
      <div className='flex'>
        <ScoreGauge score={feedback?.overallScore || 0} />
        <div className='mt-4'>
          <h3 className="text-xl font-semibold mb-2">Resume Score</h3>
          <p className="subtitles">based on the overall score.</p>
        </div>
      </div>
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
      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>

  )
}

export default Summary;