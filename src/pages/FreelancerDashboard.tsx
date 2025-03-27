import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  CircleCheckBig,
  CircleX,
  Clock,
  FileText,
  ChevronRight,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  PlayCircle,
  AlertTriangle,
  UserCircle,
  Briefcase,
  Grid3X3,
  ListFilter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Application } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { jobProgressService } from '@/services/jobProgressService';
import { userService } from '@/services/userService';
import { Spinner } from '@/components/ui/spinner';

const FreelancerDashboard = () => {
  // 1. All useState hooks at the top
  const [activeTab, setActiveTab] = useState('applications');
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [bypassAPIMode, setBypassAPIMode] = useState(false);

  // 2. All context hooks
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 3. All useQuery hooks
  const { data: dashboardData, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: ['freelancerDashboard', user?._id],
    queryFn: async () => {
      try {
        const data = await api.dashboard.getFreelancerData();
        console.log('Dashboard data:', data);
        return data;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    enabled: !!user?._id, // Only require user ID to be present
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });

  // 4. All useEffect hooks
  useEffect(() => {
    // Enhanced Debug logging for authentication
    const token = sessionStorage.getItem('token');
    console.log('Auth state:', { 
      user, 
      isAuthenticated, 
      authLoading, 
      hasToken: !!token,
      tokenFirstChars: token ? token.substring(0, 15) + '...' : 'none'
    });

    // Only redirect if we're sure the user is not authenticated
    if (!authLoading && !isAuthenticated && !token) {
      console.log('No authentication found, redirecting to login');
      navigate('/login');
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  // 5. All callback functions
  const enableBypassMode = useCallback(() => {
    setBypassAPIMode(true);
    toast({
      title: "API Bypass Mode Enabled",
      description: "Now using mock data instead of API calls",
    });
  }, [toast]);

  const disableBypassMode = useCallback(() => {
    setBypassAPIMode(false);
    toast({
      title: "API Bypass Mode Disabled",
      description: "Now using real API calls",
    });
  }, [toast]);

  const testApiConnection = useCallback(async () => {
    toast({
      title: "Testing API connection",
      description: "Checking connectivity to backend...",
    });
    
    try {
      const result = await jobProgressService.testConnection();
      setConnectionStatus(result.status);
      
      toast({
        title: result.status === 'connected' ? "Connection successful" : "Connection failed",
        description: result.status === 'connected' 
          ? "Successfully connected to the backend API" 
          : "Could not connect to the backend. Is the server running?",
        variant: result.status === 'connected' ? 'default' : 'destructive',
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection error",
        description: "Error testing API connection. See console for details.",
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleTokenRefresh = useCallback(() => {
    const currentToken = sessionStorage.getItem('token');
    if (currentToken) {
      toast({
        title: "Refreshing authentication",
        description: "Checking token format and refreshing...",
      });
      
      let fixedToken = currentToken;
      
      if (currentToken.includes('Bearer Bearer ')) {
        fixedToken = currentToken.replace('Bearer Bearer ', 'Bearer ');
      }
      
      if (!fixedToken.startsWith('Bearer ') && fixedToken.split('.').length === 3) {
        fixedToken = `Bearer ${fixedToken}`;
      }
      
      if (fixedToken.startsWith('Bearer ') && fixedToken.replace('Bearer ', '').split('.').length !== 3) {
        fixedToken = fixedToken.replace('Bearer ', '');
      }
      
      if (fixedToken !== currentToken) {
        sessionStorage.setItem('token', fixedToken);
        toast({
          title: "Token format fixed",
          description: "The authentication token format has been fixed. Refreshing data...",
        });
        window.location.reload();
      } else {
        sessionStorage.removeItem('token');
        setTimeout(() => {
          sessionStorage.setItem('token', currentToken);
          toast({
            title: "Authentication refreshed",
            description: "Please try loading your data again.",
          });
          window.location.reload();
        }, 500);
      }
    } else {
      toast({
        title: "No authentication token",
        description: "You need to log in first",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [toast, navigate]);

  const refetch = useCallback(() => {
    window.location.reload();
  }, []);

  // Show loading state while checking authentication
  if (authLoading) {
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

  // Only redirect if we're sure the user is not authenticated
  if (!isAuthenticated || !user) {
    console.log('No authentication found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Show loading state while fetching dashboard data
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    console.error('Dashboard error:', error);
    toast({
      title: 'Error',
      description: 'Failed to load dashboard data. Please try again.',
      variant: 'destructive',
    });
  }

  // Show no data state if no dashboard data
  if (!dashboardData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-600 mb-4">Unable to load dashboard data.</p>
            <Button onClick={() => queryRefetch()}>Try Again</Button>
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => queryRefetch()} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-90">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                Refresh Data
              </Button>
              <Button 
                onClick={handleTokenRefresh} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Refresh Auth
              </Button>
              <Button 
                onClick={testApiConnection} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 16.7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7.3a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4Z"></path>
                  <rect width="6" height="10" x="9" y="7" rx="1"></rect>
                  <path d="M9 7v10"></path>
                </svg>
                Test API
                {connectionStatus && (
                  <span className={connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}>
                    •
                  </span>
                )}
              </Button>
              <Button
                onClick={() => bypassAPIMode ? disableBypassMode() : enableBypassMode()}
                variant={bypassAPIMode ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="22" y1="11" x2="16" y2="11"></line>
                </svg>
                {bypassAPIMode ? "Using Mock Data" : "Use Mock Data"}
              </Button>
            </div>
          </div>
          
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
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="applications">My Applications</TabsTrigger>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
              <TabsTrigger value="profile">Profile Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="applications">
              <ApplicationsList userId={user._id} bypassAPI={bypassAPIMode} />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsList userId={user._id} freelancerId={user._id} bypassAPI={bypassAPIMode} />
            </TabsContent>
            <TabsContent value="profile">
              <ProfileOverview userId={user._id} bypassAPI={bypassAPIMode} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

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

const ProjectsList = ({ userId, freelancerId, bypassAPI }: { userId: string, freelancerId: string, bypassAPI: boolean }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for authentication token
  const token = localStorage.getItem('token');
  
  const {
    data: allProjects,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userProjects', userId, freelancerId],
    queryFn: async () => {
      try {
        // Try to fetch data from API
        const data = bypassAPI ? mockProjectData : await api.dashboard.getFreelancerData();
        
        if (!data || !data.projects || !Array.isArray(data.projects) || data.projects.length === 0) {
          return [];
        }
        
        return data.projects;
      } catch (err) {
        console.error("Error fetching projects:", err);
        throw err;
      }
    },
    enabled: !!userId && isAuthenticated && !!token,
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Filter projects for the current freelancer
  const projects = React.useMemo(() => {
    if (!allProjects || !Array.isArray(allProjects)) return [];
    
    return allProjects.filter(project => {
      if (!project) return false;
      
      // Check if freelancerId is an object with _id property
      if (project.freelancerId && typeof project.freelancerId === 'object' && project.freelancerId._id) {
        return project.freelancerId._id === freelancerId;
      }
      
      // Check if freelancerId is a string
      if (project.freelancerId && typeof project.freelancerId === 'string') {
        return project.freelancerId === freelancerId;
      }
      
      return false;
    });
  }, [allProjects, freelancerId]);
  
  // Display an authentication error with login option if needed
  if (error && (!token || !isAuthenticated)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-medium">Authentication Required</h3>
          <p className="text-gray-500">
            Please log in again to view your projects.
          </p>
          <Button onClick={() => navigate('/login')} variant="default">
            Log In
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="text-center py-8"><Spinner /></div>;
  }
  
  // If there's an error, show error UI
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading projects</h3>
        <p className="text-gray-500 mb-2">There was a problem fetching your projects.</p>
        <div className="flex flex-col space-y-3 items-center">
          <Button onClick={() => refetch()} className="bg-growgig-500 hover:bg-growgig-600">
            Try Again
          </Button>
          <Button 
            onClick={() => {
              const currentToken = localStorage.getItem('token');
              if (currentToken) {
                toast({
                  title: "Refreshing authentication",
                  description: "Trying to refresh your authentication...",
                });
                
                // For testing: Remove and reset the same token
                localStorage.removeItem('token');
                setTimeout(() => {
                  localStorage.setItem('token', currentToken);
                  toast({
                    title: "Authentication refreshed",
                    description: "Please try loading your projects again.",
                  });
                  refetch();
                }, 500);
              } else {
                navigate('/login');
              }
            }} 
            variant="outline"
          >
            Refresh Authentication
          </Button>
          <Button 
            onClick={() => navigate('/login')} 
            variant="link"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase size={40} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No active projects</h3>
        <div className="text-gray-500 mb-4">You don't have any ongoing projects yet.</div>
        <Link to="/find-jobs" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-growgig-500 hover:bg-growgig-600 text-white h-10 px-4 py-2">
          Browse Jobs
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {projects.map((project) => {
        // Calculate project progress based on milestones
        const totalMilestones = project.milestones.length;
        const completedMilestones = project.milestones.filter(
          m => m.status === 'completed' || m.status === 'paid'
        ).length;
        const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);
        
        // Get the next active milestone
        const nextMilestone = project.milestones.find(m => 
          m.status === 'pending' || m.status === 'in_progress'
        );
        
        return (
          <Card key={project._id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{project.jobId.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      <span>{project.jobId.company}</span>
                    </div>
                  </CardDescription>
                </div>
                <Badge className={cn(
                  project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                )}>
                  {project.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {nextMilestone && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium flex items-center mb-1">
                      <PlayCircle className="h-4 w-4 mr-1 text-blue-500" />
                      Current Milestone: {nextMilestone.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">{nextMilestone.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {format(new Date(nextMilestone.dueDate), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Amount: ${nextMilestone.amount}
                      </span>
                      <span className="flex items-center">
                        <ClipboardList className="h-3 w-3 mr-1" />
                        Status: {nextMilestone.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    {nextMilestone.status === 'in_progress' && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/applications/${project.applicationId}`)}
                        >
                          Submit Work for Review
                        </Button>
                      </div>
                    )}
                    
                    {nextMilestone.status === 'pending' && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/applications/${project.applicationId}`)}
                        >
                          Start Working
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Total:</span> ${project.totalAmount} • 
                    <span className="font-medium ml-1">Milestones:</span> {completedMilestones}/{totalMilestones}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/applications/${project.applicationId}`)}
                    className="flex items-center"
                  >
                    Manage Project
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Add mock project data for testing
const mockProjectData = [
  {
    _id: 'mockproj1',
    applicationId: 'app1',
    jobId: {
      _id: 'job1',
      title: 'E-commerce Website Development',
      company: 'ShopEasy',
      location: 'Remote',
      type: 'Contract'
    },
    freelancerId: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    employerId: {
      _id: 'emp1',
      name: 'Sarah Johnson',
      email: 'sarah@shopeasy.com'
    },
    status: 'in_progress',
    milestones: [
      {
        title: 'UI/UX Design',
        description: 'Create wireframes and design mockups for all pages',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        amount: 500,
        status: 'completed',
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        title: 'Frontend Development',
        description: 'Implement responsive frontend using React',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        amount: 1000,
        status: 'in_progress'
      },
      {
        title: 'Backend Integration',
        description: 'Connect to API and implement authentication',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        amount: 800,
        status: 'pending'
      }
    ],
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    expectedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    totalAmount: 2300,
    amountPaid: 500,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updatedAt: new Date()
  }
];

const ApplicationsList = ({ userId, bypassAPI }: { userId: string, bypassAPI: boolean }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for authentication token
  const token = localStorage.getItem('token');
  
  const {
    data: applications,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userApplications', userId],
    queryFn: async () => {
      try {
        // Try to fetch data from the API
        const data = bypassAPI ? mockApplicationData : await api.applications.getMine();
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          return [];
        }
        
        return data;
      } catch (err) {
        console.error("Error fetching applications:", err);
        throw err;
      }
    },
    enabled: !!userId && isAuthenticated && !!token,
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) return <div className="text-center py-8"><Spinner /></div>;
  
  // If there's an error, show error UI
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load applications</h3>
        <p className="text-gray-500 mb-2">There was an error loading your applications.</p>
        <div className="flex flex-col space-y-3 items-center">
          <Button onClick={() => refetch()} className="bg-growgig-500 hover:bg-growgig-600">
            Try Again
          </Button>
          <Button 
            onClick={() => {
              const currentToken = localStorage.getItem('token');
              if (currentToken) {
                toast({
                  title: "Refreshing authentication",
                  description: "Trying to refresh your authentication...",
                });
                
                // For testing: Remove and reset the same token
                localStorage.removeItem('token');
                setTimeout(() => {
                  localStorage.setItem('token', currentToken);
                  toast({
                    title: "Authentication refreshed",
                    description: "Please try loading your applications again.",
                  });
                  refetch();
                }, 500);
              } else {
                navigate('/login');
              }
            }} 
            variant="outline"
          >
            Refresh Authentication
          </Button>
          <Button 
            onClick={() => navigate('/login')} 
            variant="link"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText size={40} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
        <div className="text-gray-500 mb-4">You haven't applied to any jobs yet. Start exploring opportunities!</div>
        <Link to="/jobs" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-growgig-500 hover:bg-growgig-600 text-white h-10 px-4 py-2">
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application: any) => (
        <div key={application._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              {application.jobId ? (
                <Link to={`/jobs/${application.jobId._id}`} className="text-lg font-semibold text-gray-900 hover:text-growgig-600">
                  {typeof application.jobId.title === 'string' ? application.jobId.title : 'Untitled Job'}
                </Link>
              ) : (
                <span className="text-lg font-semibold text-gray-900">Job no longer available</span>
              )}
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="flex items-center">
                  <Building2 size={14} className="mr-1" />
                  {application.jobId?.company || 'Company not available'}
                </span>
                <span className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {application.jobId?.location || 'Location not available'}
                </span>
                <span>•</span>
                <span>Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            <Badge variant={application.status === 'accepted' ? 'default' : 
                         application.status === 'rejected' ? 'destructive' : 'outline'} 
                   className={application.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}>
              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
            </Badge>
          </div>
          <div className="text-sm text-gray-600 line-clamp-2 mb-3">
            {application.coverLetter?.substring(0, 150)}...
          </div>
          <div className="flex justify-between items-center">
            {application.jobId ? (
              <Link 
                to={`/jobs/${application.jobId._id}`} 
                className="text-sm text-growgig-600 hover:text-growgig-700 inline-flex items-center"
              >
                View Job Details <ChevronRight size={16} className="ml-1" />
              </Link>
            ) : (
              <span className="text-sm text-gray-500">Job details unavailable</span>
            )}
            <Badge variant="outline" className="bg-gray-50">
              {application.jobId?.type || 'Type not available'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add mock application data for testing
const mockApplicationData = [
  {
    _id: 'mock1',
    jobId: {
      _id: 'job1',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      location: 'Remote',
      type: 'Full-time'
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
    coverLetter: 'I am a skilled developer with experience in React, TypeScript, and modern frontend frameworks. I am excited about this opportunity and believe I would be a great fit for your team.'
  },
  {
    _id: 'mock2',
    jobId: {
      _id: 'job2',
      title: 'Full Stack Engineer',
      company: 'InnovateTech',
      location: 'New York',
      type: 'Contract'
    },
    status: 'accepted',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    coverLetter: 'With my experience in both frontend and backend technologies including React, Node.js, and MongoDB, I can contribute effectively to your full stack projects. I am particularly interested in your work on distributed systems.'
  }
];

const ProfileOverview = ({ userId, bypassAPI }: { userId: string, bypassAPI: boolean }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    location: '',
    hourlyRate: '',
    yearsOfExperience: '',
    skills: [] as string[]
  });
  
  // Debug logging
  console.log('ProfileOverview render:', { isEditing, formData });
  
  // Check for authentication token
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? token.substring(0, 15) + '...' : 'none');
  
  const {
    data: profileData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      try {
        console.log('Fetching profile data...');
        const data = bypassAPI ? mockProfileData : await userService.getProfile();
        console.log('Received profile data:', data);
        return data;
      } catch (err) {
        console.error("Error fetching profile:", err);
        throw err;
      }
    },
    enabled: !!userId && isAuthenticated && !!token,
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });

  // Update form data when profile data changes
  React.useEffect(() => {
    if (profileData) {
      console.log('Setting form data from profile:', profileData);
      setFormData({
        title: profileData.title || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        hourlyRate: profileData.hourlyRate?.toString() || '',
        yearsOfExperience: profileData.yearsOfExperience?.toString() || '',
        skills: profileData.skills || []
      });
    }
  }, [profileData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting profile update:', formData);
      
      toast({
        title: "Updating profile",
        description: "Saving your changes...",
      });
      
      // Convert numeric strings to numbers
      const updatedData = {
        ...formData,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        skills: formData.skills.filter(Boolean) // Remove empty strings
      };
      
      console.log('Sending update request with data:', updatedData);
      const response = await userService.updateProfile(updatedData);
      console.log('Update response:', response);
      
      // Update the form data with the response
      setFormData({
        title: response.title || '',
        bio: response.bio || '',
        location: response.location || '',
        hourlyRate: response.hourlyRate?.toString() || '',
        yearsOfExperience: response.yearsOfExperience?.toString() || '',
        skills: response.skills || []
      });
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
      
      setIsEditing(false);
      await refetch(); // Refresh the profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Debug logging for component state
  React.useEffect(() => {
    console.log('Profile data changed:', profileData);
  }, [profileData]);
  
  React.useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  if (isLoading) return <div className="text-center py-8"><Spinner /></div>;
  
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load profile</h3>
        <p className="text-gray-500 mb-4">There was an error loading your profile data.</p>
        <div className="flex flex-col space-y-3 items-center">
          <Button onClick={() => refetch()} className="bg-growgig-500 hover:bg-growgig-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-8">
        <UserCircle size={40} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Profile not found</h3>
        <div className="text-gray-500 mb-4">Complete your profile to increase visibility to employers.</div>
        <Button onClick={() => setIsEditing(true)} className="bg-growgig-500 hover:bg-growgig-600">
          Create Profile
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Professional Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-growgig-500 focus:ring-growgig-500"
              placeholder="e.g. Full Stack Developer"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-growgig-500 focus:ring-growgig-500"
              placeholder="Tell employers about yourself..."
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-growgig-500 focus:ring-growgig-500"
              placeholder="e.g. New York, USA"
            />
          </div>
          
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Hourly Rate (₹)</label>
            <input
              type="number"
              id="hourlyRate"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-growgig-500 focus:ring-growgig-500"
              placeholder="e.g. 50"
            />
          </div>
          
          <div>
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
            <input
              type="number"
              id="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-growgig-500 focus:ring-growgig-500"
              placeholder="e.g. 5"
            />
          </div>
          
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
            <input
              type="text"
              id="skills"
              value={formData.skills.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-growgig-500 focus:ring-growgig-500"
              placeholder="e.g. React, TypeScript, Node.js"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-growgig-500 hover:bg-growgig-600">
            Save Changes
          </Button>
        </div>
      </form>
    );
  }

  // Profile view mode
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-shrink-0">
          <img 
            src={profileData.avatar || '/placeholder-avatar.png'} 
            alt={profileData.name} 
            className="rounded-full w-24 h-24 object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
          <p className="text-growgig-600">{profileData.title || 'Add your title'}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin size={16} className="mr-1" />
              {profileData.location || 'Add your location'}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Briefcase size={16} className="mr-1" />
              {profileData.hourlyRate ? `₹${profileData.hourlyRate}/hr` : 'Add your rate'}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar size={16} className="mr-1" />
              {profileData.yearsOfExperience ? `${profileData.yearsOfExperience} years of experience` : 'Add your experience'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Bio</h4>
        <p className="text-gray-600">{profileData.bio || 'Add your bio to help employers know more about you.'}</p>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Skills</h4>
        <div className="flex flex-wrap gap-2">
          {profileData.skills && profileData.skills.length > 0 ? (
            profileData.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-gray-500">Add your skills to showcase your expertise.</p>
          )}
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Button onClick={() => setIsEditing(true)} className="bg-growgig-500 hover:bg-growgig-600">
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

// Add mock profile data for testing
const mockProfileData = {
  _id: 'mockuser1',
  name: 'John Doe',
  email: 'john@example.com',
  title: 'Full Stack Developer',
  avatar: '/placeholder-avatar.png',
  bio: 'Experienced developer specializing in React and Node.js with a passion for building responsive and user-friendly web applications.',
  location: 'Remote',
  hourlyRate: 50,
  yearsOfExperience: 5,
  skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Express']
};

export default FreelancerDashboard;

