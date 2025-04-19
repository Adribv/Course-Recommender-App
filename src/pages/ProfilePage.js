import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  CalendarDays, 
  Briefcase, 
  BookMarked, 
  Heart, 
  Save, 
  Check, 
  AlertCircle,
  Shield,
  Mail,
  UserCircle2,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, saveUserProfile } from '../service';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [interestedCourses, setInterestedCourses] = useState('');
  const [likedCourses, setLikedCourses] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin', { replace: true });
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile(currentUser.token);
        setName(userData.name || '');
        setAge(userData.age || '');
        setJobRole(userData.job_role || '');
        setInterestedCourses(userData.interested_courses || '');
        setLikedCourses(userData.liked_courses || '');
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        
        // If token error, log out
        if (error.message?.includes('token')) {
          logout();
          navigate('/signin', { replace: true });
        } else {
          setErrorMessage('Failed to fetch user data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) {
      setErrorMessage('You must be logged in to save your profile.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveUserProfile(currentUser.token, {
        name,
        age: age ? parseInt(age, 10) : null,
        job_role: jobRole,
        interested_courses: interestedCourses,
        liked_courses: likedCourses
      });

      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving profile data:', error.message);
      
      if (error.message?.includes('token')) {
        logout();
        navigate('/signin', { replace: true });
      } else {
        setErrorMessage('Failed to save profile data. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser && !loading) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-r-4 border-violet-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-900 pt-20 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Your Profile
          </motion.h1>
          <motion.p 
            className="mt-2 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Manage your personal information and preferences
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <motion.div 
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>

            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/40 flex items-start"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle className="mr-3 text-red-400 mt-0.5" size={18} />
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </motion.div>
              )}

              {successMessage && (
                <motion.div 
                  className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/40 flex items-start"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Check className="mr-3 text-green-400 mt-0.5" size={18} />
                  <p className="text-green-300 text-sm">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Age
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Job Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Data Scientist"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Interested Courses
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookMarked size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={interestedCourses}
                    onChange={(e) => setInterestedCourses(e.target.value)}
                    placeholder="e.g. Machine Learning, Web Development"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <p className="mt-1 text-gray-400 text-xs">
                  Enter courses or topics you're interested in learning (comma separated)
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Liked Courses
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Heart size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={likedCourses}
                    onChange={(e) => setLikedCourses(e.target.value)}
                    placeholder="e.g. Python for Everybody, JavaScript Fundamentals"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <p className="mt-1 text-gray-400 text-xs">
                  Enter courses you've taken and enjoyed in the past (comma separated)
                </p>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`w-full py-3 flex items-center justify-center gap-2 text-white font-semibold rounded-lg transition-all mt-8 ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-violet-500/25"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Profile
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Side Panel */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Account Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-violet-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {name ? name[0]?.toUpperCase() : currentUser.email[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{name || 'User'}</h3>
                  <p className="text-gray-400 text-sm">{currentUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-300 text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <UserCircle2 className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Account ID: {currentUser.id}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Account secure and active</span>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-6 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-white font-medium rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
                >
                  <Settings size={16} />
                  Go to Dashboard
                </motion.button>
              </div>
            </div>
            
            {/* Learning Progress */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
              <h3 className="font-semibold text-white mb-4">Why Complete Your Profile?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-violet-400 text-xs font-bold">1</span>
                  </div>
                  <p className="ml-3 text-gray-400 text-sm">
                    Better course recommendations tailored to your exact needs
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">2</span>
                  </div>
                  <p className="ml-3 text-gray-400 text-sm">
                    Track your learning progress more effectively
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-purple-400 text-xs font-bold">3</span>
                  </div>
                  <p className="ml-3 text-gray-400 text-sm">
                    Get notified about courses that match your interests
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;