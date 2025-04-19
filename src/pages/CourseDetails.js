import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseDetails } from '../service';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin', { replace: true });
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        const data = await getCourseDetails(currentUser.token, courseId);
        setCourseDetails(data);
      } catch (error) {
        console.error('Error fetching course details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, currentUser, navigate]);

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-800 text-white">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-800 text-white">
        <p className="text-xl">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white">

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