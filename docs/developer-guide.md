# Developer Guidelines

## Setting up the Local Development Environment

### Prerequisites

Ensure the following are installed:

- [Postgres](https://www.postgresql.org/)
- [Sqitch](https://sqitch.org/) (requires a working Perl 5 installation)
- [Node](https://nodejs.org/)
- [asdf](https://asdf-vm.com/#/core-manage-asdf) (using your system's package manager & follow instructions to add it to your shell)

### Repository and Version Control

- Ensure you have push access (most likely by being added to the **@bcgov/cas-developers** GitHub team) to [bcgov/cas-cif](https://github.com/bcgov/cas-cif).
- Ensure you have [GPG commit signing](https://docs.github.com/en/github/authenticating-to-github/signing-commits) set up on your local environment.
  - First, ensure your `git config user.email` is set to the email address you want to use for signing.
  - You can verify it's working when you commit to a branch and the signature is indicated by `git log --show-signature`. Once pushed, a "Verified" badge appears next to your commits on GitHub.
- Clone a local copy of [bcgov/cas-cif](https://github.com/bcgov/cas-cif).

### Install the Dev Tools

In the root of `cas-cif`, run `make install_dev_tools`. This creates the databases, installs packages, etc.

To seed the dev data, run `make drop_db && make deploy_dev_data`. If you get warnings about the database being accessed, stop and start postgres (`pg_ctl stop` then `pg_ctl start`).

Install dependencies with `cd app && yarn install`

### App Environment Variables

Create an `app/.env` file and copy the contents of [`app/.env.example`](../app/.env.example) into it. See the 1Password vault for the values.

### Run the App

Ensure postgres is running (`pg_start` if not). Then run the development server:

```
cd app && yarn dev
```

Navigate in your browser to `localhost:3004`.

Work that changes Relay GraphQL queries will require you to re-run `yarn build:relay` (which alternatively can be run using a `--watch` flag).

### GraphQL Query Debugger

Graphiql is an interactive in-browser GraphQL IDE available in development at `localhost:3004/graphiql`. It is handy for developing queries interactively before inserting them into a Relay fragment.

### Pre-Commit

[pre-commit](https://pre-commit.com/) runs a variety of formatting and lint checks configured in [`.pre-commit-config.yaml`](../.pre-commit-config.yaml) which are required for a pull request to pass CI.

`pre-commit install` will [configure a pre-commit hook to run before every commit](https://pre-commit.com/#usage); alternatively, you can run it manually with:

```
pre-commit run --all-files
```

If you are impatient and your work is isolated to Javascript, it may be faster to run only the linter and formatter (`eslint` and `prettier`), but it may not catch everything (such as the end-of-file fixer and trailing whitespace):

```
yarn lint && yarn format
```

### Commit Message Conventions

We use [gitlint](https://jorisroovers.com/gitlint/) to check commit message formatting. You can enable it by using `pre-commit install --hook-type commit-msg`.

This project follows the commit message conventions outlined by [Convential Commits](https://www.conventionalcommits.org/). Besides the standard commit types (message prefixes) **feat** and **fix**, we use some other types described there based on the Angular convention; some common ones among those are **test**, **docs**, **chore** and **refactor**. You can find the configuration details in the [.gitlint](../gitlint) file

These facilitate the automated creation of [changelogs](../CHANGELOG.md), using the [standard-version](https://github.com/conventional-changelog/standard-version) utility.

We also extend this prefix convention to the naming of **branches**, eg: `docs/add-readme` or `feat/some-feature`.

## Testing

### Unit Tests with Jest

```
cd app && yarn test
```

Front-end unit tests include snapshots. Work that changes the DOM will result in a diff from the last accepted snapshot and cause related tests to fail. You can update the snapshots and review / accept the diff with `yarn test -u`.

### Database Unit Tests with pgTAP

See [Database Testing](#database-testing) below.

### End-to-end Tests with Cypress

#### Run Cypress Specs

First, ensure the web app is running (`cd app && yarn dev`).

For test error debugging and to observe tests' behavior in the browser as they run:

```
cd app && yarn cypress
```

To run the tests more efficiently in a headless mode:

```
cd app && yarn test:e2e
```

[Options](https://docs.cypress.io/guides/guides/command-line.html#cypress-run) can be passed to Cypress through this command, for example to run an individual test or subset:

```
cd app && yarn test:e2e --spec cypress/integration/cif/*
```

## Growthbook

Growthbook is a feature-flagging service that allows us to easily turn features on and off in our different environments.
This allows us to hide features from our users that are incomplete when releasing to the production environment, unblocking
the release of critical bug fixes. Features can be turned on and off via the (Growthbook dashboard)[https://app.growthbook.io].
The login credentials are stored in our 1Password vault.

### Creating a Feature Flag

Growthbook documentation on features: https://docs.growthbook.io/app/features

To create a feature flag, navigate to 'Features' on the (Growthbook dashboard)[https://app.growthbook.io].

- Click `Add Feature`. This will pull up a modal for feature creation.
- `Feature Key`. This is the name of the feature that will be displayed in Growthbook and the key that will be used in the code to allow toggling it on/off. Using a good naming convention here is important. It should clearly and uniquely describe what can be toggled on/off, "flagged-feature" like in the example below is not a good name!
- Ignore `tags`, we are currently using a boolean on/off and they are not useful in this context. Attributes can be set on flags and used here.
- `Enabled Environments` This is going to be the default config when the feature flag is created. There is a toggle for each of our openshift environments (dev,test,prod). When creating a new feature in Growthbook we should set production to "off" and dev/test to "on" to start.
- `Value Type` This is what type we will be returning from our flag. We can leave it as boolean (on/off).
- `Behaviour` This will allow us, if necessary, to turn some things on for some users and off for others. For now, leave it as `Simple`. We are only using the on/off for all users flow at this point.
- `Value` This is the default value for the flag. You can configure what is returned when the feature flag is turned on. Leave it as `on`.

Click `Create` and the new feature will show up in the Growthbook dashboard.

### Using Growthbook in the code

In order for the feature toggling in the Growthbook dashboard to actually do anything, we need to add some code to declare anything we want to be able to show/hide. We have a custom wrapper (lib/growthbookWrapper) that allows us to bypass growthbook & show features even if growthbook is down (or in our cypress test github action, where features should always be enabled).

To bypass growthbook locally, add `BYPASS_GROWTHBOOK=true` to your .env

Example:

```typescript
import useShowGrowthbookFeature from "lib/growthbookWrapper"; // Import the growthbook wrapper function
...
...
const showFlaggedFeature = useShowGrowthbookFeature('flagged-feature'); // Set the boolean return value of our wrapper to a variable
...
...
{ showFlaggedFeature && <FlaggedFeature />} // Conditionally render the feature. You may also want to just return null for an entire component    depending on what is being turned off / on
```

### Cleanup

Once a feature flag is no longer necessary, any code that was added (ex: `useShowGrowthbookFeature`) should be removed and the flag in Growthbook can be deleted.

## Sqitch

We manage our database with [sqitch] via the sqitch.plan in the `/schema` directory.
To add something to the database:

- `sqitch add <new database entity> --require <dependency for new entity> --set schema=<schema>` (--require can be repeated for many dependencies)
  To deploy changes:
- `sqitch deploy <Name of change>` (Name of change is optional, & deploys up to that change. If not set, it will deploy all changes)
  To roll back changes:
- `sqitch revert <Name of change>` (Name of change is optional, & reverts back to that change. If not set, it will revert all changes)

## Incremental Database changes

Releases are tagged in the sqitch plan, ex: `@v1.0.0-rc.7 2020-06-18T18:52:29Z database user <db_user@mail.com> # release v1.0.0-rc.7`
Any database entities in the plan before a release are immutable and any changes to them must be done as follows:

### Tables (or other non-idempotent changes)

Changes to tables require creating a new entry in the sqitch plan for that table, for example:
`sqitch add tables/application_001 --require tables/application`
This will create a deploy,revert and verify files for tables/application_001

- In the deploy file, any necessary changes can be made to the table with `alter table`.
- In the revert file, any changes made in the deploy file must be undone, again with `alter table`
- The verify file should just verify the existence of the table, and can probably be the same as the original verify file

### Functions (or other idempotent changes)

Changes to functions are done via the `sqitch rework` command, which only works with idempotent changes, ie `create or replace function`.
example: `sqitch rework -c <NAME OF FILE TO BE CHANGED>`
This will create deploy, revert and verify files, for the changed item like so: `function_file_name@TAG.sql`
The `TAGGED` files should contain the original deploy, revert, verify code.
The `UNTAGGED` files will contain the changes:

- The deploy file will contain the updated function code
- The revert file will contain the original, (or in the case of several changes, the previous) function code to return the function to its previous state
- The verify file will likely be the same as the original verify file

[submodule]: https://git-scm.com/book/en/v2/Git-Tools-Submodules
[sqitch]: https://sqitch.org/docs/manual/sqitchtutorial/

## Database Testing

### pgTap + sqitch tips

#### Run a single test

You can run a single test by calling `pg_prove` directly from the command line like so:

```
`pg_prove -v -d \<test_db_name\> \<path-to-test-file\>/file_to_test.sql`
```

flags:

- `-v`runs pg_prove in verbose. This allows you to add select statements in the test file & they will show up in the output (helpful for debugging)
- `-d` sets the target database (must be right before your test database)

The path to the test file can be a glob pattern. So if you want to run all tests in a specific folder, or don't feel like writing our the whole path,
you could write the command like this (assuming our tests are found at `test/unit/tables/file_test.sql`:

Run all table tests:</br>
`pg_prove -v -d \<test_db_name\> test/unit/tables/*_test.sql`

Run a specific test anywhere in the 'unit' directory:</br>
`pg_prove -v -d \<test_db_name\> test/unit/**/specific_file_test.sql`

#### Idempotence (create or replace function...)

Our make target `make db_unit_tests` drops the database, recreates it and runs all sqitch migrations.
This is annoying if you just want to test the last thing you deployed (which is usually the case).

With idempotent migrations (like functions) you can make changes to your deploy file and copy paste the `create function..` statement directly into a terminal connected to your test db to save some time.

#### Revert & Deploy with a target

If the change you're testing is not idempotent (like creating or altering a table), then you'll want to revert/deploy just that change in your test database
as you make changes to avoid having to redeploy all changes just to get the change you've made to apply.
Sqitch by default is probably pointed at the local database that you use for running the app locally.
Here we just want to target the test database and only the change you're testing.

To revert to a specific change in your sqitch plan (on your test_db):</br>
`sqitch revert \<name-of-change\> \<your-test-db\>`

Same thing to deploy, if you want to to deploy to the end of your migrations:</br>
`sqitch deploy \<your-test-db\>`

Or if you'd like to deploy up to a specific migration:</br>
`sqitch deploy \<name-of-change\> \<your-test-db\>`

#### Debugging in the test file

Using the -v option is helpful to be able to add some debugging to the output in your terminal when the test runs.
It will also run the output of any functions your test writes, so the output can get a little hard to read.

Adding some `select` statements to debug will help to debug a flaky or tricky test, but wraping these statments in "breakers" can make them much more readable.
You can write some wrappers to break up the output and give a title to what you are debugging :

```
select '---------DEBUG 1---------';
select 'Value before commit:';
select \<debug statement\>
select '--------END DEBUG 1--------';
select '---------DEBUG 2---------;
...
...
```

#### no_plan()

When you're starting a test file & you don't know how many tests you will be writing,
updating the `select plan(n)` statement at the top so n always matches the number of tests you have is unnecessary.

`select plan(n)` can be replaced with `select * from no_plan` while you're writing your tests.
This will run any number of tests without stopping after n tests have been run.

Once you've finished writing your tests in that file, the output will say how many tests were run and you can switch back to `select plan(n)` and set n to that number.
