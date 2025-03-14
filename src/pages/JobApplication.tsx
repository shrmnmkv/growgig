
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import { api } from '@/services/api';
import { Job } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const JobApplication = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const jobData = await api.getJobById(id);
        if (jobData) {
          setJob(jobData);
        } else {
          toast({
            title: "Error",
            description: "Job not found.",
            variant: "destructive",
          });
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !job) return;
    
    if (!resumeFile) {
      toast({
        title: "Missing Resume",
        description: "Please upload your resume before applying.",
        variant: "destructive",
      });
      return;
    }
    
    if (!coverLetter.trim()) {
      toast({
        title: "Missing Cover Letter",
        description: "Please write a cover letter before applying.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would upload the file to storage and get a URL
      // For our mock, we'll just use the file name
      const resumeUrl = resumeFile.name;
      
      await api.createApplication({
        jobId: id,
        freelancerId: '1', // In a real app, this would be the logged-in user's ID
        resumeUrl,
        coverLetter,
        status: 'pending',
      });
      
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted!",
      });
      
      // Redirect to job details page
      navigate(`/jobs/${id}?applied=true`);
      
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-gray-50 py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
              
              <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
                
                <div className="space-y-6">
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                  </div>
                  
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-32 bg-gray-200 rounded w-full"></div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-gray-50 py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Not Found</h1>
              <p className="text-gray-600 mb-8">
                The job you're trying to apply for doesn't exist or has been removed.
              </p>
              <Link to="/jobs">
                <Button className="bg-growgig-500 hover:bg-growgig-600">
                  Browse All Jobs
                </Button>
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to={`/jobs/${id}`} className="inline-flex items-center text-growgig-600 hover:text-growgig-700 mb-6">
              <ArrowLeft size={16} className="mr-2" />
              Back to Job Details
            </Link>
            
            <Card className="mb-8">
              <CardContent className="p-6 md:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Apply for: {job.title}
                </h1>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Resume Upload */}
                    <div>
                      <Label htmlFor="resume" className="block mb-2">
                        Upload Resume
                      </Label>
                      
                      {!resumeFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Label 
                            htmlFor="resume" 
                            className="flex flex-col items-center cursor-pointer"
                          >
                            <Upload size={32} className="text-gray-400 mb-3" />
                            <span className="text-gray-800 font-medium mb-1">
                              Drop your resume here or click to browse
                            </span>
                            <span className="text-gray-500 text-sm">
                              PDF, DOC, or DOCX (max 5MB)
                            </span>
                          </Label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <FileText size={24} className="text-growgig-500 mr-3" />
                            <div>
                              <p className="font-medium text-gray-800">{resumeFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setResumeFile(null)}
                          >
                            <X size={18} />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Cover Letter */}
                    <div>
                      <Label htmlFor="coverLetter" className="block mb-2">
                        Cover Letter
                      </Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Introduce yourself and explain why you're a good fit for this position..."
                        rows={8}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="resize-none"
                      />
                    </div>
                    
                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                      <Link to={`/jobs/${id}`}>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                      <Button 
                        type="submit" 
                        className="bg-growgig-500 hover:bg-growgig-600"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Apply Now'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Job Overview */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Job Overview</h2>
                <h3 className="font-medium text-gray-900 mb-2">{job.title}</h3>
                <p className="text-gray-600 mb-2">{job.company} • {job.location}</p>
                <p className="text-gray-600 mb-4">{job.type} • {job.salary}</p>
                <div className="text-sm text-gray-600">
                  <p className="line-clamp-3">{job.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobApplication;
