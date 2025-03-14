
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  SlidersHorizontal,
  MapPin, 
  X 
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { Job } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const JobsListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  
  // Filters
  const [jobType, setJobType] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const jobsData = await api.getJobs();
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        
        // Apply search term filter if it exists in URL
        if (searchParams.get('q')) {
          filterJobs(jobsData, searchParams.get('q') || '', location, jobType);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams]);
  
  const filterJobs = (
    jobs: Job[], 
    term: string, 
    loc: string, 
    types: string[]
  ) => {
    let filtered = [...jobs];
    
    // Filter by search term (job title or company)
    if (term) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term.toLowerCase()) || 
        job.company.toLowerCase().includes(term.toLowerCase()) ||
        job.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Filter by location
    if (loc) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(loc.toLowerCase())
      );
    }
    
    // Filter by job type
    if (types.length > 0) {
      filtered = filtered.filter(job => 
        types.includes(job.type)
      );
    }
    
    setFilteredJobs(filtered);
  };
  
  const handleSearch = () => {
    filterJobs(jobs, searchTerm, location, jobType);
    
    // Update URL search parameters
    if (searchTerm) {
      setSearchParams({ q: searchTerm });
    } else {
      setSearchParams({});
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const toggleJobType = (type: string) => {
    setJobType(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const handleFilter = () => {
    filterJobs(jobs, searchTerm, location, jobType);
    setShowFilters(false);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setJobType([]);
    setFilteredJobs(jobs);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Projects</h1>
            
            {/* Search and Filter */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Job title or keyword"
                    className="pl-10 border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Location"
                    className="pl-10 border-gray-300"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-gray-300"
                  >
                    <SlidersHorizontal size={18} className="mr-2" />
                    Filters
                  </Button>
                  <Button 
                    className="bg-growgig-500 hover:bg-growgig-600" 
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
              </div>
              
              {/* Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Job Type Filter */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Job Type</h4>
                      <div className="space-y-2">
                        {['Full-time', 'Part-time', 'Contract'].map((type) => (
                          <div className="flex items-center space-x-2" key={type}>
                            <Checkbox 
                              id={`job-type-${type}`} 
                              checked={jobType.includes(type)}
                              onCheckedChange={() => toggleJobType(type)}
                            />
                            <Label 
                              htmlFor={`job-type-${type}`}
                              className="text-sm font-normal"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      className="bg-growgig-500 hover:bg-growgig-600" 
                      onClick={handleFilter}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Active Filters */}
              {(searchTerm || location || jobType.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  
                  {searchTerm && (
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {searchTerm}
                      <X 
                        size={14} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => {
                          setSearchTerm('');
                          filterJobs(jobs, '', location, jobType);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {location && (
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {location}
                      <X 
                        size={14} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => {
                          setLocation('');
                          filterJobs(jobs, searchTerm, '', jobType);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {jobType.map(type => (
                    <Badge 
                      key={type}
                      variant="secondary" 
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {type}
                      <X 
                        size={14} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => {
                          toggleJobType(type);
                          filterJobs(
                            jobs, 
                            searchTerm, 
                            location, 
                            jobType.filter(t => t !== type)
                          );
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Results */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {isLoading ? 'Loading...' : `Showing ${filteredJobs.length} jobs`}
              </p>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="relevant">Most relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 h-64 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">No jobs found matching your criteria</p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-growgig-500 text-growgig-500"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobsListing;
