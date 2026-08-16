"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { requestSignup, verifySignup, loginUser } from "@/lib/api";
import OtpInput from "@/components/OtpInput";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<"landing" | "signup-form" | "signup-otp" | "signin-form">("landing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockOtpMsg, setMockOtpMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !email || !password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await requestSignup({ name, phone_number: phone, email, password });
      setMockOtpMsg(`This is your OTP: ${data.mock_otp}, enter to continue.`);
      setMode("signup-otp");
    } catch (err: any) {
      setError(err.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      const data = await verifySignup(phone, otp);
      login(data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(identifier, password);
      login(data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1623] text-slate-200 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#162032] rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        {mode === "landing" && (
          <div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-4xl font-serif font-medium tracking-tight mb-4 text-white">CheckIn</h1>
              <p className="text-slate-400 leading-relaxed">A calm, private daily check-in to help track and gradually reduce drinking.</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setMode("signup-form")}
                className="w-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-medium text-lg py-4 rounded-2xl transition-colors border border-indigo-500/30"
              >
                Create Account
              </button>
              <button
                onClick={() => setMode("signin-form")}
                className="w-full bg-transparent text-slate-400 font-medium text-lg py-4 rounded-2xl hover:text-white transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {mode === "signin-form" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-medium tracking-tight mb-3 text-white">Welcome back</h1>
              <p className="text-slate-400">Sign in to sync your progress securely.</p>
            </div>
            <form onSubmit={handleSignin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 px-1">Email or Phone</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or (555) 555-5555"
                  className="w-full px-5 py-4 bg-[#0F1623] border-2 border-slate-700/50 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 px-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-[#0F1623] border-2 border-slate-700/50 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder-slate-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-medium text-lg py-4 rounded-2xl transition-colors disabled:opacity-50 border border-indigo-500/30"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <button
              onClick={() => setMode("landing")}
              className="w-full text-slate-500 font-medium py-4 hover:text-slate-300 transition-colors mt-4"
            >
              Back
            </button>
          </div>
        )}

        {mode === "signup-form" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-medium tracking-tight mb-3 text-white">Create Account</h1>
              <p className="text-slate-400">Join CheckIn to securely track your journey.</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 px-1">Username (Display Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  className="w-full px-5 py-3 bg-[#0F1623] border-2 border-slate-700/50 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 px-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-5 py-3 bg-[#0F1623] border-2 border-slate-700/50 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 px-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full px-5 py-3 bg-[#0F1623] border-2 border-slate-700/50 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 px-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3 bg-[#0F1623] border-2 border-slate-700/50 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder-slate-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-medium text-lg py-4 rounded-2xl transition-colors disabled:opacity-50 border border-indigo-500/30 mt-4"
              >
                {loading ? "Registering..." : "Continue"}
              </button>
            </form>
            <button
              onClick={() => setMode("landing")}
              className="w-full text-slate-500 font-medium py-4 hover:text-slate-300 transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {mode === "signup-otp" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {mockOtpMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-medium text-center shadow-sm">
                {mockOtpMsg}
              </div>
            )}
            
            <div className="text-center">
              <h1 className="text-3xl font-serif font-medium tracking-tight mb-3 text-white">Verify Number</h1>
              <p className="text-slate-400 mb-6">Enter the 4-digit code sent to <br/><span className="font-medium text-white">{phone}</span></p>
              
              <OtpInput
                length={4}
                value={otp}
                onChange={setOtp}
              />
              
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 4}
                className="w-full mt-10 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-medium text-lg py-4 rounded-2xl transition-colors disabled:opacity-50 border border-indigo-500/30"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </div>
            
            <button
              onClick={() => setMode("signup-form")}
              className="w-full text-slate-500 font-medium py-3 hover:text-slate-300 transition-colors"
            >
              Wait, I need to change my number
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
