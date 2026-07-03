import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { User, LogOut, Camera, FileText, Users, Settings as SettingsIcon, Shield } from 'lucide-react';
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
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
      <div>
        <h2 className="text-2xl font-display font-black tracking-tight text-neutral-900">More</h2>
        <p className="text-sm text-neutral-500 mt-1">Manage users, view reports, and app settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="text-center p-8 bg-white shadow-sm border border-neutral-100">
            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-neutral-300" />
                )}
              </div>
              <button 
                onClick={() => {
                  const url = prompt('Enter image URL for profile picture:');
                  if (url) setAvatar(url);
                }}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold mt-4">{user?.name}</h3>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{user?.role}</p>
          </Card>

          <div className="space-y-3">
             <button className="w-full flex items-center justify-between p-4 bg-white rounded-[12px] border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-sm active:scale-95 cursor-pointer group">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><FileText className="w-5 h-5" /></div>
                   <span className="font-bold text-neutral-700">Reports</span>
                </div>
             </button>
             <button className="w-full flex items-center justify-between p-4 bg-white rounded-[12px] border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-sm active:scale-95 cursor-pointer group">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors"><Users className="w-5 h-5" /></div>
                   <span className="font-bold text-neutral-700">Users</span>
                </div>
             </button>
             <button className="w-full flex items-center justify-between p-4 bg-white rounded-[12px] border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-sm active:scale-95 cursor-pointer group">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-neutral-100 text-neutral-600 rounded-lg group-hover:bg-neutral-200 transition-colors"><SettingsIcon className="w-5 h-5" /></div>
                   <span className="font-bold text-neutral-700">App Settings</span>
                </div>
             </button>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-[12px] font-bold hover:bg-red-100 transition-colors active:scale-95 cursor-pointer"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border border-neutral-100">
            <CardHeader className="border-b border-neutral-100 pb-4">
              <CardTitle className="text-lg font-bold text-neutral-900">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-1">
                 <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  placeholder="Display Name"
                  className="w-full px-4 py-3 bg-white text-neutral-900 border border-neutral-200 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1 opacity-70">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email</label>
                <input 
                  disabled
                  type="email" 
                  placeholder="Email (Locked)"
                  className="w-full px-4 py-3 bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-[8px] text-sm focus:outline-none transition-all shadow-sm"
                  value={user?.email}
                />
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  className="bg-primary text-white rounded-[8px] px-6 py-2.5 text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-neutral-100">
            <CardHeader className="border-b border-neutral-100 pb-4">
              <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-neutral-600 mb-4 font-medium">
                Resetting the app will clear all local inventory items and stock movements. This action cannot be undone.
              </p>
              <button 
                onClick={handleResetData}
                className="bg-red-600 text-white rounded-[8px] px-6 py-2.5 text-sm font-bold hover:bg-red-700 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Reset Database
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
