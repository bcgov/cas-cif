import { screen } from "@testing-library/react";
import RevisionRecordHistory from "components/ProjectRevision/RevisionRecordHistory";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { graphql } from "react-relay";
import compiledRevisionRecordHistory, {
  RevisionRecordHistoryQuery,
} from "__generated__/RevisionRecordHistoryQuery.graphql";
import { RevisionRecordHistory_projectRevision$data } from "__generated__/RevisionRecordHistory_projectRevision.graphql";

const testQuery = graphql`
  query RevisionRecordHistoryQuery($project_revision: ID!)
  @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: $project_revision) {
        ...RevisionRecordHistory_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: Partial<RevisionRecordHistory_projectRevision$data> = {
      createdAt: "2021-01-01T23:59:59.999-07:00",
      cifUserByCreatedBy: { fullName: "test-user-1" },
      updatedAt: "2021-02-01T23:59:59.999-07:00",
      cifUserByUpdatedBy: { fullName: "test-user-2" },
    };
    return result;
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<RevisionRecordHistoryQuery>({
    component: RevisionRecordHistory,
    compiledQuery: compiledRevisionRecordHistory,
    testQuery: testQuery,
    defaultQueryResolver: mockQueryPayload,
    getPropsFromTestQuery: (data) => ({
      projectRevision: data.query.projectRevision,
    }),
  });

describe("The RevisionRecordHistory", () => {
  it("renders the history with username and date", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText(/test-user-2/i)).toBeInTheDocument();
    expect(screen.getByText(/Feb[.]? 1, 2021/i)).toBeInTheDocument();
    expect(screen.getByText(/test-user-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 1, 2021/i)).toBeInTheDocument();
  });
});
