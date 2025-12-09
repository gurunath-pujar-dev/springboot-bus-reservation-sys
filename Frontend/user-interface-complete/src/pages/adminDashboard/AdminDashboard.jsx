import React, { useState } from "react";
import { FaHome, FaUserCircle } from "react-icons/fa";
import BusSection from "./BusSection";
import RouteSection from "./RouteSection";
import ScheduleSection from "./ScheduleSection";
import BookingHistorySection from "./BookingHistorySection";
import { useNavigate } from "react-router-dom";

const sections = [
  { key: "bus", label: "Bus" },
  { key: "route", label: "Route" },
  { key: "schedule", label: "Schedule" },
  { key: "bookingHistory", label: "Booking History" },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("bus");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
     
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-100 via-white to-purple-100 shadow flex px-7 py-3 gap-2">
        {sections.map((section) => (
          <button
            key={section.key}
            className={`capitalize font-semibold px-5 py-2 rounded-lg text-lg transition ${
              activeSection === section.key
                ? "bg-blue-600 text-white shadow"
                : "hover:bg-blue-200 text-blue-700 border border-transparent"
            }`}
            onClick={() => setActiveSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-7">
        {activeSection === "bus" && <BusSection />}
        {activeSection === "route" && <RouteSection />}
        {activeSection === "schedule" && <ScheduleSection />}
        {activeSection === "bookingHistory" && <BookingHistorySection />}
      </main>
    </div>
  );
}
