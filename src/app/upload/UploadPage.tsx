"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, LoaderCircle, ShieldCheck, UploadCloud, X } from "lucide-react";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { prepareInstructions } from "@/constants";
import { convertPdfToImage } from "@/lib/pdf2img";
import { usePuterStore } from "@/lib/puter";
import { generateUUID } from "@/lib/utils";

const formSchema = z.object({
  companyName: z.string().trim().min(2, "Enter the company name.").max(50),
  jobTitle: z.string().trim().min(2, "Enter the role title.").max(50),
  jobDescription: z.string().trim().min(50, "Add at least 50 characters from the job description.").max(20000),
  uploadFile: z.instanceof(File, { message: "Select a PDF resume." }).refine((file) => file.type === "application/pdf", "Only PDF files are supported."),
});

type ReviewFormValues = z.infer<typeof formSchema>;

const analysisSteps = [
  "Uploading your resume securely",
  "Preparing the document",
  "Comparing skills with the job description",
  "Generating prioritized feedback",
];

function extractJsonPayload(content: string) {
  return content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}

export default function UploadPage() {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyName: "", jobTitle: "", jobDescription: "", uploadFile: undefined },
  });
  const { fs, ai, kv, error: puterError, clearError } = usePuterStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [statusText, setStatusText] = React.useState("");
  const [step, setStep] = React.useState(0);
  const selectedFile = useWatch({ control: form.control, name: "uploadFile" });
  const description = useWatch({ control: form.control, name: "jobDescription" }) ?? "";

  const fail = (message: string) => {
    setIsProcessing(false);
    setStatusText(message);
  };

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, uploadFile }: ReviewFormValues) => {
    clearError();
    setIsProcessing(true);
    setStep(0);
    setStatusText(analysisSteps[0]);

    try {
      const uploadedFile = await fs.upload([uploadFile]);
      if (!uploadedFile) return fail(usePuterStore.getState().error ?? "The PDF could not be uploaded. Try again.");

      setStep(1);
      setStatusText(analysisSteps[1]);
      const imageFile = await convertPdfToImage(uploadFile);
      if (!imageFile.file) return fail("The PDF could not be prepared for analysis.");

      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) return fail(usePuterStore.getState().error ?? "The resume preview could not be stored.");

      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "" as string | Feedback,
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStep(2);
      setStatusText(analysisSteps[2]);
      const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({ jobTitle, jobDescription }));
      if (!feedback) {
        await kv.delete(`resume:${uuid}`);
        return fail(usePuterStore.getState().error ?? "Puter AI did not return feedback. Retry the analysis.");
      }

      setStep(3);
      setStatusText(analysisSteps[3]);
      const feedbackText = typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content.find((item) => item.type === "text")?.text;
      if (!feedbackText) {
        await kv.delete(`resume:${uuid}`);
        return fail("The AI response did not include readable feedback.");
      }

      try {
        data.feedback = JSON.parse(extractJsonPayload(feedbackText)) as Feedback;
      } catch {
        await kv.delete(`resume:${uuid}`);
        return fail("The AI response was incomplete or malformed. Retry the analysis.");
      }

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      router.push(`/resume/${uuid}`);
    } catch {
      fail(usePuterStore.getState().error ?? "The analysis could not be completed. Check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-12">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-3"><p className="text-sm font-medium text-primary">New resume review</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Match your resume to a specific role.</h1><p className="leading-7 text-muted-foreground">Provide the exact context an employer will use. HireLens stores the review in your Puter account.</p></div>
          <Card><CardHeader><CardTitle className="text-base">What happens next</CardTitle></CardHeader><CardContent className="space-y-4">{analysisSteps.map((item, index) => <div key={item} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span><p className="text-sm leading-6 text-muted-foreground">{item}</p></div>)}</CardContent></Card>
          <div className="flex gap-3 rounded-xl border bg-muted/30 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-6 text-muted-foreground">Resume content is not written to the browser console or sent to additional third-party AI services.</p></div>
        </aside>

        {isProcessing ? (
          <Card className="min-h-[520px]"><CardContent className="flex h-full min-h-[520px] flex-col items-center justify-center gap-6 p-8 text-center" aria-live="polite"><div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><LoaderCircle className="size-8 animate-spin motion-reduce:animate-none" /></div><div className="max-w-md space-y-2"><h2 className="text-2xl font-semibold">Review in progress</h2><p className="text-muted-foreground">{statusText}</p></div><div className="w-full max-w-md space-y-3"><Progress value={(step + 1) * 25} /><p className="text-xs text-muted-foreground">Step {step + 1} of {analysisSteps.length}. Progress reflects workflow stages, not model completion.</p></div></CardContent></Card>
        ) : (
          <Card><CardHeader><CardTitle>Role and resume details</CardTitle><CardDescription>All fields are required. Use the full job description for a more relevant comparison.</CardDescription></CardHeader><CardContent>
            {(statusText || puterError) ? <div role="alert" className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{statusText || puterError}</div> : null}
            <Form {...form}><form onSubmit={form.handleSubmit(handleAnalyze)} className="space-y-6" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField control={form.control} name="companyName" render={({ field }) => <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Acme" autoComplete="organization" {...field} /></FormControl><FormDescription>Used only to identify this review.</FormDescription><FormMessage /></FormItem>} />
                <FormField control={form.control} name="jobTitle" render={({ field }) => <FormItem><FormLabel>Role title</FormLabel><FormControl><Input placeholder="Frontend Developer" {...field} /></FormControl><FormDescription>Use the title shown in the listing.</FormDescription><FormMessage /></FormItem>} />
              </div>
              <FormField control={form.control} name="jobDescription" render={({ field }) => <FormItem><div className="flex items-center justify-between gap-4"><FormLabel>Job description</FormLabel><span className="text-xs text-muted-foreground">{description.length.toLocaleString()}/20,000</span></div><FormControl><Textarea placeholder="Paste responsibilities, requirements, and preferred qualifications..." className="min-h-64 resize-y" {...field} /></FormControl><FormDescription>Include responsibilities, required skills, and preferred qualifications.</FormDescription><FormMessage /></FormItem>} />
              <FormField control={form.control} name="uploadFile" render={({ field }) => <FormItem><FormLabel>Resume PDF</FormLabel><FormControl><div className="rounded-xl border border-dashed bg-muted/20 p-5"><label className="flex cursor-pointer flex-col items-center gap-3 text-center"><span className="grid size-12 place-items-center rounded-xl bg-background shadow-sm"><UploadCloud className="size-5 text-primary" /></span><span><span className="font-medium">Choose a PDF resume</span><span className="mt-1 block text-sm text-muted-foreground">PDF format, processed with the existing parser.</span></span><Input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => field.onChange(event.target.files?.[0])} onBlur={field.onBlur} name={field.name} ref={field.ref} /></label>{selectedFile ? <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border bg-background p-3"><div className="flex min-w-0 items-center gap-3"><FileText className="size-5 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">{selectedFile.name}</p><p className="text-xs text-muted-foreground">{Math.max(1, Math.round(selectedFile.size / 1024))} KB</p></div></div><Button type="button" variant="ghost" size="icon" aria-label="Remove selected resume" onClick={() => field.onChange(undefined)}><X className="size-4" /></Button></div> : null}</div></FormControl><FormMessage /></FormItem>} />
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>Analyze resume</Button>
            </form></Form>
          </CardContent></Card>
        )}
      </main>
    </div>
  );
}
