import { useCallback } from "react";
import { WidgetProps } from "@rjsf/core";
import Widgets from "@rjsf/core/dist/cjs/components/widgets";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { InputAdornment } from "@mui/material";
import Search from "@mui/icons-material/Search";

const SearchDropdownWidget: React.FC<WidgetProps> = (props) => {
  const { id, onChange, schema, placeholder, readonly } = props;

  const handleChange = (e: React.ChangeEvent<{}>, option: any) => {
    onChange(option?.enum?.[0]);
  };

  const getSelected = useCallback(() => {
    if (props.value === null || props.value === undefined || !schema.anyOf)
      return null;
    const selectedValue = schema.anyOf.find(
      (option) => (option as any).enum?.[0] === props.value
    );
    return selectedValue;
  }, [schema, props.value]);

  const options = schema && schema.anyOf ? schema.anyOf : [];

  if (readonly) return <Widgets.SelectWidget {...props} />;

  return (
    <Autocomplete
      disableClearable
      id={id}
      options={options}
      defaultValue={getSelected()}
      value={getSelected()}
      onChange={handleChange}
      isOptionEqualToValue={(option) =>
        props.value ? option.enum?.[0] === props.value : true
      }
      getOptionLabel={(option) => (option ? option.title : "")}
      sx={{
        border: "2px solid #606060",
        borderRadius: "0.25em",
        marginTop: "0.2em",
        "&.Mui-focused": {
          outlineStyle: "solid",
          outlineWidth: "4px",
          outlineColor: "#3B99FC",
          outlineOffset: "1px",
        },
      }}
      popupIcon={<KeyboardArrowDownIcon style={{ color: "black" }} />}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="standard"
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              padding: "5px",
              background: "white",
            }}
          />
        );
      }}
    />
  );
};

export default SearchDropdownWidget;
