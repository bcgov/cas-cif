import fetch from "node-fetch";
import get_user_from_idir from "./get_user_from_idir";

export default async function create_and_return_user(
  user_data,
  bearer_token,
  config
) {
  const raw = await fetch(
    `${config.realm_url}/auth/admin/realms/${config.realm_name}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer_token}`,
      },
      body: JSON.stringify({
        username: user_data.idir_username,
        email: user_data.email,
        firstName: user_data.first_name,
        lastName: user_data.last_name,
      }),
    }
  );

  console.log(`${raw.status}: created user: ${user_data.idir_username}`);

  const created_user = await get_user_from_idir(
    user_data.idir_username,
    bearer_token,
    config
  );

  return created_user;
}
