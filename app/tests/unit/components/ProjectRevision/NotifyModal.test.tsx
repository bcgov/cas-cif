import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotifyModal from "components/ProjectRevision/NotifyModal";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledNotifyModalQuery, {
  NotifyModalQuery,
} from "__generated__/NotifyModalQuery.graphql";
import { NotifyModal_projectRevision$data } from "__generated__/NotifyModal_projectRevision.graphql";
import getConfig from "next/config";
import { mocked } from "jest-mock";
jest.mock("next/config");

const testQuery = graphql`
  query NotifyModalQuery($project_revision: ID!) @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: $project_revision) {
        ...NotifyModal_projectRevision
      }
    }
  }
`;
const defaultQueryResolver = {
  ProjectRevision() {
    const result: Partial<NotifyModal_projectRevision$data> = {
      id: "director-id",
      pendingActionsFrom: "Director",
      projectByProjectId: {
        proposalReference: "001",
        contacts: {
          edges: [],
        },
        managers: {
          edges: [],
        },
      },
    };
    return result;
  },
};

const allProponentsQueryResolver = {
  ProjectRevision() {
    const result: Partial<NotifyModal_projectRevision$data> = {
      id: "all-proponents-id",
      pendingActionsFrom: "Proponent",
      projectByProjectId: {
        proposalReference: "001",
        contacts: {
          edges: [
            {
              node: {
                email: "bob.l001@example.com",
                fullName: "Bob001 Loblaw001",
              },
            },
            {
              node: {
                email: "bob.l002@example.com",
                fullName: "Bob002 Loblaw002",
              },
            },
            {
              node: {
                email: "bob.l003@example.com",
                fullName: "Bob003 Loblaw003",
              },
            },
          ],
        },
        managers: {
          edges: [],
        },
      },
    };
    return result;
  },
};

const primaryProponentsQueryResolver = {
  ProjectRevision() {
    const result: Partial<NotifyModal_projectRevision$data> = {
      id: "primary-proponent-id",
      pendingActionsFrom: "Proponent",
      projectByProjectId: {
        proposalReference: "001",
        contacts: {
          edges: [
            {
              node: {
                email: "bob.l001@example.com",
                fullName: "Bob001 Loblaw001",
              },
            },
          ],
        },
        managers: {
          edges: [],
        },
      },
    };
    return result;
  },
};

const techTeamQueryResolver = {
  ProjectRevision() {
    const result: Partial<NotifyModal_projectRevision$data> = {
      id: "tech-team-id",
      pendingActionsFrom: "Tech Team",
      projectByProjectId: {
        proposalReference: "001",
        contacts: {
          edges: [],
        },
        managers: {
          edges: [
            {
              node: {
                cifUserByCifUserId: {
                  emailAddress: "ronald.ulysses.swanson@gov.bc.ca",
                  fullName: "Ron Swanson",
                },
                projectManagerLabelByProjectManagerLabelId: {
                  label: "Tech Team Primary",
                },
              },
            },
          ],
        },
      },
    };
    return result;
  },
};

const opsTeamQueryResolver = {
  ProjectRevision() {
    const result: Partial<NotifyModal_projectRevision$data> = {
      id: "ops-team-id",
      pendingActionsFrom: "Ops Team",
      projectByProjectId: {
        proposalReference: "001",
        contacts: {
          edges: [],
        },
        managers: {
          edges: [
            {
              node: {
                cifUserByCifUserId: {
                  emailAddress: "ronald.ulysses.swanson@gov.bc.ca",
                  fullName: "Ron Swanson",
                },
                projectManagerLabelByProjectManagerLabelId: {
                  label: "Ops Team Primary",
                },
              },
            },
            {
              node: {
                cifUserByCifUserId: {
                  emailAddress: "april@gov.bc.ca",
                  fullName: "April Ludgate",
                },
                projectManagerLabelByProjectManagerLabelId: {
                  label: "Ops Team Secondary",
                },
              },
            },
          ],
        },
      },
    };
    return result;
  },
};

const componentTestingHelper = new ComponentTestingHelper<NotifyModalQuery>({
  component: NotifyModal,
  compiledQuery: compiledNotifyModalQuery,
  testQuery: testQuery,
  defaultQueryResolver: defaultQueryResolver,
  getPropsFromTestQuery: (data) => ({
    projectRevision: data.query.projectRevision,
  }),
});

