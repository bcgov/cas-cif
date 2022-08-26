import { UseDebouncedMutationConfig } from "mutations/useDebouncedMutation";
import { UseMutationConfig } from "react-relay";
import { Disposable, MutationParameters, PayloadError } from "relay-runtime";

export interface DiscardFormChangeOptions<TDelete$data, TUpdate$data> {
  formChange: {
    id: string;
    rowId: number;
    operation: "CREATE" | "UPDATE" | "ARCHIVE";
  };
  onCompleted?: (
    response: TDelete$data | TUpdate$data,
    errors: PayloadError[]
  ) => void;
  onError?: (error: Error) => void;
}

/**
 * Returns a function that can be used to discard a form change,
 * e.g. remove a project_contact or project_manager from a pending project_revision.
 * If the form change was created in the same project revision, i.e. if its operation is "CREATE", it will be deleted.
 * If the form change was created in a different project revision, i.e. if its operation is "UPDATE", its operation will be updated to "ARCHIVE".
 * @param connectionId an optional connection id to update when the form change is deleted
 * @returns
 */
const useConfigurableDiscardFormChange = function <
  TDelete extends MutationParameters,
  TUpdate extends MutationParameters
>(
  deleteMutationHook: () => [
    (config: UseMutationConfig<TDelete>) => Disposable,
    boolean
  ],
  updateMutationHook: () => [
    (config: UseDebouncedMutationConfig<TUpdate>) => Disposable,
    boolean
  ],
  additionalVariables:
    | Partial<TDelete["variables"]>
    | Partial<TUpdate["variables"]>,
  connectionId?: string
): [
  (
    options: DiscardFormChangeOptions<TDelete["response"], TUpdate["response"]>
  ) => void,
  boolean
] {
  // Disabling the rules of hooks below is okay, as long as they are not disabled
  // in the component that uses this hook.
  const [deleteFormChange, isDeleting] = deleteMutationHook();
  const [updateFormChange, isUpdating] = updateMutationHook();

  const discardFormChange = (
    options: DiscardFormChangeOptions<TDelete["response"], TUpdate["response"]>
  ) => {
    const { formChange, onCompleted, onError } = options;
    if (formChange.operation === "CREATE") {
      const variables: TDelete["variables"] = {
        input: {
          id: formChange.id,
        },
        connections: connectionId ? [connectionId] : undefined,
        ...additionalVariables,
      };

      deleteFormChange({ variables, onCompleted, onError });
    } else {
      updateFormChange({
        variables: {
          input: {
            rowId: formChange.rowId,
            formChangePatch: {
              operation: "ARCHIVE",
            },
          },
          ...additionalVariables,
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              rowId: formChange.rowId,
              operation: "ARCHIVE",
              newFormData: {},
            },
          },
        },
        onCompleted,
        onError,
        debounceKey: formChange.id,
      });
    }
  };
  const isDiscarding = isDeleting || isUpdating;
  return [discardFormChange, isDiscarding];
};

export default useConfigurableDiscardFormChange;
