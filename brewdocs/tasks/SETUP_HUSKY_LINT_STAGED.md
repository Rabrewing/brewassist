# 🐶 New Husky + lint-staged Setup (BrewAssist-safe)

This setup:

- only runs on staged ts/tsx/js/jsx files
- does not touch models/, mistral_models/, GGUF, venv, etc.
- runs fast and won’t block commits on big binary files

## 1️⃣ Install dependencies

From your repo root (inside Ubuntu):

```bash
pnpm add -D husky lint-staged
```

## 2️⃣ Initialize Husky

```bash
npx husky init
```

That will:

- create a .husky/ directory
- create a default .husky/pre-commit file that runs npm test
- add "prepare": "husky" script to package.json if it’s not there

## 3️⃣ Edit .husky/pre-commit

Open .husky/pre-commit and replace its contents with:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# BrewAssist pre-commit: only run lint-staged on staged TS/JS files
pnpm lint-staged
```

> If you ever see a future Husky deprecation warning, we can tweak this, but for Husky 9 this pattern is standard.

## 4️⃣ Add lint-staged config

Create a file at the repo root:

**.lintstagedrc.json**

```json
{
  "*.{ts,tsx,js,jsx}": [
    "pnpm eslint --fix",
    "pnpm prettier --write"
  ]
}
```

This means:

- When you commit, Husky calls `pnpm lint-staged`
- `lint-staged` finds changed `*.ts/tsx/js/jsx` files
- It runs `eslint --fix` and `prettier --write` only on those files

> If you don’t yet have ESLint or Prettier set up, we can adjust this to match your existing package.json scripts or add them.

## 5️⃣ (Optional) Add convenience scripts to package.json

In `package.json` you can also add:

```json
"scripts": {
  "lint": "next lint",
  "format": "prettier --write .",
  "lint:staged": "lint-staged"
}
```

Not required for Husky to work, but nice to have.
