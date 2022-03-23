## Keycloak configuration to allow setting up IDIR users ahead of first login

There is a little bit of setup required to allow IDIR users to log into the system if they are not
setup in the realm.

## Initial manual setup:

1. Follow the steps in [this issue](https://github.com/bcgov/ocp-sso/issues/118)
   <br>
   **IMPORTANT** In the IDIR identity provider, 'Client Authentication' should be set to 'Client secret sent as post'
   ![image](https://user-images.githubusercontent.com/11507754/159771775-a95553c0-fe9e-4b6e-ae63-d0d9653e51c3.png)
   <br>
   **IMPORTANT** The new mapper on the identity provider matters and should be `idir_guid`
2. Create an ad-hoc Client named 'service-client' <br>
   Access Type: 'confidential' <br>
   Direct Access Grants Enabled: False <br>
   Service Accounts Enabled: **True** <br>

3. In the 'Service Account Roles' tab of that client, find the Client Roles under 'realm-management' and assign 'realm-admin'.
   ![image](https://user-images.githubusercontent.com/11507754/159774487-b07f8a90-4c31-435e-86e4-eb9faf451efc.png)

## Run user import

Go to this repository `cd realm_configuration`

1. Install required npm packages `yarn install`
2. Create a configuration file `config.json` (see the config.json.example file)

3. Fetch the IDIR UIDs <br>
   3.a. Connect to the BCGOV VPN (ignore this if already on the bcgov network)<br>
   3.b. Create a `idirs.json` file with an array or IDIRs to import (see the idirs.json.example file)<br>
   3.c. Run `yarn run idir-ids`<br>
   <br>
   The IDIR UIDs are printed out to the console

4. Configure the users <br>
   3.a. Create a `users.json` file with the user information to create in the realm (see the users.json.example file) <br>
   3.b. Run `yarn run keycloak-users` <br>
   <br>
   Response statuses will be printed out when API calls are made.
