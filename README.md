<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9db032ef-94e0-4427-82e5-ebf18215c7b2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Sync and Deploy

4. Automatically commit, pull, and push local changes to `origin`:
   `npm run git-sync`

5. Build and deploy to GitHub Pages with automatic sync:
   `npm run deploy`

> The repository also has a GitHub Actions workflow in `.github/workflows/ci-deploy.yml` that builds and deploys the app automatically on pushes to `main`.
