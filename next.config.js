/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  i18n: {
    locales: ['fa'],
    defaultLocale: 'fa',
  },
}

module.exports = nextConfig
