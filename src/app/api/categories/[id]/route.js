import { NextResponse } from 'next/server';
import { requireDocAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const user = await requireDocAdmin();
  if (!user) return NextResponse.json({ error: '無權限' }, { status: 403 });

  const id = (await params).id;
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
