import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import campusImage from '../../assets/kampus.png';
import praditaLogo from '../../assets/image.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { 
      username: 'Bima Chef',
      email: email || 'bima.chef@bimaresto.co.id'
    };

    if (staySignedIn) {
      // Use localStorage to persist across browser sessions
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.removeItem('user');
    } else {
      // Use sessionStorage to persist for the current tab session only
      sessionStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('user');
    }

    // Role-based navigation
    const emailToCheck = email.toLowerCase();
    if (emailToCheck.includes('admin')) {
      navigate('/admin');
    } else {
      navigate('/pos');
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel - Campus Image */}
      <div className="w-1/2 hidden lg:block relative overflow-hidden">
        <img
          src={campusImage}
          alt="Pradita University Campus"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#F5F5F7] flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md text-center">

          {/* Logo & Header */}
          <img
            src={praditaLogo}
            alt="Bima Resto"
            className="mx-auto mb-5 h-24 w-auto object-contain"
          />
          <h1 className="text-4xl font-extrabold tracking-wide text-gray-800">BIMA RESTO</h1>
          <p className="mt-2 text-lg font-medium text-gray-600">Restaurant Management</p>

          <form onSubmit={handleLogin} className="mt-16 space-y-6 text-left">
            {/* Email */}
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 placeholder-gray-500"
                placeholder="bima.chef@bimaresto.co.id"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 placeholder-gray-500"
                  placeholder="●●●●●●●●"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between text-sm">
              <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                Lupa kata sandi ?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all text-base shadow-md hover:shadow-lg"
            >
              Login
            </button>

            {/* Stay Signed In Checkbox */}
            <div className="text-center pt-4">
              <label className="flex items-center justify-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-gray-700 text-sm">Stay signed in</span>
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}