import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Star, ExternalLink, ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRecommendations, submitFeedback } from '../service';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin', { replace: true });
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getRecommendations(currentUser.token);
        setCourses(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser, navigate]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + courses.length) % courses.length);
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      return;
    }

    try {
      setSubmittingFeedback(true);
      await submitFeedback(currentUser.token, feedback);
      setFeedbackSuccess(true);
      setFeedback(''); // Clear the feedback input after submission
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFeedbackSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!currentUser) {
    return null; // Will redirect in the useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-r-2 border-violet-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 px-6">
        <div className="max-w-4xl mx-auto mt-16 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-4">No Recommendations Available</h1>
          <p className="text-gray-300 mb-6">
            We couldn't find any course recommendations for you at this time. Please complete your profile to get personalized recommendations.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile-setup')}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-medium rounded-lg"
          >
            Complete Your Profile
          </motion.button>
        </div>
      </div>
    );
  }

  const currentCourse = courses[currentIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Welcome Section */}
        <div className="mb-10">
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome back, {currentUser.name || 'Learner'}!
          </motion.h1>
          <motion.p 
            className="text-gray-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Continue exploring personalized course recommendations tailored for you
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Course Recommendation Card */}
          <motion.div 
            className="md:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Recommended Course</h2>
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock size={16} className="mr-1" />
                  <span>Course {currentIndex + 1} of {courses.length}</span>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-3">{currentCourse['Course Title']}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentCourse.Keyword && currentCourse.Keyword.split(',').map((keyword, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 text-xs font-medium rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center mb-4">
                      <div className="flex mr-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < Math.floor(currentCourse.Rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} 
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">{currentCourse.Rating || 'No rating'}</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      {currentCourse['What you will learn']?.slice(0, 150)}
                      {currentCourse['What you will learn']?.length > 150 ? '...' : ''}
                    </p>
                    <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400">
                      {currentCourse.Instructor && (
                        <div className="flex items-center">
                          <span className="mr-2">Instructor:</span>
                          <span className="text-gray-300">{currentCourse.Instructor}</span>
                        </div>
                      )}
                      {currentCourse.Level && (
                        <div className="flex items-center">
                          <span className="mr-2">Level:</span>
                          <span className="text-gray-300">{currentCourse.Level}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/course/${currentCourse.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <BookOpen size={18} />
                      <span>View Details</span>
                    </motion.button>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={currentCourse['Course Url']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center no-underline text-white gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 rounded-lg transition-colors"
                    >
                      <ExternalLink size={18} />
                      <span>Go to Course</span>
                    </motion.a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center p-4 mt-2 border-t border-gray-700 bg-gray-800/70">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-700 hover:bg-violet-600 transition-colors"
                onClick={handlePrev}
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <div className="flex space-x-1">
                {courses.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-violet-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-700 hover:bg-violet-600 transition-colors"
                onClick={handleNext}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </motion.div>

          {/* Feedback Section */}
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Your Feedback</h2>
            <p className="text-gray-400 text-sm mb-4">
              We value your input! Let us know how these recommendations are working for you.
            </p>
            
            <div className="relative">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts on our recommendations..."
                className="w-full p-4 bg-gray-900/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-white placeholder-gray-500 resize-none h-32"
              ></textarea>
              
              {feedbackSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg"
                >
                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">Thank you for your feedback!</p>
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={submittingFeedback || !feedback.trim()}
              onClick={handleSubmitFeedback}
              className={`mt-4 w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                submittingFeedback || !feedback.trim()
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:shadow-lg hover:shadow-violet-500/20'
              }`}
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              {!submittingFeedback && <Send size={16} />}
            </motion.button>

            {/* Quick Links */}
            <div className="mt-8">
              <h3 className="text-gray-300 font-medium mb-3">Quick Links</h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate('/recommended-courses')}
                  className="w-full text-left px-4 py-3 flex items-center justify-between rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  <span>View All Recommendations</span>
                  <ChevronRight size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate('/profile-setup')}
                  className="w-full text-left px-4 py-3 flex items-center justify-between rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  <span>Update Your Profile</span>
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;