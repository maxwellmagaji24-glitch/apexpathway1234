'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import { authApi, Bank, BASE_URL, UPLOAD_URL } from '../api/authApi';
import { ProtectedRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </>
    )}
  </svg>
);

const CheckCircle = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const universities = ["LAUTECH", "University of Lagos", "University of Ibadan", "OAU", "UNILORIN", "FUTA", "ABU Zaria"];



function SettingsContent() {
  const { user, isInstructor, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.avatarId) {
      setUserAvatar(`${UPLOAD_URL}/public/${user.avatarId}`);
    } else {
      setUserAvatar(null);
    }
  }, [user]);
  const userName = user?.fullName?.split(' ')[0] || 'User';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    bio: "I am a student learning new skills on Apex Pathway.",
    university: "University of Lagos",
    department: "Computer Science",
    level: "400",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [payout, setPayout] = useState({ accountName: "", bank: "", bankCode: "", accountNumber: "" });
  const [verifiedName, setVerifiedName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [payoutSaved, setPayoutSaved] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setUserAvatar(reader.result as string);
      reader.readAsDataURL(file);
      setAvatarFile(file);
    }
  };

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    setProfileError('');
    try {
      await authApi.updateProfile({
        fullName: profile.fullName,
        bio: profile.bio,
        department: profile.department,
        level: profile.level,
        ...(avatarFile ? { avatar: avatarFile } : {}),
      });
      await refreshUser(); // Update context
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validatePassword = (pw: string) => {
    return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw.length >= 8;
  };

  const handlePasswordUpdate = () => {
    setPasswordError("");
    if (!validatePassword(passwords.newPassword)) {
      setPasswordError("Password must include uppercase, lowercase, number, and special character.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordSaved(true);
    setPasswords({ newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleAccountNumberChange = async (val: string) => {
    setPayout((p) => ({ ...p, accountNumber: val }));
    setVerifiedName("");
    setVerifyError("");
    if (val.length === 10 && payout.bankCode) {
      setVerifying(true);
      try {
        const result = await authApi.resolveAccount(val, payout.bankCode);
        if (result.verified && result.accountName) {
          setVerifiedName(result.accountName);
          setPayout((p) => ({ ...p, accountName: result.accountName! }));
        } else {
          setVerifyError(result.message || 'Could not verify account. Check details.');
        }
      } catch (err: any) {
        setVerifyError(err.message || 'Verification failed. Try again.');
      } finally {
        setVerifying(false);
      }
    }
  };

  const handleBankChange = (bankName: string) => {
    const bank = banks.find((b) => b.name === bankName);
    setPayout((p) => ({ ...p, bank: bankName, bankCode: bank?.code || "" }));
    setVerifiedName("");
    setVerifyError("");
    // Auto-verify if account number already entered
    if (payout.accountNumber.length === 10 && bank?.code) {
      handleAccountNumberChange(payout.accountNumber);
    }
  };

  const handlePayoutSave = async () => {
    setIsSavingPayout(true);
    setPayoutError("");
    try {
      await authApi.savePayoutProfile({
        bankName: payout.bank,
        accountName: verifiedName,
        accountNumber: payout.accountNumber,
      });
      setPayoutSaved(true);
      setTimeout(() => setPayoutSaved(false), 3000);
    } catch (err: any) {
      setPayoutError(err.message || 'Failed to save bank details.');
    } finally {
      setIsSavingPayout(false);
    }
  };

  // Fetch banks when payouts tab is opened
  const fetchBanks = async () => {
    if (banks.length > 0) return;
    setBanksLoading(true);
    try {
      const resp: any = await authApi.getBanks();
      const banksData: Bank[] = Array.isArray(resp) ? resp : (resp.data || []);
      // Remove duplicate banks with the same code (e.g., Zenith Bank)
      const uniqueBanks: Bank[] = Array.from(new Map(banksData.map((b: Bank) => [b.code, b])).values());
      setBanks(uniqueBanks);
    } catch (err) {
      console.error('Failed to load banks', err);
    } finally {
      setBanksLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    ...(isInstructor ? [{ id: "payouts", label: "Payouts" }] : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="flex-1 w-full flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pt-6">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Settings</span>
          </nav>
        </div>

        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="flex gap-8">
            <aside className="w-56 flex-shrink-0">
              <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'payouts') fetchBanks();
                    }}
                    className={`w-full text-left px-5 py-4 text-sm font-medium transition-all border-l-4 ${activeTab === tab.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {!isInstructor && user?.instructorStatus !== 'PENDING' && (
                <Link href="/apply-instructor" className="block mt-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-blue-200 transition-all">
                    <svg className="w-8 h-8 mb-2 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    <h3 className="font-bold text-sm mb-1">Become an Instructor</h3>
                    <p className="text-xs text-blue-200 leading-relaxed">Share your knowledge and earn from your courses.</p>
                    <div className="mt-3 text-xs font-bold flex items-center gap-1">
                      Apply Now →
                    </div>
                  </div>
                </Link>
              )}
              {user?.instructorStatus === 'PENDING' && (
                <Link href="/apply-instructor" className="block mt-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 hover:shadow-md transition-all">
                    <svg className="w-8 h-8 mb-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-bold text-sm text-amber-900 mb-1">Application Pending</h3>
                    <p className="text-xs text-amber-700 leading-relaxed">Your instructor application is under review.</p>
                  </div>
                </Link>
              )}
            </aside>

            <div className="flex-1 max-w-2xl">
              {activeTab === "profile" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative group">
                      <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden cursor-pointer">
                        {userAvatar ? <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{userName.substring(0, 2).toUpperCase()}</span>}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                    <div>
                      <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Upload Photo</button>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <input type="email" value={profile.email} disabled className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                        <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    {isInstructor && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                        <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4} placeholder="Tell students about yourself..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none placeholder-gray-500" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">University</label>
                        <select value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                          {universities.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                        <input type="text" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" />
                      </div>
                    </div>
                    <div className="w-1/2 pr-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
                      <select value={profile.level} onChange={(e) => setProfile({ ...profile, level: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                        {["100", "200", "300", "400", "500"].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                    <button onClick={handleProfileSave} disabled={isSavingProfile} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    {profileSaved && <div className="flex items-center gap-2 text-green-600 text-sm font-medium"><CheckCircle />Changes saved!</div>}
                    {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Security & Password</h2>
                  <p className="text-gray-500 text-sm mb-8">Manage your account security and update your password.</p>
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-5">Change Password</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                        <div className="relative">
                          <input type={showNew ? "text" : "password"} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" placeholder="Enter new password" />
                          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon open={showNew} /></button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[
                            { label: "8+ chars", check: passwords.newPassword.length >= 8 },
                            { label: "Uppercase", check: /[A-Z]/.test(passwords.newPassword) },
                            { label: "Lowercase", check: /[a-z]/.test(passwords.newPassword) },
                            { label: "Number", check: /[0-9]/.test(passwords.newPassword) },
                            { label: "Special char", check: /[^A-Za-z0-9]/.test(passwords.newPassword) },
                          ].map(({ label, check }) => (
                            <span key={label} className={`text-xs px-2 py-1 rounded-full font-medium ${check ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {check ? "✓" : "○"} {label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input type={showConfirm ? "text" : "password"} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" placeholder="Confirm new password" />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon open={showConfirm} /></button>
                        </div>
                        {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                      </div>
                      <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-700"><strong>Auto-Link:</strong> If you sign in with Google using this email, your accounts will automatically sync.</p>
                      </div>
                      {passwordError && (
                        <div className="flex gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-600">{passwordError}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                      <button onClick={handlePasswordUpdate} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Update Password</button>
                      {passwordSaved && <div className="flex items-center gap-2 text-green-600 text-sm font-medium"><CheckCircle />Password updated!</div>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payouts" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Payout Settings</h2>
                  <p className="text-gray-500 text-sm mb-8">Set up your bank account to receive course earnings.</p>
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-5">Bank Account Details</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank</label>
                        <select value={payout.bank} onChange={(e) => handleBankChange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                          <option value="">{banksLoading ? 'Loading banks...' : 'Select a bank...'}</option>
                          {banks.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                        <input type="text" value={payout.accountNumber} onChange={(e) => handleAccountNumberChange(e.target.value.replace(/\D/g, "").slice(0, 10))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" placeholder="Enter 10-digit account number" maxLength={10} />
                        {verifying && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Verifying account...
                          </div>
                        )}
                        {verifiedName && <div className="flex items-center gap-2 mt-2 text-sm text-green-600 font-medium"><CheckCircle />{verifiedName}</div>}
                        {verifyError && <p className="text-sm text-red-500 mt-2">{verifyError}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                        <input type="text" value={payout.accountName || verifiedName} readOnly placeholder="Auto-filled after verification" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-sm text-amber-700">Your account number is encrypted and stored securely. Only the last 4 digits will be visible after saving.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                      <button onClick={handlePayoutSave} disabled={!verifiedName || isSavingPayout} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSavingPayout ? 'Saving...' : 'Save Bank Details'}</button>
                      {payoutSaved && <div className="flex items-center gap-2 text-green-600 text-sm font-medium"><CheckCircle />Bank details saved!</div>}
                      {payoutError && <p className="text-sm text-red-500">{payoutError}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}