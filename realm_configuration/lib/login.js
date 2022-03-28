import fetch from "node-fetch";

export default async function login(config) {
  const loginRequest = {
    grant_type: "client_credentials",
    client_id: config.realm_client_id,
    client_secret: config.realm_client_secret,
  };

  const loginBody = Object.keys(loginRequest)
    .map(
      (key) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(loginRequest[key])
    )
    .join("&");

  const response = await fetch(
    `${config.realm_url}/auth/realms/${config.realm_name}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: loginBody,
    }
  );

  if (response.status !== 200)
    throw new Error(`${response.status}: ${await response.text()}`);

  const { access_token } = await response.json();

  console.log(`${response.status}: retrieved access token. Logged in!`);

  return access_token;
}
