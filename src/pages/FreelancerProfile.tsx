
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Freelancer } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap,
  Clock,
  ArrowLeft,
  ExternalLink,
  Linkedin,
  CalendarClock
} from 'lucide-react';

const FreelancerProfile = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: freelancer, isLoading, error } = useQuery({
    queryKey: ['freelancer', id],
    queryFn: () => api.getFreelancerById(id || ''),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-32 w-32 bg-gray-200 rounded-full mb-4 mx-auto"></div>
            <div className="h-8 w-64 bg-gray-200 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-8 mx-auto"></div>
            <div className="h-96 w-full max-w-4xl bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Freelancer Not Found</h2>
            <p className="text-gray-600 mb-6">The freelancer you're looking for doesn't exist or there was an error loading their profile.</p>
            <Link to="/freelancers">
              <Button className="bg-growgig-500 hover:bg-growgig-600">
                <ArrowLeft size={18} className="mr-2" />
                Back to Freelancers
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Blurred Background */}
      <div className="relative bg-growgig-50 py-12">
        {/* Blurred background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl"
          style={{ backgroundImage: `url(${freelancer.avatar})` }}
        />
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center">
            <Link 
              to="/freelancers" 
              className="inline-flex items-center text-growgig-600 mb-6 hover:text-growgig-700"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Freelancers
            </Link>
            
            <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
              <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
              <AvatarFallback className="text-3xl bg-growgig-100 text-growgig-600">
                {freelancer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{freelancer.name}</h1>
            <p className="text-xl text-growgig-600 mb-3">{freelancer.title}</p>
            
            <div className="flex justify-center items-center gap-3 text-gray-600 mb-6">
              <div className="flex items-center">
                <MapPin size={18} className="mr-1 text-growgig-500" />
                {freelancer.location}
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-1 text-growgig-500" />
                {freelancer.yearsOfExperience} years experience
              </div>
              <div className="flex items-center">
                <Briefcase size={18} className="mr-1 text-growgig-500" />
                ₹{freelancer.hourlyRate}/hr
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              <a href={`mailto:${freelancer.contact.email}`}>
                <Button className="bg-growgig-500 hover:bg-growgig-600">
                  <Mail size={18} className="mr-2" />
                  Contact
                </Button>
              </a>
              <a href={`tel:${freelancer.contact.phone}`}>
                <Button variant="outline" className="border-growgig-500 text-growgig-600 hover:bg-growgig-50">
                  <Phone size={18} className="mr-2" />
                  Call
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="skills">Skills & Expertise</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">About Me</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {freelancer.bio}
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-growgig-500 mr-3" />
                      <a 
                        href={`mailto:${freelancer.contact.email}`} 
                        className="text-gray-700 hover:text-growgig-600"
                      >
                        {freelancer.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-growgig-500 mr-3" />
                      <a 
                        href={`tel:${freelancer.contact.phone}`} 
                        className="text-gray-700 hover:text-growgig-600"
                      >
                        {freelancer.contact.phone}
                      </a>
                    </div>
                    {freelancer.contact.linkedin && (
                      <div className="flex items-center">
                        <Linkedin className="h-5 w-5 text-growgig-500 mr-3" />
                        <a 
                          href={freelancer.contact.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-growgig-600"
                        >
                          LinkedIn Profile
                          <ExternalLink size={14} className="inline ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="skills">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Skills & Expertise</h2>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {freelancer.skills.map((skill, index) => (
                      <Badge key={index} className="bg-growgig-100 text-growgig-700 hover:bg-growgig-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex items-center mb-4">
                    <CalendarClock className="h-5 w-5 text-growgig-500 mr-2" />
                    <h3 className="text-xl font-semibold">Experience</h3>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-growgig-200 space-y-6">
                    <div>
                      <h4 className="font-medium text-lg">Senior Developer</h4>
                      <p className="text-gray-600">Tech Solutions India • 2018 - Present</p>
                      <p className="mt-2 text-gray-700">
                        Led development of enterprise applications for major clients across finance and healthcare sectors.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Full Stack Developer</h4>
                      <p className="text-gray-600">Digital Innovations • 2015 - 2018</p>
                      <p className="mt-2 text-gray-700">
                        Developed responsive web applications using React and Node.js.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Junior Developer</h4>
                      <p className="text-gray-600">StartUp Hub Bangalore • 2012 - 2015</p>
                      <p className="mt-2 text-gray-700">
                        Worked on front-end development for various startup clients.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="portfolio">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Portfolio</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {freelancer.portfolio.map((item, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <Briefcase className="h-12 w-12 text-gray-300" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-growgig-600 text-sm hover:text-growgig-700 inline-flex items-center"
                          >
                            View Project <ExternalLink size={14} className="ml-1" />
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="education">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <GraduationCap className="h-6 w-6 text-growgig-500 mr-3" />
                    <h2 className="text-2xl font-semibold">Education</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {freelancer.education.map((edu, index) => (
                      <div key={index} className="pl-4 border-l-2 border-growgig-200">
                        <h3 className="font-semibold text-lg">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-gray-500 text-sm">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FreelancerProfile;
