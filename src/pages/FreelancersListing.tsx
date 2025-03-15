
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Freelancer } from '@/types';
import { api } from '@/services/api';
import FreelancerCard from '@/components/FreelancerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  MapPin, 
  Filter, 
  Briefcase, 
  Zap,
  X
} from 'lucide-react';

const FreelancersListing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState<number[]>([0, 15]);
  const [rateRange, setRateRange] = useState<number[]>([500, 10000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: freelancers, isLoading, error } = useQuery({
    queryKey: ['freelancers', searchQuery, location, selectedSkills, experienceRange, rateRange, currentPage],
    queryFn: () => api.getFreelancers({
      search: searchQuery,
      location,
      skills: selectedSkills,
      minExperience: experienceRange[0],
      maxExperience: experienceRange[1],
      minRate: rateRange[0],
      maxRate: rateRange[1],
      page: currentPage
    })
  });
  
  const totalPages = freelancers?.totalPages || 1;
  
  const commonSkills = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'UI/UX Design', 
    'Python', 'Java', 'PHP', 'WordPress', 'Mobile Development',
    'Flutter', 'React Native', 'Angular', 'Vue.js', 'Data Science'
  ];
  
  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setSelectedSkills([]);
    setExperienceRange([0, 15]);
    setRateRange([500, 10000]);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-growgig-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Talented Freelancers
            </h1>
            <p className="text-lg text-gray-600">
              Connect with the best freelance professionals from across India
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search freelancers by name or skill"
                className="pl-10 border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Location (Delhi, Mumbai, Bangalore, etc.)"
                className="pl-10 border-gray-300"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button 
              className="bg-growgig-500 hover:bg-growgig-600 h-10"
              onClick={() => setCurrentPage(1)}
            >
              Search
            </Button>
            <Button 
              variant="outline" 
              className="h-10 border-growgig-200 text-growgig-700"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} className="mr-2" />
              Filters
            </Button>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-100 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Advanced Filters</h3>
                <Button 
                  variant="ghost" 
                  className="h-8 text-sm text-gray-500"
                  onClick={handleClearFilters}
                >
                  <X size={16} className="mr-1" /> Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block mb-2">Experience (Years)</Label>
                  <div className="px-2">
                    <Slider
                      value={experienceRange}
                      min={0}
                      max={15}
                      step={1}
                      onValueChange={setExperienceRange}
                      className="my-4"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{experienceRange[0]} years</span>
                    <span>{experienceRange[1]} years</span>
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-2">Hourly Rate (₹)</Label>
                  <div className="px-2">
                    <Slider
                      value={rateRange}
                      min={500}
                      max={10000}
                      step={100}
                      onValueChange={setRateRange}
                      className="my-4"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>₹{rateRange[0]}/hr</span>
                    <span>₹{rateRange[1]}/hr</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="block mb-2">Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedSkills.includes(skill) 
                          ? "bg-growgig-500 hover:bg-growgig-600" 
                          : "hover:bg-growgig-50"
                      }`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && (
                        <X size={14} className="ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Freelancers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-80 animate-pulse">
                <CardContent className="p-0">
                  <div className="h-full bg-gray-100"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-500 mb-4">
              Failed to load freelancers. Please try again.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-growgig-500 hover:bg-growgig-600"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {freelancers && freelancers.data.length > 0 ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {freelancers.data.length} of {freelancers.total} freelancers
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <Select>
                      <option value="relevance">Relevance</option>
                      <option value="experience_high">Experience (High to Low)</option>
                      <option value="rate_low">Rate (Low to High)</option>
                      <option value="rate_high">Rate (High to Low)</option>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {freelancers.data.map((freelancer: Freelancer) => (
                    <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                  ))}
                </div>
                
                {/* Pagination */}
                <Pagination className="my-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // Logic to show pagination numbers centered around current page
                      let pageNum = currentPage;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="rounded-full bg-growgig-50 p-4 inline-flex items-center justify-center mb-4">
                  <Briefcase className="h-10 w-10 text-growgig-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Freelancers Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search filters or browse all freelancers
                </p>
                <Button 
                  onClick={handleClearFilters}
                  className="bg-growgig-500 hover:bg-growgig-600"
                >
                  <Zap size={18} className="mr-2" />
                  View All Freelancers
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default FreelancersListing;
