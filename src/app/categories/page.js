"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        router.push('/');
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setNewCategory('');
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這個分類嗎？(舊有教材的分類文字將不受影響，但下拉選單不再顯示)')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
      else {
        const data = await res.json();
        alert(data.error || '刪除失敗');
      }
    } catch(e) {
      alert('系統錯誤');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const body = await res.json();
        setError(body.error || '儲存失敗');
      }
    } catch (err) {
      setError('系統錯誤');
    }
  };

  if (loading) return <div className="text-center text-muted" style={{ padding: '2rem' }}>載入中...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>分類管理</h1>
        <button className="btn btn-primary" onClick={openAddModal}>+ 新增分類</button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>分類名稱</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>{c.id}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(c.id)} className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>新增分類</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">分類名稱</label>
                <input type="text" className="form-control" required value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="例如: 系統設計" />
              </div>
              <div className="flex gap-2 mt-4" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>取消</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
