import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

const jobSchema = z.object({
  title: z.string().min(5, { message: 'Job title must be at least 5 characters long' }),
  company: z.string().min(2, { message: 'Company name is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  type: z.string().min(1, { message: 'Job type is required' }),
  salary: z.string().min(1, { message: 'Salary range is required' }),
  description: z.string().min(30, { message: 'Description must be at least 30 characters long' }),
  requirementsString: z.string().min(10, { message: 'Requirements are required (one per line)' }),
  benefitsString: z.string().min(10, { message: 'Benefits are required (one per line)' }),
});

type JobFormValues = z.infer<typeof jobSchema>;

const EditJob = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);

  // Fetch job data
  const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.jobs.getOne(jobId!),
    enabled: !!jobId,
    retry: 1
  });
  
  // Check for job ownership, completed or cancelled jobs after data is loaded
  useEffect(() => {
    if (job) {
      // Check if job is completed or cancelled
      if (job.status === 'completed' || job.status === 'cancelled') {
        toast({
          title: "Access Denied",
          description: "You cannot edit a job that has been completed or cancelled.",
          variant: "destructive",
        });
        navigate(`/jobs/${jobId}`);
        return;
      }
      
      // Check if the current user is the owner of the job
      if (user?.role === 'employer') {
        const jobEmployerId = typeof job.employerId === 'string' 
          ? job.employerId 
          : job.employerId._id;
          
        if (jobEmployerId !== user._id) {
          toast({
            title: "Access Denied",
            description: "You can only edit jobs that you have created.",
            variant: "destructive",
          });
          setNotAuthorized(true);
          return;
        }
      }
    }
  }, [job, jobId, navigate, toast, user]);
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      company: user?.companyName || '',
      location: '',
      type: '',
      salary: '',
      description: '',
      requirementsString: '',
      benefitsString: '',
    },
  });

  // Check authentication after hooks are initialized
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'employer')) {
      setRedirectToLogin(true);
    }
  }, [authLoading, isAuthenticated, user?.role]);

  // Update form with job data when loaded
  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary,
        description: job.description,
        requirementsString: job.requirements.join('\n'),
        benefitsString: job.benefits.join('\n'),
      });
    }
  }, [job, form]);
  
  const onSubmit = async (values: JobFormValues) => {
    if (!user?._id || !jobId) {
      toast({
        title: "Error",
        description: "You must be logged in to edit a job",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Convert requirements and benefits from string to array
      const requirements = values.requirementsString
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      const benefits = values.benefitsString
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      // Create the job object
      const jobData = {
        title: values.title,
        company: values.company,
        location: values.location,
        type: values.type,
        salary: values.salary,
        description: values.description,
        requirements,
        benefits,
        employerId: user._id,
      };
      
      await api.jobs.update(jobId, jobData);
      
      toast({
        title: "Success!",
        description: "Your job has been updated successfully",
      });
      
      navigate(`/jobs/${jobId}`);
    } catch (error: any) {
      console.error('Error updating job:', error);
      if (error.response?.status === 403 && error.response?.data?.message) {
        toast({
          title: "Error",
          description: error.response.data.message || "There was a problem updating your job. Please try again.",
          variant: "destructive",
        });
        navigate(`/jobs/${jobId}`);
      } else {
        toast({
          title: "Error",
          description: "There was a problem updating your job. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Perform the redirect after all hooks have been set up
  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }

  if (authLoading || jobLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show not authorized page
  if (notAuthorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h2>
            <p className="text-gray-700 mb-6">
              You can only edit jobs that you have created.
            </p>
            <Button 
              onClick={() => navigate(`/jobs/${jobId}`)}
              className="bg-growgig-500 hover:bg-growgig-600"
            >
              View Job Details
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Add check for completed or cancelled jobs
  if (job && (job.status === 'completed' || job.status === 'cancelled')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Cannot Edit Job</h2>
            <p className="text-gray-700 mb-6">
              This job has been {job.status} and can no longer be edited.
            </p>
            <Button 
              onClick={() => navigate(`/jobs/${jobId}`)}
              className="bg-growgig-500 hover:bg-growgig-600"
            >
              View Job Details
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Job</h1>
          <p className="text-gray-600 mb-8">Update the details of your job posting</p>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Update the information about the position you're hiring for</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Senior React Developer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., TechSolutions India" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Bengaluru, Karnataka" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Freelance">Freelance</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Range</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ₹6,00,000 - ₹8,00,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, responsibilities, and ideal candidate..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requirementsString"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List each requirement on a new line, e.g.
3+ years of experience with React
Strong understanding of JavaScript
Experience with REST APIs"
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="benefitsString"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefits</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List each benefit on a new line, e.g.
Competitive salary
Health insurance
Remote work options"
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/jobs/${jobId}`)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-growgig-500 hover:bg-growgig-600">
                      Update Job
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditJob; 