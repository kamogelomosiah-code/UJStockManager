import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { User, LogIn, UserPlus, Box } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo auth
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: isLogin ? (email.split('@')[0]) : name,
      email,
      role: 'Admin',
      joinedDate: new Date().toISOString()
    };
    onLogin(user);
    localStorage.setItem('uj_user', JSON.stringify(user));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Box className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">UJ Cafeteria</h1>
          <p className="text-gray-500 text-sm mt-1">Stock Management System</p>
        </div>

        <Card className="shadow-xl border-t-4 border-t-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:border-black focus:outline-none transition-colors bg-gray-50 font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@uj.ac.za"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-black focus:outline-none transition-colors bg-gray-50 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-black focus:outline-none transition-colors bg-gray-50 font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold transition-all shadow-lg mt-2"
              >
                {isLogin ? 'Sign In' : 'Register Now'}
              </button>

              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
                >
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2024 University of Johannesburg Cafeteria Services
        </p>
      </motion.div>
    </div>
  );
}
