/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Azure App Service 最佳實踐
  serverExternalPackages: ['better-sqlite3'], // 確保原生模組被正確引用
  allowedDevOrigins: ['192.168.68.62'],
};

export default nextConfig;
