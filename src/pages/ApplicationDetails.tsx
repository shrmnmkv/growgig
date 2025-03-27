import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatDistanceToNow } from 'date-fns';
import { CircleCheckBig, Clock, CircleX, FileText, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ApplicationDetails = () => {
  const { id, jobId } = useParams<{ id?: string; jobId?: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch application data if we have an ID
  const { data: application, isLoading: isLoadingApplication, error: applicationError } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.applications.getOne(id!),
    enabled: !!id && isAuthenticated,
    retry: false
  });

  // Fetch applications for a job if we have a jobId - Only for employers
  const { data: applications, isLoading: isLoadingApplications, error: applicationsError } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: () => api.applications.getByJobId(jobId!),
    enabled: !!jobId && user?.role === 'employer' && isAuthenticated,
    retry: false
  });

  const isLoading = isLoadingApplication || isLoadingApplications;
  
  // Handle errors and unauthorized access
  useEffect(() => {
    if (applicationError) {
      const status = (applicationError as any)?.response?.status;
      if (status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this application.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      if (status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view this application.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
    }
    
    if (applicationsError) {
      const status = (applicationsError as any)?.response?.status;
      if (status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view applications for this job.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      if (status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view these applications.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
    }
  }, [applicationError, applicationsError, navigate, toast]);

  const updateStatusMutation = useMutation({
    mutationFn: (params: { status: 'accepted' | 'rejected'; applicationId: string }) => 
      api.applications.updateStatus(params.applicationId, params.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications', jobId] });
      queryClient.invalidateQueries({ queryKey: ['employerDashboard'] });
      toast({
        title: 'Status Updated',
        description: 'Application status has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      });
    },
  });

  const handleStatusUpdate = async (status: 'accepted' | 'rejected', applicationId: string) => {
    try {
      console.log('handleStatusUpdate called with:', { status, applicationId });
      
      if (status === 'accepted') {
        console.log('Accepting application');
        await updateStatusMutation.mutateAsync({ status, applicationId });
        toast({
          title: 'Success',
          description: 'Application accepted successfully.',
        });
      } else {
        console.log('Rejecting application');
        await updateStatusMutation.mutateAsync({ status, applicationId });
        toast({
          title: 'Success',
          description: 'Application rejected successfully.',
        });
      }
    } catch (error) {
      console.error('Error in handleStatusUpdate:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      });
    }
  };

  // Redirect if the user isn't authorized to view the application
  useEffect(() => {
    if (application && !isLoading && user) {
      const isEmployer = user.role === 'employer';
      const isFreelancer = user.role === 'freelancer';
      
      // Check if this application belongs to the current freelancer
      const isMyApplication = isFreelancer && 
        application.freelancerId && 
        (typeof application.freelancerId === 'string' 
          ? application.freelancerId === user._id
          : application.freelancerId._id === user._id);
      
      // Check if this job belongs to the current employer
      const isMyJob = isEmployer && 
        application.jobId && 
        (typeof application.jobId === 'string' 
          ? false  // We need the populated jobId to check employerId
          : application.jobId.employerId === user._id);
      
      // If neither, redirect to dashboard
      if (!isMyApplication && !isMyJob) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this application.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [application, isLoading, user, navigate, toast]);

  // Remove the useEffect for openMilestones
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const openMilestones = searchParams.get('openMilestones');
    
    if (openMilestones === 'true') {
      // Remove the query parameter to prevent dialog from reopening on refresh
      navigate(`/applications/${id}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  // Add a check for whether the user is an employer
  const isEmployer = user?.role === 'employer';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500"></div>
          <p className="ml-3">Loading application details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (applicationsError || applicationError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Error Loading Data</h2>
            <p className="mt-1 text-gray-500">
              {(applicationsError as Error)?.message || (applicationError as Error)?.message || 'Failed to load application details.'}
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="mt-4 bg-growgig-500 hover:bg-growgig-600"
            >
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If we're viewing a job's applications and have the data
  if (jobId && applications) {
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
                  <CardTitle>Applications for {applications[0]?.jobId.title}</CardTitle>
                  <CardDescription>
                    Review and manage applications for this position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {applications.map((app) => (
                      <Card key={app._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {app.freelancerId.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <ApplicationStatusBadge status={app.status} />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Cover Letter</h4>
                              <p className="text-gray-600 whitespace-pre-line">
                                {app.coverLetter}
                              </p>
                            </div>

                            {app.resumeUrl && (
                              <div>
                                <a 
                                  href={app.resumeUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Resume
                                </a>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {app.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => handleStatusUpdate('accepted', app._id)}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    Accept Application
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate('rejected', app._id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Reject Application
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If we're viewing a single application and have the data
  if (id && application) {
    // Additional security check before rendering
    const isMyApplication = user?.role === 'freelancer' && 
      application.freelancerId && 
      (typeof application.freelancerId === 'string' 
        ? application.freelancerId === user._id
        : application.freelancerId._id === user._id);
    
    const isMyJob = user?.role === 'employer' && 
      application.jobId && 
      (typeof application.jobId === 'string' 
        ? false
        : application.jobId.employerId === user._id);

    if (!isMyApplication && !isMyJob) {
      navigate('/dashboard');
      return null;
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
                  <CardTitle>Application Details</CardTitle>
                  <CardDescription>
                    {isEmployer ? 'Review and manage this application' : 'View your application details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Application Status */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Status</h3>
                        <ApplicationStatusBadge status={application.status} />
                      </div>
                      {isEmployer && application.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusUpdate('accepted', application._id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Accept Application
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate('rejected', application._id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Reject Application
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Job Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Job Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">{(application.jobId as any).title}</h4>
                        <p className="text-sm text-gray-600">{(application.jobId as any).company} • {(application.jobId as any).location}</p>
                        <Badge className="mt-2">{(application.jobId as any).type}</Badge>
                      </div>
                    </div>

                    {/* Applicant Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Applicant Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">{(application.freelancerId as any).name}</h4>
                        <p className="text-sm text-gray-600">{(application.freelancerId as any).email}</p>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 whitespace-pre-line">{application.coverLetter}</p>
                      </div>
                    </div>

                    {/* Resume */}
                    {application.resumeUrl && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Resume</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <a 
                            href={application.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            <Button variant="outline" className="w-full">
                              <Download className="mr-2 h-4 w-4" />
                              Download Resume
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not found state
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Application Not Found</h2>
          <p className="mt-1 text-gray-500">The application you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button
            onClick={() => navigate(-1)}
            className="mt-4 bg-growgig-500 hover:bg-growgig-600"
          >
            Go Back
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const ApplicationStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'accepted':
      return (
        <Badge className="bg-green-100 text-green-800">
          <CircleCheckBig className="w-4 h-4 mr-1" />
          Accepted
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-800">
          <CircleX className="w-4 h-4 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4 mr-1" />
          Pending
        </Badge>
      );
  }
};

export default ApplicationDetails; 