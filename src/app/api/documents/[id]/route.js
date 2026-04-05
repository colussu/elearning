import { NextResponse } from 'next/server';
import { requireDocAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request, { params }) {
  const user = await requireDocAdmin();
  if (!user) return NextResponse.json({ error: '無權限。僅總管或教材管理者可刪除此文件。' }, { status: 403 });

  try {
    const id = (await params).id;

    const doc = db.prepare('SELECT type, url FROM documents WHERE id = ?').get(id);
    if (doc && doc.type === 'file' && doc.url && doc.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', doc.url);
      try {
        await fs.unlink(filePath);
      } catch (fileErr) {
        console.error('Failed to delete physical file:', fileErr);
      }
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete document error:', err);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = await requireDocAdmin();
  if (!user) return NextResponse.json({ error: '無權限。僅總管或教材管理者可修改教材。' }, { status: 403 });

  try {
    const id = (await params).id;
    const data = await request.json();

    if (!data.title || !data.category) {
      return NextResponse.json({ error: '請填寫必填欄位 (標題, 分類)' }, { status: 400 });
    }

    db.prepare(`
      UPDATE documents 
      SET title = ?, category = ?, group_name = ?, url = ?
      WHERE id = ?
    `).run(data.title, data.category, data.group_name || null, data.url, id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update document error:', err);
    return NextResponse.json({ error: '修改失敗' }, { status: 500 });
  }
}
