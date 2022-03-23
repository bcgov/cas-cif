import fetch from "node-fetch";

export default async function update_attributes_for_user(
  user,
  attributes,
  bearer_token,
  config
) {
  const user_update_response = await fetch(
    `${config.realm_url}/auth/admin/realms/${config.realm_name}/users/${user.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer_token}`,
      },
      body: JSON.stringify({
        attributes: {
          ...user.attributes,
          ...attributes,
        },
      }),
    }
  );

  console.log(`${user_update_response.status}: updated user attributes`);

  return user_update_response.status;
}
