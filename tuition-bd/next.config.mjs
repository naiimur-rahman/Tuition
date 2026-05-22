/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcrypt', '@prisma/client'],
};

export default nextConfig;
