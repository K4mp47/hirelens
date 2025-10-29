"use client"

import { usePuterStore } from '@/lib/puter'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { resume } from 'react-dom/server'

export const meta = () => ([
  { title: "Resumind | Review" },
  { name: "description", content: "Review your resume" }
])

const Resume = () => {
  
  const router = useRouter()

  const { auth, isLoading, fs, kv } = usePuterStore();
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const { id } = useParams()

  useEffect(() => {
    const fetchResumeData = async () => {
      // Placeholder for fetching resume data logic
      // You can replace this with actual data fetching code
      const resumeData = await kv.get(`resume:${id}`);
      if (!resumeData) {
        console.error("No resume data found");
        return;
      }

      const data = JSON.parse(resumeData);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) {
        console.error("Failed to read resume blob");
        return;
      }

      const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) {
        console.error("Failed to read image blob");
        return;
      }

      const imgBlob = new Blob([imageBlob], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imgBlob);
      
      setImageUrl(imageUrl);
      setResumeUrl(resumeUrl);
      setFeedback(data.feedback || null);
      console.log("Feedback:", data.feedback, "Image Path:", data.imagePath, "Resume Path:", data.resumePath);
    };

    fetchResumeData();
  }, [id, fs, kv]);

  return (
    <main className="flex items-center justify-center min-h-screen w-full">
      <nav className="absolute top-4 left-4">
        <button className="bg-primary text-white px-4 py-2 rounded-md" onClick={() => router.back()}>Back</button>
      </nav>
      <div>
        <section className='flex flex-col gap-4 p-4'>
          <h2 className="text-2xl font-bold">Resume ID: {id}</h2>
          <p className="text-gray-600">Here you can review your resume details.</p>
          {imageUrl && resumeUrl && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Profile Image</h3>
                <Image src={imageUrl} alt="Profile" className="w-full h-auto rounded-md border" layout='responsive' width={10} height={10} />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Resume Document</h3>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View Resume
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Resume
