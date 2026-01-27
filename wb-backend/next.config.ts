import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
// добавляем CORS заголовки для API endpoint'ов
  // это необходимо для разрешения запросов с фронта (localhost:5173) к бэкенду (localhost:3000)
  async headers() {
    return [
      {
        // применяем к всем API endpoint'ам по пути /api/*
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // разрешаем все источники (только для разработки!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!)
            ////// ААААААЛЛОООООО  в продакшене заменю '*' на конкретный домен
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
            // разрешенные HTTP методы
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
            // реазрешенные заголовки
          },
        ],
      },
    ];
  },
};

export default nextConfig;