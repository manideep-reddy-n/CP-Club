"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ChannelsList({ showJoinedOnly = false, onOpenChat, refreshKey }) {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [joined, setJoined] = useState(new Set());

  useEffect(() => {
    fetchChannels();
  }, [user, refreshKey]);

  async function fetchChannels() {
    const res = await fetch('/api/channels');
    const data = await res.json();
    setChannels(data.channels || []);
    if (user) {
      // fetch joined channels for this user
      const joinedRes = await fetch('/api/user/joined-channels?username=' + encodeURIComponent(user.username));
      if (joinedRes.ok) {
        const j = await joinedRes.json();
        setJoined(new Set((j.channels || []).map(c => String(c._id))));
      }
    } else {
      // clear joined when not logged in
      setJoined(new Set());
    }
  }

  async function handleJoin(ch) {
    if (!user) return alert('Login to join channels');
    const res = await fetch(`/api/channels/${ch._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: joined.has(String(ch._id)) ? 'leave' : 'join', username: user.username })
    });
    if (res.ok) {
      const body = await res.json();
      setChannels((prev) => prev.map(p => p._id === ch._id ? { ...p, membersCount: body.membersCount } : p));
      const next = new Set(joined);
      if (joined.has(String(ch._id))) next.delete(String(ch._id)); else next.add(String(ch._id));
      setJoined(next);
    }
  }

  return (
    <div className="space-y-2 md:space-y-3 w-full">
      {channels
        .filter(ch => (showJoinedOnly ? joined.has(String(ch._id)) : !joined.has(String(ch._id))))
        .map((ch) => (
        <div 
          key={ch._id} 
          className="p-3 md:p-4 rounded-lg bg-zinc-900/50 border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-zinc-900/70 cursor-pointer group"
        >
          {/* Channel Name and Creator */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="font-mono font-semibold text-white text-sm md:text-base truncate group-hover:text-matrix-200 transition-colors">
                {ch.name}
              </div>
              {ch.creator && (
                <div className="text-xs text-emerald-400 mt-0.5">
                  by <span className="font-medium">{ch.creator}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description and Members Info */}
          {ch.description && (
            <div className="text-xs text-zinc-400 truncate mb-2 line-clamp-2">
              {ch.description}
            </div>
          )}
          
          <div className="text-xs text-zinc-500 mb-3">
            👥 {ch.membersCount ?? 0} member{ch.membersCount !== 1 ? 's' : ''}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full">
            {joined.has(String(ch._id)) && (
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenChat(ch); }}
                className="flex-1 px-2 py-1.5 bg-matrix-200 text-black font-medium rounded-md text-xs hover:bg-matrix-300 transition-colors"
              >
                Open Chat
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); handleJoin(ch); }}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                joined.has(String(ch._id)) 
                  ? 'bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-900/50' 
                  : 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/50'
              }`}
            >
              {joined.has(String(ch._id)) ? 'Leave' : 'Join'}
            </button>
          </div>
        </div>
      ))}
      
      {channels.filter(ch => (showJoinedOnly ? joined.has(String(ch._id)) : !joined.has(String(ch._id)))).length === 0 && (
        <div className="p-8 text-center text-zinc-500 text-sm">
          {showJoinedOnly ? "You haven't joined any channels yet." : 'No channels available.'}
        </div>
      )}
    </div>
  );
}
