# Developer Guidelines

## Setting up the commit-msg hook for the pre-commit

Run `pre-commit install --hook-type commit-msg` to install the commit-msg hook.

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

## Database Testing

### pgTap + sqitch tips

#### Run a single test

You can run a single test by calling `pg_prove` directly from the command line like so:
`pg_prove -v -d \<test_db_name\> \<path-to-test-file\>/file_to_test.sql`
flags:

- `-v`runs pg_prove in verbose. This allows you to add select statements in the test file & they will show up in the output (helpful for debugging)
- `-d` sets the target database (must be right before your test database)

The path to the test file can be a glob pattern. So if you want to run all tests in a specific folder, or don't feel like writing our the whole path,
you could write the command like this (assuming our tests are found at `test/unit/tables/file_test.sql`:

Run all table tests:
`pg_prove -v -d \<test_db_name\> test/unit/tables/*_test.sql`
Run a specific test anywhere in the 'unit' directory:
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

To revert to a specific change in your sqitch plan (on your test_db):
`sqitch revert \<name-of-change\> \<your-test-db\>`
Same thing to deploy, if you want to to deploy to the end of your migrations:
`sqitch deploy \<your-test-db\>`
Or if you'd like to deploy up to a specific migration:
`sqitch deploy \<name-of-change\> \<your-test-db\>`

#### Debugging in the test file

Using the -v option is helpful to be able to add some debugging to the output in your terminal when the test runs.
It will also run the output of any functions your test writes, so the output can get a little hard to read.
Adding some `select` statements to debug will help to debug a flaky or tricky test, but wraping these statments in "breakers" can make them much more readable.
You can write some wrappers to break up the output and give a title to what you are debugging :

select '---------DEBUG 1---------';
select 'Value before commit:';
select \<debug statement\>
select '--------END DEBUG 1--------';
select '---------DEBUG 2---------;
...
...

#### no_plan()

When you're starting a test file & you don't know how many tests you will be writing,
updating the `select plan(n)` statement at the top so n always matches the number of tests you have is unnecessary.
`select plan(n)` can be replaced with `select * from no_plan` while you're writing your tests.
This will run any number of tests without stopping after n tests have been run.
Once you've finished writing your tests in that file, the output will say how many tests were run and you can switch back to `select plan(n)` and set n to that number.
