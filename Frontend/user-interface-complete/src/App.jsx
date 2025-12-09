import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  redirect,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import UserDashboard from './pages/userDashboard/UserDashboard';
import AdminDashboard from './pages/adminDashboard/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import BookingPage from './pages/BookingPage';
import { useProfile } from './context/ProfileContext';
import { toast, ToastContainer } from 'react-toastify';
import { MdDashboard } from 'react-icons/md';
import { FaUserCircle, FaSignOutAlt, FaEdit } from 'react-icons/fa';

export default function App() {
  const { profile, setProfile, clearProfile } = useProfile();
  
  // It controls whether the user profile dropdown menu is shown or hidden when the user clicks on the profile icon.
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Close profile dropdown whenever token (login/logout) changes
  useEffect(() => {
    setShowProfileMenu(false);
  }, [token]);

  function logout() {
    localStorage.clear();
    clearProfile();
    redirect('/');
    toast.success('Logged out successfully.');
  }

  return (
    <>
      <Router>
        {/* Navbar */}
        <nav className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-md p-4 flex justify-between items-center">
          {/* Brand */}
          <Link
            to="/"
            className="text-3xl font-bold text-white flex items-center gap-2"
          >
            🚌 Bus Booking
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Dashboard link */}
            {token && role && (
              <Link
                to={role === 'ADMIN' ? '/adminDashboard' : '/userDashboard'}
                className="flex items-center gap-2 bg-white text-purple-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
              >
                <MdDashboard className="text-xl" />
                Dashboard
              </Link>
            )}

            {/* Guest: Login / Register */}
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="bg-blue-200 hover:bg-blue-300 text-blue-800 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                >
                  Register
                </Link>
              </>
            ) : (
              /* Logged-in profile dropdown */
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-white text-purple-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                >
                  <FaUserCircle className="text-2xl" />
                  {profile?.fullName || 'Profile'}
                </button>

                {/* Dropdown menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-fadeIn overflow-hidden">
                    {/* Profile header */}
                    {profile && (
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="font-semibold text-lg text-purple-700">{profile.fullName}</div>
                        <div className="text-md text-gray-800">{profile.email}</div>
                        <div className="text-md  text-gray-800">{profile.phoneNumber}</div>
                        <div className="text-md text-gray-800 mt-1">Role: {profile.role}</div>
                      </div>
                    )}

                    {/* Menu options */}
                    <div className="flex flex-col p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FaEdit className="text-lg text-purple-600" />
                        Edit Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <FaSignOutAlt className="text-lg" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/booking/:scheduleId" element={<BookingPage />} />

          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/userDashboard" element={<UserDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/adminDashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
            <Route
              path="/profile"
              element={
                <ProfilePage profile={profile} setProfile={setProfile} />
              }
            />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
