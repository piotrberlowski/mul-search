/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    publicRuntimeConfig: {
        version,
    },
}

module.exports = nextConfig