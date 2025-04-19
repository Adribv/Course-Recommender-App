import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Code, 
  BrainCircuit, 
  Sparkles, 
  Check, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { saveUserProfile, getUserProfile } from "../service";

const ProfileSetup = () => {
  const [careerGoals, setCareerGoals] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Fetch existing profile data
  useEffect(() => {
    if (!currentUser) {
      navigate("/signin", { replace: true });
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await getUserProfile(currentUser.token);
        console.log("Profile Data:", profileData);  
        
        if (profileData) {
          setCareerGoals(profileData.career_goals || "");
          setSkills(profileData.skills || "");
          setInterests(profileData.interests || "");
        }
        
        setProfileLoaded(true);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.message?.includes("token")) {
          logout();
          navigate("/signin", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser, navigate, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentUser) {
      setErrorMessage("You must be logged in to save your profile.");
      navigate("/signin", { replace: true });
      return;
    }

    try {
      setIsSubmitting(true);
      // Save profile data using API
      await saveUserProfile(currentUser.token, {
        career_goals: careerGoals,
        skills,
        interests,
      });

      setSuccessMessage("Profile updated successfully!");
      
      // Show success message for 2 seconds before navigating
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error("Error saving profile:", error.message);

      // If it's a token error, redirect to login
      if (
        error.message?.includes("session has expired") ||
        error.message?.includes("Invalid token")
      ) {
        logout();
        navigate("/signin", { replace: true });
      } else {
        setErrorMessage("Failed to save profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser && !loading) {
    navigate("/signin", { replace: true });
    return null;
  }

  // Loading state
  if (loading && !profileLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Complete Your Profile
          </motion.h1>
          <motion.p 
            className="mt-2 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Help us tailor course recommendations specifically for you
          </motion.p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <motion.div 
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-6">Your Learning Profile</h2>

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
                  Career Goals
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Target size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    placeholder="e.g. Become a data scientist, Lead a tech team"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <p className="mt-1 text-gray-400 text-xs">
                  What are you aiming to achieve in your career?
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Skills
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Code size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Python, React, Machine Learning"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <p className="mt-1 text-gray-400 text-xs">
                  What skills do you already have? Separate multiple with commas.
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Interests
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sparkles size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. AI, Web Development, Data Analysis"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <p className="mt-1 text-gray-400 text-xs">
                  What topics interest you? Separate multiple with commas.
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
                    Updating Profile...
                  </>
                ) : (
                  <>Save Profile</>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Information Panel */}
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <BrainCircuit className="h-14 w-14 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Why This Matters</h3>
            </div>

            <div className="space-y-4 text-gray-300 text-sm">
              <p>
                The information you provide helps our recommendation system understand your needs better. This enables us to suggest courses that are truly relevant to your career path.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-violet-400 text-xs font-bold">1</span>
                  </div>
                  <p className="ml-3 text-gray-400">
                    <span className="text-gray-300 font-medium">Career Goals</span> help us 
                    understand where you want to go professionally.
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">2</span>
                  </div>
                  <p className="ml-3 text-gray-400">
                    <span className="text-gray-300 font-medium">Skills</span> tell us 
                    what you already know so we don't suggest courses that are too basic.
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-purple-400 text-xs font-bold">3</span>
                  </div>
                  <p className="ml-3 text-gray-400">
                    <span className="text-gray-300 font-medium">Interests</span> ensure 
                    we recommend courses that will keep you engaged and motivated.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className="font-medium text-gray-300 mb-3">What's Next?</h4>
              <p className="text-gray-400 text-sm mb-4">
                After saving your profile, you'll immediately get personalized course recommendations based on your inputs.
              </p>
              <motion.button
                whileHover={{ x: 5 }}
                onClick={() => navigate('/dashboard')}
                className="w-full text-left px-4 py-3 flex items-center justify-between rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-colors"
              >
                <span>Skip to Dashboard</span>
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSetup;