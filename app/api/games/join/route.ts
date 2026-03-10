import { NextRequest, NextResponse } from 'next/server';
import { getGameIdByCode } from '@/lib/game-sessions';

/** 코드로 게임 ID 조회 (참가 시) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body as { code: string };

    if (!code) {
      return NextResponse.json({ error: 'code가 필요합니다.' }, { status: 400 });
    }

    const gameId = await getGameIdByCode(code);
    if (!gameId) {
      return NextResponse.json({ error: '유효하지 않은 방 코드입니다.' }, { status: 404 });
    }

    return NextResponse.json({ gameId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '참가 실패' }, { status: 500 });
  }
}
