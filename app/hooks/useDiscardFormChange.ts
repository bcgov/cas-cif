import {
  useDeleteFormChangeWithConnection,
  useDeleteFormChange,
} from "mutations/FormChange/deleteFormChange";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { deleteFormChangeMutation } from "__generated__/deleteFormChangeMutation.graphql";
import { updateFormChangeMutation } from "__generated__/updateFormChangeMutation.graphql";
import useConfigurableDiscardFormChange from "./useConfigurableDiscardFormChange";

// export interface DiscardFormChangeOptions {
//   formChange: {
//     id: string;
//     operation: "CREATE" | "UPDATE" | "ARCHIVE";
//   };
//   onCompleted?: (
//     response: updateFormChangeMutation$data | deleteFormChangeMutation$data,
//     errors: PayloadError[]
//   ) => void;
//   onError?: (error: Error) => void;
// }

// /**
//  * Returns a function that can be used to discard a form change,
//  * e.g. remove a project_contact or project_manager from a pending project_revision.
//  * If the form change was created in the same project revision, i.e. if its operation is "CREATE", it will be deleted.
//  * If the form change was created in a different project revision, i.e. if its operation is "UPDATE", its operation will be updated to "ARCHIVE".
//  * @param connectionId an optional connection id to update when the form change is deleted
//  * @returns
//  */
// const useDiscardFormChange = (
//   connectionId?: string
// ): [(options: DiscardFormChangeOptions) => void, boolean] => {
//   // Disabling the rules of hooks below is okay, as long as they are not disabled
//   // in the component that uses this hook.
//   const [deleteFormChange, isDeleting] = connectionId
//     ? // eslint-disable-next-line react-hooks/rules-of-hooks
//       useDeleteFormChangeWithConnection()
//     : // eslint-disable-next-line react-hooks/rules-of-hooks
//       useDeleteFormChange();
//   const [updateFormChange, isUpdating] = useUpdateFormChange();
//   const discardFormChange = (options: DiscardFormChangeOptions) => {
//     const { formChange, onCompleted, onError } = options;
//     if (formChange.operation === "CREATE") {
//       const variables:
//         | deleteFormChangeMutation$variables
//         | deleteFormChangeWithConnectionMutation$variables = {
//         input: {
//           id: formChange.id,
//         },
//         connections: connectionId ? [connectionId] : undefined,
//       };

//       deleteFormChange({ variables, onCompleted, onError });
//     } else {
//       updateFormChange({
//         variables: {
//           input: {
//             id: formChange.id,
//             formChangePatch: {
//               operation: "ARCHIVE",
//             },
//           },
//         },
//         optimisticResponse: {
//           updateFormChange: {
//             formChange: {
//               id: formChange.id,
//               operation: "ARCHIVE",
//               newFormData: {},
//             },
//           },
//         },
//         onCompleted,
//         onError,
//         debounceKey: formChange.id,
//       });
//     }
//   };
//   const isDiscarding = isDeleting || isUpdating;
//   return [discardFormChange, isDiscarding];
// };

const useDiscardFormChange = (connectionId?: string) =>
  useConfigurableDiscardFormChange<
    deleteFormChangeMutation,
    updateFormChangeMutation
  >(
    connectionId ? useDeleteFormChangeWithConnection : useDeleteFormChange,
    useUpdateFormChange,
    {},
    connectionId
  );

export default useDiscardFormChange;
