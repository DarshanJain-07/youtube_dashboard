// app/api/youtube/search-channels/route.ts
import { searchChannels } from '@/services/youtubeApi';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  }
  
  try {
    const data = await searchChannels(q);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Error searching YouTube channels' }, { status: 500 });
  }
}
