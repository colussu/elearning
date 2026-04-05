"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    student_id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        // Force a hard navigation to refresh layout state
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.error || '登入失敗，請檢查您的帳號密碼。');
      }
    } catch (err) {
      setError('系統錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center" style={{ justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <h2 className="text-center" style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>
          會員登入
        </h2>
        
        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">會員編號 (ID)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="請輸入會員編號 (例如: admin / 1001)"
              value={formData.student_id}
              onChange={e => setFormData({...formData, student_id: e.target.value})}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">密碼 (Password)</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="請輸入密碼"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}
