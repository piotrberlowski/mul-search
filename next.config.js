/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
    trailingSlash: true,
    images: { unoptimized: true },
    publicRuntimeConfig: {
        version,
    },
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        config.externals.push({ canvas: 'commonjs canvas' })
        return config
    },
}

module.exports = nextConfig