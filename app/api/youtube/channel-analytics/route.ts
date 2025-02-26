
// app/api/youtube/channel-analytics/route.ts
import { getChannelAnalytics } from '@/services/youtubeApi';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');
  
  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
  }
  
  try {
    const data = await getChannelAnalytics(channelId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Error fetching channel analytics' }, { status: 500 });
  }
}