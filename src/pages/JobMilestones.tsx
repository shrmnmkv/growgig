import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JobProgress } from '@/components/job/JobProgress';
import { jobProgressService } from '@/services/jobProgressService';
import { axiosInstance } from '@/lib/axios';

const JobMilestones = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const isEmployer = user?.role === 'employer';
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; dueDate: string; amount: number }>>([]);
  const [expectedEndDate, setExpectedEndDate] = useState<string>('');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [redirect, setRedirect] = useState<string | null>(null);

  // Check if user is employer and verify job ownership
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to access this page.",
        variant: "destructive",
      });
      setRedirect("/login");
      return;
    }

    // Only employers can access the milestones management page
    if (user && user.role !== 'employer') {
      toast({
        title: "Access Denied",
        description: "Only employers can manage job milestones.",
        variant: "destructive",
      });
      setRedirect("/jobs/" + jobId);
      return;
    }
  }, [isAuthenticated, user, jobId, toast]);

  // If redirect is set, navigate to that path
  useEffect(() => {
    if (redirect) {
      navigate(redirect);
    }
  }, [redirect, navigate]);

  // Fetch job data
  const { data: job, isLoading: isLoadingJob, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.jobs.getOne(jobId!),
    enabled: !!jobId && isAuthenticated && user?.role === 'employer'
  });

  // Add a separate effect to handle job ownership verification
  useEffect(() => {
    if (job && user && user.role === 'employer') {
      // Verify job ownership
      const jobEmployerId = typeof job.employerId === 'string' 
        ? job.employerId 
        : job.employerId._id;
        
      if (jobEmployerId !== user._id) {
        toast({
          title: "Access Denied",
          description: "You can only manage milestones for jobs you have created.",
          variant: "destructive",
        });
        setRedirect("/jobs/" + jobId);
      }
    }
  }, [job, user, jobId, toast]);

  // Add a separate effect to handle job error
  useEffect(() => {
    if (jobError) {
      toast({
        title: "Error",
        description: "Failed to load job details.",
        variant: "destructive",
      });
    }
  }, [jobError, toast]);

  // For freelancers, check if they are accepted for this job
  const { data: myApplications, isLoading: isLoadingMyApplications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.applications.getMine(),
    enabled: !!user && user.role === 'freelancer'
  });

  // For employers, fetch applications for this job
  const { data: jobApplications, isLoading: isLoadingJobApplications } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => api.applications.getByJobId(jobId!),
    enabled: !!jobId && !!user && user.role === 'employer'
  });

  useEffect(() => {
    // For freelancers, verify they have an accepted application for this job
    if (user?.role === 'freelancer' && myApplications && jobId) {
      const acceptedApplication = myApplications.find(app => 
        (app.jobId === jobId || (app.jobId as any)?._id === jobId) && 
        app.status === 'accepted'
      );
      
      if (!acceptedApplication) {
        toast({
          title: "Access Denied",
          description: "You don't have an accepted application for this job.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      setApplicationId(acceptedApplication._id);
    }
    
    // For employers, verify they own this job
    if (user?.role === 'employer' && job) {
      const isOwner = typeof job.employerId === 'string' 
        ? job.employerId === user._id 
        : job.employerId._id === user._id;
        
      if (!isOwner) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to manage milestones for this job.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      // Find the accepted application
      if (jobApplications) {
        const acceptedApp = jobApplications.find(app => app.status === 'accepted');
        if (acceptedApp) {
          setApplicationId(acceptedApp._id);
        }
      }
    }
  }, [user, job, jobId, myApplications, jobApplications, toast, navigate]);

  // Fetch job progress data using the application ID
  const { data: jobProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['jobProgress', applicationId],
    queryFn: () => jobProgressService.getByApplicationId(applicationId!),
    enabled: !!applicationId,
  });

  const isLoading = isLoadingJob || isLoadingMyApplications || isLoadingJobApplications || isLoadingProgress;

  const handleAddMilestone = () => {
    setMilestones(prevMilestones => [
      ...prevMilestones,
      { title: '', description: '', dueDate: '', amount: 0 }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length > 1) {
      const newMilestones = [...milestones];
      newMilestones.splice(index, 1);
      setMilestones(newMilestones);
    }
  };

  const handleMilestoneChange = (index: number, field: string, value: string | number) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const handleSubmitMilestones = async () => {
    if (!jobId) {
      toast({
        title: 'Error',
        description: 'No job ID provided',
        variant: 'destructive',
      });
      return;
    }

    // Validate milestones
    if (milestones.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one milestone',
        variant: 'destructive',
      });
      return;
    }

    if (milestones.some(m => !m.title || !m.description || !m.dueDate || m.amount <= 0)) {
      toast({
        title: 'Error',
        description: 'Please fill in all milestone details',
        variant: 'destructive',
      });
      return;
    }

    if (!expectedEndDate) {
      toast({
        title: 'Error',
        description: 'Please set an expected end date',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!applicationId) {
        toast({
          title: 'Error',
          description: 'No accepted application found for this job',
          variant: 'destructive',
        });
        return;
      }

      // Initialize job progress with the application
      await jobProgressService.initialize({
        applicationId: applicationId,
        milestones: milestones.map(m => ({
          title: m.title,
          description: m.description,
          dueDate: new Date(m.dueDate).toISOString(),
          amount: m.amount
        })),
        expectedEndDate: new Date(expectedEndDate).toISOString()
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['jobProgress', applicationId] });

      toast({
        title: 'Success',
        description: 'Project milestones set successfully',
      });
      setShowMilestoneDialog(false);
    } catch (error: any) {
      console.error('Error in handleSubmitMilestones:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to set project milestones',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500"></div>
          <p className="ml-3">Loading job details...</p>
        </div>
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
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Dashboard
              </button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Milestones for {job?.title}</CardTitle>
                <CardDescription>
                  {isEmployer ? 'Manage project milestones and track progress' : 'Update milestone progress and submit completed work'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {!applicationId ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        {isEmployer 
                          ? "No accepted application found for this job." 
                          : "You don't have an accepted application for this job."}
                      </p>
                    </div>
                  ) : jobProgress ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">Current Project Status</h3>
                          <p className="text-sm text-gray-500">
                            Started {formatDistanceToNow(new Date(jobProgress.startDate), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {jobProgress.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Project Progress</h4>
                        <JobProgress 
                          applicationId={applicationId} 
                          isEmployer={isEmployer}
                        />
                      </div>
                    </>
                  ) : isEmployer ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No milestones have been set for this project yet.</p>
                      <Button
                        onClick={() => setShowMilestoneDialog(true)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Set Project Milestones
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">The employer hasn't set milestones for this project yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {/* Milestone Dialog */}
      {isEmployer && (
        <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Set Project Milestones</DialogTitle>
              <DialogDescription>
                Define the milestones for this project. Each milestone should have a title, description, due date, and amount.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Milestone {index + 1}</h4>
                    {milestones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMilestone(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label htmlFor={`title-${index}`} className="text-sm font-medium">Title</label>
                      <Input
                        id={`title-${index}`}
                        placeholder="Milestone Title"
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`description-${index}`} className="text-sm font-medium">Description</label>
                      <Textarea
                        id={`description-${index}`}
                        placeholder="Describe what needs to be completed"
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`dueDate-${index}`} className="text-sm font-medium">Due Date</label>
                      <Input
                        id={`dueDate-${index}`}
                        type="date"
                        value={milestone.dueDate}
                        onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`amount-${index}`} className="text-sm font-medium">Amount ($)</label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        placeholder="0.00"
                        value={milestone.amount}
                        onChange={(e) => handleMilestoneChange(index, 'amount', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddMilestone}
                className="w-full"
              >
                Add Milestone
              </Button>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected End Date</label>
                <Input
                  type="date"
                  value={expectedEndDate}
                  onChange={(e) => setExpectedEndDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMilestones}>
                Save Milestones
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JobMilestones; 