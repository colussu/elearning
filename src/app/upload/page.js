"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    group_name: ''
  });
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
           setCategories(data.categories.map(c => c.name));
           if (data.categories.length > 0) {
             setFormData(prev => ({ ...prev, category: data.categories[0].name }));
           }
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('type', uploadType);
      if (formData.group_name) {
        data.append('group_name', formData.group_name);
      }

      if (uploadType === 'file') {
        if (!file) {
          setError('請選擇要上傳的文件');
          setLoading(false);
          return;
        }
        data.append('file', file);
      } else {
        if (!linkUrl) {
          setError('請輸入外部連結');
          setLoading(false);
          return;
        }
        data.append('url', linkUrl);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const body = await res.json();
        setError(body.error || '上傳失敗');
      }
    } catch (err) {
      setError('系統錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>上傳教材文件</h2>
      
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">教材標題</label>
          <input 
            type="text" 
            className="form-control" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
            placeholder="請輸入教材標題"
          />
        </div>

        <div className="form-group">
          <label className="form-label">分類</label>
          <select 
            className="form-control"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">教材群組 (非必填)</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="例如: 基礎班、進階班 (若無可留空)"
            value={formData.group_name}
            onChange={e => setFormData({...formData, group_name: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label className="form-label">上傳方式</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="type" 
                value="file" 
                checked={uploadType === 'file'}
                onChange={() => setUploadType('file')}
              /> 
              上傳檔案
            </label>
            <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="type" 
                value="link" 
                checked={uploadType === 'link'}
                onChange={() => setUploadType('link')}
              /> 
              外部連結
            </label>
          </div>
        </div>

        {uploadType === 'file' ? (
          <div className="form-group">
            <label className="form-label">選擇檔案 (支援: .pptx, .docx, .pdf)</label>
            <input 
              type="file" 
              className="form-control" 
              accept=".pptx,.docx,.pdf"
              onChange={e => setFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">外部連結網址</label>
            <input 
              type="url" 
              className="form-control" 
              placeholder="https://"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? '處理中...' : '提交上傳'}
        </button>
      </form>
    </div>
  );
}
