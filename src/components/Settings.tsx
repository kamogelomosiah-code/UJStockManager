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
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="text-center p-8">
            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <button 
                onClick={() => {
                  const url = prompt('Enter image URL for profile picture:');
                  if (url) setAvatar(url);
                }}
                className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold mt-4">{user?.name}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">{user?.role}</p>
          </Card>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 opacity-50">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email (Locked)</label>
                <input 
                  disabled
                  type="email" 
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  value={user?.email}
                />
              </div>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-neutral-800 transition-all shadow-sm"
              >
                Save Profile
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Default Currency</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                  value={currency}
                  onChange={(e) => onUpdateCurrency(e.target.value)}
                >
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Database className="w-5 h-5" /> Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div>
                  <p className="text-sm font-bold text-orange-800">Clear Stock Cache</p>
                  <p className="text-xs text-orange-600">Resets all inventory to demo defaults.</p>
                </div>
                <button 
                  onClick={handleResetData}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-sm"
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
