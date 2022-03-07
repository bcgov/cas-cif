import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectOverviewQuery } from "__generated__/ProjectOverviewQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

export const pageQuery = graphql`
  query ProjectOverviewQuery($project: ID!) {
    session {
      ...DefaultLayout_session
    }
    project(id: $project) {
      projectName
      rfpNumber
      totalFundingRequest
      summary
      operatorByOperatorId {
        legalName
        bcRegistryId
        tradeName
      }
      fundingStreamRfpByFundingStreamRfpId {
        year
        fundingStreamByFundingStreamId {
          description
        }
      }
      projectStatusByProjectStatusId {
        name
      }
      contactsByProjectContactProjectIdAndContactId {
        edges {
          node {
            id
            familyName
            givenName
          }
        }
      }
      projectManagersByProjectId {
        edges {
          node {
            cifUserByCifUserId {
              firstName
              lastName
              id
            }
          }
        }
      }
    }
  }
`;

export function ProjectViewPage({
  preloadedQuery,
}: RelayProps<{}, ProjectOverviewQuery>) {
  const { session, project } = usePreloadedQuery(pageQuery, preloadedQuery);
  return (
    <DefaultLayout session={session}>
      <header>
        <h2>Project Details</h2>
      </header>
      <dl>
        <dt>RFP Number</dt>
        <dd>{project.rfpNumber}</dd>

        <dt>Project Name</dt>
        <dd>{project.projectName}</dd>

        <dt>Total Funding Request</dt>
        <dd>{project.totalFundingRequest}</dd>

        <dt>Summary</dt>
        <dd>{project.summary}</dd>

        <dt>Legal Operator Name and BC Registry ID</dt>
        <dd>
          {project.operatorByOperatorId.legalName} (
          {project.operatorByOperatorId.bcRegistryId})
        </dd>

        <dt>Trade Name</dt>
        <dd>{project.operatorByOperatorId.tradeName}</dd>

        <dt>Funding Stream</dt>
        <dd>
          {
            project.fundingStreamRfpByFundingStreamRfpId
              .fundingStreamByFundingStreamId.description
          }
        </dd>

        <dt>Funding Stream RFP</dt>
        <dd>{project.fundingStreamRfpByFundingStreamRfpId.year}</dd>

        <dt>Project Status</dt>
        <dd>{project.projectStatusByProjectStatusId.name}</dd>

        <dt>Project Manager</dt>
        {project.projectManagersByProjectId.edges.length > 0 ? (
          <>
          {project.projectManagersByProjectId.edges.map(
            (manager) => (
              <dd key={manager.node.cifUserByCifUserId.id}>{manager.node.cifUserByCifUserId.firstName} {manager.node.cifUserByCifUserId.lastName}</dd>
            )
          )}
        </>
        ) : (

            <dd>n/a</dd>
      
        )}

        <dt>Project Contacts</dt>
        {project.contactsByProjectContactProjectIdAndContactId.edges.length >
        0 ? (
          <>
            {project.contactsByProjectContactProjectIdAndContactId.edges.map(
              (contact) => (
                <dd key={contact.node.id}>{contact.node.givenName} {contact.node.familyName}</dd>
              )
            )}
          </>
        ) : (
            <dd>n/a</dd>
      
        )}
      </dl>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .preformatted {
          white-space: pre-wrap;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectViewPage, pageQuery, withRelayOptions);
