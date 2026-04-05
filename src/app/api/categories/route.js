import { NextResponse } from 'next/server';
import { requireDocAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const categories = db.prepare('SELECT id, name FROM categories ORDER BY id ASC').all();
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await requireDocAdmin();
  if (!user) return NextResponse.json({ error: '無權限' }, { status: 403 });

  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: '必填寫分類名稱' }, { status: 400 });
    }

    const exists = db.prepare('SELECT id FROM categories WHERE name = ?').get(data.name);
    if (exists) return NextResponse.json({ error: '分類名稱已存在' }, { status: 400 });

    db.prepare('INSERT INTO categories (name) VALUES (?)').run(data.name);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '新增失敗' }, { status: 500 });
  }
}
