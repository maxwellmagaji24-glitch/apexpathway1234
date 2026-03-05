'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { InstructorRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authApi, Bank, PayoutProfile, InstructorEarningsResponse, PayoutRequest } from '../api/authApi';

function WalletContent() {
  const { user } = useUser();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [payoutProfile, setPayoutProfile] = useState<PayoutProfile | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const [payoutForm, setPayoutForm] = useState({ accountName: "", bank: "", bankCode: "", accountNumber: "" });
  const [verifiedName, setVerifiedName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  const [earnings, setEarnings] = useState<InstructorEarningsResponse | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setProfileLoading(true);
      setEarningsLoading(true);
      try {
        const [profile, earningsData, payouts] = await Promise.all([
          authApi.getPayoutProfile(),
          authApi.getInstructorEarnings(),
          authApi.getPayoutRequests()
        ]);
        setPayoutProfile(profile);
        setEarnings(earningsData);
        setPayoutRequests(payouts);
      } catch (err) {
        console.error("Failed to load wallet data", err);
      } finally {
        setProfileLoading(false);
        setEarningsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const openBankModal = () => {
    fetchBanks();
    setIsBankModalOpen(true);
    // Pre-fill if they already have one
    if (payoutProfile) {
      setPayoutForm({
        bank: payoutProfile.bankName,
        accountName: payoutProfile.accountName,
        accountNumber: "",
        bankCode: "" // We don't have the original code saved
      });
      setVerifiedName(payoutProfile.accountName);
    } else {
      setPayoutForm({ accountName: "", bank: "", bankCode: "", accountNumber: "" });
      setVerifiedName("");
    }
    setVerifyError("");
    setPayoutError("");
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }

    if (earnings && (amount * 100) > earnings.currentBalanceKobo) {
      setWithdrawError("Insufficient available balance.");
      return;
    }

    setIsSubmittingWithdrawal(true);
    setWithdrawError("");
    try {
      await authApi.requestWithdrawal(Math.floor(amount * 100));
      setIsWithdrawModalOpen(false);
      setShowSuccessMessage(true);
      setWithdrawAmount("");

      // Refresh data
      const [earningsData, payouts] = await Promise.all([
        authApi.getInstructorEarnings(),
        authApi.getPayoutRequests()
      ]);
      setEarnings(earningsData);
      setPayoutRequests(payouts);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (err: any) {
      setWithdrawError(err.message || "Withdrawal request failed.");
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const handleAccountNumberChange = async (val: string) => {
    setPayoutForm((p) => ({ ...p, accountNumber: val }));
    setVerifiedName("");
    setVerifyError("");
    if (val.length === 10 && payoutForm.bankCode) {
      setVerifying(true);
      try {
        const result = await authApi.resolveAccount(val, payoutForm.bankCode);
        if (result.verified && result.accountName) {
          setVerifiedName(result.accountName);
          setPayoutForm((p) => ({ ...p, accountName: result.accountName! }));
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
    setPayoutForm((p) => ({ ...p, bank: bankName, bankCode: bank?.code || "" }));
    setVerifiedName("");
    setVerifyError("");
    // Auto-verify if account number already entered
    if (payoutForm.accountNumber.length === 10 && bank?.code) {
      handleAccountNumberChange(payoutForm.accountNumber);
    }
  };

  const handlePayoutSave = async () => {
    setIsSavingPayout(true);
    setPayoutError("");
    try {
      const savedProfile = await authApi.savePayoutProfile({
        bankName: payoutForm.bank,
        accountName: verifiedName,
        accountNumber: payoutForm.accountNumber,
      });
      setPayoutProfile(savedProfile);
      setIsBankModalOpen(false);
    } catch (err: any) {
      setPayoutError(err.message || 'Failed to save bank details.');
    } finally {
      setIsSavingPayout(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Withdrawal request has been successfully made and you will be credited within 24 hours.</p>
        </div>
      )}

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400 mb-6 gap-2">
          <Link href="/instructorsdashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">My Wallet</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 uppercase tracking-tight">MY WALLET</h1>

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 relative">
          {earningsLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">AVAILABLE BALANCE</p>
              <p className="text-5xl font-black text-gray-900 tracking-tight">₦ {((earnings?.currentBalanceKobo || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <button
              onClick={() => {
                setWithdrawError("");
                setIsWithdrawModalOpen(true);
              }}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              WITHDRAW FUNDS
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">TOTAL PERFORMANCE</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Net Share */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">NET EARNINGS</p>
              <p className="text-3xl font-black text-gray-900">₦ {((earnings?.netShareKobo || 0) / 100).toLocaleString('en-NG')}</p>
            </div>

            {/* Gross Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">GROSS REVENUE</p>
              <p className="text-3xl font-black text-gray-900 font-mono">₦ {((earnings?.grossSalesKobo || 0) / 100).toLocaleString('en-NG')}</p>
            </div>

            {/* Total Paid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">TOTAL WITHDRAWN</p>
              <p className="text-3xl font-black text-gray-900">₦ {((earnings?.withdrawnKobo || 0) / 100).toLocaleString('en-NG')}</p>
            </div>
          </div>
        </div>

        {/* Recent Ledger Entries */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">TRANSACTION HISTORY</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            {earningsLoading ? (
              <div className="p-12 text-center text-gray-400 font-medium">Loading transactions...</div>
            ) : (earnings?.recent.length || 0) > 0 ? (
              earnings?.recent.map((tx, index) => (
                <div key={tx.id} className={`p-8 ${index !== earnings.recent.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${tx.entryType === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {tx.entryType === 'CREDIT' ? '↓' : '↑'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-gray-900 leading-none">{tx.description}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${tx.reason === 'COURSE_SALE' ? 'bg-green-100 text-green-700' :
                            tx.reason === 'PAYOUT' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {tx.reason.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">
                          {new Date(tx.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto pt-2 sm:pt-0">
                      <p className={`text-2xl font-black tracking-tight ${tx.entryType === 'CREDIT' ? 'text-green-600' : 'text-blue-600'}`}>
                        {tx.entryType === 'CREDIT' ? '+' : '-'} ₦ {(tx.amountKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-1">REF: {tx.referenceId.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500 font-medium">No transactions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payout History */}
        {payoutRequests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">PAYOUT REQUESTS</h2>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              {payoutRequests.map((req, index) => (
                <div key={req.id} className={`p-6 ${index !== payoutRequests.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">₦ {(req.amountKobo / 100).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{req.bankNameSnapshot} • {req.accountNumberLast4Snapshot}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase">Requested on {new Date(req.requestedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {req.status === 'PAID' ? 'COMPLETED' : req.status === 'REQUESTED' ? 'PENDING' : req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payout Profile */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">PAYOUT PROFILE {payoutProfile && <span className="text-green-600 text-sm">(Active)</span>}</h2>
            {payoutProfile && (
              <button
                onClick={openBankModal}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={profileLoading}
              >
                EDIT SETTINGS
              </button>
            )}
          </div>

          {profileLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : payoutProfile ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">BANK NAME</p>
                  <p className="text-gray-900 font-semibold">{payoutProfile.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ACCOUNT NAME</p>
                  <p className="text-gray-900 font-semibold">{payoutProfile.accountName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ACCOUNT NUMBER</p>
                  <p className="text-gray-900 font-semibold">******{payoutProfile.accountNumberLast4}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="text-gray-600 mb-2">No payout bank added yet.</p>
              <p className="text-gray-500 text-sm mb-6">Please add a bank account to receive withdrawals.</p>
              <button
                onClick={openBankModal}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                ADD BANK
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Withdraw Funds Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">WITHDRAW FUNDS</h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Available Balance: <span className="font-black text-gray-900 font-mono">₦ {((earnings?.currentBalanceKobo || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>

              <label className="block text-gray-700 font-bold text-sm uppercase tracking-widest mb-2">
                Amount to Withdraw (₦):
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                min="0"
                value={withdrawAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (parseFloat(val) < 0) return;
                  setWithdrawAmount(val);
                }}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
              />
              {withdrawError && <p className="text-red-500 text-xs font-bold mt-2">{withdrawError}</p>}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 py-4 border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isSubmittingWithdrawal}
                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {isSubmittingWithdrawal ? 'WAIT...' : 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Bank Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">PAYOUT BANK SETTINGS</h3>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Bank Name:
                </label>
                <select
                  value={payoutForm.bank}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">{banksLoading ? 'Loading banks...' : 'Select a bank...'}</option>
                  {banks.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Account Number: {payoutProfile && !payoutForm.accountNumber && <span className="text-sm font-normal text-gray-500">(Was: ******{payoutProfile.accountNumberLast4})</span>}
                </label>
                <input
                  type="text"
                  placeholder="Enter 10-digit account number"
                  value={payoutForm.accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {verifying && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying account...
                  </div>
                )}
                {verifiedName && payoutForm.accountNumber.length === 10 && <div className="flex items-center gap-2 mt-2 text-sm text-green-600 font-medium whitespace-nowrap overflow-hidden">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {verifiedName}
                </div>}
                {verifyError && <p className="text-sm text-red-500 mt-2">{verifyError}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Account Name:
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled after verification"
                  value={payoutForm.accountName || verifiedName}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {payoutError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {payoutError}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handlePayoutSave}
                disabled={(!verifiedName && !payoutForm.accountName) || isSavingPayout}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPayout ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default function Wallet() {
  return (
    <InstructorRoute>
      <WalletContent />
    </InstructorRoute>
  );
}