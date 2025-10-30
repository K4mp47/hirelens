"use client"
import NavBar from '@/components/NavBar'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Textarea } from '@/components/ui/textarea'
import { TbFiles } from "react-icons/tb";
import { usePuterStore } from '@/lib/puter'
import { convertPdfToImage } from '@/lib/pdf2img'
import { generateUUID } from '@/lib/utils'
import { prepareInstructions } from '@/constants'
import { useRouter } from 'next/navigation'
 
const formSchema = z.object({
  companyName: z.string().min(2).max(50),
  jobTitle: z.string().min(2).max(50),
  jobDescription: z.string().min(50).max(20000),
  uploadFile: z.instanceof(File),
})

const UploadPage = () => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      jobDescription: "",
      uploadFile: undefined,
    },
  })

  const { fs, ai, kv } = usePuterStore();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [statusText, setStatusText] = React.useState("");

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, uploadFile }: z.infer<typeof formSchema>) => {
    console.log("Analyzing resume...");
    console.log("Company Name:", companyName);
    console.log("Job Title:", jobTitle);
    console.log("Job Description:", jobDescription);
    console.log("Uploaded File:", uploadFile);

    setIsProcessing(true);
    setStatusText("Processing...");

    if (!uploadFile) {
      setIsProcessing(false);
      return setStatusText("Please select a file to upload.");
    }

    const uploadedFile = await fs.upload([uploadFile]);

    if (!uploadedFile) {
      setIsProcessing(false);
      return setStatusText("Failed to upload file. Please try again.");
    }

    setStatusText("Analyzing resume with AI...");

    const imageFile = await convertPdfToImage(uploadFile);

    if (!imageFile.file) {
      setIsProcessing(false);
      return setStatusText("Failed to convert PDF to image. Please try again.");
    }

    setStatusText("Generating image...");
    const uploadedImage = await fs.upload([imageFile.file]);

    if (!uploadedImage) {
      setIsProcessing(false);
      return setStatusText("Failed to upload image. Please try again.");
    }

    setStatusText("Getting resume analysis...");

    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Analyzing...");

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    )

    if (!feedback) {
      setIsProcessing(false);
      return setStatusText("Failed to get feedback. Please try again.");
    }

    const feedbackTest = typeof feedback.message.content === "string"
      ? feedback.message.content
      : feedback.message.content?.[0]?.text;

    if (!feedbackTest) {
      setIsProcessing(false);
      return setStatusText("Failed to parse feedback. Please try again.");
    }

    try {
      data.feedback = JSON.parse(feedbackTest as string);
    } catch (err) {
      console.error("Failed to parse feedback JSON:", err);
      setIsProcessing(false);
      return setStatusText("Failed to parse feedback JSON. Please try again.");
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    
    // setIsProcessing(false);
    setStatusText("Analysis complete! You can view your resume on the home page.");
    console.log("Analysis complete:", data);
    router.push(`/resume/${uuid}`);
  };

  return (
    <main className="flex flex-col items-center justify-center text-center lg:mx-36">
      <NavBar />
      <div className='mx-4 flex flex-col items-center mb-20'>
        <h1 className="Titles mt-8 md:text-8xl mask-x-from-70%">Smart Feedback for your Dream Job</h1>
        <h2 className='subtitles mb-12 mt-8'> Drop your resume for an ATS score and improvement tips</h2>
        { isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex-col gap-4 w-full flex items-center justify-center h-112">
              <div
                className="w-20 h-20 border-4 border-transparent text-primary text-4xl transition duration-[20s] animate-spin flex items-center justify-center border-t-primary rounded-full"
              >
                <div
                  className="w-16 h-16 border-4 border-transparent text-destructive text-2xl transition duration-[20s] animate-spin flex items-center justify-center border-t-accent rounded-full"
                ></div>
              </div>
            </div>
            <p className="subtitles">{statusText}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAnalyze)} className="space-y-8 w-full lg:w-1/2 flex-col flex justify-start bg-card p-8 rounded-xl">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className='text-left'>
                    <FormLabel className='text-lg'>Company Name</FormLabel>
                    <FormDescription className='text-xs'>
                      This is your public display name.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>         
                    <FormMessage />
                  </FormItem>
                  
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem className='text-left'>
                    <FormLabel className='text-lg'>Job Title</FormLabel>
                    <FormDescription className='text-xs'>
                      This is the title of the job you are applying for.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Job Title" {...field} />
                    </FormControl>         
                    <FormMessage />
                  </FormItem>
                  
                )}
              />
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem className='text-left'>
                    <FormLabel className='text-lg'>Job Description</FormLabel>
                    <FormDescription className='text-xs'>
                      This is the description of the job you are applying for.
                    </FormDescription>
                    <FormControl>
                      <Textarea placeholder="Job Description" {...field}/>
                    </FormControl>         
                    <FormMessage />
                  </FormItem>
                  
                )}
              />
              <FormField
                control={form.control}
                name="uploadFile"
                render={({ field }) => (
                  <FormItem className='text-left'>
                    <FormLabel className='text-lg'>Upload File</FormLabel>
                    <FormDescription className='text-xs'>
                      This is the CV file you want to upload.
                    </FormDescription>
                    <FormControl>
                      <label className="flex items-center gap-4 cursor-pointer">
                        <TbFiles />
                        <span className="text-sm">
                          {field.value ? field.value.name : "No file chosen"}
                        </span>
                        {field.value ? (
                          <span className="text-sm">
                            { field.value.size / 1024 > 1000 ? 
                              `${Math.round(field.value.size / 1024 / 1024)}.${Math.round(field.value.size % 1024 / 10)} MB` :
                              `${Math.round(field.value.size / 1024)} KB`
                            }
                          </span>
                        ) : null}
                        {field.value ? (
                          <button
                            type="button"
                            aria-label="Remove file"
                            className="ml-2 text-lg text-red-500 cursor-pointer"
                            onClick={(e) => {
                              // prevent the label click from opening file dialog
                              e.preventDefault();
                              // clear RHF value
                              field.onChange(undefined);
                              // also clear the underlying input element's value if present
                              const input = (e.currentTarget.closest('label')?.querySelector('input[type="file"]') as HTMLInputElement | null);
                              if (input) input.value = '';
                            }}
                          >
                            ✕
                          </button>
                        ) : null}
                        <Input
                          type="file"
                          accept=".pdf"
                          className="sr-only relative w-0"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? undefined;
                            field.onChange(file);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                        
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  
                )}
              />
              <Button type="submit" size="lg" variant="default">Analyze Resume</Button>
            </form>
          </Form>
        )}
      </div>
    </main>
  )
}

export default UploadPage