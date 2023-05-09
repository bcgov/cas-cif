import Button from "@button-inc/bcgov-theme/Button";
import {
  getDisplayDateString,
  parseStringDate,
} from "lib/helpers/reportStatusHelpers";
import { useRouter } from "next/router";
import { useFragment, graphql } from "react-relay";
import {
  getProjectRevisionEditPageRoute,
  getProjectRevisionViewPageRoute,
} from "routes/pageRoutes";
import { ProjectRevisionTableRow_projectRevision$key } from "__generated__/ProjectRevisionTableRow_projectRevision.graphql";

interface Props {
  projectRevision: ProjectRevisionTableRow_projectRevision$key;
}

const ProjectRevisionTableRow: React.FC<Props> = ({ projectRevision }) => {
  const projectRevisionData = useFragment(
    graphql`
      fragment ProjectRevisionTableRow_projectRevision on ProjectRevision {
        id
        revisionType
        createdAt
        revisionStatus
        updatedAt
        effectiveDate
        typeRowNumber
        cifUserByUpdatedBy {
          fullName
        }
        projectRevisionAmendmentTypesByProjectRevisionId {
          edges {
            node {
              amendmentType
            }
          }
        }
      }
    `,
    projectRevision
  );

  const router = useRouter();

  const {
    id,
    revisionType,
    createdAt,
    revisionStatus,
    effectiveDate,
    updatedAt,
    cifUserByUpdatedBy,
    projectRevisionAmendmentTypesByProjectRevisionId,
    typeRowNumber,
  } = projectRevisionData;

  return (
    <tr>
      <td>
        {revisionType} {typeRowNumber}
      </td>
      <td>{getDisplayDateString(parseStringDate(createdAt))}</td>
      <td>
        {effectiveDate
          ? getDisplayDateString(parseStringDate(effectiveDate))
          : "Pending"}
      </td>
      <td>{getDisplayDateString(parseStringDate(updatedAt))}</td>
      <td>{cifUserByUpdatedBy?.fullName}</td>
      <td>
        {projectRevisionAmendmentTypesByProjectRevisionId.edges
          .map(({ node }) => node.amendmentType)
          .join(", ")}
      </td>
      <td>
        {revisionType === "Amendment" && revisionStatus === "Applied"
          ? "Approved"
          : revisionStatus}
      </td>
      <td>
        <div>
          <Button
            size="small"
            onClick={() =>
              !effectiveDate
                ? router.push(getProjectRevisionEditPageRoute(id))
                : router.push(getProjectRevisionViewPageRoute(id))
            }
          >
            View {!effectiveDate && "/ Edit"}
          </Button>
        </div>
      </td>
      <style jsx>{`
        td {
          vertical-align: top;
        }
        td :global(button.pg-button) {
          width: 100%;
        }
      `}</style>
    </tr>
  );
};

export default ProjectRevisionTableRow;
