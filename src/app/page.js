"use client";

import { useState, useEffect } from 'react';

/* ── Shared Style Constants ── */
const cellStyle = { padding: '0.75rem' };
const mutedCellStyle = { ...cellStyle, color: 'var(--text-muted)' };
const filterLabelStyle = { display: 'inline-block', marginRight: '0.5rem' };
const filterSelectStyle = { width: 'auto', display: 'inline-block' };
const groupBadgeStyle = { backgroundColor: '#fff7ed', color: '#ea580c' };
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};
const actionBtnBase = {
  background: 'transparent', border: 'none',
  cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold',
};

export default function HomePage() {
  /* ── State ── */
  const [documents, setDocuments] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    group: 'all',
    sort: 'upload_date',
    order: 'desc',
    limit: 5,
  });

  // Edit modal
  const [editingDoc, setEditingDoc] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', category: '', group_name: '', url: '' });
  const [editError, setEditError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Data Fetching ── */
  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(console.error);

    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(['all', ...data.categories.map(c => c.name)]);
        }
      })
      .catch(console.error);
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/documents?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
        setAvailableGroups(data.groups || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, [filters]);

  /* ── Sorting ── */
  const handleSort = (column) => {
    if (filters.sort === column) {
      setFilters(prev => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }));
    } else {
      setFilters(prev => ({ ...prev, sort: column, order: 'desc' }));
    }
  };

  const getSortIcon = (column) => {
    if (filters.sort !== column) return '↕️';
    return filters.order === 'asc' ? '↑' : '↓';
  };

  /* ── CRUD Actions ── */
  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這筆教材嗎？')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDocuments();
      else {
        const body = await res.json();
        alert(body.error || '刪除失敗');
      }
    } catch (err) {
      alert('系統錯誤');
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setEditFormData({
      title: doc.title,
      category: doc.category,
      group_name: doc.group_name || '',
      url: doc.url,
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        setEditingDoc(null);
        fetchDocuments();
      } else {
        const body = await res.json();
        setEditError(body.error || '儲存失敗');
      }
    } catch (err) {
      setEditError('系統錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Derived ── */
  const canEditOrDelete = user?.role === 'system_admin' || user?.role === 'doc_admin';
  const categoryOptions = categories.filter(c => c !== 'all');

  /* ── Render ── */
  return (
    <div>
      {/* ── Page Title ── */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>最新教材與文件</h1>
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={filterLabelStyle}>分類篩選:</label>
            <select
              className="form-control"
              style={filterSelectStyle}
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">所有分類</option>
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={filterLabelStyle}>群組篩選:</label>
            <select
              className="form-control"
              style={filterSelectStyle}
              value={filters.group}
              onChange={e => setFilters({ ...filters, group: e.target.value })}
            >
              <option value="all">所有群組</option>
              {availableGroups.map(grp => <option key={grp} value={grp}>{grp}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={filterLabelStyle}>顯示筆數:</label>
            <select
              className="form-control"
              style={filterSelectStyle}
              value={filters.limit}
              onChange={e => setFilters({ ...filters, limit: e.target.value })}
            >
              <option value={5}>最新5筆 (預設)</option>
              <option value={10}>10筆</option>
              <option value={50}>50筆</option>
              <option value={0}>全部顯示</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>載入中...</div>
      ) : documents.length === 0 ? (
        <div className="card text-center text-muted" style={{ padding: '3rem' }}>
          目前沒有任何教材文件符合條件
        </div>
      ) : (
        /* Card Grid – hidden on mobile */
        <div className="grid gap-4 hide-on-mobile" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {documents.map(doc => (
            <div key={doc.id} className="card flex-col flex justify-between animate-fade-in relative">
              {canEditOrDelete && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(doc)} style={{ ...actionBtnBase, color: 'var(--primary-color)' }} title="編輯">編輯</button>
                  <button onClick={() => handleDelete(doc.id)} style={{ ...actionBtnBase, color: '#ef4444' }} title="刪除">刪除</button>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge">{doc.category}</span>
                  {doc.group_name && <span className="badge" style={groupBadgeStyle}>{doc.group_name}</span>}
                </div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', paddingRight: canEditOrDelete ? '5rem' : '0' }}>{doc.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  👤 {doc.uploader_name} <br />
                  🕒 {new Date(doc.upload_date).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%' }}>
                  {doc.type === 'file' ? '📂 下載文件' : '🔗 前往連結'}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── List Table ── */}
      <div className="card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem' }}>清單檢視 (支援排序)</h3>
        {documents.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => handleSort('category')}>分類 {getSortIcon('category')}</th>
                <th className="hide-on-mobile" style={cellStyle}>群組</th>
                <th style={cellStyle}>標題</th>
                <th style={cellStyle}>類型</th>
                <th className="hide-on-mobile" style={cellStyle}>上傳者</th>
                <th className="hide-on-mobile" style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => handleSort('upload_date')}>日期 {getSortIcon('upload_date')}</th>
                {user && <th style={cellStyle}>操作</th>}
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={cellStyle}><span className="badge">{doc.category}</span></td>
                  <td className="hide-on-mobile" style={cellStyle}>
                    {doc.group_name && <span className="badge" style={groupBadgeStyle}>{doc.group_name}</span>}
                  </td>
                  <td style={{ ...cellStyle, fontWeight: 500 }}>{doc.title}</td>
                  <td style={mutedCellStyle}>{doc.type === 'file' ? '檔案' : '連結'}</td>
                  <td className="hide-on-mobile" style={mutedCellStyle}>{doc.uploader_name}</td>
                  <td className="hide-on-mobile" style={mutedCellStyle}>{new Date(doc.upload_date).toLocaleDateString('zh-TW')}</td>
                  {user && (
                    <td style={cellStyle}>
                      <div className="flex gap-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>開啟</a>
                        {canEditOrDelete && (
                          <>
                            <button onClick={() => openEditModal(doc)} style={{ ...actionBtnBase, color: 'var(--primary-color)', fontWeight: 500 }}>編輯</button>
                            <button onClick={() => handleDelete(doc.id)} style={{ ...actionBtnBase, color: '#ef4444', fontWeight: 500 }}>刪除</button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingDoc && (
        <div style={overlayStyle}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>編輯教材內容</h2>
            {editError && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{editError}</div>}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">教材標題</label>
                <input type="text" className="form-control" required value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">分類</label>
                <select className="form-control" value={editFormData.category} onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}>
                  {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  {/* 若教材使用了已刪除的分類，仍顯示以便修改 */}
                  {!categories.includes(editFormData.category) && <option value={editFormData.category}>{editFormData.category}</option>}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">教材群組 (非必填)</label>
                <input type="text" className="form-control" value={editFormData.group_name} onChange={e => setEditFormData({ ...editFormData, group_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{editingDoc.type === 'file' ? '下載路徑 (若為檔案不建議亂改)' : '外部連結網址'}</label>
                <input type="text" className="form-control" required value={editFormData.url} onChange={e => setEditFormData({ ...editFormData, url: e.target.value })} />
              </div>
              <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingDoc(null)} disabled={isSubmitting}>取消</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>{isSubmitting ? '儲存中...' : '儲存修改'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
