# Sweety's CA Finals HQ — GitHub Pages Edition

This edition uses only plain HTML, CSS and vanilla JavaScript. It has no framework, package manager, build step or server dependency.

## Optional multi-device Supabase sync

1. Create a free Supabase project.
2. Open **SQL Editor**, paste everything from `supabase-setup.sql`, and run it once.
3. In Supabase, open **Project Settings → API** and copy the project URL and publishable/anon key. Never use the service-role key.
4. Open the deployed tracker, select **Set up sync**, save those two values, and create your account.
5. Confirm the verification email if Supabase requests it. Sign in with the same email on every device.

Only formatted chapter notes and YouTube/lecture links sync automatically. The syllabus and interface are static website files. Progress, revisions, tasks, calendars, qualification checks, and uploaded documents stay in each browser's local storage.

## Publish on GitHub Pages

1. Create a new GitHub repository, for example `ca-finals-hq`.
2. Upload every file from this `github-pages` folder to the repository root.
3. Open the repository's **Settings**.
4. Select **Pages** under **Code and automation**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/ (root)`, then save.
7. GitHub will show the website address after deployment completes.

## Data and documents

Tracker data is stored in the browser used to visit the GitHub Pages address. Documents are stored in IndexedDB in that browser. Use **Resources → Export full backup** regularly. The `.cafinalbackup` file restores data and documents in a new browser or computer.

Do not change the GitHub repository name after you begin using the tracker unless you export a backup first, because changing the Pages URL creates a different browser-storage origin.
