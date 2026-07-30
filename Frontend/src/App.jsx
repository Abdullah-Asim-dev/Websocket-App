import React, { useState } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { Chat } from "./Chat";
import { Auth } from "./Auth";
import ahmad from "./assets/ahmad.mp3";

// 🚀 FIXED: localhost ko hata kar aapka exact Back4App backend URL laga diya hai
const socket = io.connect("https://b4a.run");

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

const App = () => {
  const [authedUser, setAuthedUser] = useState(
    localStorage.getItem("username") || null
  );
  const [username, setUsername] = useState(authedUser || "");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const notification = new Audio(ahmad);

  const joinChat = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
      notification.play();
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter") joinChat();
  };

  const canJoin = username.trim() !== "" && room.trim() !== "";

  // Step 1: Not logged in yet -> show Auth screen
  if (!authedUser) {
    return (
      <Auth
        onAuthSuccess={(name) => {
          setAuthedUser(name);
          setUsername(name);
        }}
      />
    );
  }

  return (
    <>
      {!showChat && (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050710] px-4">
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
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
              style={{ background: "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #d946ef, #8b5cf6)" }}
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
              <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5">
                <motion.div variants={item} className="flex flex-col items-center gap-3 mb-1">
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400
                               flex items-center justify-center shadow-lg shadow-violet-500/30"
                  >
                    <span className="text-xl">✦</span>
                  </motion.div>
                  <div className="text-center">
                    <h1 className="text-white text-[26px] font-semibold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                      Hi, {authedUser}
                    </h1>
                    <p className="text-gray-500 text-[13px] mt-1 tracking-wide">
                      Drop in a room, start the conversation
                    </p>
                  </div>
                </motion.div>

                <motion.label variants={item} className="relative block">
                  <input
                    type="text"
                    placeholder=" "
                    onFocus={() => setFocusField("room")}
                    onBlur={() => setFocusField(null)}
                    onChange={(e) => setRoom(e.target.value)}
                    onKeyDown={onEnter}
                    className="peer w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl
                               px-4 pt-5 pb-2 outline-none transition-colors duration-200
                               focus:border-cyan-400/60 focus:bg-white/[0.06]"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm transition-all duration-200
                               peer-focus:top-3.5 peer-focus:text-[11px] peer-focus:text-cyan-300
                               peer-[&:not(:placeholder-shown)]:top-3.5 peer-[&:not(:placeholder-shown)]:text-[11px]">
                    Room Id
                  </span>
                  <motion.span
                    className="absolute left-0 bottom-0 h-[1.5px] bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: focusField === "room" ? "100%" : "0%" }}
                    transition={{ duration: 0.25 }}
                  />
                </motion.label>

                <motion.button
                  variants={item}
                  onClick={joinChat}
                  disabled={!canJoin}
                  whileHover={canJoin ? { scale: 1.02, y: -1 } : {}}
                  whileTap={canJoin ? { scale: 0.96 } : {}}
                  className="mt-2 relative overflow-hidden rounded-xl py-3 text-sm font-medium text-white
                             bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500
                             shadow-lg shadow-violet-600/25 disabled:opacity-30 disabled:shadow-none
                             transition-opacity duration-200"
                >
                  Enter room →
                </motion.button>

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    setAuthedUser(null);
                    setUsername("");
                  }}
                  className="text-[12px] text-gray-500 hover:text-gray-300 text-center"
                >
                  Logout
                </button>
              </motion.div>
            </motion.div>
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap');
          `}</style>
        </div>
      )}

      {showChat && <Chat socket={socket} username={username} room={room} />}
    </>
  );
};

export default App;
