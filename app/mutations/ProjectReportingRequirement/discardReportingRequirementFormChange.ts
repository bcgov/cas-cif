import useConfigurableDiscardFormChange from "hooks/useConfigurableDiscardFormChange";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { discardReportingRequirementFormChangeMutation } from "__generated__/discardReportingRequirementFormChangeMutation.graphql";
import { updateReportingRequirementFormChangeMutation } from "__generated__/updateReportingRequirementFormChangeMutation.graphql";
import { useUpdateReportingRequirementFormChange } from "./updateReportingRequirementFormChange";

const discardMutation = graphql`
  mutation discardReportingRequirementFormChangeMutation(
    $connections: [ID!]!
    $input: DeleteFormChangeInput!
    $reportType: String!
  ) {
    deleteFormChange(input: $input) {
      deletedFormChangeId @deleteEdge(connections: $connections)
      formChange {
        projectRevisionByProjectRevisionId {
          upcomingReportingRequirementFormChange(reportType: $reportType) {
            ...ReportDueIndicator_formChange
          }
        }
      }
    }
  }
`;

const useDeleteReportingRequirementFormChange = () =>
  useMutationWithErrorMessage<discardReportingRequirementFormChangeMutation>(
    discardMutation,
    () => "An error occurred when deleting a reporting requirement."
  );

// interface DiscardFormChangeOptions {
//   formChange: {
//     id: string;
//     operation: "CREATE" | "UPDATE" | "ARCHIVE";
//   };
//   onCompleted?: (
//     response:
//       | updateReportingRequirementFormChangeMutation$data
//       | discardReportingRequirementFormChangeMutation$data,
//     errors: PayloadError[]
//   ) => void;
//   onError?: (error: Error) => void;
// }

// const useDiscardFormChange = (
//   reportType: string,
//   connectionId: string
// ): [(options: DiscardFormChangeOptions) => void, boolean] => {
//   // Disabling the rules of hooks below is okay, as long as they are not disabled
//   // in the component that uses this hook.
//   const [deleteFormChange, isDeleting] = useMutationWithErrorMessage(
//     discardMutation,
//     () => "An error occurred while deleting"
//   );
//   const [updateFormChange, isUpdating] =
//     useUpdateReportingRequirementFormChange();

//   const discardFormChange = (options: DiscardFormChangeOptions) => {
//     const { formChange, onCompleted, onError } = options;
//     if (formChange.operation === "CREATE") {
//       const variables: discardReportingRequirementFormChangeMutation$variables =
//         {
//           input: {
//             id: formChange.id,
//           },
//           reportType: reportType,
//           connections: [connectionId],
//         };

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
//           reportType: reportType,
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

const useDiscardReportingRequirementFormChange = (
  reportType: string,
  connectionId: string
) =>
  useConfigurableDiscardFormChange<
    discardReportingRequirementFormChangeMutation,
    updateReportingRequirementFormChangeMutation
  >(
    useDeleteReportingRequirementFormChange,
    useUpdateReportingRequirementFormChange,
    { reportType: reportType },
    connectionId
  );

export default useDiscardReportingRequirementFormChange;
