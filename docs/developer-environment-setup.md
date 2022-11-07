# Setting up the Local Development Environment

## Prerequisites

Ensure the following are installed:

- [Postgres](https://www.postgresql.org/)

## Repository and Version Control

- Ensure you have push access (most likely by being added to the **@bcgov/cas-developers** GitHub team) to [bcgov/cas-cif](https://github.com/bcgov/cas-cif).
- Ensure you have [GPG commit signing](https://docs.github.com/en/github/authenticating-to-github/signing-commits) set up on your local environment.
  - First, ensure your `git config user.email` is set to the email address you want to use for signing.
  - You can verify it's working when you commit to a branch and the signature is indicated by `git log --show-signature`. Once pushed, a "Verified" badge appears next to your commits on GitHub.
- Clone a local copy of [bcgov/cas-cif](https://github.com/bcgov/cas-cif).

## Install the Dev Tools

In the root of `cas-cif`, run `make install_dev_tools`. This creates the databases, installs packages etc.

To seed the dev data, run `make drop_db && make deploy_dev_data`. If you get warnings about the database being accessed, stop and start postgres (`pg_ctl stop` then `pg_ctl start`).

### Troubleshooting

If you run into an error `failed to start: "No such file or directory"`, this can be caused by the client definition in the global sqitch config. Remove the line `client = path/to/psql` from `~/.sqitch/sqitch.conf`.

There might be an error where postgres is only installed with the `postgres` user and not your local user.
To address this, in a terminal, enter:

```
$> sudo -u postgres createuser -s -i -d -r -l -w <<your_local_user>>
$> sudo -u postgres createdb <<your_local_user>>
```

## Install Dependencies

Install dependencies with `cd app && yarn install`

## App Environment Variables

Create an `app/.env` file and copy the contents of [`app/.env.example`](../app/.env.example) into it. See the 1Password vault for the values.

## Run the App

Ensure postgres is running (`pg_start` if not). Then run the development server:

```
cd app && yarn dev
```

Navigate in your browser to `localhost:3004`.

Work that changes Relay GraphQL queries will require you to re-run `yarn build:relay` (which alternatively can be run using a `--watch` flag).

## Pre-Commit

[pre-commit](https://pre-commit.com/) runs a variety of formatting and lint checks configured in [`.pre-commit-config.yaml`](../.pre-commit-config.yaml) which are required for a pull request to pass CI.

`pre-commit install` will [configure a pre-commit hook to run before every commit](https://pre-commit.com/#usage); alternatively, you can run it manually with:

```
pre-commit run --all-files
```

If you are impatient and your work is isolated to Javascript, it may be faster to run only the linter and formatter (`eslint` and `prettier`), but it may not catch everything (such as the end-of-file fixer and trailing whitespace):

```
yarn lint && yarn format
```

## Commit Message Conventions

We use [gitlint](https://jorisroovers.com/gitlint/) to check commit message formatting. You can enable it by using `pre-commit install --hook-type commit-msg`.

This project follows the commit message conventions outlined by [Convential Commits](https://www.conventionalcommits.org/). Besides the standard commit types (message prefixes) **feat** and **fix**, we use some other types described there based on the Angular convention; some common ones among those are **test**, **docs**, **chore** and **refactor**. You can find the configuration details in the [.gitlint](../gitlint) file

These facilitate the automated creation of [changelogs](../CHANGELOG.md), using the [standard-version](https://github.com/conventional-changelog/standard-version) utility.

We also extend this prefix convention to the naming of **branches**, eg: `docs/add-readme` or `feat/some-feature`.
