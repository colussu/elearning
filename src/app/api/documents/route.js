import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const groupName = searchParams.get('group') || 'all';
    const sortBy = searchParams.get('sort') || 'upload_date'; // upload_date or category
    const order = searchParams.get('order') || 'desc'; // asc or desc
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 5;

    let query = `
      SELECT d.*, m.name as uploader_name 
      FROM documents d
      LEFT JOIN members m ON d.uploader_student_id = m.student_id
      WHERE 1=1
    `;
    const params = [];

    if (category !== 'all') {
      query += ` AND d.category = ?`;
      params.push(category);
    }
    
    if (groupName !== 'all') {
      query += ` AND d.group_name = ?`;
      params.push(groupName);
    }

    const safeSortBy = sortBy === 'category' ? 'd.category' : 'd.upload_date';
    const safeOrder = order === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSortBy} ${safeOrder}`;
    
    if (limit > 0) {
      query += ` LIMIT ?`;
      params.push(limit);
    }

    const documents = db.prepare(query).all(...params);

    // Get distinct groups for the frontend to build the filter dropdown
    const distinctGroups = db.prepare("SELECT DISTINCT group_name FROM documents WHERE group_name IS NOT NULL AND group_name != ''").all();
    const groups = distinctGroups.map(g => g.group_name);

    return NextResponse.json({ success: true, documents, groups });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json({ error: '獲取文件失敗' }, { status: 500 });
  }
}
