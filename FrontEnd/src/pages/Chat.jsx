import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";

const API        = "http://localhost:3000";
const SOCKET_URL = "http://localhost:3000";

const Chat = () => {
    const navigate      = useNavigate();
    const [searchParams] = useSearchParams();
    const token         = localStorage.getItem("accessToken");
    const currentUser   = token ? jwtDecode(token) : null;
    const role          = currentUser?.role;

    // ── Socket ref ───────────────────────────────────
    const socketRef = useRef(null);

    // ── State ────────────────────────────────────────
    const [conversations,    setConversations]    = useState([]);
    const [activeConv,       setActiveConv]       = useState(null);
    const [messages,         setMessages]         = useState([]);
    const [newMessage,       setNewMessage]       = useState("");
    const [chatableUsers,    setChatableUsers]    = useState([]);
    const [showNewChat,      setShowNewChat]      = useState(false);
    const [userSearch,       setUserSearch]       = useState("");
    const [convLoading,      setConvLoading]      = useState(true);
    const [msgLoading,       setMsgLoading]       = useState(false);
    const [sending,          setSending]          = useState(false);
    const [typingUser,       setTypingUser]       = useState(null);
    const [connected,        setConnected]        = useState(false);

    const messagesEndRef  = useRef(null);
    const typingTimeout   = useRef(null);
    const authH           = { Authorization: `Bearer ${token}` };

    // ── Scroll to bottom ─────────────────────────────
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages, typingUser]);

    // ── Connect socket ────────────────────────────────
    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"]
        });

        socket.on("connect", () => {
            setConnected(true);
            console.log("Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        // New message arrives
        socket.on("new_message", ({ message, conversationId }) => {
            // Only add if it's for the active conversation
            setActiveConv(prev => {
                if (prev?._id === conversationId) {
                    setMessages(msgs => {
                        // Avoid duplicates
                        if (msgs.find(m => m._id === message._id)) return msgs;
                        return [...msgs, message];
                    });
                }
                return prev;
            });

            // Update conversation list preview
            setConversations(prev => prev.map(c =>
                c._id === conversationId
                    ? { ...c, lastMessage: { text: message.text, sender: message.sender, timestamp: new Date() }, updatedAt: new Date() }
                    : c
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        });

        // Typing indicators
        socket.on("user_typing", ({ name }) => {
            setTypingUser(name);
        });
        socket.on("user_stopped_typing", () => {
            setTypingUser(null);
        });

        socket.on("messages_read", () => {
            setMessages(prev => prev.map(m => ({ ...m, read: true })));
        });

        socket.on("message_error", ({ error }) => {
            console.error("Message error:", error);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [token]);

    // ── Fetch conversations ───────────────────────────
    const fetchConversations = async () => {
        setConvLoading(true);
        try {
            const res  = await fetch(`${API}/chat/conversations`, { headers: authH });
            const data = await res.json();
            setConversations(data.data || []);
        } catch {
            setConversations([]);
        } finally {
            setConvLoading(false);
        }
    };

    useEffect(() => { fetchConversations(); }, []);

    // ── Fetch chatable users ──────────────────────────
    const fetchChatableUsers = async () => {
        try {
            const res  = await fetch(`${API}/chat/users`, { headers: authH });
            const data = await res.json();
            setChatableUsers(data.data || []);
        } catch {
            setChatableUsers([]);
        }
    };

    useEffect(() => { fetchChatableUsers(); }, []);

    // ── Auto-open conversation from URL param ─────────
    // e.g. /buyer/chat?with=userId
    useEffect(() => {
        const recipientId = searchParams.get("with");
        if (recipientId && chatableUsers.length > 0) {
            startConversation(recipientId);
        }
    }, [searchParams, chatableUsers]);

    // ── Open a conversation ───────────────────────────
    const openConversation = async (conv) => {
        // Leave previous room
        if (activeConv) {
            socketRef.current?.emit("leave_conversation", { conversationId: activeConv._id });
        }

        setActiveConv(conv);
        setMessages([]);
        setMsgLoading(true);

        try {
            const res  = await fetch(
                `${API}/chat/conversations/${conv._id}/messages`,
                { headers: authH }
            );
            const data = await res.json();
            setMessages(data.data || []);
        } catch {
            setMessages([]);
        } finally {
            setMsgLoading(false);
        }

        // Join socket room for this conversation
        socketRef.current?.emit("join_conversation", { conversationId: conv._id });
    };

    // ── Start new conversation ────────────────────────
    const startConversation = async (recipientId) => {
        try {
            const res  = await fetch(`${API}/chat/conversation`, {
                method:  "POST",
                headers: { ...authH, "Content-Type": "application/json" },
                body:    JSON.stringify({ recipientId })
            });
            const data = await res.json();
            const conv = data.data;

            // Add to list if not already there
            setConversations(prev => {
                const exists = prev.find(c => c._id === conv._id);
                if (exists) return prev;
                return [conv, ...prev];
            });

            setShowNewChat(false);
            setUserSearch("");
            openConversation(conv);
        } catch (err) {
            console.error("Failed to start conversation:", err);
        }
    };

    // ── Send message ──────────────────────────────────
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv || sending) return;

        setSending(true);
        const text = newMessage.trim();
        setNewMessage("");

        // Stop typing indicator
        socketRef.current?.emit("typing_stop", { conversationId: activeConv._id });

        // Emit via socket — server saves to DB and broadcasts back
        socketRef.current?.emit("send_message", {
            conversationId: activeConv._id,
            text
        });

        setSending(false);
    };

    // ── Typing indicator ──────────────────────────────
    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!activeConv) return;

        socketRef.current?.emit("typing_start", { conversationId: activeConv._id });

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current?.emit("typing_stop", { conversationId: activeConv._id });
        }, 1500);
    };

    // ── Get other participant in a conversation ────────
    const getOtherUser = (conv) => {
        return conv.participants?.find(
            p => p._id !== currentUser?.userID
        );
    };

    // ── Filtered users for new chat ───────────────────
    const filteredUsers = chatableUsers.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const roleColor = (r) => {
        if (r === "admin")  return { bg: "#171717", color: "#d7ff5f" };
        if (r === "seller") return { bg: "#ede9fe", color: "#5b21b6" };
        return                     { bg: "#dcfce7", color: "#166534" };
    };

    const formatTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000)      return "just now";
        if (diff < 3600000)    return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000)   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return (
        <div style={page}>
            <style>{css}</style>

            {/* ── NAVBAR ── */}
            <nav style={navbar}>
                <div style={logoWrap}>
                    <div style={logoIcon}>A</div>
                    <span style={{ fontSize: "18px", fontWeight: 800 }}>
                        Art<span style={{ color: "#d7ff5f" }}>Space</span>
                    </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: connected ? "#22c55e" : "#ef4444"
                    }} />
                    <span style={{ fontSize: "12px", color: "#888" }}>
                        {connected ? "Connected" : "Connecting..."}
                    </span>
                    <button style={ghostBtn} onClick={() => navigate(`/${role}/dashboard`)}>
                        ← Dashboard
                    </button>
                    <button style={primaryBtn} onClick={() => { setShowNewChat(true); fetchChatableUsers(); }}>
                        + New Chat
                    </button>
                </div>
            </nav>

            <div style={chatLayout}>

                {/* ══ SIDEBAR — conversation list ══ */}
                <aside style={sidebar}>
                    <div style={sidebarHeader}>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Messages</h2>
                        <span style={convCount}>{conversations.length}</span>
                    </div>

                    {convLoading ? (
                        <div style={centred}>
                            <div className="chat-spinner" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: "32px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: "40px", marginBottom: "12px" }}>💬</div>
                            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 16px" }}>
                                No conversations yet.
                            </p>
                            <button
                                style={{ ...primaryBtn, width: "100%" }}
                                onClick={() => { setShowNewChat(true); fetchChatableUsers(); }}
                            >
                                Start a chat
                            </button>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const other    = getOtherUser(conv);
                            const isActive = activeConv?._id === conv._id;
                            const rc       = roleColor(other?.role);
                            return (
                                <div
                                    key={conv._id}
                                    style={{
                                        ...convItem,
                                        background: isActive ? "#f0f4ff" : "white",
                                        borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent"
                                    }}
                                    className="conv-item"
                                    onClick={() => openConversation(conv)}
                                >
                                    <div style={{ ...convAvatar, background: rc.bg }}>
                                        <span style={{ color: rc.color, fontSize: "14px", fontWeight: 700 }}>
                                            {other?.name?.[0]?.toUpperCase() || "?"}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <p style={convName}>{other?.name || "Unknown"}</p>
                                            <span style={convTime}>
                                                {formatTime(conv.lastMessage?.timestamp || conv.updatedAt)}
                                            </span>
                                        </div>
                                        <p style={convPreview}>
                                            {conv.lastMessage?.text || "Start the conversation"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </aside>

                {/* ══ MAIN — message thread ══ */}
                <main style={chatMain}>
                    {!activeConv ? (
                        <div style={emptyChat}>
                            <div style={{ fontSize: "64px", marginBottom: "16px" }}>💬</div>
                            <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 700 }}>
                                Your messages
                            </h2>
                            <p style={{ margin: "0 0 24px", color: "#888", fontSize: "14px" }}>
                                Select a conversation or start a new one.
                            </p>
                            <button
                                style={primaryBtn}
                                onClick={() => { setShowNewChat(true); fetchChatableUsers(); }}
                            >
                                + Start new chat
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            {(() => {
                                const other = getOtherUser(activeConv);
                                const rc    = roleColor(other?.role);
                                return (
                                    <div style={chatHeader}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ ...convAvatar, width: "40px", height: "40px", background: rc.bg }}>
                                                <span style={{ color: rc.color, fontSize: "16px", fontWeight: 700 }}>
                                                    {other?.name?.[0]?.toUpperCase() || "?"}
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>
                                                    {other?.name}
                                                </p>
                                                <span style={{
                                                    fontSize: "11px", fontWeight: 700,
                                                    padding: "1px 8px", borderRadius: "20px",
                                                    background: rc.bg, color: rc.color
                                                }}>
                                                    {other?.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Messages */}
                            <div style={messageArea}>
                                {msgLoading ? (
                                    <div style={centred}>
                                        <div className="chat-spinner" />
                                        <p style={{ color: "#888", marginTop: "12px", fontSize: "13px" }}>
                                            Loading messages...
                                        </p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div style={{ ...centred, color: "#888", fontSize: "14px" }}>
                                        <div style={{ fontSize: "40px", marginBottom: "12px" }}>👋</div>
                                        Send a message to start the conversation.
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMine = msg.sender?._id === currentUser?.userID ||
                                                       msg.sender?._id?.toString() === currentUser?.userID;
                                        return (
                                            <div
                                                key={msg._id}
                                                style={{
                                                    ...msgRow,
                                                    justifyContent: isMine ? "flex-end" : "flex-start"
                                                }}
                                            >
                                                {!isMine && (
                                                    <div style={msgAvatar}>
                                                        {msg.sender?.name?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div style={{
                                                    ...msgBubble,
                                                    background:   isMine ? "#171717" : "white",
                                                    color:        isMine ? "white"   : "#171717",
                                                    borderRadius: isMine
                                                        ? "16px 16px 4px 16px"
                                                        : "16px 16px 16px 4px",
                                                    border: isMine ? "none" : "1px solid #ebebeb"
                                                }}>
                                                    <p style={{ margin: "0 0 4px", fontSize: "14px", lineHeight: 1.5 }}>
                                                        {msg.text}
                                                    </p>
                                                    <div style={{
                                                        display: "flex", alignItems: "center",
                                                        gap: "4px", justifyContent: "flex-end"
                                                    }}>
                                                        <span style={{
                                                            fontSize: "10px",
                                                            color: isMine ? "rgba(255,255,255,0.6)" : "#bbb"
                                                        }}>
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                        {isMine && (
                                                            <span style={{ fontSize: "10px", color: msg.read ? "#60a5fa" : "rgba(255,255,255,0.4)" }}>
                                                                {msg.read ? "✓✓" : "✓"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Typing indicator */}
                                {typingUser && (
                                    <div style={{ ...msgRow, justifyContent: "flex-start" }}>
                                        <div style={msgAvatar}>{typingUser[0]}</div>
                                        <div style={{
                                            ...msgBubble, background: "white",
                                            border: "1px solid #ebebeb", padding: "10px 16px"
                                        }}>
                                            <div style={typingDots}>
                                                <div className="dot" />
                                                <div className="dot" />
                                                <div className="dot" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message input */}
                            <form onSubmit={sendMessage} style={inputArea}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={handleTyping}
                                    style={msgInput}
                                    className="chat-input"
                                    maxLength={2000}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    style={{
                                        ...sendBtn,
                                        opacity: !newMessage.trim() || sending ? 0.5 : 1
                                    }}
                                    disabled={!newMessage.trim() || sending}
                                >
                                    ➤
                                </button>
                            </form>
                        </>
                    )}
                </main>
            </div>

            {/* ══ NEW CHAT MODAL ══ */}
            {showNewChat && (
                <div style={backdrop} onClick={() => setShowNewChat(false)}>
                    <div style={modal} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>New Conversation</h2>
                            <button style={closeBtn} onClick={() => setShowNewChat(false)}>✕</button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            style={{ ...msgInput, marginBottom: "16px", border: "1px solid #dedede" }}
                            className="chat-input"
                            autoFocus
                        />

                        <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                            {filteredUsers.length === 0 ? (
                                <p style={{ textAlign: "center", color: "#888", fontSize: "14px", padding: "24px" }}>
                                    No users found.
                                </p>
                            ) : (
                                filteredUsers.map(u => {
                                    const rc = roleColor(u.role);
                                    return (
                                        <div
                                            key={u._id}
                                            style={userRow}
                                            className="user-row"
                                            onClick={() => startConversation(u._id)}
                                        >
                                            <div style={{ ...convAvatar, width: "40px", height: "40px", background: rc.bg }}>
                                                <span style={{ color: rc.color, fontSize: "15px", fontWeight: 700 }}>
                                                    {u.name[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{u.name}</p>
                                                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{u.email}</p>
                                            </div>
                                            <span style={{
                                                fontSize: "11px", fontWeight: 700,
                                                padding: "2px 10px", borderRadius: "20px",
                                                background: rc.bg, color: rc.color
                                            }}>
                                                {u.role}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Styles ───────────────────────────────────────────────
const page        = { height: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717", overflow: "hidden" };
const navbar      = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "60px", background: "white", borderBottom: "1px solid #ebebeb", flexShrink: 0, zIndex: 50 };
const logoWrap    = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon    = { width: "30px", height: "30px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" };
const chatLayout  = { display: "flex", flex: 1, overflow: "hidden" };
const sidebar     = { width: "320px", background: "white", borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" };
const sidebarHeader = { padding: "16px 20px", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", gap: "10px" };
const convCount   = { background: "#171717", color: "white", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" };
const convItem    = { display: "flex", gap: "12px", padding: "14px 20px", cursor: "pointer", alignItems: "center", transition: "background 0.15s" };
const convAvatar  = { width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const convName    = { margin: 0, fontWeight: 600, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const convPreview = { margin: 0, fontSize: "12px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const convTime    = { fontSize: "11px", color: "#bbb", flexShrink: 0 };
const chatMain    = { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" };
const emptyChat   = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#888" };
const chatHeader  = { padding: "14px 24px", background: "white", borderBottom: "1px solid #ebebeb", flexShrink: 0 };
const messageArea = { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" };
const msgRow      = { display: "flex", alignItems: "flex-end", gap: "8px" };
const msgAvatar   = { width: "28px", height: "28px", borderRadius: "50%", background: "#e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 };
const msgBubble   = { maxWidth: "65%", padding: "10px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const typingDots  = { display: "flex", gap: "4px", alignItems: "center", height: "16px" };
const inputArea   = { padding: "16px 24px", background: "white", borderTop: "1px solid #ebebeb", display: "flex", gap: "10px", flexShrink: 0 };
const msgInput    = { flex: 1, height: "44px", padding: "0 16px", border: "1px solid #e5e5e5", borderRadius: "22px", fontSize: "14px", outline: "none", fontFamily: "inherit", background: "#fafaf9" };
const sendBtn     = { width: "44px", height: "44px", borderRadius: "50%", background: "#171717", color: "white", border: "none", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity 0.15s" };
const backdrop    = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" };
const modal       = { background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" };
const closeBtn    = { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#888", padding: "4px" };
const userRow     = { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", cursor: "pointer", transition: "background 0.15s" };
const centred     = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "40px" };
const primaryBtn  = { height: "36px", padding: "0 14px", background: "#171717", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const ghostBtn    = { height: "36px", padding: "0 14px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };

const css = `
    .conv-item:hover { background: #f9f9f8 !important; }
    .user-row:hover  { background: #f5f5f3 !important; }
    .chat-input:focus { border-color: #171717 !important; outline: none; }
    .chat-spinner { width: 28px; height: 28px; border: 3px solid #e5e5e5; border-top-color: #171717; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #bbb; animation: bounce 1.2s ease-in-out infinite; }
    .dot:nth-child(1) { animation-delay: 0s; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
`;

export default Chat;