import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './Card';
import { Lock, Smartphone, Monitor, ShieldAlert, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: (user: { id: string; name: string; email: string; role: 'Admin' | 'Staff'; joinedDate: string }) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [selectedRole, setSelectedRole] = React.useState<'Staff' | 'Admin'>('Staff');
  const [passcode, setPasscode] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedRole === 'Staff') {
      if (passcode === 'owner123' || passcode === '123' || passcode === '') {
        const staffUser = {
          id: 'user-owner',
          name: 'Cafeteria Owner',
          email: 'owner@uj.ac.za',
          role: 'Staff' as const,
          joinedDate: new Date().toISOString()
        };
        onLogin(staffUser);
        localStorage.setItem('uj_user', JSON.stringify(staffUser));
      } else {
        setErrorMsg('Invalid Owner/Operator passcode. Hint: Use "owner123" or leave blank for instant login.');
      }
    } else {
      if (passcode === 'admin123' || passcode === 'admin' || passcode === '') {
        const adminUser = {
          id: 'user-admin',
          name: 'Chief Supply Administrator',
          email: 'admin@uj.ac.za',
          role: 'Admin' as const,
          joinedDate: new Date().toISOString()
        };
        onLogin(adminUser);
        localStorage.setItem('uj_user', JSON.stringify(adminUser));
      } else {
        setErrorMsg('Invalid Administrative passcode. Hint: Use "admin123" or leave blank for instant login.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 selection:bg-neutral-900 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex py-1 px-3 bg-neutral-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest leading-none font-display mb-1">
            FunctionHead V1.1
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-neutral-900 uppercase">
            STOCK<span className="text-neutral-500 font-medium">MASTER</span>
          </h1>
          <p className="text-xs text-neutral-500 font-sans font-medium">
            Cross-Viewport Unified Supply & Logistics Engine
          </p>
        </div>

        <Card className="border border-neutral-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          {/* Top selection tabs following clean M3 layout */}
          <div className="grid grid-cols-2 bg-neutral-50 border-b border-neutral-200">
            <button
              type="button"
              onClick={() => { setSelectedRole('Staff'); setErrorMsg(''); }}
              className={`py-4 text-xs font-bold font-sans tracking-wide flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'Staff' 
                  ? 'bg-white text-black border-r border-neutral-200' 
                  : 'text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <Smartphone className={`w-4 h-4 ${selectedRole === 'Staff' ? 'text-[#FF3B30]' : ''}`} />
              Owner Mobile Terminal
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('Admin'); setErrorMsg(''); }}
              className={`py-4 text-xs font-bold font-sans tracking-wide flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'Admin' 
                  ? 'bg-white text-black border-l border-neutral-200' 
                  : 'text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <Monitor className={`w-4 h-4 ${selectedRole === 'Admin' ? 'text-[#FF3B30]' : ''}`} />
              Admin Desktop Studio
            </button>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold font-display uppercase tracking-wider text-neutral-900">
                    {selectedRole === 'Staff' ? 'Owner Operator Entrance' : 'System Administration'}
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    {selectedRole === 'Staff' 
                      ? 'Secure, fast-action interface tailored optimized strictly for mobile phones' 
                      : 'Widescreen dense matrix control center suited for desktop workspace actions'}
                  </p>
                </div>

                <div className="space-y-1 relative">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400 font-sans">
                      Security Passcode
                    </label>
                    <span className="text-[9px] text-neutral-400 font-mono font-bold">
                      {selectedRole === 'Staff' ? 'Hint: owner123' : 'Hint: admin123'}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      placeholder={selectedRole === 'Staff' ? 'owner123' : 'admin123'}
                      className="w-full bg-neutral-50 hover:bg-neutral-100/70 text-neutral-900 font-mono border border-neutral-200 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all placeholder:text-neutral-300"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-red-50 text-red-600 space-y-1 border border-red-100 flex items-start gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="text-[10px] leading-relaxed font-semibold font-sans">{errorMsg}</span>
                  </motion.div>
                )}
              </div>

              {/* Monochromatic pill-shaped button using red accent (#FF3B30) */}
              <button 
                type="submit"
                className="w-full py-3 bg-[#FF3B30] text-white hover:bg-[#E03026] active:scale-95 transition-all rounded-full text-xs font-bold uppercase tracking-wider font-sans shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Access Terminal Keyway
              </button>

              <div className="pt-2 text-center border-t border-neutral-100 font-mono text-[9px] text-neutral-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-neutral-400" />
                Decoupled engine session isolated
              </div>

            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-[10px] text-neutral-400 mt-8 font-sans">
          University of Johannesburg Cafeteria Services • May 2026 Codebase
        </p>
      </motion.div>
    </div>
  );
}
