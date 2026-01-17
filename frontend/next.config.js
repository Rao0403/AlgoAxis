/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    // Server-side proxy target. Keep backend URLs off the client.
    // Set API_PROXY_TARGET to your Elastic Beanstalk base URL in production.
    const proxyTarget = process.env.API_PROXY_TARGET || "http://localhost:5000";

    return [
      {
        source: "/api/:path*",
        destination: `${proxyTarget}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
