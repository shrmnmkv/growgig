
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
  CircleX,
  Clock,
  Briefcase,
  UserCircle,
  FileText,
  ChevronRight,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Application } from '@/types';

const FreelancerDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirect if not authenticated or not a freelancer
  if (!authLoading && (!isAuthenticated || user?.role !== 'freelancer')) {
    return <Navigate to="/login" />;
  }
  
  const freelancerId = user?.freelancerId;
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['freelancerDashboard', freelancerId],
    queryFn: () => freelancerId ? api.getFreelancerDashboardData(freelancerId) : null,
    enabled: !!freelancerId && isAuthenticated,
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <Briefcase size={40} className="text-growgig-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.appliedJobs || 0}</CardTitle>
                <CardDescription>Jobs Applied</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <Clock size={40} className="text-yellow-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.pendingApplications || 0}</CardTitle>
                <CardDescription>Pending Applications</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <CircleCheckBig size={40} className="text-green-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.acceptedApplications || 0}</CardTitle>
                <CardDescription>Accepted Applications</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <CircleX size={40} className="text-red-500 mb-2" />
                <CardTitle className="text-3xl font-bold">{dashboardData?.stats.rejectedApplications || 0}</CardTitle>
                <CardDescription>Rejected Applications</CardDescription>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="applications">My Applications</TabsTrigger>
              <TabsTrigger value="profile">Profile Overview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.applications && dashboardData.applications.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.applications.map((application: Application) => {
                        // Find the job details for this application
                        const job = application.jobId;
                        
                        return (
                          <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Link to={`/jobs/${application.jobId}`} className="text-lg font-semibold text-gray-900 hover:text-growgig-600">
                                  Job #{application.jobId}
                                </Link>
                                <div className="text-sm text-gray-500">
                                  Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                              <ApplicationStatusBadge status={application.status || 'pending'} />
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {application.coverLetter.substring(0, 150)}...
                            </div>
                            <Link 
                              to={`/jobs/${application.jobId}`} 
                              className="text-sm text-growgig-600 hover:text-growgig-700 inline-flex items-center"
                            >
                              View Job Details <ChevronRight size={16} className="ml-1" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={40} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
                      <p className="text-gray-500 mb-4">You haven't applied to any jobs yet. Start exploring opportunities!</p>
                      <Button as={Link} to="/jobs" className="bg-growgig-500 hover:bg-growgig-600">
                        Browse Jobs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                  <CardDescription>Your professional information visible to employers</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.profile ? (
                    <div>
                      <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-shrink-0">
                          <img 
                            src={dashboardData.profile.avatar} 
                            alt={dashboardData.profile.name} 
                            className="rounded-full w-24 h-24 object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{dashboardData.profile.name}</h3>
                          <p className="text-growgig-600">{dashboardData.profile.title}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin size={16} className="mr-1" />
                              {dashboardData.profile.location}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Briefcase size={16} className="mr-1" />
                              ₹{dashboardData.profile.hourlyRate}/hr
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar size={16} className="mr-1" />
                              {dashboardData.profile.yearsOfExperience} years of experience
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Bio</h4>
                        <p className="text-gray-600">{dashboardData.profile.bio || 'No bio added yet.'}</p>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.profile.skills && dashboardData.profile.skills.length > 0 ? (
                            dashboardData.profile.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-50">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No skills added yet.</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center mt-8">
                        <Button className="bg-growgig-500 hover:bg-growgig-600">
                          Edit Profile
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCircle size={40} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Profile not found</h3>
                      <p className="text-gray-500 mb-4">Complete your profile to increase visibility to employers.</p>
                      <Button className="bg-growgig-500 hover:bg-growgig-600">
                        Create Profile
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

export default FreelancerDashboard;
