"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null); // null means adding new or not editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ student_id: '', name: '', password: '', role: 'member' });
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
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
    fetchMembers();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({ student_id: '', name: '', password: '', role: 'member' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({ student_id: member.student_id, name: member.name, password: '', role: member.role });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這位會員嗎？')) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMembers();
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

    const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members';
    const method = editingMember ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchMembers();
      } else {
        const body = await res.json();
        setError(body.error || '儲存失敗');
      }
    } catch (err) {
      setError('系統錯誤');
    }
  };

  const roleText = (r) => {
    if (r === 'system_admin') return '系統管理者';
    if (r === 'doc_admin') return '教材管理者';
    return '一般會員';
  };

  if (loading) return <div className="text-center text-muted" style={{ padding: '2rem' }}>載入中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>會員管理系統</h1>
        <button className="btn btn-primary" onClick={openAddModal}>+ 新增會員</button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>帳號 (學號)</th>
                <th style={{ padding: '0.75rem' }}>姓名</th>
                <th style={{ padding: '0.75rem' }}>權限等級</th>
                <th style={{ padding: '0.75rem' }}>建立時間</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{m.student_id}</td>
                  <td style={{ padding: '0.75rem' }}>{m.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge" style={{ backgroundColor: m.role === 'system_admin' ? '#fca5a5' : m.role === 'doc_admin' ? '#fde047' : '#EEF2FF', color: m.role === 'member' ? 'var(--primary-color)' : '#000' }}>
                      {roleText(m.role)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleDateString('zh-TW')}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {m.student_id !== 'admin' && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEditModal(m)} className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>修改</button>
                        <button onClick={() => handleDelete(m.id)} className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>刪除</button>
                      </div>
                    )}
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
            <h2 style={{ marginBottom: '1.5rem' }}>{editingMember ? '編輯會員' : '新增會員'}</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">會員編號</label>
                <input type="text" className="form-control" required disabled={!!editingMember} value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">姓名</label>
                <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">密碼 {editingMember && '(留空表示不修改)'}</label>
                <input type="password" className="form-control" required={!editingMember} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">權限角色</label>
                <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="member">一般會員</option>
                  <option value="doc_admin">教材管理者</option>
                  <option value="system_admin">系統管理者</option>
                </select>
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
