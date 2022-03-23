import fetch from "node-fetch";

export default async function assign_group_to_user(
  group,
  user,
  bearer_token,
  config
) {
  const set_group_for_user_response = await fetch(
    `${config.realm_url}/auth/admin/realms/${config.realm_name}/users/${user.id}/groups/${group.id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${bearer_token}`,
      },
    }
  );

  console.log(
    `${set_group_for_user_response.status}: set group: ${group.name} for user: ${user.username}`
  );

  return set_group_for_user_response.status;
}
