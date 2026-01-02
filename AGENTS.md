The purpose of this software is to manage code repositories.

It lists all the repositories in a folder and allows you to:

- Open projects in your preferred code editor (Cursor, VSCode, Zed, Sublime, WebStorm, etc.)
- Create new projects with optional git initialization
- Push commits to remote repositories
- Create GitHub remotes for local repos using GitHub CLI
- Pin/favorite important projects for quick access
- Organize projects into custom tabs
- Tag projects for categorization
- Search and filter projects

## Tech Stack

- Electron + React 19
- TypeScript
- Tailwind CSS
- Vite

## Architecture

```
src/
├── main/           # Electron main process
│   ├── ipc-handlers.ts
│   └── services/
│       ├── project-scanner.ts  # Discovers repos in code folder
│       ├── git-service.ts      # Git operations
│       ├── gh-service.ts       # GitHub CLI operations
│       └── settings-service.ts # Settings management
├── renderer/       # React frontend
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   └── types/
└── main.ts
```

## Key Features

### Project Discovery
Scans a configured folder to find all git and non-git repositories, retrieving status info (branch, commits, changes).

### Git Status Indicators
- No repo (gray): Folder without git
- No remote (yellow): Git repo without remote
- Changes (orange): Uncommitted changes
- Ahead (blue): Unpushed commits
- Behind (purple): Commits to pull
- Synced (green): Up to date

### Tab System
Finder-style tabs for organizing projects. Users can create, rename, and delete tabs.

### Settings
- Configurable code folder location
- Configurable editor command
- Optional cloud sync for settings (iCloud, Dropbox, etc.)