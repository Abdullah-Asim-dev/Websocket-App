import React, { useState } from "react";
import { motion } from "framer-motion";

export const Auth = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const isSignup = mode === "signup";

  const handleSubmit = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Username aur password zaroori hain");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      // 🚀 FIXED: Localhost URL ko hata kar aapka live Back4App URL laga diya hai
      const res = await fetch(`https://b4a.run${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kuch masla ho gaya");
        setLoading(false);
        return;
      }

      if (isSignup) {
        // Signup ke baad seedha login mode pe le jao
        setMode("login");
        setError("Account ban gaya! Ab login karo.");
        setPassword("");
      } else {
        // Login success — token aur username save karo
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        onAuthSuccess(data.username);
      }
    } catch (err) {
      setError("Server se connect nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050710] px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-violet-600/25 blur-[120px]"
          animate={{ x:, y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[130px]"
          animate={{ x: [0, -25, 0], y:, scale: [1.05, 1, 1.05] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        <motion.div
          className="absolute -inset-[1.5px] rounded-3xl opacity-70"
          style={{
            background: "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #d946ef, #8b5cf6)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="relative rounded-3xl bg-[#0b0e18] px-8 py-10 flex flex-col gap-5
                     shadow-[0_20px_70px_-15px_rgba(139,92,246,0.35)]"
        >
          <div className="flex flex-col items-center gap-3 mb-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400
                            flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-xl">✦</span>
            </div>
            <div className="text-center">
              <h1 className="text-white text-[26px] font-semibold tracking-tight">
                {isSignup ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-gray-500 text-[13px] mt-1">
                {isSignup ? "Naya account banao" : "Login karke chat shuru karo"}
              </p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={onEnter}
            className="w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl
                       px-4 py-3 outline-none focus:border-violet-400/60 focus:bg-white/[0.06]"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onEnter}
              className="w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl
                         px-4 py-3 pr-11 outline-none focus:border-cyan-400/60 focus:bg-white/[0.06]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && (
            <p className="text-[13px] text-center text-rose-400">{error}</p>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
            whileTap={!loading ? { scale: 0.96 } : {}}
            className="mt-1 rounded-xl py-3 text-sm font-medium text-white
                       bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500
                       shadow-lg shadow-violet-600/25 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignup ? "Sign up" : "Login"}
          </motion.button>

          <button
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setError("");
            }}
            className="text-[13px] text-gray-400 hover:text-gray-200 text-center"
          >
            {isSignup ? "Already have an account? Login" : "No account? Sign up"}
          </button>
        </motion.div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap');
      `}</style>
    </div>
  );
};
