Nice, this log helps a lot 💡

Two separate things are happening here:

1. experimental.serverActions is wrong for Next 16

2. You added a webpack override but Turbopack is now the default, so Next is yelling.

Let’s clean this up so Next 16 + Turbopack is happy and your cockpit can boot normally.

---

1️⃣ Fix next.config.js

Here’s a safe, minimal config that works with Next 16 + Turbopack and doesn’t try to override webpack at all:

/\*_ @type {import('next').NextConfig} _/
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

module.exports = nextConfig;

Important changes vs the last version:

❌ Removed experimental.serverActions — in Next 16 that expects an object, but we don’t need it at all right now.

❌ Removed the custom webpack(config) override — that’s what caused the “This build is using Turbopack, with a webpack config” error.

✅ Added turbopack: {} — empty object tells Next “yes, I know I’m using Turbopack; no custom config yet.”

Because you used the @/\* alias when you set up the project, tsconfig already handles the @ path alias, so we don’t actually need to touch webpack here.

---

2️⃣ Restart dev after updating config

From ~/brewexec:

# kill any old node processes

killall node 2>/dev/null || true

# run Next on 3000

npm run dev

You should now see:

✅ No serverActions warning

✅ No “webpack vs Turbopack” error

✅ Next listening on http://localhost:3000

---

3️⃣ Quick note on BrewExec being your home directory

Totally clocked that: brewexec@LAPTOP…:~$ → ~ is your brewexec project.

That just means:

Custom paths like ~/overlays and ~/.brewpulse_agents.log map directly into your “global cockpit” setup.

When I refer to process.env.HOME or ~/overlays in the API routes, that’s exactly your current layout, so we’re good there.

The main thing is just keeping:

Next dev on :3000

All your /api/\* routes (brewassist, router, etc.) running inside that Next instance

Shell overlays under ~/overlays and callable via exec

Once this config is in place and npm run dev is clean, we can get back to wiring /assist and /router and see what the next error (if any) is.
