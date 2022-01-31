# Hulky

[![npm](https://img.shields.io/npm/v/hulky.svg?cacheSeconds=3600)](https://www.npmjs.com/package/hulky) [![downloads](https://img.shields.io/npm/dt/hulky.svg?cacheSeconds=3600)](https://www.npmjs.com/package/hulky) [![license](https://img.shields.io/npm/l/hulky.svg?cacheSeconds=3600)](https://www.npmjs.com/package/hulky)

Hulky workspace speeds up multi-repository workflows. Compared to monorepos, Hulky fully embraces a poly-repository environment. It significantly reduces the overhead of handling multiple repositories and allows for a more streamlined workflow.

Hulky is specifically designed for NPM packaged projects. Hulky currently relies on NPM Workspace for linking (Yarn support to come).

**NB!** Currently, `hulky` does not yet calculate the dependency graph for the workspace, so it will not recursively version up affected packages. Therefore, NPM package versioning and publishing should still be done manually.

## Table of contents

- [Installation](#installation)
- [Setup](#setup)
- [Commands](#commands)
- [Usage](#usage)
- [Roadmap and issues](#roadmap-and-issues)

## Installation

```bash
npm install -g hulky
```

## Setup

### 1. Set up .hulkyrc.js

Define your repositories in `.hulkyrc.js` in the root of your workspace

```js
module.exports = {
    repositories: [
        // Microservice applications in apps/
        {
            url: "git@github.com:example-org-name/example-microservice-name.git",
            branch: "main",
            path: "apps/microservice-service"
        },

        // Shared package libraries in packages/
        {
            url: "git@github.com:example-org-name/example-package-name.git",
            branch: "main",
            path: "packages/package-name",
        }
    ]
}
```

| Property | Description |
|---|---|
| `url` | URL of the git repository |
| `branch` | This is the branch that the repository will be checked out to when you run `hulky init` and `hulky reset`. This is usually `main`. |
| `path` | Relative path to the repository. |

### 2. Set up package.json

In the workspace root: `npm init`

This will create a `package.json` file in the root of your workspace. It is mainly used to define the "workspace" paths for npm linking by NPM Workspaces.

### 3. Clone repositories

```bash
hulky init
```

This will clone the repositories defined in `.hulkyrc.js` into the directories defined in the `path` properties.

## Commands

| Command | Description |
|---|---|
| `help` | Shows a list of all commands. |
| `add` | Runs `git add` in all the repositories. Simple alias of `hulky run 'git add'` |
| `check [-a]` | Checks the compatibility of dependencies compared to the local packages. Incompatible packages are unlinked, compatible packages are linked. <br /> If the package is <span style="font-weight:bold;color:red">red</span>, it will be unlinked. If it is <span style="font-weight:bold;color:green">green</span> or <span style="font-weight:bold;color:orange">orange</span>, it will be linked. |
| `checkout` | Runs `git checkout` in all the repositories. Simple alias of `hulky run 'git checkout'` |
| `commit` | Runs `git commit` in repositories with staged, unstaged and/or tracked changes. |
| `init` | Initialises repositories defined in `.hulkyrc.js`, populates `"workspaces"` and runs `npm i` in the root of the workspace. |
| `link` | Refreshes the workspace root `package.json` `"workspaces"` value. |
| `list` | Lists the projects. |
| `pull` | Runs `git pull` in all the repositories. |
| `push` | Runs `git push` in all the repositories which are ahead of the base branch at least with one commit. |
| `reset` | Discards all changes (staged, unstaged and untracked) and resets to the latest base branch. |
| `run '<command>'` | Runs the command in all repositories. Notice the upticks. |
| `status` | Quick overview of the changed repositories. <br /> It will show you any repositories that are ahead of the base branch or that have uncommited changes. |
| `switch <branch-name>` | Switches to the branch in all repositories. |
| `upgrade <package-name>` | Upgrades the package in all repositories. <br /> Runs `npm i package-name@<version>` in all repositories dependent on the package.<br /> The `<version>` will match the value in the local workspace, but it will pull it from the remote registry. |

## Usage

### Starting a new feature branch

Implementing a feature is symmetric to `git` commands. A workflow example:

1. `hulky reset` makes sure we have the latest changes and are on the base branch
2. `hulky checkout -b new-branch-name` creates a new branch in all repositories
3. Implement the required changes
4. Commit the changes: `hulky add .` and `hulky commit -m "Implement feature"`
5. Push the changes of the affected repositories: `hulky push`

### Publishing the packages

**`hulky` does not yet support a way to automatically publish all affected packages.**

It is currently expected that you version and publish the packages manually with `npm version` and `npm publish` in the affected repositories.

### Upgrading packages

Once the packages are upgraded with `npm version major/minor/patch` and published with `npm publish`, use:

```bash
hulky upgrade @org-name/package-name
```

This will update the version in all repositories that use the package **_to the version that is currently on your local machine._**

Use:

```bash
hulky check
```

To check that all your repositories use the compatible package version. If not, they will show up either yellow or red with the required version numbers defined.

You can then use

1. `hulky add .`
2. `hulky commit -m "Upgrade package"`
3. `hulky push`

To push the changes to all services.

### Deploying services

It is expected that you use your own deployment flow to deploy the services. `hulky` does not restrict you to using a specific deployment flow and will not do so in the future.

## Roadmap and issues

In no particular order

- [ ] Support for `-a` in `hulky commit -am "Commit message"`. When `-a` is detected, `git commit` will run in repositories that have unstaged changes, too.
- [ ] Show unpushed commits in `hulky status`
- [ ] `hulky prune` or similar to clean up unused branches and old merged branches.
- [ ] `hulky pull` should not fail when remote is not tracked or when remote is already merged/deleted
- [ ] `hulky push` should not push branch which has been deleted in remote
- [ ] Migrate code to TypeScript for better code scaling
- [ ] `hulky reset` should show the changes that are going to be discarded and ask the user for confirmation before continuing
- [ ] `hulky snap` should create a snapshot of the current state of the workspace. This includes the branch state, stashed and unstanshed changes
