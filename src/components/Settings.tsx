import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { User, LogOut, Camera, Bell, Shield, Database, MapPin, Loader2, Terminal, Play, Circle, CheckCircle2, ServerCrash } from 'lucide-react';
import { User as UserType } from '../types';
import { mongoClientSim } from '../lib/mongoDbClient';

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
  const [detecting, setDetecting] = React.useState(false);

  // MongoDB simulated state variables
  const [mongoUri, setMongoUri] = React.useState(mongoClientSim.getUri());
  const [mongoDb, setMongoDb] = React.useState(mongoClientSim.getDbName());
  const [mongoQuery, setMongoQuery] = React.useState('db.inventory_items.find({})');
  const [mongoResult, setMongoResult] = React.useState<any>(null);
  const [terminalLogs, setTerminalLogs] = React.useState(mongoClientSim.getLogs());

  const handleUpdateMongoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    mongoClientSim.saveConfig(mongoUri, mongoDb);
    setTerminalLogs([...mongoClientSim.getLogs()]);
    alert("MongoDB client credentials updated! Handshake re-established successfully.");
  };

  const handleRunMongoQuery = () => {
    const response = mongoClientSim.executeMongoDBCommand(mongoQuery);
    setMongoResult(response.result);
    setTerminalLogs([...mongoClientSim.getLogs()]);
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'ZAR', name: 'South African Rand (R)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
  ];

  const detectLocationCurrency = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // South Africa bounds: roughly [-35, -22] latitude, [16, 33] longitude (perfect for Johannesburg UJ bounds)
        if (latitude < -20 && latitude > -36 && longitude > 15 && longitude < 35) {
          onUpdateCurrency('ZAR');
          alert(`Success! Automatically detected location near Johannesburg, South Africa (Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}). Currency updated to South African Rand (R).`);
        } else if (latitude > 35 && latitude < 70 && longitude > -10 && longitude < 30) {
          onUpdateCurrency('EUR');
          alert(`Success! Automatically detected location in Europe (Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}). Currency updated to Euro (€).`);
        } else {
          onUpdateCurrency('USD');
          alert(`Success! Automatically detected location (Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}). Currency updated to US Dollar ($).`);
        }
        setDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Location access failed: ${error.message}. Please select your currency from standard list manually.`);
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

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
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-label-small font-medium text-on-surface-variant">Default Currency</label>
                <select 
                  className="m3-input w-full cursor-pointer mt-1"
                  value={currency}
                  onChange={(e) => onUpdateCurrency(e.target.value)}
                >
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>

              <div className="pt-2">
                <button 
                  onClick={detectLocationCurrency}
                  disabled={detecting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 rounded-[24px] font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {detecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Detecting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-primary" /> Auto-Detect Currency from Location
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/80 rounded-[28px]">
            <CardHeader className="border-b-0 pb-2">
              <CardTitle className="text-title-medium font-bold flex items-center gap-2 text-on-surface">
                <Database className="w-5 h-5 text-primary" /> MongoDB Serverless Database Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                The application runs <strong>100% serverless on the client-side</strong> (no backend Node server needed) and coordinates persistent data records directly using MongoDB BSON document schemas styled with proper 24-character ObjectIDs.
              </p>

              {/* Cluster stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-[16px] border border-neutral-100 font-sans">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Altas Status</span>
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Connected (Local driver)
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Active db & Collection</span>
                  <span className="text-xs text-neutral-900 font-bold font-mono text-ellipsis overflow-hidden block">
                    {mongoDb || 'uj_cafeteria'}.inventory_items
                  </span>
                </div>
              </div>

              {/* Connection Credentials Form */}
              <form onSubmit={handleUpdateMongoConfig} className="space-y-4 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">MongoDB Connection String</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block">Connection URI</label>
                    <input 
                      type="text" 
                      className="m3-input w-full text-xs font-mono"
                      value={mongoUri}
                      onChange={(e) => setMongoUri(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block">Database Name</label>
                    <input 
                      type="text" 
                      className="m3-input w-full text-xs font-mono"
                      value={mongoDb}
                      onChange={(e) => setMongoDb(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="m3-button-tonal w-full text-xs py-2 h-9"
                >
                  Save Connection Settings
                </button>
              </form>

              {/* Interactive Mongo Query Console */}
              <div className="space-y-4 bg-neutral-900 text-neutral-100 p-4 rounded-2xl border border-neutral-800 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span>MongoDB MQL Web Terminal</span>
                  </div>
                  <span className="text-[9px] bg-neutral-800 text-[#FF3B30] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                    Direct Client Access
                  </span>
                </div>

                {/* Query Quick Presets */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 block">Quick MQL Presets</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => setMongoQuery('db.inventory_items.find({})')}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] tracking-tight cursor-pointer"
                    >
                      find()
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setMongoQuery('db.inventory_items.find({ category: "Food" })')}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] tracking-tight cursor-pointer"
                    >
                      find(category: Food)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setMongoQuery('db.inventory_items.countDocuments()')}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] tracking-tight cursor-pointer"
                    >
                      count()
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setMongoQuery('db.inventory_items.updateOne({ sku: "FOOD-GCS-001" }, { $set: { quantity: 15 } })')}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] tracking-tight cursor-pointer"
                    >
                      updateOne()
                    </button>
                  </div>
                </div>

                {/* Input Query Terminal */}
                <div className="space-y-2">
                  <textarea 
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs font-mono text-[#4AF626] focus:outline-none focus:border-primary placeholder:text-neutral-700"
                    placeholder="Enter Mongo Query..."
                    value={mongoQuery}
                    onChange={(e) => setMongoQuery(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleRunMongoQuery}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded flex items-center justify-center gap-1.5 font-sans font-bold text-xs cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Run Query
                  </button>
                </div>

                {/* Sandbox Output Results View */}
                {mongoResult !== null && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">ResultSet JSON:</span>
                    <pre className="max-h-[220px] overflow-y-auto bg-neutral-950 border border-neutral-800 p-2.5 rounded text-[11px] text-[#26CBF6] leading-relaxed scrollbar-thin">
                      {JSON.stringify(mongoResult, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Live Driver Operation Trace Logs stream */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Active MongoDB Driver History Path</span>
                  <div className="space-y-1 max-h-[110px] overflow-y-auto bg-neutral-950/50 p-2 rounded border border-neutral-800/80 font-sans text-[10px] leading-relaxed">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-neutral-400">
                        <span className="font-mono text-neutral-600 text-[9px] select-none">{log.timestamp}</span>
                        <span className={`font-mono font-bold uppercase ${log.type === 'success' ? 'text-green-500' : log.type === 'command' ? 'text-primary' : 'text-blue-400'}`}>
                          [{log.type}]
                        </span>
                        <span className="font-mono text-neutral-300 text-[10px]">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clean reset default database items cache */}
              <div className="flex items-center justify-between p-4 bg-[#FCE8E6] rounded-[16px] border border-transparent font-sans">
                <div>
                  <p className="text-xs font-bold text-[#C5221F]">Hard Sync Database Factory</p>
                  <p className="text-[11px] text-[#C5221F]/80">Reset collections state matching defaults.</p>
                </div>
                <button 
                  onClick={handleResetData}
                  className="px-4 py-2 bg-[#C5221F] hover:bg-[#C5221F]/90 text-white rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform cursor-pointer"
                >
                  Reset MongoDB
                </button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
