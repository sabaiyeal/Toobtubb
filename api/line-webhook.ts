import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Line webhook received:', body);
    
    // ตอนนี้แค่ return 200 ก่อน
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Line webhook endpoint is working' });
}
