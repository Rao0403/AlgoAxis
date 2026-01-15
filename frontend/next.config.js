/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://interviewmate.ap-south-1.elasticbeanstalk.com/api/:path*"
      }
    ];
  }
};

module.exports = nextConfig;