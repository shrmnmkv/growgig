
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-growgig-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{job.title}</h3>
              <p className="text-gray-600 text-sm">{job.company}</p>
            </div>
            <Badge className="bg-growgig-100 text-growgig-700 hover:bg-growgig-200">
              {job.type}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin size={16} className="mr-1 text-growgig-500" />
              {job.location}
            </div>
            <div className="flex items-center">
              <DollarSign size={16} className="mr-1 text-growgig-500" />
              {job.salary}
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-1 text-growgig-500" />
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {job.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 3).map((req, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                {req.split(' ').slice(0, 3).join(' ')}
                {req.split(' ').length > 3 ? '...' : ''}
              </Badge>
            ))}
            {job.requirements.length > 3 && (
              <Badge variant="outline" className="bg-gray-50">
                +{job.requirements.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default JobCard;
