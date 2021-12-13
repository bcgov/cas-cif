import React, { useCallback } from "react";
import { WidgetProps } from "@rjsf/core";
import Widgets from "@rjsf/core/dist/cjs/components/widgets";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import getRequiredLabel from "../utils/getRequiredLabel";

const SearchDropdownWidget: React.FC<WidgetProps> = (props) => {
  const { onChange, schema, placeholder, readonly, label, required } = props;

  const handleChange = (e: React.ChangeEvent<{}>, option: any) => {
    onChange(option.value);
  };

  const getSelected = useCallback(() => {
    if (props.value === null || props.value === undefined) return undefined;
    const selectedValue = schema.anyOf.find(
      (option) => (option as any).value === props.value
    );
    return selectedValue;
  }, [schema, props.value]);

  if (readonly) return <Widgets.SelectWidget {...props} />;

  return (
    <>
      <label>{getRequiredLabel(label, required)}</label>
      <Autocomplete
        id="search-dropdown"
        options={schema.anyOf}
        defaultValue={getSelected}
        onChange={handleChange}
        isOptionEqualToValue={(option) =>
          props.value ? option.value === props.value : true
        }
        getOptionLabel={(option) => option.title}
        sx={{ border: "2px solid #606060", borderRadius: "0.25em" }}
        renderInput={(params) => (
          <TextField {...params} placeholder={placeholder} />
        )}
      />
    </>
  );
};

export default SearchDropdownWidget;
