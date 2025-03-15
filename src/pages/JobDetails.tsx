import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/services/api';
import { Job } from '@/types';
import { useToast } from '@/components/ui/use-toast';

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
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-gray-50 py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
              
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
              
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
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
                The job you're looking for doesn't exist or has been removed.
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
                      {job.title}
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1 text-growgig-500" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-1 text-growgig-500" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-1 text-growgig-500" />
                        {job.salary}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1 text-growgig-500" />
                        Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <EscrowBadge />
                    <Link to={`/apply/${job.id}`}>
                      <Button className="bg-growgig-500 hover:bg-growgig-600 w-full">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Job Description */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {job.description}
                  </p>
                </section>
                
                {/* Requirements */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
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
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check size={18} className="mr-2 mt-1 text-growgig-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                
                {/* Apply Now */}
                <div className="mt-8 flex justify-center">
                  <Link to={`/apply/${job.id}`}>
                    <Button size="lg" className="bg-growgig-500 hover:bg-growgig-600 px-8">
                      Apply for this position
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Similar Jobs */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Similar Jobs</h2>
              <p className="text-gray-600">
                Browse more {job.title.split(' ')[0]} jobs or see all available positions.
              </p>
              <div className="mt-4 flex space-x-3">
                <Link to={`/jobs?q=${job.title.split(' ')[0]}`}>
                  <Button variant="outline" className="border-growgig-500 text-growgig-500">
                    Similar Jobs
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="ghost">
                    All Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobDetails;
