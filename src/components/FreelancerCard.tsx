
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  Clock
} from 'lucide-react';
import { Freelancer } from '@/types';

interface FreelancerCardProps {
  freelancer: Freelancer;
}

const FreelancerCard = ({ freelancer }: FreelancerCardProps) => {
  return (
    <Link to={`/freelancers/${freelancer.id}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-growgig-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center mb-4">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
              <AvatarFallback className="text-xl bg-growgig-100 text-growgig-600">
                {freelancer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg text-gray-900">{freelancer.name}</h3>
            <p className="text-growgig-600">{freelancer.title}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin size={16} className="mr-1 text-growgig-500" />
              {freelancer.location}
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-1 text-growgig-500" />
              {freelancer.yearsOfExperience} years
            </div>
            <div className="flex items-center">
              <Briefcase size={16} className="mr-1 text-growgig-500" />
              ₹{freelancer.hourlyRate}/hr
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {freelancer.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 3 && (
              <Badge variant="outline" className="bg-gray-50">
                +{freelancer.skills.length - 3} more
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 text-sm text-center line-clamp-2">
            {freelancer.bio}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FreelancerCard;
