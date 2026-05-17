import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import Pusher from 'pusher';

export async function GET(request, { params }) {
  const awaitedParams = await params;
  const id = awaitedParams.id;
  const db = await getDb();
  const channelId = new ObjectId(id);
  const messages = await db
    .collection('channel_messages')
    .find({ channelId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  const out = messages.reverse().map(m => ({ ...m, _id: String(m._id), channelId: String(m.channelId), createdAt: m.createdAt.toISOString() }));
  return NextResponse.json({ messages: out });
}

export async function POST(request, { params }) {
  const awaitedParams = await params;
  const id = awaitedParams.id;
  const body = await request.json();
  const { username, text } = body;
  if (!username || !text) return NextResponse.json({ error: 'username and text required' }, { status: 400 });
  
  const db = await getDb();
  const channelId = new ObjectId(id);
  const doc = { channelId, username, text, createdAt: new Date() };
  const result = await db.collection('channel_messages').insertOne(doc);
  
  const out = {
    ...doc,
    _id: String(result.insertedId),
    channelId: String(channelId),
    createdAt: doc.createdAt.toISOString(),
  };
  
  // Broadcast message via Pusher
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
  
  await pusher.trigger(`channel-${id}`, 'new-message', out);
  
  return NextResponse.json({ message: out }, { status: 201 });
}
