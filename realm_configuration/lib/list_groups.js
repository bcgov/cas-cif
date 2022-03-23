import fetch from "node-fetch";

export default async function list_groups(bearer_token, config) {
  const raw = await fetch(
    `${config.realm_url}/auth/admin/realms/${config.realm_name}/groups`,
    {
      headers: {
        Authorization: `Bearer ${bearer_token}`,
      },
    }
  );

  const groups_json = await raw.json();

  console.log(`${raw.status}: retrieved groups`);

  return groups_json;
}
