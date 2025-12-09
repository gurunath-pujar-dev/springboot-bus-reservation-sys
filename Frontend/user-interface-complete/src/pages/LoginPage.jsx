import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const { fetchProfile } = useProfile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrMsg('');
    if (!email || !password) {
      setErrMsg('All fields are required.');
      return;
    }
    if (!validateEmail(email)) {
      setErrMsg('Please provide a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      if (res.data.userId !== undefined)
        localStorage.setItem('userId', res.data.userId);
      if (res.data.fullName)
        localStorage.setItem('fullName', res.data.fullName);
      if (res.data.role) localStorage.setItem('role', res.data.role);

      const name = localStorage.getItem('fullName');

      await fetchProfile();

      navigate(redirectTo, { replace: true });
      toast.success(`Welcome ${name}!`);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Login failed.');
      toast.error('Login Failed.');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 px-4">
      <div className="bg-white/40 backdrop-blur-lg w-full max-w-md rounded-2xl p-8 shadow-xl border border-white/30">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center drop-shadow-sm">
          Welcome Back
        </h2>
        {errMsg && (
          <div className="mb-4 text-sm font-medium text-red-600 bg-red-100 rounded-lg p-3">
            {errMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p className="mt-4 text-md text-center text-gray-700">
          New user?{' '}
          <Link
            to="/register"
            className="text-blue-700 hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
