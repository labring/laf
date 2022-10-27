/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");

const nextConfig = {
  experimental: {
    newNextLinkBehavior: true,
    // fallbackNodePolyfills: false
  },
  i18n,
};

module.exports = nextConfig;
