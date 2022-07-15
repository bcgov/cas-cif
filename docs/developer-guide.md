# Developer Guidelines

## Setting up the commit-msg hook for the pre-commit

Run `pre-commit install --hook-type commit-msg` to install the commit-msg hook.

## Growthbook

Growthbook is a feature-flagging service that allows us to easily turn features on and off in our different environments.
This allows us to hide features from our users that are incomplete when releasing to the production environment, unblocking
the release of critical bug fixes. Features can be turned on an off via the (Growthbook dashboard)[https://app.growthbook.io].
The login credentials are stored in our 1Password vault.

### Creating a Feature Flag

Growthbook documentation on features: https://docs.growthbook.io/app/features

To create a feature flag, navigate to 'Features' on the (Growthbook dashboard)[https://app.growthbook.io].

- Click `Add Feature`. This will pull up a modal for feature creation.
- `Feature Key`. This is the name of the feature that will be displayed in Growthbook and the key that will be used in the code to allow toggling it on/off. Using a good naming convention here is important. It should clearly and uniquely describe what can be toggled on/off, "flagged-item" like in the example below is not a good name!
- Ignore `tags`, we are currently using a boolean on/off and they are not useful in this context. Attributes can be set on flags and used here.
- `Enabled Environments` This is going to be the default config when the feature flag is created. There is a toggle for each of our openshift environments (dev,test,prod). When creating a new feature in Growthbook we should set production to "off" and dev/test to "on" to start.
- `Value Type` This is what type we will be returning from our flag. We can leave it as boolean (on/off).
- `Behaviour` This will allow us, if necessary, to turn some things on for some users and off for others. For now, leave it as `Simple`. We are only using the on/off for all users flow at this point.
- `Value` This is the default value for the flag. You can configure what is returned when the feature flag is turned on. Leave it as `on`.

Click `Create` and the new feature will show up in the Growthbook dashboard.

### Using Growthbook in the code

In order for the feature toggling in the Growthbook dashboard to actually do anything, we need to add some code to wrap anything we want to be able to show/hide.

Example:

```typescript
import { useFeature } from "@growthbook/growthbook-react"; // Import the useFeature() function
...
...
const showFlaggedFeature = useFeature('flagged-item').on; // Set the value of useFeature.on to a boolean variable
...
...
{ showFlaggedFeature && <FlaggedFeature />} // Conditionally render the feature. You may also want to just return null for an entire component    depending on what is being turned off / on
```
