import "./globals.css";
import Navigation from "../components/Navigation";
import { getCurrentUser } from "../lib/auth";

export const metadata = {
  title: "數位學習平台 | E-Learning Platform",
  description: "一個提供文件分類與上傳的教學網站",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navigation user={user} />
        <main className="container">
          {children}
        </main>
        <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
          &copy; 2026 數位學習平台. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
