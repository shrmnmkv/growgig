
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  CircleCheckBig,
  Clock,
  Briefcase,
  FileText,
  ChevronRight,
  Users,
  Building2,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Job, Application } from '@/types';

const EmployerDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirect if not authenticated or not an employer
  if (!authLoading && (!isAuthenticated || user?.role !== 'employer')) {
    return <Navigate to="/login" />;
  }
  
  const employerId = user?.id;
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['employerDashboard', employerId],
    queryFn: () => employerId ? api.getEmployerDashboardData(employerId) : null,
    enabled: !!employerId && isAuthenticated,
  });
  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name} • {user?.companyName}</p>
            </div>
            <Button as={Link} to="/post-job" className="bg-growgig-500 hover:bg-growgig-600">
              <Plus size={16} className="mr-2" /> Post New Job
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <Briefcase size={40} className="text-growgig-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.totalJobs || 0}</CardTitle>
                <CardDescription>Jobs Posted</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <Users size={40} className="text-blue-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.totalApplications || 0}</CardTitle>
                <CardDescription>Total Applicants</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <Clock size={40} className="text-yellow-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.pendingApplications || 0}</CardTitle>
                <CardDescription>Pending Review</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <CircleCheckBig size={40} className="text-green-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.acceptedApplications || 0}</CardTitle>
                <CardDescription>Accepted Candidates</CardDescription>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Job Postings</CardTitle>
                  <CardDescription>Manage your active job listings</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.postedJobs && dashboardData.postedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.postedJobs.map((job: Job) => (
                        <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-gray-900 hover:text-growgig-600">
                                {job.title}
                              </Link>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Building2 size={14} className="mr-1" />
                                  {job.company}
                                </div>
                                <div>
                                  Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-growgig-100 text-growgig-800 hover:bg-growgig-200">
                              {job.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {job.description.substring(0, 150)}...
                          </div>
                          <div className="flex justify-between items-center">
                            <Link 
                              to={`/jobs/${job.id}`} 
                              className="text-sm text-growgig-600 hover:text-growgig-700 inline-flex items-center"
                            >
                              View Details <ChevronRight size={16} className="ml-1" />
                            </Link>
                            <div className="text-sm text-gray-500">
                              {dashboardData.applications.filter(app => app.jobId === job.id).length} applications
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase size={40} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs posted yet</h3>
                      <p className="text-gray-500 mb-4">Post your first job to start finding talent!</p>
                      <Button as={Link} to="/post-job" className="bg-growgig-500 hover:bg-growgig-600">
                        Post a Job
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Review and manage candidate applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.applications && dashboardData.applications.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.applications.map((application: Application) => {
                        // Find the job for this application
                        const job = dashboardData.postedJobs.find(j => j.id === application.jobId);
                        
                        return (
                          <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Link to={`/applications/${application.id}`} className="text-lg font-semibold text-gray-900 hover:text-growgig-600">
                                  Application for {job?.title || `Job #${application.jobId}`}
                                </Link>
                                <div className="text-sm text-gray-500">
                                  Freelancer ID: {application.freelancerId} • Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                              <ApplicationStatusBadge status={application.status || 'pending'} />
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {application.coverLetter.substring(0, 150)}...
                            </div>
                            <div className="flex justify-between items-center">
                              <Link 
                                to={`/applications/${application.id}`} 
                                className="text-sm text-growgig-600 hover:text-growgig-700 inline-flex items-center"
                              >
                                Review Application <ChevronRight size={16} className="ml-1" />
                              </Link>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                                  Accept
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={40} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
                      <p className="text-gray-500 mb-4">You haven't received any applications yet.</p>
                      <Button as={Link} to="/freelancers" className="bg-growgig-500 hover:bg-growgig-600">
                        Browse Freelancers
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Helper component for application status badge
const ApplicationStatusBadge = ({ status }: { status: 'pending' | 'accepted' | 'rejected' }) => {
  switch (status) {
    case 'accepted':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CircleCheckBig size={14} className="mr-1" /> Accepted
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <CircleX size={14} className="mr-1" /> Rejected
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock size={14} className="mr-1" /> Pending
        </Badge>
      );
  }
};

const CircleX = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default EmployerDashboard;
