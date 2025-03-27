import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Search } from 'lucide-react';

const EmployersListing = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const { data: employers, isLoading } = useQuery({
    queryKey: ['employers', searchTerm],
    queryFn: () => api.employers.getEmployers({ search: searchTerm }),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Find Employers</h1>
            <p className="text-gray-600">Discover companies looking for talent like you</p>
          </div>

          <div className="mb-8">
            <div className="flex gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search by company name or industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-growgig-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading employers...</p>
            </div>
          ) : employers && employers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employers.map((employer) => (
                <Card key={employer._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={employer.logo || '/company-placeholder.png'}
                          alt={employer.companyName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {employer.companyName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building2 size={14} className="mr-1" />
                            {employer.industry}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {employer.location}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Users size={14} className="mr-1" />
                            {employer.companySize}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-4 line-clamp-3">
                      {employer.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {employer.openPositions > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {employer.openPositions} Open Positions
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link to={`/employers/${employer._id}`}>
                        <Button className="w-full bg-growgig-500 hover:bg-growgig-600">
                          View Company Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 size={40} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No employers found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmployersListing;
