import React, { useState, useRef } from 'react';
import { Profile } from '../types';
import { User, Mail, Phone, MapPin, Key, ShieldAlert, Check, Camera, Upload, Image as ImageIcon, Sparkles, Palette } from 'lucide-react';

interface ProfileViewProps {
  profile: Profile;
  onUpdateProfile: (profile: Profile) => void;
}

const PRESET_AVATARS = [
  { name: 'Tech Agent (F)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Elite Analyst (M)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Venture Partner (F)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Quantum Dev (M)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Deep Space Core', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
  { name: 'Liquid Flow Sphere', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Cyber Wave Grid', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80' },
  { name: 'System Shell', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' }
];

const GLOW_COLORS = [
  { id: 'blue', name: 'Slate Blue', border: 'border-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]', ring: 'ring-blue-500/30', bg: 'bg-blue-500' },
  { id: 'cyan', name: 'Cyber Cyan', border: 'border-cyan-400', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.6)]', ring: 'ring-cyan-400/30', bg: 'bg-cyan-400' },
  { id: 'purple', name: 'Neon Purple', border: 'border-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.6)]', ring: 'ring-purple-500/30', bg: 'bg-purple-500' },
  { id: 'rose', name: 'Rose Gold', border: 'border-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]', ring: 'ring-rose-500/30', bg: 'bg-rose-500' },
  { id: 'amber', name: 'Liquid Amber', border: 'border-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]', ring: 'ring-amber-500/30', bg: 'bg-amber-500' },
  { id: 'emerald', name: 'Fintech Green', border: 'border-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]', ring: 'ring-emerald-500/30', bg: 'bg-emerald-500' },
];

export default function ProfileView({ profile, onUpdateProfile }: ProfileViewProps) {
  // Local Form state
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [photoUrl, setPhotoUrl] = useState(profile.photo || '');

  // Custom real-time customizable states
  const [isDragging, setIsDragging] = useState(false);
  const [avatarGlow, setAvatarGlow] = useState<string>(() => {
    return localStorage.getItem('avatarGlow') || 'blue';
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password fields state (simulated)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setProfileError('Name and Email are required parameters.');
      setTimeout(() => setProfileError(null), 4000);
      return;
    }
    setProfileError(null);
    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      photo: photoUrl.trim() || undefined,
    });
    setMessage('Profile details updated successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required to modify credentials.');
      setTimeout(() => setPasswordError(null), 4000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords entered do not match.');
      setTimeout(() => setPasswordError(null), 4000);
      return;
    }
    setPasswordError(null);
    setPasswordMessage('Password security updated successfully! (Simulation)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMessage(null), 4000);
  };

  const activeGlowColor = GLOW_COLORS.find(g => g.id === avatarGlow) || GLOW_COLORS[0];

  const handleSelectAvatar = (url: string) => {
    setPhotoUrl(url);
    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      photo: url,
    });
    setMessage('Profile photo customized in real-time!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('File must be a valid image format.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setProfileError('Image size must be smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleSelectAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileError('Image size must be smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleSelectAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h2>
        <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Configure your primary account information and security parameters</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column Stack: Avatar & Customizer Studio */}
        <div className="space-y-6 md:col-span-1">
          {/* Summary Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div 
                className={`p-1 rounded-full border-4 ${activeGlowColor.border} ${activeGlowColor.glow} transition-all duration-500`}
              >
                <img
                  src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={name}
                  className="h-28 w-28 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800"
                  onError={() => {
                    // fallback to default avatar
                    setPhotoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
                  }}
                />
              </div>
              <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-sm" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name || 'User'}</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-semibold">{email || 'Not provided'}</p>
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 text-xs space-y-2 text-left text-gray-500 dark:text-slate-400 font-semibold">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{phone || 'No phone set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{address || 'No address set'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Avatar Customizer Studio */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Avatar Studio</h3>
            </div>

            {/* A. Preset Avatars Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-450 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3 text-slate-400" /> Choose Preset
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((av, idx) => {
                  const isSelected = photoUrl === av.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAvatar(av.url)}
                      title={av.name}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        isSelected ? `${activeGlowColor.border} scale-105 ring-2 ${activeGlowColor.ring}` : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="h-full w-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white font-bold" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. Drag & Drop or Select Local File */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-450 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Upload className="h-3 w-3 text-slate-400" /> Upload Photo
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  isDragging 
                    ? `border-indigo-500 bg-indigo-50/10` 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/40 dark:bg-slate-900/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Camera className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 leading-normal">
                  Drag & drop image or click to select
                </p>
                <p className="text-[8px] text-gray-400/80">Max 2MB (Base64 Live update)</p>
              </div>
            </div>

            {/* C. Interactive Accent Ring Customizer */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-450 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Palette className="h-3 w-3 text-slate-400" /> Halo Accent Color
              </label>
              <div className="flex items-center gap-2">
                {GLOW_COLORS.map((c) => {
                  const isSelected = avatarGlow === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setAvatarGlow(c.id);
                        localStorage.setItem('avatarGlow', c.id);
                      }}
                      title={c.name}
                      className={`h-6 w-6 rounded-full ${c.bg} transition-all duration-300 relative flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer ${
                        isSelected ? 'ring-4 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110' : 'opacity-80'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Editing Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:col-span-2 space-y-6">
          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" /> Personal Information
            </h3>

            {message && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in">
                <Check className="h-4 w-4" />
                {message}
              </div>
            )}

            {profileError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 p-3 text-xs text-red-600 dark:text-red-450 font-bold flex items-center gap-1.5 animate-fade-in">
                <span className="text-base">⚠️</span>
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Profile Photo Link (URL)</label>
                <input
                  type="text"
                  value={photoUrl}
                  placeholder="Insert image URL"
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Mailing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
              >
                Update Profile Details
              </button>
            </div>
          </form>

          {/* Change password block (simulated) */}
          <form onSubmit={handleChangePassword} className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" /> Account Security Settings
            </h3>

            {passwordMessage && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in">
                <Check className="h-4 w-4" />
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 p-3 text-xs text-red-600 dark:text-red-450 font-bold flex items-center gap-1.5 animate-fade-in">
                <span className="text-base">⚠️</span>
                {passwordError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-gray-400 dark:text-slate-450 font-bold flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-amber-500" /> 2FA Multi-Factor active on this email
              </span>
              <button
                type="submit"
                className="rounded-xl bg-slate-100 dark:bg-slate-850 text-gray-700 dark:text-slate-300 hover:bg-slate-250 dark:hover:bg-slate-800 px-5 py-2 text-xs font-bold transition border border-slate-200/50 dark:border-slate-700 cursor-pointer"
              >
                Change Passphrase
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
