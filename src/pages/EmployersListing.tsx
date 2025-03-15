
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/services/api';
import { Mail, MapPin, Building, Users } from 'lucide-react';

interface Employer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  location: string;
  industry?: string;
  employeeCount?: number;
  logo?: string;
  description?: string;
}

const EmployersListing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  
  // This would use a real API endpoint in a production app
  const { data: employers, isLoading } = useQuery({
    queryKey: ['employers'],
    queryFn: () => {
      // Create employer objects from the users with 'employer' role
      return api.getUsers()
        .then(users => users
          .filter(user => user.role === 'employer')
          .map(user => ({
            id: user.id,
            name: user.name,
            companyName: user.companyName || 'Company',
            email: user.email,
            location: 'India', // Assume India for mock data
            industry: getRandomIndustry(),
            employeeCount: Math.floor(Math.random() * 500) + 5,
            logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName || 'Company')}&background=random`,
            description: `${user.companyName} is a leading company in its industry, providing quality services across India.`
          }))
        );
    },
  });
  
  // Get filtered employers based on search term and filters
  const filteredEmployers = React.useMemo(() => {
    if (!employers) return [];
    
    return employers.filter(employer => {
      const matchesSearch = searchTerm === '' || 
        employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employer.industry?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesIndustry = industryFilter === '' || 
        employer.industry === industryFilter;
        
      const matchesLocation = locationFilter === '' || 
        employer.location.toLowerCase().includes(locationFilter.toLowerCase());
        
      return matchesSearch && matchesIndustry && matchesLocation;
    });
  }, [employers, searchTerm, industryFilter, locationFilter]);
  
  const industries = ["Technology", "Healthcare", "Education", "Finance", "Manufacturing", "Retail", "Construction"];
  
  function getRandomIndustry() {
    return industries[Math.floor(Math.random() * industries.length)];
  }
  
  const handleContactEmployer = (employer: Employer) => {
    window.location.href = `mailto:${employer.email}?subject=Inquiry from GrowGig&body=Hello ${employer.name},%0D%0A%0D%0AI found your company profile on GrowGig and would like to inquire about potential freelance opportunities.%0D%0A%0D%0ABest regards,%0D%0A[Your Name]`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Employers</h1>
            <p className="text-gray-600">Connect with employers across India for freelance opportunities</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Industries" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                        <SelectItem value="Pune">Pune</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox id="size-small" />
                        <label htmlFor="size-small" className="ml-2 text-sm text-gray-600">
                          1-50 employees
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox id="size-medium" />
                        <label htmlFor="size-medium" className="ml-2 text-sm text-gray-600">
                          51-200 employees
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox id="size-large" />
                        <label htmlFor="size-large" className="ml-2 text-sm text-gray-600">
                          201-500 employees
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox id="size-enterprise" />
                        <label htmlFor="size-enterprise" className="ml-2 text-sm text-gray-600">
                          500+ employees
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-growgig-500 hover:bg-growgig-600">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="mb-6">
                <Input
                  type="text"
                  placeholder="Search by company name or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading employers...</p>
                </div>
              ) : filteredEmployers.length > 0 ? (
                <div className="space-y-4">
                  {filteredEmployers.map(employer => (
                    <Card key={employer.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                            <img
                              src={employer.logo}
                              alt={employer.companyName}
                              className="w-16 h-16 rounded"
                            />
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-xl font-semibold text-gray-900">{employer.companyName}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1 mb-3">
                              <div className="flex items-center">
                                <Building size={14} className="mr-1 text-growgig-500" />
                                {employer.industry}
                              </div>
                              <div className="flex items-center">
                                <MapPin size={14} className="mr-1 text-growgig-500" />
                                {employer.location}
                              </div>
                              <div className="flex items-center">
                                <Users size={14} className="mr-1 text-growgig-500" />
                                {employer.employeeCount} employees
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">{employer.description}</p>
                            <Button 
                              onClick={() => handleContactEmployer(employer)}
                              className="bg-growgig-500 hover:bg-growgig-600"
                            >
                              <Mail size={16} className="mr-2" />
                              Contact Employer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Building size={48} className="mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No employers found</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmployersListing;
