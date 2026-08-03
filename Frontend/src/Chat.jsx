import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ahmad from './assets/ahmad.mp3'
export const Chat = ({ socket, username, room }) => {
  const [currentMessage, setcurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [showComposerEmoji, setShowComposerEmoji] = useState(false);
  const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  const EMOJI_GRID = [
    "😀","😂","😍","😎","🤔","😢","😡","👍","👎","🙏",
    "🎉","🔥","💯","❤️","😴","🤝","👀","✨","😅","🥳",
  ];
  const notification = new Audio(ahmad);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const isDark = theme === "dark";
  const handleTyping = (value) => {
    setcurrentMessage(value);

    socket.emit("typing", { room, author: username });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { room, author: username });
    }, 1500);
  };

  const deleteMessage = (id, forEveryone) => {
    if (forEveryone) {
      socket.emit("delete_message", { room, id });
    }
    setMessageList((list) =>
      forEveryone
        ? list.map((m) => (m.id === id ? { ...m, deleted: true } : m))
        : list.filter((m) => m.id !== id)
    );
  };
const reactToMessage = (id, emoji) => {
  socket.emit("react_message", {
    room,
    id,
    emoji,
    author: username
  });

  setReactionPickerFor(null);
};


// yahan replace karo
const onPickFile = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const messageData = {
      room,
      author: username,
      type: file.type.startsWith("image/") ? "image" : "file",
      fileName: file.name,
      fileData: reader.result,
      message: "",
      status: "sent",
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    };

    socket.emit("send_message", messageData);
  };

  reader.readAsDataURL(file);
};


  const sendMessage = () => {

  if (!currentMessage.trim()) return;

  const messageData = {
    room,
    author: username,
    message: currentMessage,
    type: "text",
    status: "sent",
    replyTo: replyingTo
      ? {
          author: replyingTo.author,
          message: replyingTo.message
        }
      : null,
    time:
      new Date().getHours() +
      ":" +
      new Date().getMinutes(),
  };


  socket.emit(
    "send_message",
    messageData
  );


  setcurrentMessage("");
  setReplyingTo(null);

};
useEffect(() => {

  const handleReceiveMsg = (data) => {

    console.log("Received Message:", data);

    setMessageList((list) => [
      ...list,
      data
    ]);

    if (data.author !== username) {
      socket.emit("message_status", {
        room,
        id: data.id,
        status: "delivered",
      });
    }

  };


  const handleChatHistory = (history) => {
    console.log("History:", history);
    setMessageList(history);
  };


  const handleTypingEvent = (data) => {
    if (data.author !== username) {
      setTypingUser(data.author);
    }
  };


  const handleStopTypingEvent = (data) => {
    if (data.author !== username) {
      setTypingUser(null);
    }
  };


  const handleOnlineUsers = (users) => {
    console.log("Online:", users);
    setOnlineUsers(users);
  };


  // user online
  socket.emit("user_online", username);


  socket.on("receive_message", handleReceiveMsg);
  socket.on("chat_history", handleChatHistory);
  socket.on("typing", handleTypingEvent);
  socket.on("stop_typing", handleStopTypingEvent);
  socket.on("online_users", handleOnlineUsers);


  return () => {

    socket.off("receive_message", handleReceiveMsg);
    socket.off("chat_history", handleChatHistory);
    socket.off("typing", handleTypingEvent);
    socket.off("stop_typing", handleStopTypingEvent);
    socket.off("online_users", handleOnlineUsers);

  };


}, [socket, username, room]);
  const containRef = useRef(null);

