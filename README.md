<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Fz1oub1Aq6TUGMydidXIJRCp9Am6EZY-

## Run Locally

**Prerequisites:**  Nix (dev environment provided via `flake.nix`)

1. Enter the environment:
   `direnv allow` (or `nix develop`)

2. Install dependencies:
   `just install`

3. Set the `GEMINI_API_KEY` in `src/.env.local` to your Gemini API key.

4. Run the app:
   `just dev`

## Development Workflow

This project uses a spec sheet driver workflow.
- **Specifications**: See [specifications.md](./specifications.md) for current feature requirements and design specs.
- **Agent Instructions**: See [agents.md](./agents.md) for how to work with the spec sheet.

