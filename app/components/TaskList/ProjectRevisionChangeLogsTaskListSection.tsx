import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
  title: string;
  linkUrl: { pathname: string; query: { projectRevision: string } };
}

const ProjectRevisionChangeLogsTaskListSection: React.FC<Props> = ({
  title,
  linkUrl,
}) => {
  const router = useRouter();
  return (
    <li
      aria-current={
        router.pathname ===
        "/cif/project-revision/[projectRevision]/project-revision-change-logs"
          ? "step"
          : false
      }
    >
      <Link href={linkUrl} passHref>
        <h3>
          <span className="link">{title}</span>
        </h3>
      </Link>
      <style jsx>{`
        li {
          margin-bottom: 0;
          cursor: pointer;
        }
        li[aria-current="step"],
        li[aria-current="step"] div {
          background-color: #fafafc;
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
        h3,
        ul {
          list-style: none;
          margin: 0;
        }
      `}</style>
    </li>
  );
};

export default ProjectRevisionChangeLogsTaskListSection;
