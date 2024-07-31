import React, { useEffect, useState } from 'react';
import { firestore, auth } from './firebase'; // Ensure the paths are correct
import { useNavigate, NavLink } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

const ProfileSetup = () => {
  const [careerGoals, setCareerGoals] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null); // State to store user info
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        // Redirect to sign-in if not logged in
        navigate('/signin', { replace: true });
      } else {
        setUser(user); // Set user in state
      }
    });
    return () => unsubscribe(); // Clean up subscription on unmount
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage('You must be logged in to save your profile.');
      return;
    }

    try {
      // Create a reference to the document with the user's UID
      const userDocRef = doc(firestore, 'userData', user.uid);

      // Set the data in Firestore
      await setDoc(userDocRef, {
        careerGoals,
        skills,
        interests,
      });

      // Call the backend API to generate recommendations
      const response = await fetch(`https://course-backend-1.onrender.com/recommend?user_id=${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      // Navigate to the dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error saving profile or generating recommendations:', error.message);
      setErrorMessage('Failed to save profile or generate recommendations. Please try again.');
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

      {/* Profile Setup Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white bg-opacity-50 p-10 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Profile Setup</h2>
          {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-lg">Career Goals:</label>
              <input
                type="text"
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="e.g. Become a data scientist, Lead a tech team"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg">Skills:</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="e.g. Python, React, Machine Learning"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg">Interests:</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="e.g. AI, Web Development, Data Analysis"
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

export default ProfileSetup;
