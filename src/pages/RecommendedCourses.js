import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Compass, 
  Star, 
  Filter, 
  Search, 
  ExternalLink, 
  Clock, 
  RotateCcw,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../service';

const RecommendedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    level: '',
    rating: 0,
    duration: '',
    topics: []
  });
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Handle clicks outside the filter panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin', { replace: true });
      return;
    }

    const fetchRecommendedCourses = async () => {
      try {
        setLoading(true);
        const data = await getRecommendations(currentUser.token);
        setCourses(data);
        setFilteredCourses(data);
        // console.log('Recommended courses:', data);
      } catch (error) {
        console.error('Error fetching recommended courses:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, [currentUser, navigate]);

  // Apply filters and search
  useEffect(() => {
    let result = [...courses];
    
    // Apply search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(course => 
        course['Course Title']?.toLowerCase().includes(search) || 
        course['Keyword']?.toLowerCase().includes(search) ||
        course['Instructor']?.toLowerCase().includes(search)
      );
    }
    
    // Apply level filter
    if (filters.level) {
      result = result.filter(course => course.Level === filters.level);
    }
    
    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter(course => parseFloat(course.Rating) >= filters.rating);
    }
    
    // Apply duration filter
    if (filters.duration) {
      if (filters.duration === 'short') {
        result = result.filter(course => parseFloat(course['Duration to complete (Approx.)']) <= 10);
      } else if (filters.duration === 'medium') {
        result = result.filter(course => 
          parseFloat(course['Duration to complete (Approx.)']) > 10 && 
          parseFloat(course['Duration to complete (Approx.)']) <= 30
        );
      } else if (filters.duration === 'long') {
        result = result.filter(course => parseFloat(course['Duration to complete (Approx.)']) > 30);
      }
    }
    
    // Apply topic filters
    if (filters.topics && filters.topics.length > 0) {
      result = result.filter(course => {
        const keywords = course['Keyword']?.toLowerCase() || '';
        return filters.topics.some(topic => keywords.includes(topic.toLowerCase()));
      });
    }
    
    setFilteredCourses(result);
  }, [searchTerm, filters, courses]);

  // Extract unique topics/keywords
  const getUniqueTopics = () => {
    const allTopics = courses.flatMap(course => 
      (course.Keyword || '').split(',').map(k => k.trim())
    ).filter(Boolean);
    
    return [...new Set(allTopics)].slice(0, 15); // Limit to 15 most common topics
  };

  const resetFilters = () => {
    setFilters({
      level: '',
      rating: 0,
      duration: '',
      topics: []
    });
    setSearchTerm('');
  };

  const toggleTopicFilter = (topic) => {
    setFilters(prev => {
      if (prev.topics.includes(topic)) {
        return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      } else {
        return { ...prev, topics: [...prev.topics, topic] };
      }
    });
  };

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-r-4 border-violet-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-lg">Loading recommended courses...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-900 text-white pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Recommended Courses
              </h1>
              <p className="text-gray-400 mt-1">
                Discover courses tailored to your profile and preferences
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/profile-setup')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
              >
                <Compass size={16} />
                <span>Refine Preferences</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses by title, keywords, or instructor"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-300 transition-all w-full sm:w-auto justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span>Filters</span>
                </div>
                <ChevronDown size={16} className={`transform transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Filter Panel */}
              {filterOpen && (
                <motion.div 
                  className="absolute right-0 mt-2 w-72 sm:w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-300">Filter Courses</h3>
                      <button 
                        onClick={resetFilters}
                        className="text-gray-400 hover:text-violet-400 flex items-center gap-1 text-sm"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Level Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Level</label>
                        <select
                          value={filters.level}
                          onChange={(e) => setFilters({...filters, level: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                          <option value="">All Levels</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>
                      
                      {/* Rating Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Rating</label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={filters.rating}
                            onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                          />
                          <span className="ml-2 min-w-[30px] text-center text-gray-300">
                            {filters.rating > 0 ? filters.rating : 'Any'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Duration Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
                        <div className="flex gap-2">
                          {['short', 'medium', 'long'].map((duration) => (
                            <button
                              key={duration}
                              onClick={() => setFilters({...filters, duration: filters.duration === duration ? '' : duration})}
                              className={`px-3 py-1.5 text-xs rounded-md capitalize flex-1 ${
                                filters.duration === duration 
                                  ? 'bg-violet-600 text-white' 
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {duration === 'short' ? '< 10h' : duration === 'medium' ? '10-30h' : '> 30h'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Topics Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Topics</label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2">
                          {getUniqueTopics().map((topic) => (
                            <button
                              key={topic}
                              onClick={() => toggleTopicFilter(topic)}
                              className={`px-2 py-1 text-xs rounded-md ${
                                filters.topics.includes(topic)
                                  ? 'bg-violet-600 text-white' 
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Course List */}
        {filteredCourses.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <BookOpen className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No courses found</h3>
            <p className="text-gray-400 max-w-md">
              No courses match your current filters. Try adjusting your search criteria or resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={16} />
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id || index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-violet-900/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2">
                      {course.Level && (
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          course.Level === 'Beginner' ? 'bg-green-600/20 text-green-400 border border-green-600/30' :
                          course.Level === 'Intermediate' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' :
                          course.Level === 'Advanced' ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
                          'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                        }`}>
                          {course.Level}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {parseFloat(course.Rating) > 0 && (
                        <>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < Math.floor(course.Rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} 
                              />
                            ))}
                          </div>
                          <span className="text-gray-400 text-xs ml-1">{course.Rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2 h-14">
                    {course['Course Title']}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 mb-4 min-h-[28px]">
                    {course.Keyword && course.Keyword.split(',').slice(0, 3).map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                    {course.Keyword && course.Keyword.split(',').length > 3 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-700 text-gray-400">
                        +{course.Keyword.split(',').length - 3}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 h-18">
                    {course['What you will learn'] || 'No description available'}
                  </p>
                  
                  <div className="flex items-center text-gray-400 text-xs gap-4 mb-4">
                    {course['Duration to complete (Approx.)'] && (
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{course['Duration to complete (Approx.)']} hours</span>
                      </div>
                    )}
                    
                    {course.Instructor && (
                      <div className="flex-1 truncate">
                        <span className="text-gray-500">By:</span> {course.Instructor}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                    >
                      <BookOpen size={16} />
                      <span>Details</span>
                    </motion.button>
                    
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={course['Course Url']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex no-underline text-white items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 rounded-lg transition-colors text-sm"
                    >
                      <ExternalLink size={16} />
                      <span>Enroll</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecommendedCourses;