import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
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

const PostJob = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect if not authenticated or not an employer
  if (!authLoading && (!isAuthenticated || user?.role !== 'employer')) {
    return <Navigate to="/login" />;
  }
  
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
  
  const onSubmit = async (values: JobFormValues) => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "You must be logged in to post a job",
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
      
      const job = await api.jobs.create(jobData);
      
      toast({
        title: "Success!",
        description: "Your job has been posted successfully",
      });
      
      navigate(`/jobs/${job._id}`);
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: "There was a problem posting your job. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600 mb-8">Find the perfect talent for your project</p>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Fill out the information about the position you're hiring for</CardDescription>
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
Experience with REST APIs
Bachelor's degree in Computer Science or related field"
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
Remote work options
Flexible working hours
Health insurance
Professional development budget"
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-growgig-500 hover:bg-growgig-600">
                      Post Job
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

export default PostJob;
