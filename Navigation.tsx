import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, BookOpen, Map, Users, Calculator } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Droplets className="h-8 w-8" />
            <span className="font-bold text-xl">WaterWise</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/education" className="flex items-center space-x-1 hover:text-blue-200">
              <BookOpen className="h-5 w-5" />
              <span>Learn</span>
            </Link>
            <Link to="/map" className="flex items-center space-x-1 hover:text-blue-200">
              <Map className="h-5 w-5" />
              <span>Water Map</span>
            </Link>
            <Link to="/community" className="flex items-center space-x-1 hover:text-blue-200">
              <Users className="h-5 w-5" />
              <span>Community</span>
            </Link>
            <Link to="/calculator" className="flex items-center space-x-1 hover:text-blue-200">
              <Calculator className="h-5 w-5" />
              <span>Calculator</span>
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={`/profile/${user.id}`} 
                  className="text-white hover:text-blue-200"
                >
                  {user.email?.split('@')[0] || 'Profile'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-blue-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-white hover:text-blue-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;