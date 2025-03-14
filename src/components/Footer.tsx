
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-growgig-600 mb-4">GrowGig</h3>
            <p className="text-gray-600 mb-4">
              Connecting freelancers with employers for project-based work since 2023.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-growgig-500">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-growgig-500">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-growgig-500">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-growgig-500">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* For Freelancers */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">For Freelancers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-gray-600 hover:text-growgig-500">
                  Find Projects
                </Link>
              </li>
              <li>
                <Link to="/register/freelancer" className="text-gray-600 hover:text-growgig-500">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-growgig-500">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-growgig-500">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/freelancers" className="text-gray-600 hover:text-growgig-500">
                  Find Candidates
                </Link>
              </li>
              <li>
                <Link to="/post-job" className="text-gray-600 hover:text-growgig-500">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-growgig-500">
                  Enterprise Solutions
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-growgig-500">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone size={18} className="mr-2 mt-1 text-growgig-500" />
                <span className="text-gray-600">(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Mail size={18} className="mr-2 mt-1 text-growgig-500" />
                <span className="text-gray-600">contact@growgig.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-growgig-500" />
                <span className="text-gray-600">
                  123 Freelance Way<br />
                  San Francisco, CA 94107
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <p className="text-center text-gray-500 text-sm">
            © 2023 GrowGig. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
