import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="relative h-screen bg-gray-800 text-white">
      {/* Background Image */}
     
      
      <div className="relative flex flex-col items-center justify-center h-full px-4 py-8">
        <h1 className="text-5xl font-extrabold leading-tight mb-4">Welcome to Course Recommender</h1>
        <p className="text-lg mb-8">Find the best courses to boost your career and skills with our personalized recommendations.</p>
        
        <div className="flex space-x-4">
          <Link 
            to="/signin" 
            className="btn btn-primary px-6 py-3 text-lg font-semibold rounded-lg shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="btn btn-secondary px-6 py-3 text-lg font-semibold rounded-lg shadow-lg bg-green-600 hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-0 w-full py-4 bg-gray-900 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Course Recommender. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
