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
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-[16px] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Box className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="text-display-small font-normal tracking-tight text-on-surface">UJ Cafeteria</h1>
          <p className="text-body-medium text-on-surface-variant mt-1">Stock Management System</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-title-large flex items-center gap-2 text-on-surface">
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {!isLogin && (
                  <div className="w-full">
                    <input 
                      required
                      type="text" 
                      placeholder="Full Name (e.g. John Doe)"
                      className="m3-input w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div className="w-full">
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address (name@uj.ac.za)"
                    className="m3-input w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <input 
                    required
                    type="password" 
                    placeholder="Password"
                    className="m3-input w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="m3-button w-full py-4 text-[16px]"
                >
                  {isLogin ? 'Sign In' : 'Register Now'}
                </button>
              </div>

              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-label-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-body-small text-outline mt-8">
          © 2024 University of Johannesburg Cafeteria Services
        </p>
      </motion.div>
    </div>
  );
}
