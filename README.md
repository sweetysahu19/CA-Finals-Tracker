# Sweety's CA Finals — GitHub Pages Edition

This edition uses only plain HTML, CSS and vanilla JavaScript. It has no framework, package manager, build step or server dependency.

## Publish on GitHub Pages

1. Create a new GitHub repository, for example `sweety-ca-finals`.
2. Upload every file from this `github-pages` folder to the repository root.
3. Open the repository's **Settings**.
4. Select **Pages** under **Code and automation**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/ (root)`, then save.
7. GitHub will show the website address after deployment completes.

## Data and documents

Tracker data is stored in the browser used to visit the GitHub Pages address. Documents are stored in IndexedDB in that browser. Use **Home → Data Safety → Export backup** regularly. The `.cafinalbackup` file restores data and documents in a new browser or computer.

Do not change the GitHub repository name after you begin using the tracker unless you export a backup first, because changing the Pages URL creates a different browser-storage origin.
