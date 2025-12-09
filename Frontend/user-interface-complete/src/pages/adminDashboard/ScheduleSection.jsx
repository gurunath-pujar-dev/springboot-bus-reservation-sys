import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaRoad } from 'react-icons/fa';
import { AiOutlineCalendar } from 'react-icons/ai';
import { MdAccessTime } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useProfile } from '../../context/ProfileContext';

export default function ScheduleSection() {
  const [schedules, setSchedules] = useState([]);
  const [busList, setBusList] = useState([]);
  const [routeList, setRouteList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterBusId, setFilterBusId] = useState('');
  const [filterRouteId, setFilterRouteId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);

  const [busId, setBusId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');

  // Passengers modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [passengerList, setPassengerList] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);

  // Store passenger counts per schedule for calculating availableSeats
  const [passengerCounts, setPassengerCounts] = useState({});

  const today = new Date().toISOString().split('T')[0];
  const { getArrivalDate } = useProfile();

  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Utility to add minutes to HH:mm and return HH:mm:ss
  function addMinutesToTime(timeStr, minutesToAdd) {
    const [hh, mm] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hh);
    date.setMinutes(mm + minutesToAdd);
    return date.toTimeString().split(' ')[0];
  }

  // Calculate arrival time whenever route or departure changes
  useEffect(() => {
    if (routeId && departure) {
      const selectedRoute = routeList.find(r => r.id === Number(routeId));
      if (selectedRoute) {
        const arrivalTime = addMinutesToTime(
          departure,
          selectedRoute.durationOfTravelMinutes
        );
        setArrival(arrivalTime);
      }
    } else {
      setArrival('');
    }
  }, [routeId, departure, routeList]);

  // Fetch passenger counts for all schedules to calculate availableSeats
  async function fetchPassengerCountsForAll(schedulesData) {
    const counts = {};
    for (const sch of schedulesData) {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/bookings/${sch.id}/passengers`,
          { headers: getAuthHeaders() }
        );
        counts[sch.id] = Array.isArray(res.data) ? res.data.length : 0;
      } catch {
        counts[sch.id] = 0;
      }
    }
    setPassengerCounts(counts);
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const busData = await axios.get('http://localhost:8080/api/bus', { headers: getAuthHeaders() });
      const routeData = await axios.get('http://localhost:8080/api/route/all', { headers: getAuthHeaders() });
      const scheduleData = await axios.get('http://localhost:8080/api/schedules', { headers: getAuthHeaders() });

      setBusList(busData.data.data || []);
      setRouteList(routeData.data.data || []);
      const schedulesData = scheduleData.data.data || [];

      // Fetch passenger counts for all schedules
      await fetchPassengerCountsForAll(schedulesData);

      setSchedules(schedulesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    let filteredData = schedules;
    if (filterBusId)
      filteredData = filteredData.filter(s => s.busId === Number(filterBusId));
    if (filterRouteId)
      filteredData = filteredData.filter(s => s.routeId === Number(filterRouteId));
    if (filterDate)
      filteredData = filteredData.filter(s => s.travelDate === filterDate);
    setFiltered(filteredData);
  }, [schedules, filterBusId, filterRouteId, filterDate]);

  function openAddForm() {
    setEditSchedule(null);
    setBusId('');
    setRouteId('');
    setTravelDate('');
    setDeparture('');
    setArrival('');
    setShowForm(true);
  }

  function openEditForm(s) {
    setEditSchedule(s);
    setBusId(String(s.busId));
    setRouteId(String(s.routeId));
    setTravelDate(s.travelDate);
    setDeparture(s.departure);
    setArrival(s.arrival);
    setShowForm(true);
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`http://localhost:8080/api/schedules/${id}`, {
        headers: getAuthHeaders(),
      });
      await fetchAll();
      toast.success('Schedule deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      busId: Number(busId),
      routeId: Number(routeId),
      travelDate,
      departure: departure.length === 5 ? departure + ':00' : departure,
      arrival,
    };
    try {
      if (editSchedule) {
        await axios.put(
          `http://localhost:8080/api/schedules/${editSchedule.id}`,
          payload,
          { headers: getAuthHeaders() }
        );
      } else {
        await axios.post('http://localhost:8080/api/schedules', payload, {
          headers: getAuthHeaders(),
        });
      }
      await fetchAll();
      setShowForm(false);
      toast.success(editSchedule ? 'Schedule updated successfully' : 'Schedule created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit schedule');
    }
  }

  async function fetchPassengers(scheduleId) {
    setLoadingPassengers(true);
    setShowPassengerModal(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/bookings/${scheduleId}/passengers`,
        { headers: getAuthHeaders() }
      );
      setPassengerList(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to fetch passengers');
      setPassengerList([]);
    }
    setLoadingPassengers(false);
  }

  return (
    <section>
      {/* Filters & Add */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select
          value={filterBusId}
          onChange={(e) => setFilterBusId(e.target.value)}
          className="border px-4 py-2 rounded-lg text-lg focus:ring focus:ring-blue-300"
        >
          <option value="">Bus</option>
          {busList.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.busName}
            </option>
          ))}
        </select>
        <select
          value={filterRouteId}
          onChange={(e) => setFilterRouteId(e.target.value)}
          className="border px-4 py-2 rounded-lg text-lg focus:ring focus:ring-blue-300"
        >
          <option value="">Route</option>
          {routeList.map((route) => (
            <option key={route.id} value={route.id}>
              {route.fromLocation} → {route.toLocation}
            </option>
          ))}
        </select>
        <input
          type="date"
          min={today}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-4 py-2 rounded-lg text-lg focus:ring focus:ring-blue-300"
        />
        <button
          onClick={() => {
            setFilterBusId('');
            setFilterRouteId('');
            setFilterDate('');
          }}
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-blue-700 rounded-lg font-medium hover:bg-gray-300"
        >
          <FaTimes /> Clear Filter
        </button>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 shadow"
        >
          <FaPlus /> Add Schedule
        </button>
      </div>

      {/* Schedule List */}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 italic">No schedules found.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {filtered
            .sort((a, b) => b.id - a.id)
            .map((s) => {
              const passengerCount = passengerCounts[s.id] || 0;
              const availableSeats = (s.bus.totalSeats || 0) - passengerCount;

              return (
                <div
                  key={s.id}
                  className="rounded-xl shadow bg-white px-6 py-6 flex items-center gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-xl font-semibold text-orange-600">
                        #{s.id}
                      </span>
                      <span className="text-xl font-semibold text-blue-800">
                        {s.bus.busName}
                      </span>
                      <span className="Bhubaneswar text-sm text-gray-800 ml-2 mr-2">
                        {s.bus.busNumber}
                      </span>
                      <span className="text-gray-800">•</span>
                      <span className="font-semibold text-s text-cyan-600">{s.bus.busType}</span>
                    </div>
                    <div className="flex space-x-6 mt-2">
                      <div className="text-lg font-bold text-purple-700">
                        {s.route.fromLocation} → {s.route.toLocation}
                      </div>
                      <div className="text-lg text-blue-600 font-semibold">₹{s.route.price}</div>
                    </div>
                    <div className="mt-2 flex gap-6 items-center">
                      <div className="text-sm text-gray-600 font-semibold">{s.route.distanceKm} km</div>
                      <div className="flex flex-wrap gap-3 mt-1 items-center">
                        <div className="flex items-start gap-2">
                          <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-semibold text-sm shadow-sm">
                            <AiOutlineCalendar /> {s.travelDate} | <MdAccessTime /> {s.departure}
                          </span>
                          <span className="text-gray-500 text-xl">|</span>
                          <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-700 font-semibold text-sm shadow-sm">
                            <AiOutlineCalendar /> {getArrivalDate(s.departure, s.arrival, s.travelDate)} | <MdAccessTime /> {s.arrival}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-6 mt-3">
                      <div className="text-md font-semibold text-gray-800 tracking-wide ml-1">
                        Total Seats: <span className="text-gray-600">{s.bus.totalSeats}</span>
                      </div>
                      <div className="text-md font-semibold text-gray-800 tracking-wide">
                        No of Passengers : <span className="text-gray-600">{passengerCount}</span>
                      </div>
                    </div>
                  </div>
                   <div className="flex gap-3 ml-3">
          {/* Show Edit only if no passengers */}
          {passengerCount === 0 && (
            <button
              onClick={() => openEditForm(s)}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-white"
              title="Edit"
            >
              <FaEdit /> Edit
            </button>
          )}

          {/* Passengers Button */}
          
             {passengerCount > 0 && (
            <button
              onClick={() => fetchPassengers(s.id)}
              className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-white"
              title="View Passengers"
            >
              Passengers
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => handleDelete(s.id)}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-white"
            title="Delete"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
        );
      })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col gap-5" autoComplete="off">
            <h3 className="text-xl font-bold text-blue-700 mb-2">{editSchedule ? 'Edit Schedule' : 'Add Schedule'}</h3>

            <select className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300" value={busId} onChange={e => setBusId(e.target.value)} required>
              <option value="">Select Bus</option>
              {busList.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.busName} ({bus.busNumber})
                </option>
              ))}
            </select>

            <select className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300" value={routeId} onChange={e => setRouteId(e.target.value)} required>
              <option value="">Select Route</option>
              {routeList.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.fromLocation} → {route.toLocation}
                </option>
              ))}
            </select>

            <input type="date" min={today} className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300" value={travelDate} onChange={e => setTravelDate(e.target.value)} required />

            <input
              type="time"
              className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300"
              value={departure}
              step="60"
              onChange={e => setDeparture(e.target.value)}
              required
            />

            <input
              type="text"
              className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300 bg-gray-100 text-gray-500 cursor-not-allowed"
              value={arrival}
              placeholder="Arrival time"
              readOnly
              required
              title="Auto-calculated based on route and departure"
            />

            <div className="flex gap-4 mt-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-3 py-2 rounded-lg font-semibold">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold">
                {editSchedule ? 'Update' : 'Add'} Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {showPassengerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl mx-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-semibold text-indigo-700">Passenger List</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl transition" onClick={() => setShowPassengerModal(false)} aria-label="Close Passenger Modal">
                ×
              </button>
            </div>

            {loadingPassengers ? (
              <div className="text-center py-6 text-gray-500">Loading...</div>
            ) : Array.isArray(passengerList) && passengerList.length === 0 ? (
              <p className="italic text-gray-500 text-center py-4">No passengers found.</p>
            ) : Array.isArray(passengerList) ? (
              <div className="overflow-x-auto max-h-[400px] border rounded-lg shadow-sm">
                <table className="min-w-full text-sm bg-white">
                  <thead className="bg-indigo-100 text-indigo-800 font-semibold">
                    <tr>
                      <th className="py-3 px-4 text-left">ID</th>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Age</th>
                      <th className="py-3 px-4 text-left">Gender</th>
                      <th className="py-3 px-4 text-left">Seat No</th>
                    </tr>
                  </thead>

              <tbody className="divide-y divide-gray-200">
              {passengerList.map((p, i) => (
                <tr key={p.passengerId || i} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-2 px-4 font-semibold text-md">{p.passengerId}</td>
                  <td className="py-2 px-4 font-semibold text-md">{p.passengerName || 'N/A'}</td>
                  <td className="py-2 px-4 font-semibold text-md">{p.age ?? 'N/A'}</td>
                  <td className="py-2 px-4 font-semibold text-md capitalize">{p.gender || 'N/A'}</td>
                  <td className="py-2 px-4 font-semibold text-md">{p.seatNumber || 'N/A'}</td>
                </tr>
              ))}
            </tbody>

                </table>
              </div>
            ) : (
              <p className="italic text-red-500 text-center py-4">Passenger data not available.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
