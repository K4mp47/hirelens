import Link from 'next/link'
import Image from 'next/image'
import ScoreCircle from './ScoreCircle'

const ResumeCard = ({ resume }: { resume: Resume }) => {
  return (
    <Link href={`/resume/${resume.id}`} className='animate-in fade-in duration-200 flex flex-col items-center justify-between border border-border rounded-md bg-card w-full h-96'>
      <div className='flex w-full justify-between'>
        <div className='p-4'>
          <h1 className="Titles text-2xl">{resume.companyName}</h1>
          <h2 className='subtitles'>{resume.jobTitle}</h2>
        </div>
        <div className='p-4'>
          <ScoreCircle score={resume.feedback.overallScore} />
        </div>
      </div>
      <div className='animate-in fade-in duration-1000 w-full overflow-hidden'>
        <div className='p-4 relative w-full'>
          <Image src={resume.imagePath} alt={`${resume.companyName} logo`} layout='responsive' width={10} height={10} className='rounded-md'/>
        </div>
      </div>
    </Link>
  )
}

export default ResumeCard