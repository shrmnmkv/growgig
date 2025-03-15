import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const applicationSchema = z.object({
  coverLetter: z.string().min(50, {
    message: 'Your cover letter should be at least 50 characters long',
  }),
  resumeUrl: z.string().default('resume_placeholder.pdf'),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const JobApplication = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJobById(id || ''),
  });

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: '',
      resumeUrl: 'resume_placeholder.pdf',
    },
  });

  const applyMutation = useMutation({
    mutationFn: (applicationData: ApplicationFormValues) => {
      if (!user?.id || !user.freelancerId || !id) {
        throw new Error('Missing required data for job application');
      }
      
      return api.createApplication({
        jobId: id,
        freelancerId: user.freelancerId,
        resumeUrl: applicationData.resumeUrl,
        coverLetter: applicationData.coverLetter,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your job application has been successfully submitted.',
      });
      navigate('/freelancer-dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Application Failed',
        description: `Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: ApplicationFormValues) => {
    setIsSubmitting(true);
    applyMutation.mutate(values);
  };

  const handleCancel = () => {
    navigate(`/jobs/${id}`);
  };

  if (isLoadingJob) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-red-500">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow p-4 md:p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Apply for Position</CardTitle>
              <CardDescription>
                You are applying for: <span className="font-semibold">{job?.title}</span> at{' '}
                <span className="font-semibold">{job?.company}</span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-green-600 mr-3 mt-0.5 flex-shrink-0"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                    <path d="M6 15h4" />
                    <path d="M14 15h4" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">Escrow Payment Protected</h3>
                    <p className="text-sm text-green-700">
                      Payment for this project will be held in escrow. Funds will only be released once you complete the work and the employer approves it.
                    </p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <h3 className="font-medium mb-2">Resume</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        We'll use your profile resume for this application. In a real app, you would be able
                        to upload a different resume if desired.
                      </p>
                      <div className="p-3 border border-gray-300 rounded bg-white flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 text-gray-500"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="text-sm">Your profile resume</span>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write about why you're a good fit for this position..."
                              rows={8}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-growgig-500 hover:bg-growgig-600 sm:order-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Apply Now'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="bg-gray-50 border-t text-sm text-gray-600 py-4">
              By applying, you agree to our terms and conditions for job applications and escrow payment service.
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobApplication;
