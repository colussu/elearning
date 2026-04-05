import { NextResponse } from 'next/server';
import { requireDocAdmin, getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const user = await requireDocAdmin();
  if (!user) return NextResponse.json({ error: '無權限。僅系統總管或教材管理者可上傳教材。' }, { status: 403 });

  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const category = formData.get('category');
    const type = formData.get('type');
    const groupName = formData.get('group_name') || null;

    if (!title || !category || !type) {
      return NextResponse.json({ error: '請填寫完整資訊' }, { status: 400 });
    }

    let urlToSave = '';

    if (type === 'file') {
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: '請提供有效的檔案' }, { status: 400 });
      }

      const validExtensions = ['.pptx', '.docx', '.pdf'];
      const fileExtension = path.extname(file.name).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        return NextResponse.json({ error: '不支援的檔案格式，僅支援 .pptx, .docx, .pdf' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadDir, fileName);

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);

      urlToSave = `/uploads/${fileName}`;
    } else {
      const linkUrl = formData.get('url');
      if (!linkUrl) {
        return NextResponse.json({ error: '請提供連結網址' }, { status: 400 });
      }
      urlToSave = linkUrl;
    }

    db.prepare(`
      INSERT INTO documents (title, category, type, url, uploader_student_id, group_name) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, category, type, urlToSave, user.student_id, groupName);

    return NextResponse.json({ success: true, url: urlToSave });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '內部伺服器錯誤' }, { status: 500 });
  }
}
