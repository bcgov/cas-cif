# Developer Guidelines

## Setting up the commit-msg hook for the pre-commit

Run `pre-commit install --hook-type commit-msg` to install the commit-msg hook.

## Sqitch

We manage our database with [sqitch] via the sqitch.plan in the `/schema` directory.
To add something to the database:

- `sqitch add <new database entity> --require <dependency for new entity> --set schema=<schema>` (--require can be repeated for many dependencies)
  To deploy changes:
- `sqitch deploy <Name of change>` (Name of change is optional, & deploys up to that change. If not set, it will deploy all changes)
  To roll back changes:
- `sqitch revert <Name of change>` (Name of change is optional, & reverts back to that change. If not set, it will revert all changes)

## Incremental Database changes

Releases are tagged in the sqitch plan, ex: `@v1.0.0-rc.7 2020-06-18T18:52:29Z Matthieu Foucault <matthieu@button.is> # release v1.0.0-rc.7`
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
