import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";
import { toast } from "react-toastify";

export default function ProfilePage() {
  
  const { profile, setProfile } = useProfile();
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || "");
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhoneNumber(profile.phoneNumber);
    }
  }, [profile]);

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:8080/api/user/profile",
        { fullName, phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      toast.success("Profile updated successfully");
      navigate(-1);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Mobile number already exists"
      );
    }
    setLoading(false);
  }

  if (!profile) {
    return (
      <p className="p-6 text-center text-gray-600 animate-pulse">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Edit Profile
        </h2>

        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-500">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-600"
              value={profile.email}
              disabled
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all text-white py-2 rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
