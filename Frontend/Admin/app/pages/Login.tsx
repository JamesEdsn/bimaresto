import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ 
      username: 'Administrator',
      email: email || 'admin@bimaresto.com'
    }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-brand text-[40px] font-bold tracking-tight mb-2">Bima Resto</h1>
          <p className="text-muted-foreground text-[15px]">Restaurant POS — Admin</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <h2 className="text-foreground text-[22px] font-bold mb-1">Masuk</h2>
          <p className="text-muted-foreground text-[14px] mb-6">Sign in to continue to your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-foreground text-[13px] font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground text-[13px] font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary accent-primary focus:ring-primary"
                />
                <span className="text-muted-foreground text-[13px]">Remember me</span>
              </label>
              <a href="#" className="text-info text-[13px] hover:text-info/80">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-[15px] shadow-sm"
            >
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-[12px]">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="py-3 bg-secondary border border-border text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-[13px] font-medium">
              Google
            </button>
            <button type="button" className="py-3 bg-secondary border border-border text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-[13px] font-medium">
              Facebook
            </button>
          </div>

          <p className="text-center text-muted-foreground text-[13px] mt-6">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-info hover:text-info/80 font-medium">
              Sign Up
            </a>
          </p>

          <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
            <p className="text-foreground text-[12px] font-medium mb-2">Demo Credentials:</p>
            <ul className="text-muted-foreground text-[11px] space-y-1">
              <li>• Email: admin@bimaresto.com</li>
              <li>• Password: admin123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
