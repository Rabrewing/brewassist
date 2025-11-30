/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Use standalone output so BrewExec can be bundled / shipped later
  output: 'standalone',

  // Silence the Turbopack warning without adding custom config yet
  turbopack: {},

  // (Optional) expose env vars to the client side if you need them
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
