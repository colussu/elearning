import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { student_id, password } = await request.json();
    
    if (!student_id || !password) {
      return NextResponse.json({ error: '請輸入會員編號與密碼' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT id, student_id, name, role FROM members WHERE student_id = ? AND password = ?');
    const user = stmt.get(student_id, password);

    if (!user) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '內部伺服器錯誤' }, { status: 500 });
  }
}
