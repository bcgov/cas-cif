// import { screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import NotifyModal from "components/ProjectRevision/NotifyModal";
// import { graphql } from "react-relay";
// import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
// import compiledNotifyModalQuery, {
//   NotifyModalQuery,
// } from "__generated__/NotifyModalQuery.graphql";
// import { NotifyModal_projectRevision$data } from "__generated__/NotifyModal_projectRevision.graphql";

// const testQuery = graphql`
//   query NotifyModalQuery($project_revision: ID!) @relay_test_operation {
//     query {
//       # Spread the fragment you want to test here
//       projectRevision(id: $project_revision) {
//         ...NotifyModal_projectRevision
//       }
//     }
//   }
// `;
// const defaultQueryResolver = {
//   ProjectRevision() {
//     const result: Partial<NotifyModal_projectRevision$data> = {
//       projectRevisionId: "mock-id",
//       pendingActionsFrom: "Director",
//       projectByProjectId: {
//         proposalReference: "001",
//         contacts: {
//           edges: [],
//         },
//         managers: {
//           edges: [],
//         },
//       },
//     };
//     return result;
//   },
// };

// const allProponentsQueryResolver = {};

// const primaryProponentsQueryResolver = {};

// const techTeamQueryResolver = {};

// const opsTeamQueryResolver = {};

// const componentTestingHelper = new ComponentTestingHelper<NotifyModalQuery>({
//   component: NotifyModal,
//   compiledQuery: compiledNotifyModalQuery,
//   testQuery: testQuery,
//   defaultQueryResolver: defaultQueryResolver,
//   getPropsFromTestQuery: (data) => ({
//     projectRevision: data.query.projectRevision,
//   }),
// });

// describe("The NotifyModal", () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//     componentTestingHelper.reinit();
//     process.env.REACT_APP_PROGRAM_DIRECTOR_EMAIL = "test@email.com";
//     process.env.REACT_APP_PROGRAM_DIRECTOR_NAME = "director name";
//   });

//   it("renders the director form when pendingActionsFrom is Director", () => {
//     componentTestingHelper.loadQuery();
//     componentTestingHelper.renderComponent();
//     expect(screen.getByText(`Director`)).toBeInTheDocument();
//     expect(screen.getByText(`director name`)).toBeInTheDocument();
//   });

//   it("creates the correct mailto link when the director checkbox is checked", () => {
//     componentTestingHelper.loadQuery();
//     componentTestingHelper.renderComponent();
//     //brianna assertion not working
//     // expect(
//     //   screen
//     //     .getByRole("button", {
//     //       name: /notify by email/i,
//     //     })
//     //     .closest("a")
//     // ).toHaveAttribute("href", "nope");
//     expect(
//       screen.getByRole("link", {
//         name: /notify by email/i,
//       })
//     ).toBe("nope");
//   });

//   it("renders the tech team form when pendingActionsFrom is Tech Team and there is a primary manager", () => {
//     componentTestingHelper.loadQuery(techTeamQueryResolver);
//     componentTestingHelper.renderComponent();
//     expect(screen.getByText(`Tech Team Primary`)).toBeInTheDocument();
//     expect(screen.getByText(`Tech Team Secondary`)).toBeInTheDocument();
//     expect(screen.getByText(`Leslie Knope`)).toBeInTheDocument();
//     expect(
//       screen.getByText(
//         "Not added before. You can select one on the Project Details > Project Managers page."
//       )
//     ).toBeInTheDocument();
//   });

//   it("creates the correct mailto link when the primary tech team manager is checked", () => {
//     componentTestingHelper.loadQuery(techTeamQueryResolver);
//     componentTestingHelper.renderComponent();
//   });

//   it("renders the ops team form when pendingActionsFrom is Ops Team and the primary and secondary managers are assigned", () => {
//     componentTestingHelper.loadQuery(opsTeamQueryResolver);
//     componentTestingHelper.renderComponent();

