import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET() {
  const db = await getDb();
  const raw = await db
    .collection('channels')
    .find({})
    .project({ name: 1, description: 1, membersCount: 1, creator: 1 })
    .toArray();
  const channels = raw.map((c) => ({ ...c, _id: String(c._id) }));
  return NextResponse.json({ channels });
}

export async function POST(request) {
  const db = await getDb();
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: 'Channel name required' }, { status: 400 });
  }

  const existing = await db.collection('channels').findOne({ name: body.name });
  if (existing) {
    return NextResponse.json({ error: 'Channel already exists' }, { status: 409 });
  }

  const doc = {
    name: body.name,
    description: body.description || '',
    membersCount: 0,
    creator: body.creator || null,
    createdAt: new Date(),
  };
  const res = await db.collection('channels').insertOne(doc);
  return NextResponse.json({ channel: { ...doc, _id: String(res.insertedId) } }, { status: 201 });
}
