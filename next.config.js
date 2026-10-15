/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
    trailingSlash: true,
    images: { unoptimized: true },
    publicRuntimeConfig: {
        version,
    },
}

module.exports = nextConfig
