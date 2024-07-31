import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { firestore, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const RecommendedCourses = () => {
  const { userId } = useParams();
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null); // State to store user info
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      try {
        const docRef = doc(firestore, 'recommendations', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const coursesList = docSnap.data().courses;
          setCourses(coursesList);
        } else {
          console.log('No recommendations found.');
        }
      } catch (error) {
        console.error('Error fetching recommended courses:', error.message);
      }
    };

    fetchRecommendedCourses();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user); // Set user in state
      } else {
        navigate('/signin', { replace: true });
      }
    });
    return () => unsubscribe(); // Clean up subscription on unmount
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
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
          {user && (
            <NavLink 
              to={`/recommended-courses/${user.uid}`}
              className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
              activeClassName="underline"
            >
              All Recommended Courses
            </NavLink>
          )}
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

      {/* Recommended Courses */}
      <div className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Recommended Courses</h1>
        <ul className="space-y-4">
          {courses.map((course) => (
            <li key={course['Course Title']} className="p-4 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{course['Course Title']}</h2>
              <p className="text-gray-400 mb-4">{course.Keyword}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate(`/course/${user.uid}/${encodeURIComponent(course['Course Title'])}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  View Details
                </button>
                <a
                  href={course['Course Url']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Go to Course
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecommendedCourses;
