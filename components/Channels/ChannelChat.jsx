"use client";
import React, { useEffect, useState, useRef, memo } from "react";
import Pusher from "pusher-js";

const ChannelChat = memo(function ChannelChat({ channel, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const pusherRef = useRef(null);
  const channelSubRef = useRef(null);

  // Fetch initial messages on mount
  useEffect(() => {
    if (!channel) return;
    setIsLoading(true);
    fetchMessages().finally(() => setIsLoading(false));
  }, [channel]);

  // Subscribe to Pusher for real-time messages
  useEffect(() => {
    if (!channel) return;

    // Initialize Pusher only once
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });
    }

    const pusher = pusherRef.current;
    const channelName = `channel-${channel._id}`;

    // Unsubscribe from previous channel if exists
    if (channelSubRef.current) {
      channelSubRef.current.unbind_all();
      channelSubRef.current.unsubscribe();
    }

    // Subscribe to new channel
    const pusherChannel = pusher.subscribe(channelName);
    channelSubRef.current = pusherChannel;

    // Listen for new messages
    pusherChannel.bind("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (channelSubRef.current) {
        channelSubRef.current.unbind("new-message");
      }
    };
  }, [channel]);

  useEffect(() => {
    // scroll to bottom on messages change
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/channels/${channel._id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text;
    setText("");
    try {
      await fetch(`/api/channels/${channel._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username, text: msg }),
      });
    } catch (e) {
      console.error('Failed to send message:', e);
      setText(msg); // restore message if failed
    }
  }

  function timeString(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  // group messages by date (YYYY-MM-DD)
  const groups = [];
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const key = d.toISOString().slice(0, 10);
    let grp = groups.length && groups[groups.length - 1];
    if (!grp || grp.key !== key) {
      grp = { key, date: d, items: [] };
      groups.push(grp);
    }
    grp.items.push(m);
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden">
      <div
        ref={containerRef}
        data-chat-scroll="true"
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20 [webkit-overflow-scrolling:touch]"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-400">Loading messages...</div>
        ) : groups.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-400">No messages yet. Start the conversation!</div>
        ) : (
          groups.map((g) => (
            <div key={g.key}>
              <div className="flex justify-center mb-2">
                <div className="px-3 py-1 text-xs text-zinc-400 bg-zinc-900/60 rounded-full">{g.key === new Date().toISOString().slice(0, 10) ? 'Today' : new Date(g.key).toLocaleDateString()}</div>
              </div>

              <div className="space-y-3">
                {g.items.map((m, i) => {
                  const mine = m.username === (currentUser && currentUser.username);
                  const showName = !mine && (i === 0 || g.items[i - 1].username !== m.username);
                  return (
                    <div key={m._id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`relative max-w-[86%] px-3 py-2 break-words ${mine ? 'bg-emerald-600 text-white rounded-tl-2xl rounded-bl-2xl rounded-tr-sm' : 'bg-zinc-800 text-white rounded-tr-2xl rounded-br-2xl rounded-tl-sm'}`}>
                        {showName && <div className="text-xs font-semibold text-zinc-300 mb-1">{m.username}</div>}
                        <div className="text-sm leading-relaxed">{m.text}</div>
                        <div className={`text-[11px] mt-1 ${mine ? 'text-white/80' : 'text-zinc-400' } text-right`}>{timeString(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="flex-shrink-0 p-3 border-t border-white/6 bg-zinc-900/60 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex gap-2 items-center">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message..."
            className="flex-1 rounded-full bg-zinc-800/60 px-4 py-2 text-sm outline-none text-white placeholder-zinc-400 border border-zinc-700 focus:border-emerald-600 transition-colors"
          />
          <button type="submit" className="flex-shrink-0 px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Send</button>
        </div>
      </form>
    </div>
  );
});

ChannelChat.displayName = "ChannelChat";

export default ChannelChat;
