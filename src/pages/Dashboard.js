import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { auth, firestore } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || 'User',
          email: currentUser.email,
          uid: currentUser.uid,
        });

        await fetchCourses(currentUser.uid);
      } else {
        console.log('No user is logged in.');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCourses = async (userId) => {
    try {
      const docRef = doc(firestore, 'recommendations', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCourses(docSnap.data().courses);
      } else {
        console.log('No recommendations found for this user.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error.message);
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out.');
        navigate('/signin');
      })
      .catch((error) => {
        console.error('Error signing out:', error.message);
      });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + courses.length) % courses.length);
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please enter your feedback.");
      return;
    }

    try {
      const feedbackDoc = doc(firestore, 'feedback', user.uid);
      await setDoc(feedbackDoc, { text: feedback, timestamp: new Date() }, { merge: true });
      alert("Feedback submitted successfully!");
      setFeedback(''); // Clear the feedback input after submission
    } catch (error) {
      console.error("Error submitting feedback:", error.message);
      alert("There was an error submitting your feedback. Please try again later.");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">
        <p>No recommended courses available at this time.</p>
      </div>
    );
  }

  const currentCourse = courses[currentIndex];

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <div className="container mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 rounded-lg shadow-lg mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <NavLink 
              to="/dashboard" 
              className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
              activeClassName="underline"
            >
              Dashboard
            </NavLink>
            <NavLink 
              to={`/recommended-courses/${user.uid}`}
              className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
              activeClassName="underline"
            >
              All Recommended Courses
            </NavLink>
            <NavLink 
              to="/profile-setup" 
              className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
              activeClassName="underline"
            >
              My Profile
            </NavLink>
            
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </header>

        {/* Welcome and User Info */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back, {user.name}!</h1>
          <p className="text-lg text-gray-400">Email: {user.email}</p>
        </div>

        {/* Recommended Courses Section */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Recommended Courses</h2>
          <div className="flex justify-center items-center space-x-4">
            <button 
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105" 
              onClick={handlePrev}
            >
              Previous
            </button>
            <div className="max-w-lg">
              <div className="p-6 bg-gray-700 rounded-lg shadow-md transition duration-500 hover:shadow-xl">
                <h3 
                  className="text-xl font-bold cursor-pointer mb-2"
                  onClick={() => navigate(`/course/${user.uid}/${encodeURIComponent(currentCourse['Course Title'])}`)}
                >
                  {currentCourse['Course Title']}
                </h3>
                <p className="text-gray-300 mb-4">Rating: {currentCourse.Rating || 'N/A'}</p>
                <a
                  href={currentCourse['Course Url']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  View Course
                </a>
              </div>
            </div>
            <button 
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105" 
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>

        {/* Careers and Certifications Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">Recommended Careers</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Data Scientist</li>
              <li>Machine Learning Engineer</li>
              <li>Software Developer</li>
            </ul>
          </section>
          <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">Professional Certifications</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Google Data Analytics Professional Certificate</li>
              <li>Microsoft Certified: Azure AI Fundamentals</li>
              <li>AWS Certified Solutions Architect</li>
            </ul>
          </section>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">Your Feedback</h2>
          <p className="text-gray-400 mb-4">We value your feedback! Let us know how these recommendations are working for you.</p>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-black" 
            rows="4" 
            placeholder="Leave your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
          <button 
            onClick={submitFeedback}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
