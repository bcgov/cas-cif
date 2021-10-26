import Link from "next/link";
import BCGovFooter from "@button-inc/bcgov-theme/Footer";

const Footer = () => {
  return (
    <BCGovFooter>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
      </ul>
    </BCGovFooter>
  );
};

export default Footer;
