import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBus } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function BusSection() {
  const [buses, setBuses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editBus, setEditBus] = useState(null);

  // Form Fields
  const [busName, setBusName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [busType, setBusType] = useState('AC');
  const [totalSeats, setTotalSeats] = useState(40);
  const [busNumberError, setBusNumberError] = useState("");


     function getAuthHeaders() 
   {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    }

  useEffect(() => {
    fetchBuses();
  }, []);
  useEffect(() => {
    setFiltered(
      !filterName.trim()
        ? buses
        : buses.filter((b) =>
            b.busName.toLowerCase().includes(filterName.toLowerCase())
          )
    );
  }, [filterName, buses]);

 


  async function fetchBuses() {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/bus', {headers: getAuthHeaders()});
      setBuses(data.success ? data.data : []);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditBus(null);
    setBusName('');
    setBusNumber('');
    setBusType('AC');
    setTotalSeats(40);
    setShowForm(true);
  }
  function openEditForm(bus) {
    setEditBus(bus);
    setBusName(bus.busName);
    setBusNumber(bus.busNumber);
    setBusType(bus.busType);
    setTotalSeats(bus.totalSeats);
    setShowForm(true);
  }
  async function handleDelete(busId) {
    // if (!window.confirm('Delete this bus?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/bus/${busId}`, {headers: getAuthHeaders()});
      fetchBuses();
      toast.success("Bus deleted successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

async function handleSubmit(e) {
  e.preventDefault();

  // Clear previous error
  setBusNumberError("");

  const payload = {
    busName: busName.trim(),
    busNumber: busNumber.trim(),
    busType,
    totalSeats: Number(totalSeats),
  };

  try {
    if (editBus) {
      await axios.put(
        `http://localhost:8080/api/bus/${editBus.id}`,
        payload,
        { headers: getAuthHeaders() }
      );
      toast.success("Bus updated successfully");
    } else {
      await axios.post(
        "http://localhost:8080/api/bus",
        payload,
        { headers: getAuthHeaders() }
      );
      toast.success("Bus added successfully");
    }

    fetchBuses();
    setShowForm(false);
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "An error occurred while saving bus.";

    // Check if it's a duplicate bus number error
    if (errorMessage.toLowerCase().includes("already exists")) {
      setBusNumberError(errorMessage); // inline error
    }

    toast.error(errorMessage, { position: "top-center" });
  }
}


  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search Bus Name…"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="border px-4 py-2 rounded-lg w-60 text-lg focus:ring focus:ring-blue-300"
        />
        <button
          onClick={() => setFilterName('')}
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-blue-700 rounded-lg font-medium hover:bg-gray-300"
        >
          <FaTimes /> Clear Filter
        </button>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 shadow"
        >
          <FaPlus /> Add Bus
        </button>
      </div>
      {/* Vertical List */}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 italic">No buses found.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {filtered
            .sort((a, b) => b.id - a.id)
            .map((bus) => (
              <div
                key={bus.id}
                className="rounded-xl shadow bg-white px-6 py-6 flex items-center gap-5"
              >
                <span className="text-blue-600 text-3xl">
                  <FaBus />
                </span>
                <div className="flex-1">
                  <div className="text-xl font-semibold text-blue-800 mb-0.5">
                    {bus.busName}
                  </div>
                  <div className="text-md text-gray-500 tracking-wide mt-2">
                    {bus.busNumber}
                  </div>
                </div>

                <div className="flex items-center gap-10 mt-1 mr-40">
                  <div className="text-base font-bold text-gray-700">
                    <span className="text-blue-700">{bus.busType}</span>
                  </div>
                  <div className="text-gray-700 font-semibold">
                    Total Seats: {bus.totalSeats}
                  </div>
                </div>

                <div className="flex  gap-3 ml-3">
                  <button
                    onClick={() => openEditForm(bus)}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-white"
                    title="Edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bus.id)}
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
      <h3 className="text-xl font-bold text-blue-700 mb-2">
        {editBus ? 'Edit Bus' : 'Add Bus'}
      </h3>

      {/* Bus Name – Always editable */}
      <input
        type="text"
        className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300"
        placeholder="Bus Name"
        value={busName}
        onChange={(e) => setBusName(e.target.value)}
        required
      />

      {/* Bus Number – Disabled in edit mode */}
      <input
        type="text"
        className={`border px-3 py-2 rounded-lg text-base w-full focus:ring focus:ring-blue-300 ${
          busNumberError ? "border-red-500" : "border-gray-600"
        } ${editBus ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
        placeholder="Bus Number"
        value={busNumber}
        onChange={(e) => {
          setBusNumber(e.target.value);
          if (busNumberError) setBusNumberError(""); // clear inline error when typing
        }}
        required
        disabled={editBus}
        title={editBus ? "Cannot edit bus number in edit mode" : ""}
      />
      {busNumberError && (
        <p className="text-red-500 text-sm mt-1">{busNumberError}</p>
      )}

      {/* Bus Type – Always editable */}
      <select
        className="border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300"
        value={busType}
        onChange={(e) => setBusType(e.target.value)}
        required
      >
        <option value="AC">AC</option>
        <option value="Non AC">Non AC</option>
      </select>

      {/* Total Seats – Disabled in edit mode */}
      <input
        type="number"
        min={1}
        className={`border px-3 py-2 rounded-lg text-base focus:ring focus:ring-blue-300 ${
          editBus ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
        }`}
        placeholder="Total Seats"
        value={totalSeats}
        onChange={(e) => setTotalSeats(e.target.value)}
        required
        disabled={editBus}
        title={editBus ? "Cannot edit total seats in edit mode" : ""}
      />

      {/* Action Buttons */}
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
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold"
        >
          {editBus ? 'Update Bus' : 'Add Bus'}
        </button>
      </div>
    </form>
  </div>
)}

    </section>
  );
}
