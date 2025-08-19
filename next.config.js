/** @type {import('next').NextConfig} */
const isProd = process.env.GITHUB_PAGES === 'true'
const repoName = 'PicID'

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Use basePath/assetPrefix only on GitHub Pages (project site)
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
}

module.exports = nextConfig
