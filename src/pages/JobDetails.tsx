import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase,
  Check,
  ArrowLeft,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/services/api';
import { Job } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { jobProgressService } from '@/services/jobProgressService';

const EscrowBadge = () => (
  <div className="flex items-center bg-green-100 text-green-800 py-2 px-4 rounded-lg">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="mr-2"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
      <path d="M14 15h4" />
    </svg>
    <span className="font-medium">Escrow Payment Protected</span>
  </div>
);

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedRate: '',
    estimatedDuration: '',
    availability: '',
    portfolio: '',
    resume: null as File | null
  });
  const queryClient = useQueryClient();
  const [showEndJobDialog, setShowEndJobDialog] = useState(false);
  const [endJobLoading, setEndJobLoading] = useState(false);
  const [jobProgress, setJobProgress] = useState<any>(null);
  const [unfundedMilestones, setUnfundedMilestones] = useState<any[]>([]);

  // Check for existing application
  const { data: existingApplication } = useQuery({
    queryKey: ['application', id, user?._id],
    queryFn: async () => {
      if (!user?._id || !id) return null;
      try {
        const response = await api.applications.getMine();
        const application = response.find(app => app.jobId._id === id);
        if (application) {
          setHasApplied(true);
          setApplicationStatus(application.status);
        }
        return application;
      } catch (error) {
        console.error('Error checking application:', error);
        return null;
      }
    },
    enabled: !!user?._id && !!id,
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      try {
        const data = await api.jobs.getOne(id!);
        console.log('Job data:', data);
        return data;
      } catch (error) {
        console.error('Error fetching job:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });

  // Show loading state while checking authentication
  if (authLoading) {
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

  // Only redirect if we're sure the user is not authenticated
  if (!authLoading && !isAuthenticated) {
    console.log('No authentication found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Show loading state while fetching job data
  if (isLoading) {
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

  // Show error state if there's an error
  if (error) {
    console.error('Job details error:', error);
    toast({
      title: 'Error',
      description: 'Failed to load job details. Please try again.',
      variant: 'destructive',
    });
  }

  // Show no data state if no job data
  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Add function to handle fetching job progress data
  const fetchJobProgress = async () => {
    if (!id || !user?._id) return;
    
    try {
      // First get the applications for this job
      const applications = await api.applications.getByJobId(id);
      if (!applications || applications.length === 0) return;
      
      // Find an accepted application
      const acceptedApp = applications.find(app => app.status === 'accepted');
      if (!acceptedApp) return;
      
      // Fetch job progress for this application
      const progress = await jobProgressService.getByApplicationId(acceptedApp._id);
      setJobProgress(progress);
      
      // Check for unfunded milestones
      if (progress && progress.milestones) {
        const unfunded = progress.milestones.filter(
          (m: any) => m.status !== 'paid' && 
          (!m.escrowStatus || m.escrowStatus === 'not_funded')
        );
        setUnfundedMilestones(unfunded);
      }
    } catch (error) {
      console.error('Error fetching job progress:', error);
    }
  };

  // Function to open end job dialog
  const handleOpenEndJobDialog = async () => {
    await fetchJobProgress();
    setShowEndJobDialog(true);
  };

  // Function to handle ending job
  const handleEndJob = async () => {
    if (!id || !jobProgress) return;
    
    setEndJobLoading(true);
    
    try {
      // If there are unfunded milestones, update project status to complete
      if (unfundedMilestones.length > 0) {
        // Call API to mark job as completed
        await api.jobs.updateStatus(id, 'completed');
        
        toast({
          title: "Project Ended",
          description: "The project has been marked as completed. Some milestones were not funded.",
        });
      } else {
        // Check if all funded milestones are paid
        const fundedUnpaidMilestones = jobProgress.milestones.filter(
          (m: any) => m.status !== 'paid' && m.escrowStatus === 'funded'
        );
        
        // If there are funded but unpaid milestones, release them all
        if (fundedUnpaidMilestones.length > 0) {
          // Release all escrow payments
          for (let i = 0; i < fundedUnpaidMilestones.length; i++) {
            const index = jobProgress.milestones.findIndex((m: any) => 
              m === fundedUnpaidMilestones[i]
            );
            
            if (index !== -1) {
              await jobProgressService.releaseEscrow(
                jobProgress._id, 
                index, 
                "Auto-released on project completion"
              );
            }
          }
        }
        
        // Mark job as completed
        await api.jobs.updateStatus(id, 'completed');
        
        toast({
          title: "Project Ended Successfully",
          description: "The project has been marked as completed and all payments have been released.",
        });
      }
      
      // Refresh job data
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      
    } catch (error) {
      console.error('Error ending job:', error);
      toast({
        title: "Error",
        description: "Failed to end the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEndJobLoading(false);
      setShowEndJobDialog(false);
    }
  };

  const showApplyButton = user && user.role === 'freelancer' && !hasApplied && isAuthenticated;
  const showViewApplicationButton = user && user.role === 'freelancer' && hasApplied && isAuthenticated && existingApplication;
  const showManageApplicationsButton = user && user.role === 'employer' && job?.employerId && isAuthenticated && 
    (typeof job.employerId === 'string' ? job.employerId === user._id : job.employerId._id === user._id);
  const showManageMilestonesButton = user && user.role === 'employer' && job?.employerId && isAuthenticated && 
    (typeof job.employerId === 'string' ? job.employerId === user._id : job.employerId._id === user._id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/jobs" className="inline-flex items-center text-growgig-600 hover:text-growgig-700 mb-6">
              <ArrowLeft size={16} className="mr-2" />
              Back to Jobs
            </Link>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {job?.title}
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">
                      {typeof job?.employerId === 'string' ? job?.company : job?.employerId?.companyName}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1 text-growgig-500" />
                        {job?.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-1 text-growgig-500" />
                        {job?.type}
                      </div>
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-1 text-growgig-500" />
                        {job?.salary}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1 text-growgig-500" />
                        Posted {formatDistanceToNow(new Date(job?.createdAt || Date.now()), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <EscrowBadge />
                    {showApplyButton && (
                      <Link to={`/apply/${job?._id}`}>
                        <Button className="bg-growgig-500 hover:bg-growgig-600 w-full">
                          Apply Now
                        </Button>
                      </Link>
                    )}
                    {showViewApplicationButton && (
                      <Link to={`/applications/${existingApplication?._id}`}>
                        <Button className="bg-growgig-500 hover:bg-growgig-600 w-full">
                          View My Application
                        </Button>
                      </Link>
                    )}
                    {showManageApplicationsButton && (
                      <>
                        <Link to={`/applications/job/${job?._id}`}>
                          <Button className="bg-blue-500 hover:bg-blue-600 w-full mb-2">
                            Manage Applications
                          </Button>
                        </Link>
                        <Link to={`/jobs/${job?._id}/milestones`}>
                          <Button className="bg-purple-500 hover:bg-purple-600 w-full">
                            Manage Milestones
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Job Description */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {job?.description}
                  </p>
                </section>
                
                {/* Requirements */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job?.requirements?.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <Check size={18} className="mr-2 mt-1 text-growgig-500 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                
                {/* Benefits */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                  <ul className="space-y-2">
                    {job?.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check size={18} className="mr-2 mt-1 text-growgig-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                
                {/* Apply Now */}
                {showApplyButton && (
                  <div className="mt-8 flex justify-center">
                    <Link to={`/apply/${job?._id}`}>
                      <Button size="lg" className="bg-growgig-500 hover:bg-growgig-600 px-8">
                        Apply for this position
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* End Job button for employers - moved above Similar Jobs section */}
            {user?.role === 'employer' && user && job && job.status !== 'completed' && 
             (typeof job.employerId === 'string' 
               ? job.employerId === user._id 
               : job.employerId._id === user._id) && (
              <div className="mt-6 mb-8">
                <Button
                  onClick={handleOpenEndJobDialog}
                  className="bg-red-500 hover:bg-red-600 w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  End Job and Close Project
                </Button>
              </div>
            )}
            
            {/* Status indicator for completed or cancelled jobs */}
            {user?.role === 'employer' && user && job && 
             (typeof job.employerId === 'string' 
               ? job.employerId === user._id 
               : job.employerId._id === user._id) && 
             (job.status === 'completed' || job.status === 'cancelled') && (
              <div className="mt-6 p-3 border rounded-md">
                <div className={`flex items-center ${job.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                  {job.status === 'completed' ? (
                    <Check className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium">
                    Project {job.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />

      {/* End Job Dialog */}
      <Dialog open={showEndJobDialog} onOpenChange={setShowEndJobDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Job and Close Project</DialogTitle>
            <DialogDescription>
              {unfundedMilestones.length > 0 ? (
                <div className="mt-2">
                  <div className="flex items-center text-amber-600 mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Warning: Unfunded Milestones</span>
                  </div>
                  <p>
                    There are {unfundedMilestones.length} milestone(s) that haven't been funded yet.
                    If you end the job now, these milestones won't be paid.
                  </p>
                  <div className="mt-2 bg-amber-50 p-3 rounded-md">
                    <p className="text-sm text-amber-800 font-medium">Unfunded milestones:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm text-amber-800">
                      {unfundedMilestones.map((m, idx) => (
                        <li key={idx}>{m.title} - ₹{m.amount}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p>
                    This will mark the job as completed and release any remaining funded milestone payments
                    to the freelancer. This action cannot be undone.
                  </p>
                  <div className="mt-2 bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      All milestone payments will be automatically processed and the project will be closed.
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEndJobDialog(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            {unfundedMilestones.length > 0 && (
              <Button
                onClick={() => {
                  setShowEndJobDialog(false);
                  navigate(`/jobs/${id}/milestones`);
                }}
                variant="outline"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 sm:w-auto w-full"
              >
                Fund Milestones First
              </Button>
            )}
            <Button 
              onClick={handleEndJob}
              className="bg-red-500 hover:bg-red-600 sm:w-auto w-full"
              disabled={endJobLoading}
            >
              {endJobLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                'End Job'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetails;
