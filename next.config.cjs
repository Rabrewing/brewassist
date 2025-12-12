/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Use standalone output so BrewExec can be bundled / shipped later
  output: 'standalone',

  // Silence the Turbopack warning without adding custom config yet
  turbopack: {
    // Explicitly set the workspace root for Turbopack
    // This resolves the "multiple lockfiles" warning.
    root: '/home/brewexec/brewassist/',
  },

  // (Optional) expose env vars to the client side if you need them
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    BREWTRUTH_MODE: process.env.BREWTRUTH_MODE,
    BREWTRUTH_EXPECTED_TIER: process.env.BREWTRUTH_EXPECTED_TIER,
    BREWTRUTH_POLICY_VERSION: process.env.BREWTRUTH_POLICY_VERSION,
    BREWTRUTH_ENFORCE_INTENT: process.env.BREWTRUTH_ENFORCE_INTENT,
    BREWTRUTH_EMOTION_GUARD: process.env.BREWTRUTH_EMOTION_GUARD,
    BREWTRUTH_LOGGING: process.env.BREWTRUTH_LOGGING,
    BREWTRUTH_ENABLED: process.env.BREWTRUTH_ENABLED,
    BREWTRUTH_TIER: process.env.BREWTRUTH_TIER,
    BREWTRUTH_MODEL: process.env.BREWTRUTH_MODEL,
  },
};

export default nextConfig;
