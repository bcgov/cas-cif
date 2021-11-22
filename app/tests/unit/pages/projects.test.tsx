import React from 'react'
import {Projects, ProjectsQuery} from '../../../pages/internal/projects';
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom'
import {
  createMockEnvironment,
  MockPayloadGenerator
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import { projectsQuery } from '__generated__/projectsQuery.graphql';

const environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) => {
      return MockPayloadGenerator.generate(operation, {
        projectsQuery() {
          return {
            query: {
              session: null,
              allProjects: {
                edges: []
              },
              allFormChanges: {
                edges: []
              }
            }
          };
        },
      });
    });

  const query = ProjectsQuery; // can be the same, or just identical
  const variables = {
    // ACTUAL variables for the invocation goes here
  };
  environment.mock.queuePendingOperation(query, variables);

describe("The projects page", () => {

  const initialQueryRef = loadQuery<projectsQuery>(
    environment,
    ProjectsQuery,
    {},
  );

  it('loads the Create Project Button', async () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Projects data-testid="1" CSN={true} preloadedQuery={initialQueryRef}/>
      </RelayEnvironmentProvider>
    );

    expect(screen.getAllByRole('button')[1]).toHaveTextContent('Create Project');
  });

  it('calls the Create Project mutation when the Create Project Button is clicked', async () => {
    const spy = jest
      .spyOn(
        require("mutations/Project/createProject"),
        "default"
      )
      .mockImplementation(() => {});
    render(<RelayEnvironmentProvider environment={environment}>
             <Projects data-testid="2" CSN={true} preloadedQuery={initialQueryRef}/>
           </RelayEnvironmentProvider>);

    userEvent.click(screen.getAllByRole('button')[1])
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
