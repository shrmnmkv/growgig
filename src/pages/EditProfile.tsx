import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
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

const experienceSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  startDate: z.string().min(4, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters')
});

const educationSchema = z.object({
  institution: z.string().min(2, 'Institution name must be at least 2 characters'),
  degree: z.string().min(2, 'Degree must be at least 2 characters'),
  year: z.string().min(4, 'Year is required')
});

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
  experience: z.array(experienceSchema),
  education: z.array(educationSchema)
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [experiences, setExperiences] = useState<Array<z.infer<typeof experienceSchema>>>([]);
  const [education, setEducation] = useState<Array<z.infer<typeof educationSchema>>>([]);
  
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
      setExperiences(profile.experience || []);
      setEducation(profile.education || []);
    }
  }, [profile, form]);
  
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { title: '', company: '', startDate: '', endDate: '', description: '' }
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof z.infer<typeof experienceSchema>, value: string) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    setExperiences(updatedExperiences);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { institution: '', degree: '', year: '' }
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof z.infer<typeof educationSchema>, value: string) => {
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    setEducation(updatedEducation);
  };

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
        experience: experiences,
        education: education,
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
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Experience</h3>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={addExperience}
                        className="text-growgig-600 border-growgig-600 hover:bg-growgig-50"
                      >
                        Add Experience
                      </Button>
                    </div>

                    {experiences.map((exp, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                value={exp.title}
                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                placeholder="e.g. Senior Developer"
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                placeholder="e.g. Tech Corp"
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                              />
                            </FormControl>
                          </FormItem>

                          <div className="md:col-span-2">
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                  placeholder="Describe your role and achievements"
                                />
                              </FormControl>
                            </FormItem>
                          </div>

                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeExperience(index)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Education</h3>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={addEducation}
                        className="text-growgig-600 border-growgig-600 hover:bg-growgig-50"
                      >
                        Add Education
                      </Button>
                    </div>

                    {education.map((edu, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                placeholder="e.g. University of Mumbai"
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>Degree</FormLabel>
                            <FormControl>
                              <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                placeholder="e.g. Bachelor of Technology"
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={edu.year}
                                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                placeholder="e.g. 2023"
                              />
                            </FormControl>
                          </FormItem>

                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeEducation(index)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
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
