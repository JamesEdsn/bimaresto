import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import campusImage from '../../assets/kampus.png';
import praditaLogo from '../../assets/image.png';
import { login } from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const notifyAuthChanged = () => {
    window.dispatchEvent(new Event('auth-changed'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const auth = await login({
        full_name: email,
        password,
      });

      const userData = {
        id: auth.staff.id,
        username: auth.staff.full_name,
        email,
        role: auth.staff.role,
        role_id: auth.staff.role_id,
      };

      const storage = staySignedIn ? localStorage : sessionStorage;
      const otherStorage = staySignedIn ? sessionStorage : localStorage;

      storage.setItem('user', JSON.stringify(userData));
      storage.setItem('token', auth.access_token);
      storage.setItem('refresh_token', auth.refresh_token);
      otherStorage.removeItem('user');
      otherStorage.removeItem('token');
      otherStorage.removeItem('refresh_token');
      notifyAuthChanged();

      if (auth.staff.role_id === 1 || auth.staff.role_id === 4) {
        navigate('/admin');
      } else {
        navigate('/pos');
      }
    } catch (err) {
      setError('Login gagal. Periksa nama lengkap dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    const userData = { 
      username: 'Bima Chef',
      email: email || 'bima.chef@bimaresto.co.id'
    };

    const storage = staySignedIn ? localStorage : sessionStorage;
    const otherStorage = staySignedIn ? sessionStorage : localStorage;

    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('token', 'demo-token');
    storage.setItem('refresh_token', 'demo-refresh-token');
    otherStorage.removeItem('user');
    otherStorage.removeItem('token');
    otherStorage.removeItem('refresh_token');
    notifyAuthChanged();

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
                Nama Lengkap
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 placeholder-gray-500"
                placeholder="Super Admin"
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
              disabled={isSubmitting}
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all text-base shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {error && (
              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-sm font-medium text-orange-700 hover:text-orange-600"
                >
                  Masuk tanpa API untuk demo
                </button>
              </div>
            )}

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
