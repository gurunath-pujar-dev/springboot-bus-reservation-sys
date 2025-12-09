import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBus, FaUsers, FaTrash } from 'react-icons/fa';
import { AiOutlineCalendar } from 'react-icons/ai';
import { MdAccessTime } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useProfile } from '../../context/ProfileContext';
import { useNavigate } from 'react-router-dom';

export default function MyBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getArrivalDate } = useProfile();
  const navigate = useNavigate();

  // Track expanded bookings to toggle passenger list visibility
  const [expandedBookings, setExpandedBookings] = useState({});

  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/bookings/user', {
        headers: getAuthHeaders(),
      });
      setBookings(res.data);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(bookingId) {
    setExpandedBookings((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">My Booking History</h2>

      {loading ? (
        <p>Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="text-center bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl shadow-md border border-blue-200">
          <p className="text-gray-500 italic text-xl mb-3">You have not made any bookings yet.</p>
          <p className="text-gray-700 text-base sm:text-lg mb-6">
            Ready to plan your first journey? Book your tickets now and start traveling! 🚍
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <FaBus className="text-white text-lg" />
            Book a Journey
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {bookings
            .sort((a, b) => b.id - a.id)
            .map((booking) => {
              const isExpanded = !!expandedBookings[booking.id];
              return (
                <div
                  key={booking.id}
                  className="rounded-xl shadow bg-white px-6 py-6 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <FaBus className="text-blue-600 text-xl" />
                    <span className="font-semibold text-lg text-blue-800">Booking #{booking.id}</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Bus Name + Number/Type */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="font-bold text-purple-700 text-xl">{booking.schedule.bus.busName}</span>
                    <span className="font-bold text-purple-700 text-sm">
                      ({booking.schedule.bus.busNumber}, {booking.schedule.bus.busType})
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="font-bold text-orange-500 text-lg">
                      {booking.schedule.route.fromLocation} → {booking.schedule.route.toLocation}
                    </span>
                  </div>

                  {/* Departure & Arrival */}
                  <div className="flex items-start gap-2">
                    <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-semibold text-sm shadow-sm">
                      <AiOutlineCalendar /> {booking.schedule.travelDate} | <MdAccessTime />{' '}
                      {booking.schedule.departure}
                    </span>
                    <span className="text-gray-500 text-xl">|</span>
                    <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-700 font-semibold text-sm shadow-sm">
                      <AiOutlineCalendar />{' '}
                      {getArrivalDate(
                        booking.schedule.departure,
                        booking.schedule.arrival,
                        booking.schedule.travelDate
                      )}{' '}
                      | <MdAccessTime /> {booking.schedule.arrival}
                    </span>
                  </div>

                  {/* Distance & Total */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-gray-700 font-semibold">
                      {booking.schedule.route.distanceKm} Km
                    </span>
                    <span>
                      Total Amount:{' '}
                      <span className="text-purple-700 text-lg">
                        <b>₹{booking.totalAmount}</b>
                      </span>
                    </span>
                  </div>

                  {/* Toggle Passenger List Button */}
                  <button
                    className="self-start mt-3 px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
                    onClick={() => toggleExpand(booking.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`passenger-list-${booking.id}`}
                  >
                    {isExpanded ? 'Hide Passengers' : 'Show Passengers'}
                  </button>

                  {/* Passenger List Card */}
                  {isExpanded && (
                    <div
                      id={`passenger-list-${booking.id}`}
                      className="mt-4 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 shadow-sm"
                    >
                      <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                        <FaUsers className="text-orange-400" /> Passengers
                      </h4>
                      <ul className="space-y-3">
                        {booking.passengers.map((p) => (
                          <li
                            key={p.passengerId}
                            className="bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition duration-200"
                          >
                            <div className="font-semibold text-gray-800 text-md">{p.passengerName}</div>
                            <div className="text-sm text-gray-700 mt-1">
                              ID: <span className="font-medium">{p.passengerId}</span> | Age:{' '}
                              <span className="font-medium">{p.age}</span> |{' '}
                              <span className="capitalize">{p.gender}</span> | Seat No:{' '}
                              <span className="font-medium text-gray-700">{p.seatNumber}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}
