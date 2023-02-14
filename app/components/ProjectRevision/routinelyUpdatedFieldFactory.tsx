import { WidgetProps } from "@rjsf/core";
import { Button } from "@button-inc/bcgov-theme";
import React, { useEffect, useMemo, useState } from "react";
// import { UseDebouncedMutationConfig } from "mutations/useDebouncedMutation"; //TODO: bring this back when we have the mutation
// import { Disposable, MutationParameters } from "relay-runtime"; //TODO: bring this back when we have the mutation
import { DateTime } from "luxon";

/**
 * A factory function that creates a Field/Widget/React component for a routinely updated field.
 *
 * @param Widget The widget to wrap like a TextWidget, SelectWidget, etc.
 * @param mutationFnHook The hook that returns the mutation function and a boolean indicating whether the mutation is in progress
 * @param fieldNameToUpdate The name of the field to update (e.g. "status")
 * @param formDataTableName The name of the form data table to use for updating the field (e.g. "project")
 * @returns a React component that wraps the widget and adds the update button and functionality
 *
 * How to use:
 * 1. Create a mutation function hook that returns the mutation function and a boolean indicating whether the mutation is in progress
 * 2. Create a field/widget component inside the form component using this factory function
 * 3. Add the field/widget component to the form widgets prop
 * 4. Replace the widget in the ui-widget of the UISchema with this newly created field/widget component
 * 5. Pass the `projectRevision` object to the form context
 */

const routinelyUpdatedFieldFactory = (
  Widget: React.FC<WidgetProps>
  // mutationFnHook: () => [
  //   (config: UseDebouncedMutationConfig<MutationParameters>) => Disposable,
  //   boolean
  // ] //TODO: bring this back when we have the mutation
  // fieldNameToUpdate: string, //TODO: bring this back when we have the mutation
  // formDataTableName: string //TODO: bring this back when we have the mutation
): React.FC<WidgetProps> => {
  const WrappedWidget: React.FC<WidgetProps> = (props) => {
    // helper function to compare the initial value to the current value
    const valueUnchanged = useMemo(
      () =>
        (value1: any, value2: any): boolean => {
          if (
            Date.parse(value1) &&
            Date.parse(value2) &&
            typeof value1 === "string"
          ) {
            return (
              DateTime.fromISO(value1).toISODate() ===
              DateTime.fromISO(value2).toISODate()
            );
          }
          // not using strict equality because the value can be a string or a number when getting the value from the UI and we need the type coercion
          return value1 == value2;
        },
      []
    );

    const { value, disabled } = props;
    // const { id } = formContext.projectRevision; //TODO: bring this back when we have the mutation

    // const [updateFn, isUpdating] = mutationFnHook(); //TODO: bring this back when we have the mutation
    const isUpdating = false; // TODO: remove this once we have the mutation

    const [updated, setUpdated] = useState(true);
    const [informationalText, setInformationalText] = useState("");

    // to compare the initial value to the current value
    // TODO: remove this once we have the mutation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [initialValue, setInitialValue] = useState(value);

    // set the text next to the button based on whether the value has changed or not
    useEffect(() => {
      let isValueUnchanged = valueUnchanged(initialValue, value);
      setUpdated(isValueUnchanged);
      setInformationalText(
        isValueUnchanged
          ? ""
          : 'To confirm your change, please click the "Update" button.'
      );
    }, [initialValue, value, valueUnchanged]);

    // TODO: We might use something like this once we have the mutation
    // const updatePatch = {
    //   [fieldNameToUpdate]: value,
    // };

    const clickHandler = () => console.log("update mutation called");
    // TODO: We might use something like this once we have the mutation
    // return new Promise((resolve, reject) =>
    //   updateFn({
    //     variables: {
    //       input: {
    //         id: id,
    //         projectRevisionPatch: updatePatch,
    //       },
    //     },
    //     optimisticResponse: {
    //       updateFn: {
    //         projectRevision: {
    //           id: id,
    //         },
    //       },
    //     },
    //     onCompleted: () => {
    //       setUpdated(true); TODO: need to add this once we have the mutation
    //       setInitialValue(value); TODO: need to add this once we have the mutation
    //       setInformationalText("Updated"); TODO: need to add this once we have the mutation
    //     },
    //     onError: reject,
    //     debounceKey: id,
    //   })
    // );
    return (
      <div>
        <div>
          <Widget {...props} />
          <div>
            <Button
              type="submit"
              onClick={clickHandler}
              disabled={updated || isUpdating || disabled}
            >
              Update
            </Button>
          </div>
          <small>{informationalText}</small>
        </div>
        <style jsx>{`
          div {
            display: flex;
            gap: 1em;
            align-items: center;
            flex-wrap: wrap;
          }
          div :global(.pg-select) {
            width: 18em;
          }
          div :global(button.pg-button) {
            margin: 0 1em;
          }
        `}</style>
      </div>
    );
  };

  return WrappedWidget;
};

export default routinelyUpdatedFieldFactory;
