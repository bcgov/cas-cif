import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { createProjectQuery } from "__generated__/createProjectQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import updateFormChangeMutation, {
  mutation,
} from "mutations/FormChange/updateFormChange";
import { useRouter } from "next/router";
import ProjectForm from "components/Project/ProjectForm";
import { Button } from "@button-inc/bcgov-theme";
import Grid from "@button-inc/bcgov-theme/Grid";
import { useMemo, useState } from "react";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import SavingIndicator from "components/Form/SavingIndicator";
import SelectOperator from 'components/Operator/SelectOperator';

const CreateProjectQuery = graphql`
  query createProjectQuery($id: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      formChange(id: $id) {
        id
        newFormData
        updatedAt
      }
    },
    fragmentData: query {
      ...SelectOperator_query
    }
  }
`;

export function CreateProject({
  preloadedQuery,
}: RelayProps<{}, createProjectQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(CreateProjectQuery, preloadedQuery);

  const [errors, setErrors] = useState({});
  const [updateFormChange, updatingFormChange] = useDebouncedMutation(mutation);
  const lastEditedDate = useMemo(
    () => new Date(query.formChange.updatedAt),
    [query.formChange.updatedAt]
  );
  if (!query.formChange.id) return null;

  const fd = query.formChange.newFormData;

  // Function: stage the change data in the form_change table
  const storeResult = async (data) => {
    const variables = {
      input: {
        id: query.formChange.id,
        formChangePatch: {
          newFormData: data,
        },
      },
    };
    await updateFormChangeMutation(preloadedQuery.environment, variables);
  };

  // The applyChangeFromComponent function will require this page to be aware of the state of the newFormData object
  const formChangeData = query.formChange.newFormData;

  // A function to be called by individual components making changes to the overall form_change data
  const handleChange = (changeObject: any) => {
    const updatedFormData = { ...formChangeData, ...changeObject };
    return updateFormChange({
      variables: {
        input: {
          id: query.formChange.id,
          formChangePatch: {
            newFormData: updatedFormData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: query.formChange.id,
            newFormData: updatedFormData,
          },
        },
      },
      debounceKey: query.formChange.id,
    });
  };

  const onFormErrors = (incomingErrors: {}) => {
    setErrors({ ...errors, ...incomingErrors });
  };

  // Function: approve staged change, triggering an insert on the project table & redirect to the project page
  const commitProject = async () => {
    await updateFormChangeMutation(preloadedQuery.environment, {
      input: {
        id: query.formChange.id,
        formChangePatch: { changeStatus: "committed" },
      },
    });
    await router.push({
      pathname: "/cif/projects",
    });
  };

  return (
    <DefaultLayout
      session={query.session}
      title="CIF Projects Management"
      width="wide"
    >
      <header>
        <h2>Project Overview</h2>
        <SavingIndicator
          isSaved={!updatingFormChange}
          lastEdited={lastEditedDate}
        />
      </header>
      <Grid cols={2}>
        <Grid.Row>
          <Grid.Col>
            <ProjectForm
              formData={query.formChange.newFormData}
              onChange={handleChange}
              onFormErrors={onFormErrors}
            />
          </Grid.Col>
        </Grid.Row>

        <Button
          size="medium"
          variant="primary"
          onClick={commitProject}
          disabled={Object.values(errors).some((val) => val)}
        >
          Commit Project Changes
        </Button>
      </Grid>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(CreateProject, CreateProjectQuery, withRelayOptions);
