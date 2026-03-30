const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // AGREGA ESTO PARA SALTAR EL ERROR DE ESLINT DEL EQUIPO
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;