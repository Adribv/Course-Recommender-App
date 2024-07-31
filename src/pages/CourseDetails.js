import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseDetail = () => {
  const { userId, courseTitle } = useParams();
  const [courseDetails, setCourseDetails] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user details
    const fetchUser = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.log('No user signed in.');
      }
    };

    fetchUser();

    // Fetch course details
    const fetchCourseDetails = async () => {
      try {
        const docRef = doc(firestore, 'recommendations', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          const course = courses.find(c => c['Course Title'] === decodeURIComponent(courseTitle));
          setCourseDetails(course);
        } else {
          console.log('No course details found.');
        }
      } catch (error) {
        console.error('Error fetching course details:', error.message);
      }
    };

    fetchCourseDetails();
  }, [userId, courseTitle]);

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

  if (!courseDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-800 text-white">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 rounded-b-lg shadow-lg mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <NavLink 
              to="/dashboard" 
              className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
            >
              Dashboard
            </NavLink>
            {user && (
              <NavLink 
                to={`/recommended-courses/${user.uid}`}
                className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
              >
                All Recommended Courses
              </NavLink>
            )}
            <NavLink 
              to="/profile-setup" 
              className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
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
        </div>
      </header>

      {/* Course Details */}
      <div className="container mx-auto p-6">
        <div className="bg-gray-900 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-extrabold mb-4 text-center text-blue-400">{courseDetails['Course Title']}</h1>
          <p className="text-center text-xl text-gray-300 mb-6">{courseDetails.Keyword}</p>
          <div className="space-y-4">
            <p><span className="font-semibold text-blue-300">What you will learn:</span> {courseDetails['What you will learn']}</p>
            <p><span className="font-semibold text-blue-300">Instructor:</span> {courseDetails.Instructor}</p>
            <p><span className="font-semibold text-blue-300">Level:</span> {courseDetails.Level}</p>
            <p><span className="font-semibold text-blue-300">Duration:</span> {courseDetails['Duration to complete (Approx.)']} hours</p>
            <p><span className="font-semibold text-blue-300">Offered By:</span> {courseDetails['Offered By']}</p>
            <p><span className="font-semibold text-blue-300">Rating:</span> {courseDetails.Rating}</p>
            <p><span className="font-semibold text-blue-300">Number of Reviews:</span> {courseDetails['Number of Review']}</p>
            <p><span className="font-semibold text-blue-300">Schedule:</span> {courseDetails.Schedule}</p>
            <p><span className="font-semibold text-blue-300">Modules:</span> {courseDetails.Modules}</p>
          </div>
          <div className="flex justify-center mt-6">
            <a
              href={courseDetails['Course Url']}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Go to Course
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
