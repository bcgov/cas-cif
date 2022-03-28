import assign_group_to_user from "./lib/assign_group_to_user";
import get_user_from_idir from "./lib/get_user_from_idir";
import list_groups from "./lib/list_groups";
import login from "./lib/login";
import update_attributes_for_user from "./lib/update_attributes_for_user";
import create_and_return_user from "./lib/create_and_return_user";

import config from "./config.json";
import users from "./users.json";

const CIF_GROUPS = ["cif_admin", "cif_internal"];

async function main() {
  const token = await login(config);

  const groups = await list_groups(token, config);
  const cif_groups = groups.filter((group) => CIF_GROUPS.includes(group.name));

  for (let index = 0; index < users.length; index++) {
    const user_data = users[index];

    const attributes = {
      idir_user_guid: user_data.idir_user_guid,
    };

    let kc_user = await get_user_from_idir(
      user_data.idir_username,
      token,
      config
    );

    if (!kc_user) {
      kc_user = await create_and_return_user(user_data, token, config);
    }

    await update_attributes_for_user(kc_user, attributes, token, config);

    for (let index = 0; index < cif_groups.length; index++) {
      const cif_group = cif_groups[index];

      await assign_group_to_user(cif_group, kc_user, token, config);
    }
  }
}

main();