describe("The NotifyModal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mocked(getConfig).mockImplementation(() => ({
      publicRuntimeConfig: {
        PROGRAM_DIRECTOR_NAME: "director name",
        PROGRAM_DIRECTOR_EMAIL: "director@email.com",
      },
    }));
    componentTestingHelper.reinit();
  });

  it("renders the director form when pendingActionsFrom is Director", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText(`Director`)).toBeInTheDocument();
    expect(screen.getByText(`director name`)).toBeInTheDocument();
  });

  it("creates the correct mailto link when the director checkbox is checked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/director name/i));
    expect(screen.getByText(/notify by email/i)).toHaveAttribute(
      "href",
      "mailto:director@email.com?subject=Amendment%20pending%20your%20actions%20(CIF: 001)&body=View amendment here: https://cif.gov.bc.ca/cif.project-revision/director-id"
    );
  });

  it("renders the tech team form when pendingActionsFrom is Tech Team and there is a primary manager", () => {
    componentTestingHelper.loadQuery(techTeamQueryResolver);
    componentTestingHelper.renderComponent();
    expect(screen.getByText(`Tech Team Primary`)).toBeInTheDocument();
    expect(screen.getByText(`Tech Team Secondary`)).toBeInTheDocument();
    expect(screen.getByLabelText(`Ron Swanson`)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Not added before. You can select one on the Project Details > Project Managers page./i
      )
    ).toBeInTheDocument();
  });

  it("creates the correct mailto link when the primary tech team manager is checked", () => {
    componentTestingHelper.loadQuery(techTeamQueryResolver);
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/ron swanson/i));
    expect(screen.getByText(/notify by email/i)).toHaveAttribute(
      "href",
      "mailto:ronald.ulysses.swanson@gov.bc.ca?subject=Amendment%20pending%20your%20actions%20(CIF: 001)&body=View amendment here: https://cif.gov.bc.ca/cif.project-revision/tech-team-id"
    );
  });

  it("renders the ops team form when pendingActionsFrom is Ops Team and the primary and secondary managers are assigned", () => {
    componentTestingHelper.loadQuery(opsTeamQueryResolver);
    componentTestingHelper.renderComponent();

    expect(screen.getByText(`Ops Team Primary`)).toBeInTheDocument();
    expect(screen.getByText(`Ops Team Secondary`)).toBeInTheDocument();
    expect(screen.getByText(`Ron Swanson`)).toBeInTheDocument();
  });

  it("creates the correct mailto link when both ops team managers are checked", () => {
    componentTestingHelper.loadQuery(opsTeamQueryResolver);
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/ron swanson/i));
    userEvent.click(screen.getByText(/april ludgate/i));
    expect(screen.getByText(/notify by email/i)).toHaveAttribute(
      "href",
      "mailto:april@gov.bc.ca,ronald.ulysses.swanson@gov.bc.ca?subject=Amendment%20pending%20your%20actions%20(CIF: 001)&body=View amendment here: https://cif.gov.bc.ca/cif.project-revision/ops-team-id"
    );
  });

  it("renders the ops team form when there are no managers assigned", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: Partial<NotifyModal_projectRevision$data> = {
          id: "no-managers-id",
          pendingActionsFrom: "Ops Team",
          projectByProjectId: {
            proposalReference: "001",
            contacts: {
              edges: [],
            },
            managers: {
              edges: [],
            },
          },
        };
        return result;
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText(`Ops Team Primary`)).toBeInTheDocument();
    expect(screen.getByText(`Ops Team Secondary`)).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /Not added before. You can select one on the Project Details > Project Managers page./i
      )
    ).toHaveLength(2);
  });

  it("renders the proponent form when pendingActionsFrom is Proponent and there are multiple proponents", () => {
    componentTestingHelper.loadQuery(allProponentsQueryResolver);
    componentTestingHelper.renderComponent();
    expect(screen.getByText(`Project Contact Primary`)).toBeInTheDocument();
    expect(screen.getByText(`Project Contact Secondary`)).toBeInTheDocument();
    expect(screen.getByText(`Bob001 Loblaw001`)).toBeInTheDocument();
    expect(screen.getByText(`Bob002 Loblaw002`)).toBeInTheDocument();
    expect(screen.getByText(`Bob003 Loblaw003`)).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Not added before. You can select one on the Project Details > Project Contacts page./i
      )
    ).not.toBeInTheDocument();
  });

  it("creates the correct mailto link when there are multiple proponents", () => {
    componentTestingHelper.loadQuery(allProponentsQueryResolver);
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/Bob001 Loblaw001/i));
    userEvent.click(screen.getByText(/Bob002 Loblaw002/i));
    userEvent.click(screen.getByText(/Bob003 Loblaw003/i));
    expect(screen.getByText(/notify by email/i)).toHaveAttribute(
      "href",
      "mailto:bob.l002@example.com,bob.l003@example.com,bob.l001@example.com?subject=Amendment%20pending%20your%20actions%20(CIF: 001)&body=View amendment here: https://cif.gov.bc.ca/cif.project-revision/all-proponents-id"
    );
  });

  it("renders the proponent form when pendingActionsFrom is Proponent and there is only a primary contact", () => {
    componentTestingHelper.loadQuery(primaryProponentsQueryResolver);
    componentTestingHelper.renderComponent();
    expect(screen.getByText(`Project Contact Primary`)).toBeInTheDocument();
    expect(screen.getByText(`Project Contact Secondary`)).toBeInTheDocument();
    expect(screen.getByText(`Bob001 Loblaw001`)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Not added before. You can select one on the Project Details > Project Contacts page./i
      )
    ).toBeInTheDocument();
  });

  it("creates the correct mailto link when the primary proponent is checked", () => {
    componentTestingHelper.loadQuery(primaryProponentsQueryResolver);
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/Bob001 Loblaw001/i));
    expect(screen.getByText(/notify by email/i)).toHaveAttribute(
      "href",
      "mailto:bob.l001@example.com?subject=Amendment%20pending%20your%20actions%20(CIF: 001)&body=View amendment here: https://cif.gov.bc.ca/cif.project-revision/primary-proponent-id"
    );
  });

  it("renders the proponent form when there are no proponents assigned", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: Partial<NotifyModal_projectRevision$data> = {
          id: "no-proponents-id",
          pendingActionsFrom: "Proponent",
          projectByProjectId: {
            proposalReference: "001",
            contacts: {
              edges: [],
            },
            managers: {
              edges: [],
            },
          },
        };
        return result;
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText(`Project Contact Primary`)).toBeInTheDocument();
    expect(screen.getByText(`Project Contact Secondary`)).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /Not added before. You can select one on the Project Details > Project Contacts page./i
      )
    ).toHaveLength(2);
  });

  it("closes the modal when the `Cancel` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/Cancel/i));

    expect(componentTestingHelper.router.back).toHaveBeenCalledTimes(1);
  });

  it("disables the `Notify by Email` button when no email recipients are selected", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText(/Notify by Email/i)).toBeDisabled();
  });
});
