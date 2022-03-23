import fetch from "node-fetch";

export default async function get_user_from_idir(
  idir_login,
  bearer_token,
  config
) {
  const users_response = await fetch(
    `${config.realm_url}/auth/admin/realms/${
      config.realm_name
    }/users?username=${encodeURIComponent(idir_login)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearer_token}`,
      },
    }
  );

  const [user] = await users_response.json();

  console.log(
    `${users_response.status}: ${
      user ? `retrieved user: ${user.id} from idir:` : `no user found for:`
    } ${idir_login}`
  );

  return user;
}
