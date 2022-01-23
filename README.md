# Legion CLI

**Legion Workspace = NPM Workspaces + Legion CLI**

Legion is a tool to enable a **monorepo-like** workflow in a **polyrepo** setup. It significantly reduces the overhead of handling multiple repositories and allows for a more streamlined workflow.

Legion relies heavily on NPM Workspaces (Yarn support to come).

## The idea

Monorepos solve branch-management overhead by having every change in a single branch. **`Legion` solves branch-management by having every repository on a branch with the same name.** You create, push, and merge branches in a single command for all the repositories at once.

The main benefits of this approach over monorepos are:

- You can use `Legion` without changing the setup of your repositories
- You can add and remove repositories from any number of teams and organizations easily at any time
- You don't need to change your deployment setup, since your repos are all still independent and don't know about each other
- No partial checkouts - if you don't need a repository on your machine, don't add it

### What `legion` DOESN'T do

No `legion version` command. It is expected that `npm version` and `npm publish` commands are used by the developer as they see fit.

## Installation

```bash
npm install -g @legion-workspace/cli
```

## Setup

### 1. Set up .legionrc.js

Define your repositories in `.legionrc.js` in the root of your workspace

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
| `branch` | This is the branch that the repository will be checked out to when you run `legion init` and `legion reset`. This is usually `main`. |
| `path` | Relative path to the repository. |

### 2. Set up package.json

In the workspace root: `npm init`

This will create a `package.json` file in the root of your workspace. It is mainly used to define the "workspace" paths for npm linking by NPM Workspaces.

### 3. Clone repositories

```bash
legion init
```

This will clone the repositories defined in `.legionrc.js` into the directories defined in the `path` properties.

## Usage

The main idea behind Legion Workspace and the CLI tool is to create a single command that can be used to manage multiple repositories. As such, instead of creating a branch manually in each repository for a feature development, we create it with `legion` in all repositories at once, even in the ones we will not use for the feature. In the end, we will simply not push out the feature branch in the repositories we don't have changes in.

### Starting a new feature branch

1. `legion reset` makes sure we have the latest changes and are on the base branch
2. `legion checkout -b new-branch-name` creates a new branch in all repositories
3. Implement the required changes
4. Commit the changes: `legion add .` and `legion commit -m "Implement feature"`
5. Push the changes of the affected repositories: `legion push`

### Publishing the packages

**`legion` does not yet support a way to automatically publish all affected packages.** This is planned for a future release.

In all affected packages (except the service packages):

1. `npm version major/minor/patch`
2. `npm publish`

### Upgrading packages

Once the packages are upgraded with `npm version major/minor/patch` and published with `npm publish`, use:

```bash
legion upgrade @org-name/package-name
```

This will update the version in all repositories that use the package **_to the version that is currently on your local machine._**

Use:

```bash
legion check
```

To check that all your repositories use the correct package version. If not, they will show up either yellow or red with the required version numbers defined.

You can then use

1. `legion add .`
2. `legion commit -m "Upgrade package"`
3. `legion push`

To push the changes to all services.

### Deploying any services

`legion` does not yet support a way to deploy. **This is not planned.** Currently, just use your normal flow for publishing.

## List of all commands

| Command | Description |
|---|---|
| `help` | Shows a list of all commands. |
| `add` | Runs `git add` in all the repositories. Simple alias of `legion run 'git add'` |
| `check [-a]` | Shows you the versions of the packages that are out of sync with the workspace. <br /> If the package is <span style="font-weight:bold;color:red">red</span>, it will be unlinked. If it is <span style="font-weight:bold;color:green">green</span> or <span style="font-weight:bold;color:orange">orange</span>, it will be linked. |
| `checkout` | Runs `git checkout` in all the repositories. Simple alias of `legion run 'git checkout'` |
| `commit` | Runs `git commit` in repositories with staged, unstaged and/or tracked changes. |
| `init` | Initialises repositories defined in `.legionrc.js`, populates `"workspaces"` and runs `npm i` in the root of the workspace. |
| `link` | Refreshes the workspace root `package.json` `"workspaces"` value. |
| `pull` | Runs `git pull` in all the repositories. |
| `push` | Runs `git push` in all the repositories which are ahead of the base branch at least with one commit. |
| `reset` | Discards all changes (staged, unstaged and untracked) and resets to the latest base branch. |
| `run '<command>'` | Runs the command in all repositories. Notice the upticks. |
| `status` | Quick overview of the changed repositories. <br /> It will show you any repositories that are ahead of the base branch or that have uncommited changes. |
| `upgrade <packagename>` | Upgrades the package in all repositories. <br /> Runs `npm i packagename@<version>` in all repositories dependent on the package.<br /> The `<version>` will match the value in the local workspace, but it will pull it from the remote registry. |

## Roadmap and issues

1. [ ] Support for `-a` in `legion commit -am "Commit message"`. When `-a` is detected, `git commit` will run in repositories that have unstaged changes, too.
2. [ ] Show unpushed commits in `legion status`
3. [ ] `legion prune` or similar to clean up unused branches and old merged branches.
4. [ ] `legion pull` should not fail when remote is not tracked or when remote is already merged/deleted
5. [ ] `legion push` should not push branch which has been deleted in remote
6. [ ] Migrate code to TypeScript for better code scaling
