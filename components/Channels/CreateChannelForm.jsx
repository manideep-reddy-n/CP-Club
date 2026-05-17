"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function CreateChannelForm({ onCreated }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const body = { name, description: desc };
    if (user) body.creator = user.username;
    const res = await fetch('/api/channels', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    setBusy(false);
    if (res.ok) {
      setName(''); setDesc('');
      if (onCreated) onCreated();
      else window.location.reload();
    } else {
      const body = await res.json();
      alert(body.error || 'Failed');
    }
  }

  return (
    <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-2 items-center">
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Channel name" className="flex-1 px-3 py-2 rounded-md bg-zinc-900/50" />
      <input value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Description (optional)" className="flex-1 px-3 py-2 rounded-md bg-zinc-900/50" />
      <button disabled={busy} className="px-4 py-2 rounded-md bg-matrix-200 text-black">{busy? 'Creating...' : 'Create'}</button>
    </form>
  );
}
