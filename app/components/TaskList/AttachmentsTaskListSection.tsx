import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { useRouter } from "next/router";
import { MAIN_BG_COLOR } from "lib/theme/colors";

interface Props {
  icon: IconDefinition;
  title: string;
  linkUrl: { pathname: string; query: { projectRevision: string } };
}

const AttachmentsTaskListSection: React.FC<Props> = ({
  icon,
  title,
  linkUrl,
}) => {
  const router = useRouter();
  return (
    <li
      aria-current={
        router.pathname ===
        "/cif/project-revision/[projectRevision]/attachments"
          ? "step"
          : false
      }
    >
      <Link href={linkUrl} passHref legacyBehavior>
        <h3>
          <span>
            {title} <FontAwesomeIcon icon={icon} />
          </span>
        </h3>
      </Link>
      <style jsx>{`
        li {
          margin-bottom: 0;
          cursor: pointer;
        }
        li[aria-current="step"],
        li[aria-current="step"] div {
          background-color: ${MAIN_BG_COLOR};
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          padding: 10px 0 10px 0.5em;
          margin: 0;
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </li>
  );
};

export default AttachmentsTaskListSection;
