import React, { useCallback } from "react";
import { WidgetProps } from "@rjsf/core";
import Widgets from "@rjsf/core/dist/cjs/components/widgets";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const SearchDropdownWidget: React.FC<WidgetProps> = (props) => {
  const { onChange, schema, placeholder, readonly } = props;

  const handleChange = (e: React.ChangeEvent<{}>, option) => {
    onChange(option.value);
  };

  const getSelected = useCallback(() => {
    if (props.value === null || props.value === undefined) return undefined;
    const selectedValue = schema.anyOf.find(
      (option) => option.value === props.value
    );
    return selectedValue;
  }, [schema, props.value]);

  getSelected();

  if (readonly) return <Widgets.SelectWidget {...props} />;

  return (
    <Autocomplete
      disablePortal
      id="search-dropdown"
      options={schema.anyOf}
      defaultValue={getSelected}
      onChange={handleChange}
      getOptionLabel={(option) => option.title}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label={placeholder} />}
    />
  );
};

export default SearchDropdownWidget;
