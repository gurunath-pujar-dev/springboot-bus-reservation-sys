import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaRoad } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function RouteSection() {
  const [routes, setRoutes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterLoc, setFilterLoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editRoute, setEditRoute] = useState(null);

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationOfTravelMinutes, setDurationOfTravelMinutes] = useState('');
  const [price, setPrice] = useState('');
  const [locationError, setLocationError] = useState("");

   function getAuthHeaders() 
   {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    }


  // Convert minutes to "X hr Y min"
  function formatDuration(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} min`;
    if (hrs > 0) return `${hrs} hr`;
    return `${mins} min`;
  }

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    setFiltered(
      !filterLoc.trim()
        ? routes
        : routes.filter(
            r =>
              r.fromLocation.toLowerCase().includes(filterLoc.toLowerCase()) ||
              r.toLocation.toLowerCase().includes(filterLoc.toLowerCase())
          )
    );
  }, [routes, filterLoc]);

  async function fetchRoutes() {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/route/all', {headers: getAuthHeaders()});
      setRoutes(data.success ? data.data : []);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditRoute(null);
    setFromLocation('');
    setToLocation('');
    setDistanceKm('');
    setDurationOfTravelMinutes('');
    setPrice('');
    setShowForm(true);
  }

  function openEditForm(route) {
    setEditRoute(route);
    setFromLocation(route.fromLocation);
    setToLocation(route.toLocation);
    setDistanceKm(route.distanceKm);
    setDurationOfTravelMinutes(route.durationOfTravelMinutes);
    setPrice(route.price);
    setShowForm(true);
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`http://localhost:8080/api/route/${id}`, {headers: getAuthHeaders()});
      fetchRoutes();
      toast.success('Route deleted successfully.');
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    }
  }

  



async function handleSubmit(e) {
  e.preventDefault();

  // Clear previous error
  setLocationError("");

  // Client-side validation: From and To must not be the same
  if (fromLocation.trim().toLowerCase() === toLocation.trim().toLowerCase()) {
    const msg = "From and To locations cannot be the same";
    setLocationError(msg); // for inline error under fields
    toast.error(msg, { position: "top-center" });
    return; // stop here
  }

  const payload = {
    fromLocation: fromLocation.trim(),
    toLocation: toLocation.trim(),
    distanceKm: Number(distanceKm),
    durationOfTravelMinutes: Number(durationOfTravelMinutes),
    price: Number(price),
  };

  try {
    if (editRoute) {
      await axios.put(
        `http://localhost:8080/api/route/${editRoute.id}`,
        payload,
        { headers: getAuthHeaders() }
      );
    } else {
      await axios.post(
        "http://localhost:8080/api/route",
        payload,
        { headers: getAuthHeaders() }
      );
    }

    fetchRoutes();
    setShowForm(false);
    toast.success(editRoute ? "Route updated successfully" : "Route created successfully");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "An error occurred while saving the route.";
    toast.error(errorMessage, { position: "top-center" });
  }
}

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search Location…"
          value={filterLoc}
          onChange={e => setFilterLoc(e.target.value)}
          className="border px-4 py-2 rounded-lg w-60 text-lg focus:ring focus:ring-blue-300"
        />
        <button
          onClick={() => setFilterLoc('')}
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-blue-700 rounded-lg font-medium hover:bg-gray-300"
        >
          <FaTimes /> Clear Filter
        </button>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 shadow"
        >
          <FaPlus /> Add Route
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 italic">No routes found.</p>
      ) : (
        <div className="flex flex-col gap-5">
  {filtered
    .sort((a, b) => b.id - a.id)
    .map(route => (
      <div
        key={route.id}
        className="rounded-xl shadow bg-white px-6 py-6 flex items-center justify-between gap-6"
      >
        {/* Left side: icon + details */}
        <div className="flex items-center gap-4">
          <span className="text-purple-700 text-3xl">
            <FaRoad />
          </span>
          <div>
            <div className="text-xl font-semibold text-purple-700">
              {route.fromLocation} → {route.toLocation}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-gray-500">{route.distanceKm} km</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">
                {formatDuration(route.durationOfTravelMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => openEditForm(route)}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-white"
            title="Edit"
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={() => handleDelete(route.id)}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-white"
            title="Delete"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    ))}
</div>

      )}

      {/* Add/Edit Modal */}
    {showForm && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col gap-5"
      autoComplete="off"
    >
      <h3 className="text-xl font-bold text-purple-700 mb-2">
        {editRoute ? 'Edit Route' : 'Add Route'}
      </h3>

      {/* From Location */}
      <input
        type="text"
        value={fromLocation}
        placeholder="From location"
        onChange={(e) => {
          setFromLocation(e.target.value);
          if (locationError) setLocationError("");
        }}
        className={`border px-3 py-2 rounded-lg w-full ${
          locationError ? "border-red-500" : "border-gray-600"
        } ${editRoute ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
        required
        disabled={editRoute}
        title={editRoute ? "Cannot edit 'From' location in edit mode" : ""}
      />

      {/* To Location */}
      <input
        type="text"
        value={toLocation}
        placeholder="To location"
        onChange={(e) => {
          setToLocation(e.target.value);
          if (locationError) setLocationError("");
        }}
        className={`border px-3 py-2 rounded-lg w-full ${
          locationError ? "border-red-500" : "border-gray-600"
        } ${editRoute ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
        required
        disabled={editRoute}
        title={editRoute ? "Cannot edit 'To' location in edit mode" : ""}
      />

      {locationError && (
        <p className="text-red-500 text-sm mt-1">{locationError}</p>
      )}

      {/* Distance */}
      <input
        type="number"
        min={1}
        className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300"
        placeholder="Distance km"
        value={distanceKm}
        onChange={e => setDistanceKm(e.target.value)}
        required
      />

      {/* Duration */}
      <input
        type="number"
        min={1}
        className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300"
        placeholder="Duration (minutes)"
        value={durationOfTravelMinutes}
        onChange={e => setDurationOfTravelMinutes(e.target.value)}
        required
      />

      {/* Price */}
      <input
        type="number"
        min={1}
        step="0.01"
        className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300"
        placeholder="Price (₹)"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />

      {/* Buttons */}
      <div className="flex gap-4 mt-3">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-3 py-2 rounded-lg font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-semibold"
        >
          {editRoute ? 'Update' : 'Add'} Route
        </button>
      </div>
    </form>
  </div>
)}

    </section>
  );
}
