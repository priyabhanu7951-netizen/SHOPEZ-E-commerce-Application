import React, { useState } from "react";
import { User } from "../types";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function AuthPage({ onAuthSuccess, onNavigate }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  // Form Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("Customer");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { email, password }
      : { username, email, password, usertype };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Authentication failed");
      }

      const authenticatedUser: User = await res.json();
      onAuthSuccess(authenticatedUser);

      // Redirect depending on user type
      if (authenticatedUser.usertype === "Admin") {
        onNavigate("admin-dashboard");
      } else {
        onNavigate("landing");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-md space-y-6">
        
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-indigo-950 font-sans tracking-tight">
            {isLogin ? "Login" : "Register"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isLogin ? "Welcome back! Enter your credentials." : "Create your ShopEZ registered account."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-md text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username (Register Only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">Username</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 block">Email address</label>
            <input
              type="email"
              required
              placeholder="e.g. customer@gmail.com"
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 block">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* User type (Register Only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">User type</label>
              <select
                required
                className="w-full border border-gray-200 rounded-md p-2.5 bg-white text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                value={usertype}
                onChange={(e) => setUsertype(e.target.value)}
              >
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-md text-sm shadow-sm hover:shadow-md transition-all pt-2.5 pb-2.5 mt-2 disabled:opacity-50"
            id="auth-submit-btn"
          >
            {loading ? "Authenticating..." : isLogin ? "Login" : "Register"}
          </button>

        </form>

        {/* Quick Demo Credentials */}
        {isLogin && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Demo Accounts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEmail("customer@gmail.com");
                  setPassword("customer123");
                }}
                className="text-left bg-white hover:bg-indigo-50/50 p-2 border rounded border-gray-150 transition-colors group cursor-pointer"
              >
                <div className="font-semibold text-indigo-950 group-hover:text-indigo-600">Customer Mode</div>
                <div className="text-gray-500 font-mono text-[11px] mt-0.5">customer@gmail.com</div>
                <div className="text-gray-400 font-mono text-[10px]">Pass: customer123</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@gmail.com");
                  setPassword("admin123");
                }}
                className="text-left bg-white hover:bg-amber-50/50 p-2 border rounded border-gray-150 transition-colors group cursor-pointer"
              >
                <div className="font-semibold text-amber-950 group-hover:text-amber-600">Admin Mode</div>
                <div className="text-gray-500 font-mono text-[11px] mt-0.5">admin@gmail.com</div>
                <div className="text-gray-400 font-mono text-[10px]">Pass: admin123</div>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center italic mt-1">
              Click a card to auto-fill credentials
            </p>
          </div>
        )}

        {/* Toggle switch link */}
        <div className="text-center pt-2 border-t border-gray-50 text-xs">
          {isLogin ? (
            <p className="text-gray-500">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg("");
                }}
                className="text-indigo-600 font-bold hover:underline"
                id="toggle-register-link"
              >
                Register
              </button>
            </p>
          ) : (
            <p className="text-gray-500">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrorMsg("");
                }}
                className="text-indigo-600 font-bold hover:underline"
                id="toggle-login-link"
              >
                Login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
