export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getCollection('community_db', 'ideas');
    const ideas = await col.find({}).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ ideas });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const col = await getCollection('community_db', 'ideas');
    await col.insertOne({ ...body, status: '제안됨', createdAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
