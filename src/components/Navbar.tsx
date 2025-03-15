
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Globe, 
  Menu, 
  X,
  User,
  LogOut,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-2xl font-bold text-growgig-500">GrowGig</span>
          </Link>

          {/* Mobile menu button */}
          {isMobile && (
            <button onClick={toggleMenu} className="md:hidden p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex space-x-6 items-center">
              <Link to="/" className="text-gray-700 hover:text-growgig-600 font-medium">
                Home
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-growgig-600 font-medium">
                Find Projects
              </Link>
              <Link to="/freelancers" className="text-gray-700 hover:text-growgig-600 font-medium">
                Find Candidates
              </Link>
              {isAuthenticated && user?.role === 'employer' && (
                <Link to="/post-job" className="text-gray-700 hover:text-growgig-600 font-medium">
                  Post a Job
                </Link>
              )}
            </div>
          )}

          {/* Contact Info & Auth - Desktop */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-growgig-500" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Globe size={16} className="mr-2 text-growgig-500" />
                  <span>EN</span>
                </div>
              </div>
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User size={16} />
                      {user?.name?.split(' ')[0]}
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button as={Link} to="/login" variant="outline" size="sm">
                    Log In
                  </Button>
                  <Button as={Link} to="/register" className="bg-growgig-500 hover:bg-growgig-600" size="sm">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-growgig-600 font-medium py-2"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/jobs" 
                className="text-gray-700 hover:text-growgig-600 font-medium py-2"
                onClick={closeMenu}
              >
                Find Projects
              </Link>
              <Link 
                to="/freelancers" 
                className="text-gray-700 hover:text-growgig-600 font-medium py-2"
                onClick={closeMenu}
              >
                Find Candidates
              </Link>
              
              {isAuthenticated && user?.role === 'employer' && (
                <Link 
                  to="/post-job" 
                  className="text-gray-700 hover:text-growgig-600 font-medium py-2"
                  onClick={closeMenu}
                >
                  Post a Job
                </Link>
              )}
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-growgig-600 font-medium py-2"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="text-left text-gray-700 hover:text-growgig-600 font-medium py-2"
                  >
                    Log Out
                  </button>
                </>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-growgig-500" />
                  <span className="text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Globe size={16} className="mr-2 text-growgig-500" />
                  <span className="text-sm">EN</span>
                </div>
              </div>
              
              {!isAuthenticated && (
                <div className="flex space-x-2 pt-4">
                  <Button as={Link} to="/login" variant="outline" size="sm" className="flex-1" onClick={closeMenu}>
                    Log In
                  </Button>
                  <Button as={Link} to="/register" className="bg-growgig-500 hover:bg-growgig-600 flex-1" size="sm" onClick={closeMenu}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

