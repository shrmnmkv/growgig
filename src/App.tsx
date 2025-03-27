import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "@/contexts/AuthContext";
import { useContext } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import JobsListing from "./pages/JobsListing";
import JobDetails from "./pages/JobDetails";
import JobApplication from "./pages/JobApplication";
import ApplicationDetails from "@/pages/ApplicationDetails";
import FreelancersListing from "./pages/FreelancersListing";
import FreelancerProfile from "./pages/FreelancerProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import PostJob from "./pages/PostJob";
import EditJob from "./pages/EditJob";
import EditProfile from "./pages/EditProfile";
import CreateProfile from "./pages/CreateProfile";
import EmployersListing from "./pages/EmployersListing";
import JobMilestones from "./pages/JobMilestones";

const queryClient = new QueryClient();

// Route guard component to protect employer-only routes
const EmployerRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('AuthContext not found');
  }
  
  const { user, loading } = auth;
  const isAuthenticated = !!user;
  const isLoading = loading;
  
  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'employer') {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/debug-auth" element={<AuthDebugger />} />
            <Route path="/jobs" element={<JobsListing />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/jobs/:jobId/milestones" element={
              <EmployerRouteGuard>
                <JobMilestones />
              </EmployerRouteGuard>
            } />
            <Route path="/apply/:id" element={<JobApplication />} />
            <Route path="/applications/job/:jobId" element={
              <EmployerRouteGuard>
                <ApplicationDetails />
              </EmployerRouteGuard>
            } />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/freelancers" element={<FreelancersListing />} />
            <Route path="/freelancers/:id" element={<FreelancerProfile />} />
            <Route path="/employers" element={<EmployersListing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/post-job" element={
              <EmployerRouteGuard>
                <PostJob />
              </EmployerRouteGuard>
            } />
            <Route path="/edit-job/:jobId" element={
              <EmployerRouteGuard>
                <EditJob />
              </EmployerRouteGuard>
            } />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Simple component to debug authentication state
const AuthDebugger = () => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    return <div>AuthContext not found</div>;
  }
  
  const { user, loading } = auth;
  const token = sessionStorage.getItem('token');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Debug</h1>
      
      <h2>Auth State</h2>
      <pre>
        {JSON.stringify({ 
          user: user ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null,
          loading,
          isAuthenticated: !!user,
          hasToken: !!token
        }, null, 2)}
      </pre>
      
      <h2>Token (first 20 chars)</h2>
      <pre>
        {token ? token.substring(0, 20) + '...' : 'No token found'}
      </pre>
      
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => { auth.logout(); }}
          style={{ 
            padding: '8px 12px', 
            background: '#f44336', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
        
        <button
          onClick={() => { window.location.href = '/login'; }}
          style={{ 
            padding: '8px 12px', 
            background: '#2196f3', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default App;
