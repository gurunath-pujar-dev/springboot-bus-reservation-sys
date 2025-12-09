import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaChevronDown,
  FaChevronUp,
  FaTicketAlt,
  FaUser,
  FaRupeeSign,
  FaChair,
} from 'react-icons/fa';
import { AiOutlineCalendar } from 'react-icons/ai';
import { MdAccessTime } from 'react-icons/md';
import { useProfile } from '../../context/ProfileContext';

export default function BookingHistorySection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModalId, setShowModalId] = useState(null);
  const { getArrivalDate } = useProfile();

  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const { data } = await axios.get(
        'http://localhost:8080/api/bookings/admin/all',
        { headers: getAuthHeaders() }
      );
      setBookings(Array.isArray(data) ? data : data.data || []);
    } finally {
      setLoading(false);
    }
  }

  function toggleModal(id) {
    setShowModalId((prev) => (prev === id ? null : id));
  }

  const modalBooking = bookings.find((b) => b.id === showModalId);

  return (
    <section>
      <div className="mb-6">
        <span className="text-2xl font-bold text-blue-700">
          Booking History
        </span>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500 italic">No bookings found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl shadow-md px-6 py-5 border border-gray-200"
            >
              {/* Top Row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <FaTicketAlt className="text-purple-600" />
                  <span className="text-blue-600">Booking #{b.id}</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-sm font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <button
                  onClick={() => toggleModal(b.id)}
                  className="flex items-center gap-2 text-blue-700 px-3 py-1 font-semibold rounded hover:bg-blue-100 transition"
                >
                  {showModalId === b.id ? (
                    <>
                      <FaChevronUp /> Hide Details
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> Show Details
                    </>
                  )}
                </button>
              </div>

              {/* Summary Row */}
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-gray-700 text-sm">
                <span className="flex items-center gap-1">
                  <FaUser className="text-blue-500" /> User ID: {b.userId}
                </span>
                <span className="flex items-center gap-1">
                  <AiOutlineCalendar className="text-green-500" />{' '}
                  {new Date(b.bookingTime).toLocaleString()}
                </span>
                <span className="flex items-center gap-1 font-semibold text-green-700">
                  <FaRupeeSign /> {b.totalAmount}
                </span>
                <span className="flex items-center gap-1">
                  <FaChair className="text-gray-400" /> Seats: {b.noOfSeats}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowModalId(null)}
              className="absolute right-4 top-3 text-3xl text-gray-400 hover:text-red-500 transition"
              title="Close"
            >
              ×
            </button>

            {/* Title */}
            <div className="flex items-center gap-2 font-bold text-xl text-blue-700 mb-5 border-b pb-3">
              <FaTicketAlt className="text-purple-600 text-2xl" />
              Booking #{modalBooking.id}
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                  modalBooking.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {modalBooking.status}
              </span>
            </div>

            {/* Booking Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                Booking Info
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500" /> User ID:{' '}
                  {modalBooking.userId}
                </div>
                <div className="flex items-center gap-2">
                  <FaRupeeSign className="text-green-500" />
                  Amount: <b>₹{modalBooking.totalAmount}</b>
                </div>
                <div className="flex items-center gap-2">
                  <AiOutlineCalendar className="text-green-500" />
                  Booked On:{' '}
                  {new Date(modalBooking.bookingTime).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <FaChair className="text-orange-500" /> No. of Seats:{' '}
                  {modalBooking.noOfSeats}
                </div>
              </div>
            </div>

            {/* Bus Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-5 shadow-sm">
              <h3 className="font-semibold  text-gray-700 mb-3 border-b pb-2">
                Bus Details
              </h3>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-800">Bus:</span>
                  <span className="text-blue-700 font-medium">
                    {modalBooking.schedule.bus.busName}
                  </span>
                  <span className="text-gray-500">
                    ({modalBooking.schedule.bus.busNumber})
                  </span>
                  <span className="rext-semibold text-cyan-700">
                    ({modalBooking.schedule.bus.busType})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-800">Route:</span>
                  <span className="text-purple-700 font-medium">
                    {modalBooking.schedule.route.fromLocation}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-700 font-medium">
                    {modalBooking.schedule.route.toLocation}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex flex-wrap gap-3 mt-1 items-center">
                    <div className="flex items-start gap-2">
                      <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-semibold text shadow-sm">
                        <AiOutlineCalendar /> {modalBooking.schedule.travelDate}{' '}
                        |
                        <MdAccessTime /> {modalBooking.schedule.departure}
                      </span>
                      <span className="text-gray-500 text-xl ">|</span>

                      <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-700 font-semibold  text shadow-sm">
                        <AiOutlineCalendar />{' '}
                        {getArrivalDate(
                          modalBooking.schedule.departure,
                          modalBooking.schedule.arrival,
                          modalBooking.schedule.travelDate
                        )}{' '}
                        |
                        <MdAccessTime /> {modalBooking.schedule.arrival}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-sm"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger List */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                Passengers
              </h3>
              <ul className="space-y-2">
                {modalBooking.passengers.map((p, index) => (
                  <li
                    key={p.passengerId}
                    className={`flex flex-wrap items-center gap-4 p-3 rounded-lg ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    } shadow-sm`}
                  > 
                  
                    <span className="flex items-center gap-1 font-semibold text-blue-700">
                      <FaUser /> {p.passengerName}
                    </span>
                     <span className="flex items-center gap-1 text-gray-600 text-sm">
                      ID:{p.passengerId}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 text-sm">
                      Age {p.age}
                    </span>
                
                    <span
                      className={`flex items-center gap-1 text-sm font-medium ${
                        p.gender.toLowerCase() === 'male'
                          ? 'text-blue-600'
                          : p.gender.toLowerCase() === 'female'
                          ? 'text-pink-600'
                          : 'text-gray-600'
                      }`}
                    >
                      ⚥ {p.gender}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 text-sm">
                      Seat No: {p.seatNumber}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
