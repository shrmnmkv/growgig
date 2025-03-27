import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/services/api';
import { 
  Search, 
  MapPin, 
  UserPlus, 
  Briefcase,
  Users,
  Building2,
  FileText,
  Layers
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [statistics, setStatistics] = useState({
    totalJobs: 0,
    totalFreelancers: 0,
    totalCompanies: 0,
    totalCategories: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await api.statistics.getAll();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const steps = [
    {
      icon: <UserPlus className="h-10 w-10 text-growgig-500" />,
      title: 'Create Account',
      description: 'Sign up as a freelancer or employer to get started on GrowGig.'
    },
    {
      icon: <Briefcase className="h-10 w-10 text-growgig-500" />,
      title: 'Post or Apply',
      description: 'Post projects as an employer or apply to jobs as a freelancer.'
    },
    {
      icon: <Users className="h-10 w-10 text-growgig-500" />,
      title: 'Collaborate',
      description: 'Work together on projects with secure communication and payments.'
    },
    {
      icon: <Building2 className="h-10 w-10 text-growgig-500" />,
      title: 'Get Paid',
      description: 'Receive payment for completed work through our secure platform.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-pattern py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find the Perfect <span className="text-growgig-500">Freelance</span> Match
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with top freelancers and companies for your next project
            </p>
            
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-lg mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Job title or keyword"
                    className="pl-10 border-gray-300 h-12"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Location"
                    className="pl-10 border-gray-300 h-12"
                  />
                </div>
                <Button className="h-12 px-6 bg-growgig-500 hover:bg-growgig-600">
                  Search
                </Button>
              </div>
            </div>
            
            {/* Popular Searches */}
            <div className="text-sm text-gray-600">
              <span className="mr-2 font-medium">Popular:</span>
              <Link to="/jobs?q=react" className="mr-3 hover:text-growgig-500 hover:underline">React</Link>
              <Link to="/jobs?q=design" className="mr-3 hover:text-growgig-500 hover:underline">UI/UX Design</Link>
              <Link to="/jobs?q=node" className="mr-3 hover:text-growgig-500 hover:underline">Node.js</Link>
              <Link to="/jobs?q=remote" className="hover:text-growgig-500 hover:underline">Remote</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              GrowGig makes it easy to connect freelancers with employers for project-based work
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="rounded-full bg-growgig-50 p-4 inline-flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">GrowGig By The Numbers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of freelancers and companies already using our platform
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-growgig-50 p-3 inline-flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-growgig-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLoading ? '...' : statistics.totalJobs}+
                </h3>
                <p className="text-gray-600">Live Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-growgig-50 p-3 inline-flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-growgig-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLoading ? '...' : statistics.totalCompanies}+
                </h3>
                <p className="text-gray-600">Companies</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-growgig-50 p-3 inline-flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-growgig-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLoading ? '...' : statistics.totalFreelancers}+
                </h3>
                <p className="text-gray-600">Freelancers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-growgig-50 p-3 inline-flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-growgig-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLoading ? '...' : statistics.totalCategories}+
                </h3>
                <p className="text-gray-600">Categories</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-growgig-50 border-growgig-100">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Employers</h3>
                <p className="text-gray-600 mb-6">
                  Find talented freelancers to bring your projects to life. Post a job today and get proposals from skilled professionals.
                </p>
                <Link to="/post-job">
                  <Button className="bg-growgig-500 hover:bg-growgig-600">
                    Post a Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Freelancers</h3>
                <p className="text-gray-600 mb-6">
                  Discover projects that match your skills and expertise. Create a profile and start applying to jobs.
                </p>
                <Link to="/register/freelancer">
                  <Button variant="outline" className="border-growgig-500 text-growgig-500 hover:bg-growgig-50">
                    Create Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