//     expect(screen.getByText(`Ops Team Primary`)).toBeInTheDocument();
//     expect(screen.getByText(`Ops Team Secondary`)).toBeInTheDocument();
//     expect(screen.getByText(`April Ludgate`)).toBeInTheDocument();
//   });

//   it("creates the correct mailto link when both ops team managers are checked", () => {
//     componentTestingHelper.loadQuery(opsTeamQueryResolver);
//     componentTestingHelper.renderComponent();
//   });

//   it("renders the ops team form when there are no managers assigned", () => {
//     componentTestingHelper.loadQuery(opsTeamQueryResolver);
//     componentTestingHelper.renderComponent();

//     expect(screen.getByText(`Ops Team Primary`)).toBeInTheDocument();
//     expect(screen.getByText(`Ops Team Secondary`)).toBeInTheDocument();
//     expect(
//       screen.getByText(
//         "Not added before. You can select one on the Project Details > Project Managers page."
//       )
//     ).toHaveLength(2);
//   });

//   it("renders the proponent form when pendingActionsFrom is Proponent and there are multiple proponents", () => {
//     componentTestingHelper.loadQuery(allProponentsQueryResolver);
//     componentTestingHelper.renderComponent();
//     expect(screen.getByText(`Project Contact Primary`)).toBeInTheDocument();
//     expect(screen.getByText(`Project Contact Secondary`)).toBeInTheDocument();
//     expect(screen.getByText(`Bob001 Loblaw001`)).toBeInTheDocument();
//     expect(
//       screen.queryByText(
//         "Not added before. You can select one on the Project Details > Project Contacts page."
//       )
//     ).not.toBeInTheDocument();
//   });

//   it("creates the correct mailto link when there are multiple proponents", () => {
//     componentTestingHelper.loadQuery(techTeamQueryResolver);
//     componentTestingHelper.renderComponent();
//   });

//   it("renders the proponent form when pendingActionsFrom is Proponent and there is only a primary contact", () => {
//     componentTestingHelper.loadQuery(primaryProponentsQueryResolver);
//     componentTestingHelper.renderComponent();
//     expect(screen.getByText(`Project Contact Primary`)).toBeInTheDocument();
//     // expect(screen.getByText(`Project Contact Secondary`)).toBeInTheDocument();
//     expect(screen.getByText(`Bob001 Loblaw001`)).toBeInTheDocument();
//     expect(
//       screen.getByText(
//         "Not added before. You can select one on the Project Details > Project Contacts page."
//       )
//     ).toBeInTheDocument();
//   });

//   it("creates the correct mailto link when the primary proponent is checked", () => {
//     componentTestingHelper.loadQuery(techTeamQueryResolver);
//     componentTestingHelper.renderComponent();
//   });

//   it("renders the proponent form when there are no proponents assigned", () => {
//     componentTestingHelper.loadQuery(opsTeamQueryResolver);
//     componentTestingHelper.renderComponent();

//     expect(screen.getByText(`Project Contact Primary`)).toBeInTheDocument();
//     expect(screen.getByText(`Project Contact Secondary`)).toBeInTheDocument();
//     expect(
//       screen.getByText(
//         "Not added before. You can select one on the Project Details > Project Contacts page."
//       )
//     ).toHaveLength(2);
//   });

//   it("closes the modal when the `Cancel` button is clicked", () => {
//     componentTestingHelper.loadQuery();
//     componentTestingHelper.renderComponent();
//     userEvent.click(screen.getByText(/Cancel/i));

//     expect(componentTestingHelper.router.back).toHaveBeenCalledTimes(1);
//   });

//   xit("opens the email client when the `Notify by Email` button is clicked", () => {
//     componentTestingHelper.loadQuery();
//     componentTestingHelper.renderComponent();
//     userEvent.click(screen.getByText(/Director/i));
//     userEvent.click(screen.getByText(/Notify by Email/i));
//     //expect client
//   });

//   it.only("disables the `Notify by Email` button when no email recipients are selected", () => {
//     componentTestingHelper.loadQuery();
//     componentTestingHelper.renderComponent();
//     expect(screen.getByText(/Notify by Email/i)).toBeDisabled();
//   });
// });
