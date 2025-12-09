import React, { useState } from 'react';
import { FaHome, FaUserCircle } from 'react-icons/fa';
import UpcomingJourney from './UpcomingJourney';
// import UpcomingJourney1 from './UpcomingJourney1';
import MyBookingHistory from './MyBookingHistory';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      {/* <header className="bg-white shadow flex items-center justify-between px-7 py-4">
        <div className="flex items-center gap-20">
          <span className="text-3xl font-extrabold text-blue-700 tracking-tight">
            User Dashboard
          </span>
          <button
            className="text-2xl text-blue-600 hover:bg-blue-100 rounded-full p-2"
            title="Go to Home Page"
            onClick={() => navigate("/")}
          >
            <FaHome />
          </button>
        </div>
        <button className="flex items-center space-x-2 text-blue-700 font-semibold text-lg hover:bg-blue-100 px-3 py-2 rounded">
          <FaUserCircle className="text-2xl" />
          <span>Profile</span>
        </button>
      </header> */}

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-100 via-white to-purple-100 shadow flex px-7 py-3 gap-2">
        <button
          className={`font-semibold px-5 py-2 rounded-lg text-lg transition ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow'
              : 'hover:bg-blue-200 text-blue-700'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Journey
        </button>
        <button
          className={`font-semibold px-5 py-2 rounded-lg text-lg transition ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow'
              : 'hover:bg-blue-200 text-blue-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          My Booking History
        </button>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-3 py-6">
        {/* {activeTab === 'upcoming' && <UpcomingJourney />} */}
        {activeTab === 'upcoming' && <UpcomingJourney />}
        {activeTab === 'history' && <MyBookingHistory />}
      </main>
    </div>
  );
}
