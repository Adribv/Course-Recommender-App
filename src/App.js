import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/Login'
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import ProfilePage from './pages/ProfilePage';
import RecommendedCourses from './pages/RecommendedCourses';
// import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/course/:userId/:courseTitle" element={<CourseDetails />} />
        <Route path="/recommended-courses/:userId" element={<RecommendedCourses />} />

        
        {/* <Route path="*" element={<NotFoundPage />} /> For 404 - Page not found */}
      </Routes>
    </Router>
  );
};

export default App;
