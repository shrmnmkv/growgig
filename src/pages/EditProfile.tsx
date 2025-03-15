import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  location: z.string().min(2, { message: 'Location is required' }),
  bio: z.string().min(10, { message: 'Bio must be at least 10 characters' }),
  yearsOfExperience: z.coerce.number().min(0),
  hourlyRate: z.coerce.number().min(100, { message: 'Hourly rate must be at least ₹100' }),
  skills: z.string().transform(val => val.split(',').map(skill => skill.trim())),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  linkedin: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['freelancerProfile', user?.freelancerId],
    queryFn: () => user?.freelancerId ? api.getFreelancerById(user.freelancerId) : null,
    enabled: !!user?.freelancerId,
  });
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      location: '',
      bio: '',
      yearsOfExperience: 0,
      hourlyRate: 500,
      skills: '',
      phone: '',
      linkedin: '',
    },
  });
  
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        title: profile.title,
        location: profile.location,
        bio: profile.bio,
        yearsOfExperience: profile.yearsOfExperience,
        hourlyRate: profile.hourlyRate,
        skills: profile.skills.join(', '), // Convert array to comma-separated string for the form
        phone: profile.contact.phone.replace('+91 ', ''),
        linkedin: profile.contact.linkedin,
      });
    }
  }, [profile, form]);
  
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      if (!user?.freelancerId) {
        throw new Error('User ID not found');
      }
      
      return api.updateFreelancerProfile(user.freelancerId, {
        name: data.name,
        title: data.title,
        location: data.location,
        bio: data.bio,
        yearsOfExperience: data.yearsOfExperience,
        hourlyRate: data.hourlyRate,
        skills: data.skills, // This is already transformed to an array by zod
        contact: {
          email: user.email,
          phone: `+91 ${data.phone}`,
          linkedin: data.linkedin || '',
        },
        portfolio: profile?.portfolio || [],
        education: profile?.education || [],
        avatar: profile?.avatar || '',
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      navigate('/freelancer-dashboard');
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setResumeFile(files[0]);
      toast({
        title: "Resume Uploaded",
        description: `File "${files[0].name}" uploaded successfully.`,
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Senior React Developer" {...field} />
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
                            <Input placeholder="e.g. Mumbai, Maharashtra" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" min="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write a short introduction about yourself" 
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
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. React, Node.js, UI Design (comma separated)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                +91
                              </span>
                              <Input 
                                className="rounded-l-none" 
                                placeholder="98765 43210" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="linkedin.com/in/yourprofile" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">Resume</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                      <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        {resumeFile ? resumeFile.name : 'Upload your resume (PDF, DOC, DOCX)'}
                      </p>
                      <div className="mt-2">
                        <label
                          htmlFor="resume-upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-growgig-500 hover:bg-growgig-600 cursor-pointer"
                        >
                          Select file
                          <input
                            id="resume-upload"
                            name="resume"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate('/freelancer-dashboard')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-growgig-500 hover:bg-growgig-600"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
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

export default EditProfile;
