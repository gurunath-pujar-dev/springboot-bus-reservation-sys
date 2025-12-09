import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBus, FaMapMarkerAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { FaInfoCircle } from 'react-icons/fa';
import { MdAccessTime } from 'react-icons/md';
import { AiOutlineCalendar } from 'react-icons/ai';
import { useProfile } from '../context/ProfileContext';

export default function BookingPage() {
  const { scheduleId } = useParams();
  const [busDetails, setBusDetails] = useState(null);
  const [noOfSeats, setNoOfSeats] = useState(1);
  const [passengers, setPassengers] = useState([
    { passengerName: '', age: '', gender: 'M' },
  ]);
  const [bookingResponse, setBookingResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const { getArrivalDate } = useProfile();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:8080/api/schedules/${scheduleId}`,
          { headers: getAuthHeaders() }
        );
        setBusDetails(data);
      } catch {
        toast.error('Failed to load schedule details.');
      }
      setLoading(false);
    };
    fetchScheduleDetails();
  }, [scheduleId]);

  useEffect(() => {
    setPassengers((prev) => {
      const arr = [...prev];
      if (arr.length < noOfSeats) {
        while (arr.length < noOfSeats)
          arr.push({ passengerName: '', age: '', gender: 'M' });
      } else {
        arr.length = noOfSeats;
      }
      return arr;
    });
  }, [noOfSeats]);

  const handlePassengerChange = (idx, field, value) => {
    setPassengers((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });
  };

  const doBooking = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('You must be logged in to book tickets.');
      return;
    }
    setLoading(true);
    try {
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (!p.passengerName.trim())
          throw new Error(`Passenger ${i + 1} name is required.`);
        if (!p.age || isNaN(p.age) || p.age <= 0)
          throw new Error(`Passenger ${i + 1} age must be a positive number.`);
        if (!['M', 'F', 'O'].includes(p.gender))
          throw new Error(`Passenger ${i + 1} gender must be M, F, or O.`);
      }

      const payload = {
        scheduleId: Number(scheduleId),
        noOfSeats: Number(noOfSeats),
        passengers: passengers.map((p) => ({
          passengerName: p.passengerName.trim(),
          age: Number(p.age),
          gender: p.gender,
        })),
      };

      const { data } = await axios.post(
        'http://localhost:8080/api/bookings',
        payload,
        { headers: getAuthHeaders() }
      );
      setBookingResponse(data);
      toast.success('Booking successful!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Booking failed.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-5 flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" /> Bus Details
        </h1>

        {/* ---- CONFIRMATION UI ---- */}
        {bookingResponse ? (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2 mb-5">
              <FaCheckCircle className="text-green-500 text-3xl" /> Booking
              Confirmed!
            </h2>

            {/* Booking Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
                <p>
                  <span className="font-semibold">Booking ID:</span>{' '}
                  {bookingResponse.id}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className="text-green-600 font-bold">
                    {bookingResponse.status}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Time:</span>{' '}
                  {new Date(bookingResponse.bookingTime).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-sm">
                <p>
                  <span className="font-semibold">Seats:</span>{' '}
                  {bookingResponse.noOfSeats}
                </p>
                <p>
                  <span className="font-semibold ">Total : </span>
                  <span className="text-xl font-semibold text-blue-700">
                    ₹{bookingResponse.totalAmount.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            {/* Bus Details */}
            <div className="mb-6">
              <div className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col gap-3 text-sm md:text-base">
                <p className="font-semibold">
                  {bookingResponse.schedule.bus.busName} (
                  {bookingResponse.schedule.bus.busNumber},{' '}
                  {bookingResponse.schedule.bus.busType})
                </p>

                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" />
                  {bookingResponse.schedule.route.fromLocation} →{' '}
                  {bookingResponse.schedule.route.toLocation}
                </p>

                {/* DEPARTURE & ARRIVAL CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
                    <h4 className="font-semibold text-green-600 mb-2">
                      Departure
                    </h4>
                    <p className="flex items-center gap-2">
                      <AiOutlineCalendar className="text-purple-500" />
                      {bookingResponse.schedule.travelDate}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <MdAccessTime className="text-yellow-500" />
                      {bookingResponse.schedule.departure}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
                    <h4 className="font-semibold text-blue-600 mb-2">
                      Arrival
                    </h4>
                    <p className="flex items-center gap-2">
                      <AiOutlineCalendar className="text-purple-500" />
                      {getArrivalDate(
                        bookingResponse.schedule.departure,
                        bookingResponse.schedule.arrival,
                        bookingResponse.schedule.travelDate
                      )}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <MdAccessTime className="text-yellow-500" />
                      {bookingResponse.schedule.arrival}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-5 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-green-700">
                <FaUsers className="text-green-600" /> Passengers
              </h3>
              <ul className="space-y-3">
                {bookingResponse.passengers.map((p) => (
                  <li
                    key={p.passengerId}
                    className="bg-white px-5 py-3 rounded-md flex justify-between items-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <span className="font-semibold text-gray-800">
                      {p.passengerName}
                    </span>
                    <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-300">
                      ID: {p.passengerId} | Age: {p.age} | {p.gender} | Seat:{' '}
                      {p.seatNumber}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <Link to="/">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-transform hover:scale-105">
                  New Booking
                </button>
              </Link>
              <Link to="/userDashboard">
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-transform hover:scale-105">
                  View My Journeys
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Bus Details Card */}
            {busDetails && (
              <div className=" mb-8 bg-blue-50 rounded-xl px-6 py-5 shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2 mb-2">
                  <FaBus className="text-blue-600" /> {busDetails.bus.busName} (
                  {busDetails.bus.busNumber}, {busDetails.bus.busType})
                </h2>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <FaMapMarkerAlt className="text-blue-500" />{' '}
                  {busDetails.route.fromLocation} →{' '}
                  {busDetails.route.toLocation}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
                    <h4 className="font-semibold text-green-600 mb-2">
                      Departure
                    </h4>
                    <p className="flex items-center gap-2">
                      <AiOutlineCalendar className="text-purple-500" />
                      {busDetails.travelDate}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <MdAccessTime className="text-yellow-500" />
                      {busDetails.departure}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
                    <h4 className="font-semibold text-blue-600 mb-2">
                      Arrival
                    </h4>
                    <p className="flex items-center gap-2">
                      <AiOutlineCalendar className="text-purple-500" />
                      {getArrivalDate(
                        busDetails.departure,
                        busDetails.arrival,
                        busDetails.travelDate
                      )}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <MdAccessTime className="text-yellow-500" />
                      {busDetails.arrival}
                    </p>
                  </div>
                </div>
                <p className="flex items-center gap-2 text-gray-700 mt-3">
                  <FaUsers className="text-blue-500" /> Available Seats:{' '}
                  {busDetails.availableSeats}
                  <span className="ml-2 font-semibold text-lg  ml-18 text-gray-600">
                    ₹{busDetails.route.price.toFixed(2)}
                  </span>{' '}
                </p>
              </div>
            )}

            {/* Booking Form */}
            <form
              onSubmit={doBooking}
              className="space-y-4 p-6 bg-white rounded-xl shadow-lg border border-gray-200"
            >
              {/* Number of Seats */}
              <div>
                <label className="block mb-2 text-lg font-semibold text-gray-700">
                  Number of Seats
                </label>
                <input
                  type="number"
                  min={1}
                  max={busDetails?.availableSeats || 6}
                  value={noOfSeats}
                  onChange={(e) => setNoOfSeats(Number(e.target.value))}
                  className="w-28 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                  required
                />
              </div>

              {/* Passenger Details */}
              <div>
                <label className="block mb-2 text-lg font-semibold text-gray-700">
                  Passenger Details
                </label>
                <div className="space-y-2">
                  {passengers.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 flex-wrap p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <input
                        type="text"
                        placeholder={`Passenger ${idx + 1} Name`}
                        value={p.passengerName}
                        onChange={(e) =>
                          handlePassengerChange(
                            idx,
                            'passengerName',
                            e.target.value
                          )
                        }
                        className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Age"
                        min="1"
                        value={p.age}
                        onChange={(e) =>
                          handlePassengerChange(idx, 'age', e.target.value)
                        }
                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                        required
                      />
                      <select
                        value={p.gender}
                        onChange={(e) =>
                          handlePassengerChange(idx, 'gender', e.target.value)
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                      >
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-md transition duration-300"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
