import React, { useEffect, useState } from 'react';
import { firestore, auth } from './firebase'; // Ensure paths are correct
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate,NavLink } from 'react-router-dom';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [interestedCourses, setInterestedCourses] = useState('');
  const [likedCourses, setLikedCourses] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate('/signin', { replace: true });
        return;
      }

      try {
        const userDocRef = doc(firestore, 'userData', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setAge(data.age || '');
          setJobRole(data.jobRole || '');
          setInterestedCourses(data.interestedCourses || '');
          setLikedCourses(data.likedCourses || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        setErrorMessage('Failed to fetch user data. Please try again.');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setErrorMessage('You must be logged in to save your profile.');
      return;
    }

    try {
      const userDocRef = doc(firestore, 'userData', user.uid);

      await setDoc(userDocRef, {
        name,
        age,
        jobRole,
        interestedCourses,
        likedCourses,
      }, { merge: true });

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error saving profile data:', error.message);
      setErrorMessage('Failed to save profile data. Please try again.');
    }
  };

  return (
    <div className="bg-gray-800 min-h-screen flex flex-col">
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
            to="/skills"
            className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
            activeClassName="underline"
          >
            My Skills
          </NavLink>
          <NavLink
            to="/profile"
            className="text-white text-lg font-semibold hover:text-gray-300 transition duration-300"
            activeClassName="underline"
          >
            Profile Page
          </NavLink>
        </div>
        <button
          onClick={() => auth.signOut().then(() => navigate('/signin'))}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
      </header>

      {/* Profile Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white bg-opacity-50 p-10 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Profile Page</h2>
          {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-lg">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg">Age:</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg">Job Role:</label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Enter your job role"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg">Interested Courses:</label>
              <input
                type="text"
                value={interestedCourses}
                onChange={(e) => setInterestedCourses(e.target.value)}
                placeholder="Enter interested courses"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg">Liked Courses:</label>
              <input
                type="text"
                value={likedCourses}
                onChange={(e) => setLikedCourses(e.target.value)}
                placeholder="Enter liked courses"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
