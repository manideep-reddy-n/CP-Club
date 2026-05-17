"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ChannelsList from '@/components/Channels/Channels';
import ChannelChat from '@/components/Channels/ChannelChat';
import CreateChannelForm from '@/components/Channels/CreateChannelForm';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

export default function ChannelsPage() {
  const [tab, setTab] = useState('all');
  const [openChannel, setOpenChannel] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const { user } = useAuth();

  const onCreated = () => setRefreshKey((k) => k + 1);

  const handleOpenChannel = (ch) => {
    setOpenChannel(ch);
    setShowChatModal(true);
  };

  // Lock background scroll only on small screens when chat modal is open
  const _savedScroll = useRef(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(max-width: 767px)');
    const body = document.body;
    const html = document.documentElement;

    const lock = () => {
      _savedScroll.current = window.scrollY || window.pageYOffset || 0;
      body.style.position = 'fixed';
      body.style.top = `-${_savedScroll.current}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    };

    const unlock = () => {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      html.style.overflow = '';
      try { window.scrollTo(0, _savedScroll.current); } catch (e) {}
    };

    // apply lock only when modal is shown AND viewport is small
    if (showChatModal && mql.matches) {
      lock();
    } else {
      unlock();
    }

    const handleChange = (ev) => {
      // if viewport becomes large while modal open, make sure body unlocked
      if (!ev.matches) unlock();
      // if viewport becomes small and modal is open, lock
      else if (ev.matches && showChatModal) lock();
    };

    if (mql.addEventListener) mql.addEventListener('change', handleChange);
    else mql.addListener(handleChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handleChange);
      else mql.removeListener(handleChange);
      unlock();
    };
  }, [showChatModal]);

  // Prevent touch scroll from escaping the chat modal on mobile.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!showChatModal) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const onTouchMove = (e) => {
      const target = e.target;
      if (target && target.closest('[data-chat-scroll="true"]')) return;
      e.preventDefault();
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => document.removeEventListener("touchmove", onTouchMove);
  }, [showChatModal]);

  const handleCloseChat = () => {
    setShowChatModal(false);
    setTimeout(() => setOpenChannel(null), 300); // delay to allow animation
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Header */}
      <div className="flex-shrink-0 max-w-7xl w-full mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-mono text-white">Channels</h1>
          <div className="flex gap-2">
            <button onClick={() => setTab('all')} className={`px-3 py-1 rounded-md text-sm ${tab==='all' ? 'bg-matrix-200 text-black' : 'bg-zinc-900/40'}`}>All Channels</button>
            <button onClick={() => setTab('joined')} className={`px-3 py-1 rounded-md text-sm ${tab==='joined' ? 'bg-matrix-200 text-black' : 'bg-zinc-900/40'}`}>Joined Channels</button>
          </div>
        </div>

        <div className="mb-4">
          <CreateChannelForm onCreated={onCreated} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 max-w-7xl w-full mx-auto px-4 md:px-6 pb-6 overflow-hidden">
        {/* Channels List - Hidden on mobile when chat is open */}
        <aside className={`w-full md:w-1/3 rounded-lg bg-zinc-900/30 border border-white/10 p-4 overflow-y-auto transition-all duration-300 ${
          showChatModal ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}>
          <h2 className="text-lg font-semibold text-white mb-4">Channels</h2>
          <div className="space-y-2 flex-1 overflow-y-auto">
            <ChannelsList key={refreshKey} refreshKey={refreshKey} showJoinedOnly={tab==='joined'} onOpenChat={handleOpenChannel} />
          </div>
        </aside>

        {/* Chat Area */}
        {/* Desktop View */}
        <main className="hidden md:flex md:w-2/3 rounded-lg bg-zinc-900/50 border border-white/6 overflow-hidden flex-col">
          {openChannel ? (
            <>
              <div className="p-4 border-b border-white/6 flex-shrink-0">
                <div className="font-mono font-semibold text-white text-lg">{openChannel.name}</div>
                {openChannel.creator && <div className="text-xs text-zinc-400 mt-1">Created by: <span className="text-emerald-400">{openChannel.creator}</span></div>}
                <div className="text-xs text-zinc-400 mt-1">Members: {openChannel.membersCount ?? 0}</div>
                {openChannel.description && <div className="text-xs text-zinc-400 mt-2">{openChannel.description}</div>}
              </div>
              <ChannelChat channel={openChannel} currentUser={user || { username: 'Guest' }} />
            </>
          ) : (
            <div className="p-8 text-zinc-400 flex items-center justify-center h-full">Select a channel from the list to chat.</div>
          )}
        </main>

        {/* Mobile Modal View */}
        {showChatModal && openChannel && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/90 flex flex-col h-[100dvh] overflow-hidden overscroll-none">
            {/* Chat Header */}
            <div className="flex-shrink-0 p-4 border-b border-white/6 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-between">
              <div className="flex-1">
                <div className="font-mono font-semibold text-white text-xl">{openChannel.name}</div>
                {openChannel.creator && <div className="text-xs text-zinc-400 mt-1">Created by: <span className="text-emerald-400">{openChannel.creator}</span></div>}
                <div className="text-xs text-zinc-400">Members: {openChannel.membersCount ?? 0}</div>
              </div>
              <button
                onClick={handleCloseChat}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden overscroll-contain">
              <ChannelChat channel={openChannel} currentUser={user || { username: 'Guest' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
