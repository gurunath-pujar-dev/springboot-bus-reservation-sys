import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  function handleValidation() {
    if (!fullName.trim() || fullName.trim().length < 2 || fullName.trim().length > 100) {
      return 'Full name must be between 2 and 100 characters.';
    }
    if (!validateEmail(email)) {
      return 'Please provide a valid email address.';
    }
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (password !== confirmPass) {
      return 'Passwords do not match.';
    }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneNumber.match(phoneRegex)) {
      return 'Please provide a valid phone number (E.164 format, e.g., +123456789).';
    }
    return null;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrMsg('');
    const validationError = handleValidation();
    if (validationError) {
      setErrMsg(validationError);
      toast.error(validationError);
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        fullName,
        email,
        password,
        phoneNumber,
      });
      navigate('/login', { replace: true });
      toast.success('Registered successfully. Please login.');
    } catch (err) {
      const errorText = err.response?.data || 'Registration failed.';
      setErrMsg(errorText);
      toast.error(errorText);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 px-4">
      <div className="bg-white/40 backdrop-blur-lg w-full max-w-md rounded-2xl p-8 shadow-xl border border-white/30">
        
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center drop-shadow-sm">
          Create Your Account
        </h2>

        {errMsg && (
          <div className="mb-4 text-sm font-medium text-red-600 bg-red-100 rounded-lg p-3">
            {errMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none shadow-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Phone Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none shadow-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+911234567890"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-green-400 focus:outline-none shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <span
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Re-enter Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-green-400 focus:outline-none shadow-sm"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm password"
                required
              />
              <span
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white py-2 rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="mt-4 text-md text-center text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-green-700 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
