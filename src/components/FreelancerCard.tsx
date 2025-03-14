
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  DollarSign, 
  Briefcase 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Freelancer } from '@/types';

interface FreelancerCardProps {
  freelancer: Freelancer;
}

const FreelancerCard = ({ freelancer }: FreelancerCardProps) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Link to={`/freelancers/${freelancer.id}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-growgig-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-growgig-100">
              <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
              <AvatarFallback className="bg-growgig-100 text-growgig-700">
                {getInitials(freelancer.name)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{freelancer.name}</h3>
              <p className="text-growgig-600 font-medium">{freelancer.title}</p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin size={14} className="mr-1 text-growgig-500" />
                {freelancer.location}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Briefcase size={16} className="mr-1 text-growgig-500" />
              {freelancer.yearsOfExperience} years experience
            </div>
            <div className="flex items-center">
              <DollarSign size={16} className="mr-1 text-growgig-500" />
              ${freelancer.hourlyRate}/hour
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {freelancer.bio}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {freelancer.skills.slice(0, 5).map((skill, index) => (
              <Badge 
                key={index} 
                className="bg-growgig-50 text-growgig-700 hover:bg-growgig-100 border border-growgig-100"
              >
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 5 && (
              <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200">
                +{freelancer.skills.length - 5} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FreelancerCard;
