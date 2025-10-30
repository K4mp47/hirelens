import Link from 'next/link'
import Image from 'next/image'
import ScoreCircle from './ScoreCircle'
import { useEffect, useState } from 'react';
import { usePuterStore } from '@/lib/puter';

const ResumeCard = ({ resume }: { resume: Resume }) => {
  const { fs } = usePuterStore();
  // const [ resumeUrl, setResumeUrl ] = useState<string | null>(null);

  // useEffect(() => {
  //     const loadResume = async () => {
  //       const blob = await fs.read(resume.imagePath);
  //       if(!blob) return
  //       const url = URL.createObjectURL(blob);
  //       setResumeUrl(url);
  //     }
  
  //     loadResume();
  //   }, [resume.imagePath, fs]);

  return (
    <div className='animate-in fade-in duration-200 flex flex-col items-center justify-between border border-border rounded-md bg-card w-full h-96'>
      <div className='flex w-full justify-between'>
        <div className='p-4'>
          {resume.companyName && <h1 className="Titles text-2xl">{resume.companyName}</h1>}
          {resume.jobTitle && <h2 className='subtitles'>{resume.jobTitle}</h2>}
          {!resume.companyName && !resume.jobTitle && <h1 className="Titles text-2xl">Resume</h1>}
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
    </div>
  )
}

export default ResumeCard