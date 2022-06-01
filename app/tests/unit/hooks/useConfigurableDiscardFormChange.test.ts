import useConfigurableDiscardFormChange from "hooks/useConfigurableDiscardFormChange";
import { mocked } from "jest-mock";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { graphql } from "react-relay";
import { useConfigurableDiscardFormChange_testDeleteMutation } from "__generated__/useConfigurableDiscardFormChange_testDeleteMutation.graphql";
import { useConfigurableDiscardFormChange_testUpdateMutation } from "__generated__/useConfigurableDiscardFormChange_testUpdateMutation.graphql";

jest.mock("mutations/FormChange/deleteFormChange");

const deleteFormChange = jest.fn();
let isDeletingFormChange = false;
mocked(useDeleteFormChange).mockImplementation(() => [
  deleteFormChange,
  isDeletingFormChange,
]);

jest.mock("mutations/FormChange/updateFormChange");
const updateFormChange = jest.fn();
let isUpdatingFormChange = false;
mocked(useUpdateFormChange).mockImplementation(() => [
  updateFormChange,
  isUpdatingFormChange,
]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testDeleteFormChangeMutation = graphql`
  mutation useConfigurableDiscardFormChange_testDeleteMutation
  @relay_test_operation {
    deleteFormChange(input: { id: "form-change-id" }) {
      deletedFormChangeId
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testUpdateFormChangeMutation = graphql`
  mutation useConfigurableDiscardFormChange_testUpdateMutation
  @relay_test_operation {
    updateFormChange(input: { id: "form-change-id", formChangePatch: {} }) {
      formChange {
        id
      }
    }
  }
`;

const discardMethod = jest.fn();
const discardHook = jest.fn().mockImplementation(() => [discardMethod, false]);

const updateMethod = jest.fn();
const updateHook = jest.fn().mockImplementation(() => [updateMethod, false]);

describe("The useConfigurableDiscardFormChangeHook", () => {
  /**
   * The main functionality is already tested in the useDiscardFormChange test (which is a better integration test).
   * */

  it("Passes the extra variables to the delete form change hook when the form needs to be deleted", () => {
    const [discardFormChange] = useConfigurableDiscardFormChange<
      useConfigurableDiscardFormChange_testDeleteMutation,
      useConfigurableDiscardFormChange_testUpdateMutation
    >(discardHook, updateHook, { extra: "variables" });

    discardFormChange({
      formChange: { id: "some-id", operation: "CREATE" },
    });

    expect(discardMethod).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ extra: "variables" }),
      })
    );
    expect(updateMethod).not.toHaveBeenCalled();
  });
  it("Passes the extra variables to the update form change hook", () => {
    const [discardFormChange] = useConfigurableDiscardFormChange<
      useConfigurableDiscardFormChange_testDeleteMutation,
      useConfigurableDiscardFormChange_testUpdateMutation
    >(discardHook, updateHook, { extra: "variables" });

    discardFormChange({
      formChange: { id: "some-other-id", operation: "UPDATE" },
    });

    expect(updateMethod).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ extra: "variables" }),
      })
    );
    expect(discardMethod).not.toHaveBeenCalled();
  });
});
