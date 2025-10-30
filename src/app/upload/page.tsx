"use client"
import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./UploadPage'), {
  ssr: false
});

export default Page