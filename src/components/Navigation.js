"use client";

import Link from 'next/link';
import { useState } from 'react';

/* ── Style Constants ── */
const navBarStyle = {
  background: '#ffffff',
  padding: '1rem 0',
  borderBottom: '1px solid var(--border-color)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const logoStyle = {
  height: '40px',
  width: 'auto',
  objectFit: 'contain',
};

const smallBtnStyle = {
  padding: '0.3rem 0.6rem',
  fontSize: '0.875rem',
};

export default function Navigation({ user }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const isDocAdmin = user?.role === 'system_admin' || user?.role === 'doc_admin';
  const isSysAdmin = user?.role === 'system_admin';

  const roleLabel = isSysAdmin ? ' (管理)' : isDocAdmin ? ' (教材)' : '';

  /* ── User Info Block (shared between mobile header & desktop right) ── */
  const userInfoBlock = user ? (
    <div className="flex items-center gap-2">
      <span className="badge" title={`權限: ${user.role}`}>{user.name}<span className="hide-on-mobile">{roleLabel}</span></span>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="btn btn-outline"
        style={smallBtnStyle}
      >
        登出
      </button>
    </div>
  ) : (
    <Link href="/login" className="btn btn-primary" style={smallBtnStyle}>
      登入
    </Link>
  );

  return (
    <nav style={navBarStyle}>
      <div className="container flex items-center justify-between" style={{ flexWrap: 'wrap' }}>

        {/* ── Logo + Mobile User Info + Hamburger ── */}
        <div
          className="flex items-center justify-between mobile-header-row md-w-auto"
          style={{ columnGap: '0.5rem' }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
            <img
              src="https://www.anesth.org.tw/images/logo-title.png"
              alt="台灣麻醉醫學會"
              style={logoStyle}
            />
          </Link>

          {/* User info visible only on mobile (next to hamburger) */}
          <div className="flex items-center gap-2 show-on-mobile-only">
            {userInfoBlock}
            <button
              className="nav-toggle-btn"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="選單"
              style={{ marginLeft: '0.5rem' }}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* ── Collapsible Nav Links ── */}
        <div className={`nav-links-menu${isMobileMenuOpen ? ' open' : ''}`}>
          <Link href="/" className="btn btn-outline" style={{ border: 'none' }} onClick={closeMenu}>
            首頁
          </Link>
          {user && isDocAdmin && (
            <>
              <Link href="/categories" className="btn btn-outline" style={{ border: 'none' }} onClick={closeMenu}>
                分類管理
              </Link>
              <Link href="/upload" className="btn btn-outline" style={{ border: 'none' }} onClick={closeMenu}>
                上傳文件
              </Link>
            </>
          )}
          {user && isSysAdmin && (
            <Link href="/members" className="btn btn-outline" style={{ border: 'none' }} onClick={closeMenu}>
              會員管理
            </Link>
          )}
        </div>

        {/* ── User Info on desktop (pushed to far right) ── */}
        <div className="nav-user-desktop">
          {userInfoBlock}
        </div>

      </div>
    </nav>
  );
}
