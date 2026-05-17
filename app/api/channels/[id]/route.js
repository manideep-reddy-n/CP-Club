import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  const { id } = params;
  const db = await getDb();
  const channel = await db.collection('channels').findOne({ _id: new ObjectId(id) });
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ channel: { ...channel, _id: String(channel._id) } });
}

export async function POST(request, { params }) {
  // Used for join/leave actions
  const { id } = params;
  const body = await request.json();
  const { action, username } = body;
  if (!username || !action) return NextResponse.json({ error: 'username and action required' }, { status: 400 });

  const db = await getDb();
  const channelId = new ObjectId(id);

  if (action === 'join') {
    // add member if not exists
    await db.collection('channel_members').updateOne(
      { channelId, username },
      { $setOnInsert: { channelId, username, joinedAt: new Date() } },
      { upsert: true }
    );
    // update count
    const membersCount = await db.collection('channel_members').countDocuments({ channelId });
    await db.collection('channels').updateOne({ _id: channelId }, { $set: { membersCount } });
    return NextResponse.json({ ok: true, membersCount });
  }

  if (action === 'leave') {
    await db.collection('channel_members').deleteOne({ channelId, username });
    const membersCount = await db.collection('channel_members').countDocuments({ channelId });
    await db.collection('channels').updateOne({ _id: channelId }, { $set: { membersCount } });
    return NextResponse.json({ ok: true, membersCount });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
