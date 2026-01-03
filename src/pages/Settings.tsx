import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { User, Mail, Shield, Save, Loader2, Bell, CreditCard, Camera, Check, X, ChevronRight, Zap, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const Settings = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('General');
  const [loading, setLoading] = useState(false);

  // General State
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQR, setTwoFactorQR] = useState('');
  const [twoFactorBackupCodes, setTwoFactorBackupCodes] = useState<string[]>([]);
  const [twoFactorToken, setTwoFactorToken] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    securityAlerts: true,
    marketing: false
  });

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (profile?.notifications) {
      setNotifications(profile.notifications);
    }
    fetchTwoFactorStatus();
  }, [profile]);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await api.get('/auth/2fa-status');
      setTwoFactorEnabled(response.enabled);
    } catch (err) {
      console.error('Failed to fetch 2FA status');
    }
  };

  // --- Handlers ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await api.put('/profile', { fullName });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const toastId = toast.loading('Uploading avatar...');
    try {
        const res = await api.postUpload('/profile/avatar', formData);
        toast.success(res.message || 'Avatar updated', { id: toastId });
        
        // Optimistic update of profile image (assuming reload or context refresh handles it eventually)
        // Ideally context has a setProfile method exposed
        window.location.reload(); 
    } catch (err: any) {
        toast.error('Failed to upload image', { id: toastId });
    }
  };

  const handleRequestOtp = async () => {
    setSecurityLoading(true);
    try {
        await api.post('/profile/request-otp', {});
        setOtpSent(true);
        toast.info('OTP Sent to your email (Check console if localhost)');
    } catch (err: any) {
        toast.error(err.message || 'Failed to send OTP');
    } finally {
        setSecurityLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        return toast.error('Passwords do not match');
    }
    setSecurityLoading(true);
    try {
        await api.put('/profile/change-password', { otp, newPassword });
        toast.success('Password changed successfully');
        setOtpSent(false);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (err: any) {
        toast.error(err.message || 'Failed to change password');
    } finally {
        setSecurityLoading(false);
    }
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
      const newState = { ...notifications, [key]: !notifications[key] };
      setNotifications(newState); // Optimistic
      try {
          await api.put('/profile/notifications', { [key]: !notifications[key] });
      } catch (err) {
          toast.error('Failed to update preference');
          setNotifications(notifications); // Revert
      }
  };

  const handleEnable2FA = async () => {
    setTwoFactorLoading(true);
    try {
      const response = await api.post('/auth/enable-2fa', {});
      setTwoFactorSecret(response.secret);
      setTwoFactorQR(response.qrCode);
      setTwoFactorBackupCodes(response.backupCodes);
      setShowTwoFactorSetup(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to enable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    if (!twoFactorToken.trim()) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setTwoFactorLoading(true);
    try {
      await api.post('/auth/confirm-2fa', { token: twoFactorToken });
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      setTwoFactorToken('');
      toast.success('2FA enabled successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid code. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    setTwoFactorLoading(true);
    try {
      await api.post('/auth/disable-2fa', { password });
      setTwoFactorEnabled(false);
      toast.success('2FA disabled successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-zinc-500">Manage your account preferences and profile details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
           {['General', 'Security', 'Billing', 'Notifications'].map((item) => (
             <button 
               key={item} 
               onClick={() => setActiveTab(item)}
               className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
                 activeTab === item ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
               }`}
             >
                <span>{item}</span>
                {activeTab === item && <ChevronRight size={14} className="text-zinc-400" />}
             </button>
           ))}
        </div>

        {/* content Area */}
        <div className="md:col-span-3 space-y-6">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ duration: 0.2 }}
             >
               {/* GENERAL TAB */}
               {activeTab === 'General' && (
                 <Card className="p-8">
                    <div className="flex items-center space-x-6 mb-8">
                       <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-zinc-900 shadow-xl">
                             {profile?.avatar ? (
                                 <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${profile.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                             ) : (
                                (profile?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()
                             )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={24} className="text-white" />
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                          />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold">Profile Picture</h3>
                          <p className="text-xs text-zinc-500 max-w-xs">Click the image to upload. Supported formats: JPG, PNG. Max size: 5MB.</p>
                       </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-400">Full Name</label>
                          <div className="relative group">
                             <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                             <input 
                               type="text" 
                               value={fullName}
                               onChange={(e) => setFullName(e.target.value)}
                               className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                             />
                          </div>
                       </div>
                       <button 
                         type="submit" 
                         disabled={loading}
                         className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
                       >
                          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                          <span>Save Changes</span>
                       </button>
                    </form>
                 </Card>
               )}

               {/* SECURITY TAB */}
               {activeTab === 'Security' && (
                 <Card className="p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center">
                       <Shield size={20} className="mr-2 text-emerald-500" />
                       Password & Security
                    </h3>
                    
                    {!otpSent ? (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
                            <div>
                                <h4 className="font-bold text-sm">Change Password</h4>
                                <p className="text-xs text-zinc-500 mt-1">We will send a One-Time Password (OTP) to your registered email to verify this action.</p>
                            </div>
                            <button 
                              onClick={handleRequestOtp} 
                              disabled={securityLoading}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                            >
                                {securityLoading ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                                Send OTP Code
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Enter OTP Code</label>
                                <input 
                                  type="text" 
                                  value={otp} 
                                  onChange={(e) => setOtp(e.target.value)}
                                  placeholder="000000"
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-4 font-mono text-center tracking-widest text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-[10px] text-zinc-500 text-center">Check your email (or server console)</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">New Password</label>
                                <input 
                                  type="password" 
                                  value={newPassword} 
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-4"
                                />
                            </div>
                             <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-zinc-500">Confirm Password</label>
                                <input 
                                  type="password" 
                                  value={confirmPassword} 
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-4"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button 
                                  type="submit" 
                                  disabled={securityLoading}
                                  className="flex-1 bg-white text-black py-2 rounded-xl font-bold text-sm hover:bg-zinc-200"
                                >
                                    {securityLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Update Password'}
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setOtpSent(false)}
                                  className="px-4 py-2 bg-transparent border border-zinc-700 rounded-xl font-bold text-xs hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 2FA Section */}
                    <div className="mt-8 pt-6 border-t border-zinc-800">
                        <h4 className="font-bold text-sm mb-4 flex items-center">
                            <Smartphone size={16} className="mr-2 text-purple-500" />
                            Two-Factor Authentication
                        </h4>

                        {!twoFactorEnabled ? (
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h5 className="font-semibold text-sm text-white">Enable 2FA</h5>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Add an extra layer of security to your account with TOTP authentication.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleEnable2FA}
                                        disabled={twoFactorLoading}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {twoFactorLoading ? <Loader2 className="animate-spin" size={14} /> : <Smartphone size={14} />}
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h5 className="font-semibold text-sm text-white">2FA is Enabled</h5>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Your account is protected with two-factor authentication.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDisable2FA}
                                        disabled={twoFactorLoading}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {twoFactorLoading ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                                        Disable 2FA
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                 </Card>
               )}

               {/* BILLING TAB */}
               {activeTab === 'Billing' && (
                 <Card className="p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center">
                       <CreditCard size={20} className="mr-2 text-blue-500" />
                       Plan & Billing
                    </h3>

                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-2xl border border-blue-500/20 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">Current Plan</p>
                            <h2 className="text-2xl font-bold capitalize">{profile?.planTier || 'Basic'}</h2>
                        </div>
                        <button 
                          onClick={() => setShowUpgradeModal(true)}
                          className="px-6 py-2 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                        >
                            {profile?.planTier === 'premium' ? 'Manage' : 'Upgrade'}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-bold text-zinc-400">Payment Features</p>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4 text-sm text-zinc-500">
                             <Check size={16} className="text-emerald-500" />
                             <span>Secure transactions via Stripe</span>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4 text-sm text-zinc-500">
                             <Check size={16} className="text-emerald-500" />
                             <span>Crypto-Fiat conversion</span>
                        </div>
                    </div>
                 </Card>
               )}

               {/* NOTIFICATIONS TAB */}
               {activeTab === 'Notifications' && (
                 <Card className="p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center">
                       <Bell size={20} className="mr-2 text-amber-500" />
                       Notification Preferences
                    </h3>

                    <div className="space-y-4">
                        {[
                            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important account updates via email.' },
                            { key: 'securityAlerts', label: 'Security Alerts', desc: 'Get notified about login attempts and password changes.' },
                            { key: 'marketing', label: 'Marketing & Offers', desc: 'Stay updated with new features and promotions.' }
                        ].map((pref) => (
                            <div key={pref.key} className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                                <div>
                                    <p className="text-sm font-bold">{pref.label}</p>
                                    <p className="text-xs text-zinc-500">{pref.desc}</p>
                                </div>
                                <div 
                                  onClick={() => toggleNotification(pref.key as keyof typeof notifications)}
                                  className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${notifications[pref.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[pref.key as keyof typeof notifications] ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </Card>
               )}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 relative"
            >
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                    <p className="text-zinc-500">Unlock higher limits and exclusive cards</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: 'Basic', price: 'Free', features: ['Standard Limits', 'Virtual Card', '5% Trading Fees'], color: 'zinc' },
                        { name: 'Standard', price: '$9.99', features: ['Higher Limits', 'Physical Card', '2% Trading Fees', 'Priority Support'], color: 'blue' },
                        { name: 'Premium', price: '$29.99', features: ['Unlimited', 'Metal Card', '0% Trading Fees', 'Dedicated Advisor', 'Concierge'], color: 'amber' },
                    ].map((plan) => (
                        <div key={plan.name} className={`relative p-6 rounded-2xl border ${plan.name === 'Premium' ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/50'} flex flex-col`}>
                            {plan.name === 'Premium' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Best Value
                                </div>
                            )}
                            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                            <p className="text-2xl font-black mb-6">{plan.price}<span className="text-sm font-normal text-zinc-500">/mo</span></p>
                            
                            <div className="space-y-3 mb-8 flex-1">
                                {plan.features.map((f) => (
                                    <div key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Check size={14} className={plan.name === 'Premium' ? 'text-amber-500' : 'text-blue-500'} />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <NavLink 
                              to={`/checkout?plan=${plan.name.toLowerCase()}`}
                              className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-colors ${
                                  plan.name === 'Premium' ? 'bg-amber-500 text-black hover:bg-amber-400' : 
                                  plan.name === 'Standard' ? 'bg-blue-600 text-white hover:bg-blue-500' : 
                                  'bg-zinc-800 text-white hover:bg-zinc-700'
                              }`}
                            >
                                {plan.name === (profile?.planTier ? profile.planTier.charAt(0).toUpperCase() + profile.planTier.slice(1) : 'Basic') 
                                  ? 'Current Plan' 
                                  : 'Select Plan'}
                            </NavLink>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Enable Two-Factor Authentication</h3>
              <button
                onClick={() => setShowTwoFactorSetup(false)}
                className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-zinc-900 rounded-xl p-4 mb-4">
                  <img src={twoFactorQR} alt="QR Code" className="mx-auto w-48 h-48" />
                </div>
                <p className="text-sm text-zinc-500 mb-2">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <p className="text-xs text-zinc-600 font-mono bg-zinc-900 p-2 rounded">
                  {twoFactorSecret}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Enter 6-digit code from your app
                </label>
                <input
                  type="text"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 px-4 font-mono text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                  maxLength={6}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-300 mb-2">Backup Codes</h4>
                <p className="text-xs text-zinc-500 mb-3">
                  Save these backup codes in a secure place. You can use them to access your account if you lose your device.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {twoFactorBackupCodes.map((code, index) => (
                    <div key={index} className="bg-zinc-900 p-2 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleConfirm2FA}
                  disabled={twoFactorLoading || twoFactorToken.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {twoFactorLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  Enable 2FA
                </button>
                <button
                  onClick={() => setShowTwoFactorSetup(false)}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;
