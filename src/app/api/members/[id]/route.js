import { NextResponse } from 'next/server';
import { requireSysAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  const user = await requireSysAdmin();
  if (!user) return NextResponse.json({ error: '無權限' }, { status: 403 });

  const id = (await params).id;
  try {
    const data = await request.json();
    let query = 'UPDATE members SET name = ?, role = ?';
    const queryParams = [data.name, data.role];

    if (data.password) {
      query += ', password = ?';
      queryParams.push(data.password);
    }
    query += ' WHERE id = ?';
    queryParams.push(id);

    db.prepare(query).run(...queryParams);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '修改失敗' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await requireSysAdmin();
  if (!user) return NextResponse.json({ error: '無權限' }, { status: 403 });

  const id = (await params).id;
  try {
    const targetMember = db.prepare('SELECT student_id FROM members WHERE id = ?').get(id);
    if (targetMember && targetMember.student_id === user.student_id) {
      return NextResponse.json({ error: '無法刪除自己的帳號' }, { status: 400 });
    }

    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
