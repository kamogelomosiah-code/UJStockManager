import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { User, LogOut, Camera, Bell, Shield, Database } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsProps {
  user: UserType | null;
  onLogout: () => void;
  onUpdateUser: (user: UserType) => void;
  currency: string;
  onUpdateCurrency: (val: string) => void;
}

export default function Settings({ user, onLogout, onUpdateUser, currency, onUpdateCurrency }: SettingsProps) {
  const [name, setName] = React.useState(user?.name || '');
  const [avatar, setAvatar] = React.useState(user?.avatar || '');

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'ZAR', name: 'South African Rand (R)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
  ];

  const handleSave = () => {
    if (user) {
      const updated = { ...user, name, avatar };
      onUpdateUser(updated);
      localStorage.setItem('uj_user', JSON.stringify(updated));
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure? This will delete all your local stock data!')) {
      localStorage.removeItem('uj_inventory');
      localStorage.removeItem('uj_movements');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-display-small font-normal tracking-tight text-on-surface">Settings</h2>
        <p className="text-body-medium text-on-surface-variant mt-1">Manage your account and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="text-center p-8 bg-surface-variant text-on-surface">
            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-[32px] bg-surface border-2 border-outline-variant flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-outline" />
                )}
              </div>
              <button 
                onClick={() => {
                  const url = prompt('Enter image URL for profile picture:');
                  if (url) setAvatar(url);
                }}
                className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-[12px] shadow-sm hover:scale-110 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-title-large font-medium mt-4">{user?.name}</h3>
            <p className="text-label-small text-on-surface-variant uppercase tracking-widest mt-1">{user?.role}</p>
          </Card>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FCE8E6] text-[#C5221F] rounded-[24px] font-medium hover:bg-[#FCE8E6]/80 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b-0 pb-2">
              <CardTitle className="text-title-medium font-bold text-on-surface">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <input 
                  type="text" 
                  placeholder="Display Name"
                  className="m3-input w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1 opacity-70">
                <input 
                  disabled
                  type="email" 
                  placeholder="Email (Locked)"
                  className="m3-input w-full bg-outline-variant/10 text-on-surface-variant"
                  value={user?.email}
                />
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  className="m3-button w-full sm:w-auto"
                >
                  Save Profile
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-0 pb-2">
              <CardTitle className="text-title-medium font-bold text-on-surface">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <select 
                  className="m3-input w-full cursor-pointer"
                  value={currency}
                  onChange={(e) => onUpdateCurrency(e.target.value)}
                >
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-0 pb-2">
              <CardTitle className="text-title-medium font-bold flex items-center gap-2 text-on-surface">
                <Database className="w-5 h-5" /> Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#FEF7E0] rounded-[16px] border border-transparent">
                <div>
                  <p className="text-title-small font-bold text-[#B06000]">Clear Stock Cache</p>
                  <p className="text-body-small text-[#B06000]/80">Resets all inventory to demo defaults.</p>
                </div>
                <button 
                  onClick={handleResetData}
                  className="px-4 py-2 bg-[#B06000] text-white rounded-full text-label-small font-medium shadow-sm active:scale-95 transition-transform"
                >
                  Reset All
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
