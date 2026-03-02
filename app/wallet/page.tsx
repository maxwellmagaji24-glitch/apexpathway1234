'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Wallet() {
  const [userName] = useState("Maxwell");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Mock data - replace with API calls
  const walletData = {
    currentBalance: 245400.00,
    grossSales: 350000,
    totalProfit: 245000,
    totalPaid: 50000,
    hasBankAccount: true,
    bankDetails: {
      bankName: "ZENITH BANK",
      accountName: "JOHN DOE",
      accountNumberLast4: "4321"
    }
  };

  const recentTransactions = [
    {
      id: 1,
      type: "CREDIT",
      icon: "↓",
      description: "COURSE SALE",
      course: "MAT101: Calculus Basics",
      amount: 15000.00,
      date: "Oct 12, 2026",
      status: "SUCCESS"
    },
    {
      id: 2,
      type: "DEBIT",
      icon: "↑",
      description: "PAYOUT REQUEST",
      course: "To Zenith Bank - **4321",
      amount: 50000.00,
      date: "Oct 11, 2026",
      status: "REQUESTED"
    },
    {
      id: 3,
      type: "CREDIT",
      icon: "↓",
      description: "COURSE SALE",
      course: "PHY201: Physics",
      amount: 10000.00,
      date: "Oct 10, 2026",
      status: "SUCCESS"
    },
    {
      id: 4,
      type: "DEBIT",
      icon: "↑",
      description: "REFUND PROCESSED",
      course: "CHM102: Chemistry",
      amount: 5000.00,
      date: "Oct 09, 2026",
      status: "SUCCESS"
    }
  ];

  const handleWithdraw = () => {
    // API call would go here
    setIsWithdrawModalOpen(false);
    setShowSuccessMessage(true);
    setWithdrawAmount("");
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Withdrawal request has been successfully made and you will be credited within 24 hours.</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="w-12 h-12 flex items-center justify-center cursor-pointer">
                  <img 
                    src="/apex-logo.png" 
                    alt="Apex Pathway" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
              
              <a href="#" className="text-gray-700 hover:text-gray-900 font-normal">
                Explore
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-normal">
                Subscribe
              </a>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for anything"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Right Side Navigation */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-normal text-sm">
                Apex Business
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-normal text-sm">
                Become a tutor 
              </a>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-normal text-sm">
                My learning
              </Link>
              
              {/* Icons */}
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>

              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              {/* User Avatar with Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-gray-800 transition-colors overflow-hidden"
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userName.substring(0, 2).toUpperCase()}</span>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-600">maxwell@example.com</p>
                    </div>

                    <Link href="/profile" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>

                    <Link href="/wallet" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors bg-blue-50">
                      <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Wallet
                    </Link>

                    <Link href="/settings" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>

                    <Link href="/analytics" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Analytics
                    </Link>

                    <div className="border-t border-gray-200 mt-2">
                      <button className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">MY WALLET</h1>

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">BALANCE</p>
              <p className="text-5xl font-bold text-gray-900">₦ {walletData.currentBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <button 
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              WITHDRAW FUNDS
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">OVERVIEW</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Gross Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">GROSS SALES</p>
              <p className="text-3xl font-bold text-gray-900">₦ {walletData.grossSales.toLocaleString('en-NG')}</p>
            </div>

            {/* Total Profit */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">TOTAL PROFIT</p>
              <p className="text-3xl font-bold text-gray-900">₦ {walletData.totalProfit.toLocaleString('en-NG')}</p>
            </div>

            {/* Total Paid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">TOTAL PAID</p>
              <p className="text-3xl font-bold text-gray-900">₦ {walletData.totalPaid.toLocaleString('en-NG')}</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">RECENT TRANSACTIONS</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {recentTransactions.map((transaction, index) => (
              <div key={transaction.id} className={`p-6 ${index !== recentTransactions.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${
                      transaction.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{transaction.description}</p>
                      <p className="text-gray-600 text-sm">{transaction.course}</p>
                      <p className="text-gray-500 text-xs mt-1">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'} ₦ {transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${
                      transaction.status === 'SUCCESS' ? 'text-green-600' : 
                      transaction.status === 'REQUESTED' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      • {transaction.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Profile */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">PAYOUT PROFILE {walletData.hasBankAccount && <span className="text-green-600 text-sm">(Active)</span>}</h2>
            {walletData.hasBankAccount && (
              <button 
                onClick={() => setIsBankModalOpen(true)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                EDIT SETTINGS
              </button>
            )}
          </div>

          {walletData.hasBankAccount ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">BANK NAME</p>
                  <p className="text-gray-900 font-semibold">{walletData.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ACCOUNT NAME</p>
                  <p className="text-gray-900 font-semibold">{walletData.bankDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ACCOUNT NUMBER</p>
                  <p className="text-gray-900 font-semibold">******{walletData.bankDetails.accountNumberLast4}</p>
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
                onClick={() => setIsBankModalOpen(true)}
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
                Available Balance: <span className="font-bold text-gray-900">₦ {walletData.currentBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>

              <label className="block text-gray-700 font-medium mb-2">
                Amount to Withdraw (₦):
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                SUBMIT WITHDRAWAL
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
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Select Bank... ▼</option>
                  <option>Access Bank</option>
                  <option>Zenith Bank</option>
                  <option>GTBank</option>
                  <option>First Bank</option>
                  <option>UBA</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Account Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Account Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                SAVE SETTINGS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}