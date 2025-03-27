import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Phone, Globe, User } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import ButtonLink from './ButtonLink';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('AuthContext not found');
  }
  
  const { user, logout } = auth;
  const isAuthenticated = !!user;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  // Determine what navigation links to show based on user role
  const showFreelancerLinks = !user || user.role === 'freelancer';
  const showEmployerLinks = !user || user.role === 'employer';

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar with contact info */}
      <div className="hidden md:block bg-gray-100 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Phone size={14} className="mr-2" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center">
              <Globe size={14} className="mr-2" />
              <span>English</span>
            </div>
          </div>
          {isAuthenticated && (
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main navbar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-growgig-600">GrowGig</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-growgig-600 font-medium">
              Home
            </Link>
            
            {showFreelancerLinks && (
              <Link to="/jobs" className="text-gray-700 hover:text-growgig-600 font-medium">
                Find Projects
              </Link>
            )}
            
            {showEmployerLinks && (
              <Link to="/freelancers" className="text-gray-700 hover:text-growgig-600 font-medium">
                Find Candidates
              </Link>
            )}
            
            {showFreelancerLinks && (
              <Link to="/employers" className="text-gray-700 hover:text-growgig-600 font-medium">
                Find Employers
              </Link>
            )}
            
            {isAuthenticated && user?.role === 'employer' && (
              <Link to="/post-job" className="text-gray-700 hover:text-growgig-600 font-medium">
                Post a Project
              </Link>
            )}
          </nav>

          {/* Authentication buttons - desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-medium">
                    <User size={16} className="mr-2" />
                    My Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <ButtonLink to="/login" variant="outline" size="sm">
                  Login
                </ButtonLink>
                <ButtonLink to="/register" className="bg-growgig-500 text-white hover:bg-growgig-600" size="sm">
                  Register
                </ButtonLink>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold text-growgig-600">GrowGig</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="px-2 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {showFreelancerLinks && (
                  <Link
                    to="/jobs"
                    className="px-2 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Find Projects
                  </Link>
                )}
                
                {showEmployerLinks && (
                  <Link
                    to="/freelancers"
                    className="px-2 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Find Candidates
                  </Link>
                )}
                
                {showFreelancerLinks && (
                  <Link
                    to="/employers"
                    className="px-2 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Find Employers
                  </Link>
                )}
                
                {isAuthenticated && user?.role === 'employer' && (
                  <Link
                    to="/post-job"
                    className="px-2 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Post a Project
                  </Link>
                )}

                <div className="pt-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="px-2 py-3 text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        Dashboard
                      </Link>
                      <ButtonLink 
                        to="/" 
                        className="w-full mt-2 text-red-500 justify-center" 
                        variant="outline"
                        onClick={handleLogout}
                      >
                        Logout
                      </ButtonLink>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <ButtonLink 
                        to="/login" 
                        className="w-full justify-center" 
                        variant="outline"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </ButtonLink>
                      <ButtonLink
                        to="/register"
                        className="w-full bg-growgig-500 text-white justify-center hover:bg-growgig-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Register
                      </ButtonLink>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-col space-y-3 text-sm text-gray-600">
                    <div className="flex items-center px-2">
                      <Phone size={14} className="mr-2" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center px-2">
                      <Globe size={14} className="mr-2" />
                      <span>English</span>
                    </div>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