useEffect(() => {

  if (containRef.current) {
    containRef.current.scrollTop =
      containRef.current.scrollHeight;
  }

}, [messageList, typingUser]);

  const initials = (name) =>
    name ? name.trim().slice(0, 2).toUpperCase() : "?";

  const StatusTicks = ({ status }) => {
    if (status === "seen")
      return <span className="text-[11px] text-cyan-300">✓✓</span>;
    if (status === "delivered")
      return <span className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>✓✓</span>;
    return <span className={`text-[11px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>✓</span>;
  };

  return (
    <>
      <div
        className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4 transition-colors duration-300
          ${isDark ? "bg-[#050710]" : "bg-[#eef1f6]"}`}
      >

        {/* Grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className={`absolute -top-32 -left-24 w-[460px] h-[460px] rounded-full blur-[120px] ${isDark ? "bg-violet-600/20" : "bg-violet-400/25"}`}
            animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={`absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full blur-[130px] ${isDark ? "bg-cyan-500/15" : "bg-cyan-400/20"}`}
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative w-full max-w-md">
          {/* Rotating gradient border */}
          <motion.div
            className="absolute -inset-[1.5px] rounded-3xl opacity-60"
            style={{
              background: "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #d946ef, #8b5cf6)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className={`relative flex flex-col rounded-3xl overflow-hidden transition-colors duration-300
              ${isDark ? "bg-[#0b0e18] shadow-[0_20px_70px_-15px_rgba(139,92,246,0.3)]" : "bg-white shadow-[0_20px_70px_-15px_rgba(100,100,150,0.25)]"}`}
          >

            {/* Header */}
            <div className={`flex items-center gap-3 px-5 py-4 border-b transition-colors duration-300
              ${isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-black/[0.015]"}`}>
              <motion.div
                whileHover={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 0.4 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400
                           flex items-center justify-center text-white text-xs font-semibold
                           shadow-md shadow-violet-500/20 shrink-0"
              >
                {initials(room)}
              </motion.div>
              <div className="flex flex-col min-w-0 flex-1">
                <h1
                  className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {room}
                </h1>
                <span className={`text-[11px] flex items-center gap-1.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  {username} · {onlineUsers.length} online
                </span>
              </div>

              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors duration-200
                  ${isDark ? "bg-white/10 hover:bg-white/20 text-yellow-300" : "bg-black/5 hover:bg-black/10 text-indigo-600"}`}
                title="Toggle theme"
              >
                {isDark ? "☀️" : "🌙"}
              </button>
            </div>

            <div className="chat_box flex flex-col">

              {/* Messages / auto-scrolling div */}
              <div
                className="auto-scrolling-div px-4 py-5 space-y-3 overflow-y-auto scroll-smooth
                           [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]"
                ref={containRef}
                style={{ height: "440px" }}
              >
                {messageList.length === 0 && (
                  <div className={`h-full flex flex-col items-center justify-center text-center gap-2 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    <span className="text-3xl">💬</span>
                    <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>No messages yet</p>
                    <p className="text-xs">Say hi to get the room going</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messageList.map((data) => {
                    const isMe = username === data.author;
                    return (
                      <motion.div
                        key={data.id}
                        layout
                        initial={{ opacity: 0, y: 14, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 24 }}
                        className={`message_content flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                        id={isMe ? "you" : "other"}
                      >
                        {!isMe && (
                          <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-medium
                            ${isDark ? "bg-white/10 text-gray-300" : "bg-black/10 text-gray-600"}`}>
                            {initials(data.author)}
                          </div>
                        )}

                        <motion.div
                          whileHover={{ y: -3, scale: 1.015 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="max-w-[72%] relative group/msg"
                        >
                          {!data.deleted && (
                            <div
                              className={`absolute -top-2 flex items-center gap-1 opacity-0 group-hover/msg:opacity-100
                                transition-opacity duration-150 ${isMe ? "-left-24" : "-right-24"}`}
                            >
                              <button
                                onClick={() => setReplyingTo(data)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                  ${isDark ? "bg-white/10 hover:bg-white/20 text-gray-300" : "bg-black/10 hover:bg-black/20 text-gray-600"}`}
                                title="Reply"
                              >
                                ↩
                              </button>
                              <button
                                onClick={() => setReactionPickerFor(reactionPickerFor === data.id ? null : data.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                  ${isDark ? "bg-white/10 hover:bg-white/20 text-gray-300" : "bg-black/10 hover:bg-black/20 text-gray-600"}`}
                                title="React"
                              >
                                😊
                              </button>
                              <button
                                onClick={() => deleteMessage(data.id, isMe)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                  ${isDark ? "bg-white/10 hover:bg-red-500/30 text-gray-300" : "bg-black/10 hover:bg-red-500/20 text-gray-600"}`}
                                title={isMe ? "Delete for everyone" : "Delete for me"}
                              >
                                🗑
                              </button>
                            </div>
                          )}

                          <AnimatePresence>
                            {reactionPickerFor === data.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                                className={`absolute -top-11 z-10 flex items-center gap-1 px-2 py-1.5 rounded-full shadow-lg
                                  ${isMe ? "right-0" : "left-0"}
                                  ${isDark ? "bg-[#1a1f2e] border border-white/10" : "bg-white border border-black/10"}`}
                              >
                                {QUICK_REACTIONS.map((emo) => (
                                  <button
                                    key={emo}
                                    onClick={() => reactToMessage(data.id, emo)}
                                    className="text-base hover:scale-125 transition-transform duration-100"
                                  >
                                    {emo}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div
                            className={`msg break-words rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug
                              ${data.deleted
                                ? isDark ? "bg-white/[0.03] text-gray-500 italic border border-white/5" : "bg-black/[0.03] text-gray-400 italic border border-black/5"
                                : isMe
                                  ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white rounded-br-md shadow-md shadow-violet-600/25"
                                  : isDark
                                    ? "bg-white/[0.06] text-gray-100 rounded-bl-md border border-white/10"
                                    : "bg-gray-100 text-gray-800 rounded-bl-md border border-black/5"}`}
                            id={isMe ? "y" : "b"}
                          >
                            {data.deleted ? (
                              <p>🚫 This message was deleted</p>
                            ) : (
                              <>
                                {data.replyTo && (
                                  <div
                                    className={`mb-1.5 pl-2 border-l-2 text-[12px] opacity-80 truncate
                                      ${isMe ? "border-white/50" : isDark ? "border-violet-400/60" : "border-violet-500/60"}`}
                                  >
                                    <p className="font-medium">{data.replyTo.author}</p>
                                    <p className="truncate">{data.replyTo.message}</p>
                                  </div>
                                )}
                                {data.type === "image" && (
                                  <img
                                    src={data.fileData}
                                    alt={data.fileName}
                                    className="rounded-xl max-w-full max-h-52 object-cover mb-1"
                                  />
                                )}
                                {data.type === "file" && (
                                  <a
                                    href={data.fileData}
                                    download={data.fileName}
                                    className="flex items-center gap-2 underline underline-offset-2 mb-1"
                                  >
                                    📎 {data.fileName}
                                  </a>
                                )}
                                {data.message && (
                                  <p className="whitespace-pre-wrap">{data.message}</p>
                                )}
                              </>
                            )}
                          </div>

                          {data.reactions && Object.keys(data.reactions).length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                              {Object.entries(data.reactions).map(([emo, authors]) => (
                                <button
                                  key={emo}
                                  onClick={() => reactToMessage(data.id, emo)}
                                  className={`text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1
                                    ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
                                  title={authors.join(", ")}
                                >
                                  <span>{emo}</span>
                                  <span className={isDark ? "text-gray-300" : "text-gray-600"}>{authors.length}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          <div
                            className={`msg_detail flex items-center gap-2 mt-1 px-1 text-[10px]
                              ${isDark ? "text-gray-500" : "text-gray-400"} ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <p>{data.author}</p>
                            <p>{data.time}</p>
                            {isMe && !data.deleted && <StatusTicks status={data.status} />}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <AnimatePresence>
                  {typingUser && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      className="flex items-end gap-2 justify-start"
                    >
                      <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-medium
                        ${isDark ? "bg-white/10 text-gray-300" : "bg-black/10 text-gray-600"}`}>
                        {initials(typingUser)}
                      </div>
                      <div className={`rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5
                        ${isDark ? "bg-white/[0.06] border border-white/10" : "bg-gray-100 border border-black/5"}`}>
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reply preview */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center justify-between gap-2 px-4 py-2 border-t overflow-hidden
                      ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/5 bg-black/[0.02]"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-0.5 h-8 rounded-full bg-gradient-to-b from-violet-500 to-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-violet-400">
                          Replying to {replyingTo.author}
                        </p>
                        <p className={`text-[12px] truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {replyingTo.message || (replyingTo.type === "image" ? "Photo" : replyingTo.fileName)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs
                        ${isDark ? "bg-white/10 hover:bg-white/20 text-gray-300" : "bg-black/10 hover:bg-black/20 text-gray-600"}`}
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className={`chat_body flex items-center gap-2 px-4 py-3.5 border-t transition-colors duration-300
                ${isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-black/[0.015]"}`}>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={onPickFile}
                  accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors duration-200
                    ${isDark ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-black/5 hover:bg-black/10 text-gray-600"}`}
                  title="Send a file"
                >
                  📎
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowComposerEmoji((s) => !s)}
                    className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors duration-200
                      ${isDark ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-black/5 hover:bg-black/10 text-gray-600"}`}
                    title="Emoji"
                  >
                    😊
                  </button>
                  <AnimatePresence>
                    {showComposerEmoji && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className={`absolute bottom-12 left-0 z-10 grid grid-cols-5 gap-1 p-2 rounded-2xl shadow-lg w-56
                          ${isDark ? "bg-[#1a1f2e] border border-white/10" : "bg-white border border-black/10"}`}
                      >
                        {EMOJI_GRID.map((emo) => (
                          <button
                            key={emo}
                            onClick={() => {
                              setcurrentMessage((m) => m + emo);
                              setShowComposerEmoji(false);
                            }}
                            className="text-lg hover:scale-125 transition-transform duration-100 p-1"
                          >
                            {emo}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  value={currentMessage}
                  type="text"
                  placeholder="Type your message"
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => {
                    e.key === "Enter" && sendMessage();
                  }}
                  className={`flex-1 text-sm rounded-full px-4 py-2.5 outline-none transition-colors duration-200 border
                    ${isDark
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-400/50 focus:bg-white/[0.08]"
                      : "bg-black/[0.03] border-black/10 text-gray-900 placeholder-gray-400 focus:border-violet-400/60 focus:bg-white"}`}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  whileHover={currentMessage.trim() ? { scale: 1.08 } : {}}
                  whileTap={currentMessage.trim() ? { scale: 0.9 } : {}}
                  className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500
                             disabled:opacity-30 disabled:pointer-events-none
                             flex items-center justify-center text-white shadow-md shadow-violet-600/25"
                >
                  &#9658;
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap');
        `}</style>
      </div>
    </>
  );
};