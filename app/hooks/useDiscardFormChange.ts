import {
  useDeleteFormChangeWithConnection,
  useDeleteFormChange,
} from "mutations/FormChange/deleteFormChange";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { deleteFormChangeMutation } from "__generated__/deleteFormChangeMutation.graphql";
import { updateFormChangeMutation } from "__generated__/updateFormChangeMutation.graphql";
import useConfigurableDiscardFormChange from "./useConfigurableDiscardFormChange";

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
