import { NextResponse } from 'next/server';
import { requireSysAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  const user = await requireSysAdmin();
  if (!user) return NextResponse.json({ error: '無權限' }, { status: 403 });

  try {
    const members = db.prepare('SELECT id, student_id, name, role, created_at FROM members ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, members });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await requireSysAdmin();
  if (!user) return NextResponse.json({ error: '無權限' }, { status: 403 });

  try {
    const data = await request.json();
    if (!data.student_id || !data.name || !data.password || !data.role) {
      return NextResponse.json({ error: '資料不完整' }, { status: 400 });
    }

    const exists = db.prepare('SELECT id FROM members WHERE student_id = ?').get(data.student_id);
    if (exists) return NextResponse.json({ error: '編號已存在' }, { status: 400 });

    db.prepare('INSERT INTO members (student_id, name, password, role) VALUES (?, ?, ?, ?)').run(
      data.student_id, data.name, data.password, data.role
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '新增失敗' }, { status: 500 });
  }
}
