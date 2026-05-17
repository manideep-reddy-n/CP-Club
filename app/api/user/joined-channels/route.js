import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  if (!username) return NextResponse.json({ channels: [] });
  const db = await getDb();
  const members = await db.collection('channel_members').find({ username }).toArray();
  const channelIds = members.map(m => m.channelId);
  const channels = await db.collection('channels').find({ _id: { $in: channelIds } }).toArray();
  const out = channels.map(c => ({ ...c, _id: String(c._id) }));
  return NextResponse.json({ channels: out });
}
