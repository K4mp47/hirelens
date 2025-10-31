import Link from 'next/link'
import Image from 'next/image'
import ScoreCircle from './ScoreCircle'
import { useEffect, useState } from 'react';
import { usePuterStore } from '@/lib/puter';

/**
 * The ResumeCard component displays a summary of a resume, including company name, job title,
 * overall score, and a preview image. It links to the detailed view of the resume.
 * @param {object} props - The component props.
 * @param {Resume} props.resume - The resume data to display.
 * @returns {JSX.Element} The rendered ResumeCard component.
 */
const ResumeCard = ({ resume }: { resume: Resume }) => {
  // Accessing the file system from the Puter store
  const { fs } = usePuterStore();

  // State to store the URL of the resume image
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Effect to load the resume image from the file system when the component mounts
  useEffect(() => {
      const loadResume = async () => {
        // Read the image file as a blob
        const blob = await fs.read(resume.imagePath);
        if (!blob) return;

        // Create a URL from the blob and update the state
        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
      };
  
      loadResume();
    }, [resume.imagePath, fs]);

  return (
    <Link href={`/resume/${resume.id}`} className='animate-in fade-in duration-200 flex flex-col items-center justify-between border border-border rounded-md bg-card w-full h-96'>
      {/* Header section with company and job title */}
      <div className='flex w-full justify-between'>
        <div className='p-4'>
          {resume.companyName && <h1 className="Titles text-2xl">{resume.companyName}</h1>}
          {resume.jobTitle && <h2 className='subtitles'>{resume.jobTitle}</h2>}
          {!resume.companyName && !resume.jobTitle && <h1 className="Titles text-2xl">Resume</h1>}
        </div>

        {/* Score circle */}
        <div className='p-4'>
          <ScoreCircle score={resume.feedback.overallScore} />
        </div>
      </div>

      {/* Resume image preview */}
      {resumeUrl && (
        <div className='animate-in fade-in duration-1000 w-full overflow-hidden'>
          <div className='p-4 relative w-full'>
            <Image src={resumeUrl} alt={`${resume.companyName} logo`} layout='responsive' width={10} height={10} className='rounded-md'/>
          </div>
        </div>
      )}
    </Link>
  );
};

export default ResumeCard;
