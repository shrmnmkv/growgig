import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import JobCard from '@/components/JobCard';
import { api } from '@/services/api';
import { Search, Briefcase, MapPin, Filter, X } from 'lucide-react';

const JobsListing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filter states
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [salaryRange, setSalaryRange] = useState([0, 2000000]);
  const [isRemote, setIsRemote] = useState(false);
  
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['jobs', searchQuery, locationQuery, selectedIndustry, selectedBusinessType, selectedJobType, selectedRole, isRemote],
    queryFn: () => api.jobs.getAll(),
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  const resetFilters = () => {
    setSelectedIndustry('');
    setSelectedBusinessType('');
    setSelectedJobType('');
    setSelectedRole('');
    setSalaryRange([0, 2000000]);
    setIsRemote(false);
  };
  
  // Industry options
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Construction',
  ];
  
  // Business type options
  const businessTypes = [
    'Startup',
    'SME',
    'Corporate',
    'Enterprise',
    'Government',
    'Non-profit',
  ];
  
  // Job type options
  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
  ];
  
  // Role options
  const roles = [
    'Developer',
    'Designer',
    'Manager',
    'Consultant',
    'Support',
    'Sales',
    'Marketing',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Projects</h1>
            <p className="text-gray-600 mb-6">Search through thousands of projects across India</p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Job title, keyword, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="City, state, or 'remote'"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button type="submit" className="bg-growgig-500 hover:bg-growgig-600 min-w-[120px]">
                Search
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="md:ml-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? (
                  <X size={18} className="mr-2" />
                ) : (
                  <Filter size={18} className="mr-2" />
                )}
                {showFilters ? 'Hide Filters' : 'Filters'}
              </Button>
            </form>
            
            {showFilters && (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Advanced Filters</h2>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500">
                    Reset Filters
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Industries</SelectItem>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Business Types</SelectItem>
                        {businessTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Job Types</SelectItem>
                        {jobTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Roles</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Salary Range (₹)
                  </label>
                  <div className="px-3">
                    <Slider
                      defaultValue={[0, 2000000]}
                      max={2000000}
                      step={50000}
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>₹{salaryRange[0].toLocaleString()}</span>
                      <span>₹{salaryRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center space-x-2">
                  <Switch
                    id="remote-only"
                    checked={isRemote}
                    onCheckedChange={setIsRemote}
                  />
                  <label htmlFor="remote-only" className="text-sm font-medium text-gray-700">
                    Remote Jobs Only
                  </label>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={() => refetch()}
                    className="bg-growgig-500 hover:bg-growgig-600"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
            
            {/* Filter chips/tags */}
            {(selectedIndustry || selectedBusinessType || selectedJobType || selectedRole || isRemote) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedIndustry && (
                  <div className="inline-flex items-center bg-growgig-100 text-growgig-800 rounded-full px-3 py-1 text-sm">
                    Industry: {selectedIndustry}
                    <button
                      onClick={() => setSelectedIndustry('')}
                      className="ml-2 text-growgig-600 hover:text-growgig-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {selectedBusinessType && (
                  <div className="inline-flex items-center bg-growgig-100 text-growgig-800 rounded-full px-3 py-1 text-sm">
                    Business: {selectedBusinessType}
                    <button
                      onClick={() => setSelectedBusinessType('')}
                      className="ml-2 text-growgig-600 hover:text-growgig-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {selectedJobType && (
                  <div className="inline-flex items-center bg-growgig-100 text-growgig-800 rounded-full px-3 py-1 text-sm">
                    Job Type: {selectedJobType}
                    <button
                      onClick={() => setSelectedJobType('')}
                      className="ml-2 text-growgig-600 hover:text-growgig-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {selectedRole && (
                  <div className="inline-flex items-center bg-growgig-100 text-growgig-800 rounded-full px-3 py-1 text-sm">
                    Role: {selectedRole}
                    <button
                      onClick={() => setSelectedRole('')}
                      className="ml-2 text-growgig-600 hover:text-growgig-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {isRemote && (
                  <div className="inline-flex items-center bg-growgig-100 text-growgig-800 rounded-full px-3 py-1 text-sm">
                    Remote Only
                    <button
                      onClick={() => setIsRemote(false)}
                      className="ml-2 text-growgig-600 hover:text-growgig-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={resetFilters}
                  className="text-growgig-600 hover:text-growgig-800 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobsListing;
