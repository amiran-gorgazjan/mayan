# Legion - the polyrepository helper

Legion is a tool to enable a **monorepo-like** workflow in a **polyrepo** setup. It significantly reduces the overhead of handling multiple repositories and allows for a more streamlined workflow.

Legion relies heavily on NPM Workspaces (Yarn support to come).

## The idea

Monorepos solve branch-management overhead by having every change in a single branch. **`Legion` solves branch-management by having every repository on a branch with the same name.** You create, push, and merge branches in a single command for all the repositories at once.

The main benefits of this approach over monorepos are:

- You can use `Legion` without changing the setup of your repositories
- You can add and remove repositories from any number of teams and organizations easily at any time
- You don't need to change your deployment setup, since your repos are all still independent and don't know about each other
- No partial checkouts - if you don't need a repository on your machine, don't add it

## Installation

```bash
npm install -g @legion-tool/cli
```

## Setup

Define your repositories in `.legionrc.js` in the root of your workspace

```js
module.exports = {
    repositories: [
        // Microservice applications in apps/
        {
            url: "git@github.com:example-org-name/example-microservice-name.git",
            branch: "main",
            path: "apps/my-repo"
        },

        // Shared package libraries in packages/
        {
            url: "git@github.com:example-org-name/example-package-name.git",
            branch: "main",
            path: "packages/my-repo",
        }
    ]
}
```

It is recommended that you split your repositories into `apps` and `packages` folders, which will also automatically tag them as such for more fine-tuned commands.
