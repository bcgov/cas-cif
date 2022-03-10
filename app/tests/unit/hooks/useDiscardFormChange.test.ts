import useDiscardFormChange from "hooks/useDiscardFormChange";
import { mocked } from "jest-mock";
import {
  useDeleteFormChange,
  useDeleteFormChangeWithConnection,
} from "mutations/FormChange/deleteFormChange";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";

jest.mock("mutations/FormChange/deleteFormChange");

const deleteFormChange = jest.fn();
let isDeletingFormChange = false;
mocked(useDeleteFormChange).mockImplementation(() => [
  deleteFormChange,
  isDeletingFormChange,
]);

const deleteFormChangeWithConnection = jest.fn();
let isDeletingFormChangeWithConnection = false;
mocked(useDeleteFormChangeWithConnection).mockImplementation(() => [
  deleteFormChangeWithConnection,
  isDeletingFormChangeWithConnection,
]);

jest.mock("mutations/FormChange/updateFormChange");
const updateFormChange = jest.fn();
let isUpdatingFormChange = false;
mocked(useUpdateFormChange).mockImplementation(() => [
  updateFormChange,
  isUpdatingFormChange,
]);

describe("the useDiscardFormChange hook", () => {
  it("deletes a form change if its operation type is CREATE", () => {
    const [discardFormChange] = useDiscardFormChange();
    const onCompleted = jest.fn();
    const onError = jest.fn();
    discardFormChange({
      formChange: {
        id: "form-change-id",
        operation: "CREATE",
      },
      onCompleted,
      onError,
    });
    expect(deleteFormChange).toHaveBeenCalledWith({
      variables: {
        connections: undefined,
        input: {
          id: "form-change-id",
        },
      },
      onCompleted,
      onError,
    });
    expect(updateFormChange).not.toHaveBeenCalled();
  });

  it("deletes a form change with a connection id if its operation type is CREATE and a connection id is passed as a parameter", () => {
    const [discardFormChange] = useDiscardFormChange("my-connection-id");
    const onCompleted = jest.fn();
    const onError = jest.fn();
    discardFormChange({
      formChange: {
        id: "form-change-id",
        operation: "CREATE",
      },
      onCompleted,
      onError,
    });
    expect(deleteFormChangeWithConnection).toHaveBeenCalledWith({
      variables: {
        connections: ["my-connection-id"],
        input: {
          id: "form-change-id",
        },
      },
      onCompleted,
      onError,
    });
    expect(updateFormChange).not.toHaveBeenCalled();
  });

  it("updates a form change operation to ARCHIVE if its operation type is UPDATE", () => {
    const [discardFormChange] = useDiscardFormChange();
    const onCompleted = jest.fn();
    const onError = jest.fn();
    discardFormChange({
      formChange: {
        id: "form-change-id",
        operation: "UPDATE",
      },
      onCompleted,
      onError,
    });
    expect(updateFormChange).toHaveBeenCalledWith({
      variables: {
        input: {
          id: "form-change-id",
          formChangePatch: { operation: "ARCHIVE" },
        },
      },
      onCompleted,
      onError,
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: "form-change-id",
            operation: "ARCHIVE",
            newFormData: {},
          },
        },
      },
      debounceKey: "form-change-id",
    });
    expect(deleteFormChange).not.toHaveBeenCalled();
  });
});
