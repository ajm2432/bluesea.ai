/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minification
  swcMinify: false,
  distDir: 'build',

  experimental: {
    serverComponentsExternalPackages: ["@aws-sdk/client-bedrock-agent-runtime"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { dev, isServer }) => {
    // Existing AWS configuration
    if (isServer) {
      config.externals.push({
        "@aws-sdk/client-bedrock-agent-runtime":
          "commonjs @aws-sdk/client-bedrock-agent-runtime",
      });
    }

    // Add source maps for debugging
    config.devtool = 'source-map';
    
    // Log webpack output for debugging
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('LogBuiltFiles', (compilation) => {
          console.log('\nBuilt files:');
          for (let filename in compilation.assets) {
            console.log(filename);
          }
        });
      },
    });

    return config;
  },
};
