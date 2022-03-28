import config from "./config.json";
import idirs from "./idirs.json";

const { execSync } = require("child_process");

const idir_guids = [];

idirs.forEach((idir) => {
  const command = `ldapsearch -LLL -x -h idir.BCGOV -D '${config.bcogv_idir}' -w '${config.bcgov_password}' -b "OU=BCGOV,DC=idir,DC=BCGOV" '(&(objectCategory=person)(objectClass=user)(sAMAccountName=${idir}))' bcgovGUID`;

  const output = execSync(command);
  const stringOutput = output.toString();

  console.log(`-----${idir}-----`);
  console.log(stringOutput);

  const re = /^bcgovGUID: (.*)$/gm;
  const result = re.exec(stringOutput);

  idir_guids.push(result[1]);
});

console.log("--------------- GUIDS ---------------");
idir_guids.forEach((guid) => console.log(guid));
