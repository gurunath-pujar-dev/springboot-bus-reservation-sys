import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaBus,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaClock,
  FaRoad,
  FaCalendarAlt,
  FaCouch,
  FaUser,
} from 'react-icons/fa';
import { useProfile } from '../context/ProfileContext';


export default function HomePage() {
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const { getArrivalDate } = useProfile();

  // Suggestions state
  const [allSources, setAllSources] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [filteredSources, setFilteredSources] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  // Fetch available routes once
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/route/all');
        if (res.data.success && res.data.data) {
          const sources = [
            ...new Set(res.data.data.map((r) => r.fromLocation)),
          ].sort();
          const destinations = [
            ...new Set(res.data.data.map((r) => r.toLocation)),
          ].sort();
          setAllSources(sources);
          setAllDestinations(destinations);
        }
      } catch (err) {
        console.error('Error fetching route list', err);
      }
    };
    fetchRoutes();
  }, []);

  // Handlers for typing in Source/To fields
  const handleSourceChange = (value) => {
    setSource(value);
    if (value.trim().length > 0) {
      setFilteredSources(
        allSources.filter((loc) =>
          loc.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredSources([]);
    }
  };

  const handleDestinationChange = (value) => {
    setDestination(value);
    if (value.trim().length > 0) {
      setFilteredDestinations(
        allDestinations.filter((loc) =>
          loc.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredDestinations([]);
    }
  };

  const handleSearch = async () => {
    if (!source || !destination) {
      toast.error('Please enter both source and destination', {
        position: 'top-center',
      });
      return;
    }
    setLoading(true);
    try {
      let url = `http://localhost:8080/api/search?source=${source}&destination=${destination}`;
      if (date) {
        url += `&date=${date}`;
      }
      const { data } = await axios.get(url);
      setBuses(data.success ? data.data : []);
    } catch (err) {
      toast.error('Error fetching buses');
      setBuses([]);
    }
    setLoading(false);
  };

  const handleBook = (scheduleId) => {
    const isLoggedIn = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (role === 'ADMIN') {
      toast.error('Admin is not allowed to make bookings.', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }
    if (isLoggedIn) {
      navigate(`/booking/${scheduleId}`);
    } else {
      navigate('/login');
    }
  };

  // Convert minutes to hh:mm
  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} hr ${m > 0 ? `${m} min` : ''}`.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-blue-50 via-white to-purple-100 ">
      <main className="flex flex-col  items-center justify-center py-4 px-4">
        {/* === Title === */}
        <h1 className="text-4xl md:text-4xl font-extrabold text-gray-900 mt-0 text-center leading-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Find Your Perfect Journey
          </span>
        </h1>

        <p className="text-lg md:text-1xl text-gray-600 mb-6 text-center mt-3 max-w-2xl mx-auto">
          Search and book bus tickets across India with
          <span className="font-semibold text-blue-600"> ease</span> and
          <span className="font-semibold text-purple-500"> comfort</span>.
        </p>

        {/* === Search Box === */}
        <div className="bg-white rounded-2xl shadow-xl p-6  max-w-lg w-full mt-1 border border-gray-100">
          <h2 className="text-2xl font-extrabold mb-1 text-center leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Find Your Perfect Ride
            </span>
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-lg font-semibold mb-1 tracking-wide bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                From
              </label>
              <input
                type="text"
                placeholder="Enter source city"
                value={source}
                onChange={(e) => handleSourceChange(e.target.value)}
                list="from-location-list"
                autoComplete="off"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-300 
                  hover:border-blue-400 transition placeholder-gray-400"
              />
              {filteredSources.length > 0 && (
                <datalist id="from-location-list">
                  {filteredSources.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-0 tracking-wide bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                To
              </label>
              <input
                type="text"
                placeholder="Enter destination city"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                list="to-location-list"
                autoComplete="off"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-purple-300 
                  hover:border-purple-400 transition placeholder-gray-400"
              />
              {filteredDestinations.length > 0 && (
                <datalist id="to-location-list">
                  {filteredDestinations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 tracking-wide bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Date
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-pink-300 
                  hover:border-pink-400 transition"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 hover:shadow-xl transition-all duration-200"
          >
            🔍 Search Buses
          </button>
        </div>

        {/* === Results Section === */}
        <div className="mt-8 w-full max-w-4xl">
          {loading && (
            <p className="text-center text-blue-600 text-lg font-medium animate-pulse">
              Loading buses...
            </p>
          )}

          {!loading && buses.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
              <div className="flex flex-col  bg-blue-50 gap-5">
                {buses.map((bus) => (
                  <>
                    <div
                      key={bus.scheduleId}
                      className="rounded-xl bg-white p-6 flex flex-col gap-4 shadow hover:shadow-lg transition sm:flex-row sm:justify-between sm:items-center border border-gray-100"
                    >
                      {/* Left: Main Info */}
                      <div className="flex-1">
                        {/* Bus Name */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <FaBus className="text-orange-600 text-lg" />
                          <span className="text-2xl font-bold text-purple-800">
                            {bus.busName}
                          </span>
                          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">
                            {bus.busNumber}
                          </span>
                          <span className="bg-blue-50 text-blue-700 text-s font-semibold px-2 py-0.5 rounded">
                            {bus.busType}
                          </span>
                        </div>

                        {/* Route & Date */}
                        <div className="flex flex-wrap gap-3 items-center mb-4">
                          <span className="flex items-center gap-1 text-xl font-medium text-gray-700">
                            <FaMapMarkerAlt className="text-red-500" />
                            {bus.fromLocation}{' '}
                            <span className="text-gray-400">→</span>{' '}
                            {bus.toLocation}
                          </span>

                          <span className="flex items-center gap-1 text-purple-700 font-bold text-xl ml-2">
                            <FaRupeeSign /> {bus.price}
                          </span>
                        </div>

                        <div className="flex gap-5">
                          <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-semibold text-sm shadow-sm">
                            <FaCalendarAlt /> {bus.travelDate} |
                            <FaClock /> {bus.departure}
                          </span>
                          <span className="text-gray-500 text-xl">|</span>

                          <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-700 font-semibold text-sm shadow-sm">
                            <FaCalendarAlt />{' '}
                            {getArrivalDate(
                              bus.departure,
                              bus.arrival,
                              bus.travelDate
                            )}{' '}
                            |
                            <FaClock /> {bus.arrival}
                          </span>
                          {/* <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-sm"></span> */}
                        </div>

                        {/* Additional Info */}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-4 ">
                          <span className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                            ⏱ {formatDuration(bus.durationOfTravelMinutes)}
                          </span>
                          <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                            <FaRoad /> {bus.distanceKm} km
                          </span>
                          <span className="flex items-center text-sm gap-1 bg-red-50 px-3 py-1 rounded-full">
                            <FaUser /> Available Seats : {bus.availableSeats} 
                          </span>
                          
                        </div>
                      </div>

                      {/* Right: Book Button */}
                      <div className="sm:text-right sm:min-w-[160px] flex items-center">
                        <button
                          onClick={() => handleBook(bus.scheduleId)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                          text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all w-full sm:w-auto"
                        >
                          Book Ticket
                        </button>
                      </div>
                    </div>
                  </>
                ))}
              </div>
            </div>
          )}

          {!loading && buses.length === 0 && (
            <p className="text-center text-gray-500 text-lg font-medium mt-6">
              No buses found for your search. Try different locations or date.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
