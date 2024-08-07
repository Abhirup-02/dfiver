/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost'
            }
        ]
    },
    logging: {
        fetches: {
            fullUrl: true
        }
    }
};

export default nextConfig;
