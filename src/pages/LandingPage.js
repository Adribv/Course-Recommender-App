import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Target, Users, Trophy } from 'lucide-react';

const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1594085951586-67c71c56c778?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const staggerChildrenVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const featureVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Animated background images */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-center bg-cover"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentImageIndex === index ? 0.4 : 0,
              scale: currentImageIndex === index ? 1.05 : 1
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gray-900 bg-opacity-70" />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-gray-900" />
      
      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Main hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 lg:py-32 max-w-7xl mx-auto">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={staggerChildrenVariants}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-purple-500"
              variants={fadeVariants}
              transition={{ duration: 0.8 }}
            >
              Discover Your Perfect Learning Path
            </motion.h1>
            
            <motion.p 
              className="mx-auto max-w-2xl text-lg text-gray-300 mb-10"
              variants={fadeVariants}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Personalized course recommendations tailored to your skills, 
              interests, and career goals. Unlock your potential with AI-driven 
              learning guidance.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
              variants={fadeVariants}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 text-base font-medium rounded-lg shadow-lg bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Get Started <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link to="/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 text-base font-medium rounded-lg shadow-lg bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 flex items-center justify-center w-full sm:w-auto"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Features grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8"
            initial="hidden"
            animate="visible"
            variants={staggerChildrenVariants}
          >
            <motion.div
              className="bg-gray-800/60 backdrop-blur-md p-6 rounded-lg border border-gray-700 hover:border-violet-500/50 transition-colors duration-300"
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Target className="h-10 w-10 text-violet-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Personalized Recommendations</h3>
              <p className="text-gray-400">Courses tailored to your unique skills and career aspirations</p>
            </motion.div>
            
            <motion.div
              className="bg-gray-800/60 backdrop-blur-md p-6 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors duration-300"
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <BookOpen className="h-10 w-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Curated Content</h3>
              <p className="text-gray-400">High-quality courses vetted by industry professionals</p>
            </motion.div>
            
            <motion.div
              className="bg-gray-800/60 backdrop-blur-md p-6 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors duration-300"
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Trophy className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Skill Advancement</h3>
              <p className="text-gray-400">Track progress and build your expertise systematically</p>
            </motion.div>
            
            <motion.div
              className="bg-gray-800/60 backdrop-blur-md p-6 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors duration-300"
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Users className="h-10 w-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Community Insights</h3>
              <p className="text-gray-400">Learn from the experiences of other learners like you</p>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <footer className="w-full py-6 bg-gray-900/80 backdrop-blur-md border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} CourseCompass. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">About</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;