import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const token = localStorage.getItem('token');

  // Fetch profile if token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoadingProfile(false);
    }
  }, [token]);

  async function fetchProfile() {
    setLoadingProfile(true);
    try {
      const res = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setProfile(null);
    }
    setLoadingProfile(false);
  }

  function clearProfile() {
    setProfile(null);
  }

  ///////////////////////
  function getArrivalDate(departureTime, arrivalTime, travelDate) {
    const departure = new Date(`${travelDate}T${departureTime}`);
    let arrival = new Date(`${travelDate}T${arrivalTime}`);

    // If arrival is before or equal to departure, assume arrival is next day
    if (arrival <= departure) {
      arrival.setDate(arrival.getDate() + 1);
    }

    // Format as YYYY-MM-DD
    const year = arrival.getFullYear();
    const month = String(arrival.getMonth() + 1).padStart(2, '0');
    const day = String(arrival.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  ///////////////////////

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        fetchProfile,
        clearProfile,
        loadingProfile,
        getArrivalDate,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
