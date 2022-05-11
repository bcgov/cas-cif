import { Autocomplete, Popper, TextField } from "@mui/material";
import TableFilter, { FilterSettings } from "./TableFilter";
import { FilterComponent } from "./types";

const FullWidthPopper = (props) => (
  <Popper
    {...props}
    style={{ width: "fit-content", maxWidth: "200px" }}
    placement="bottom-start"
  />
);

export default class SearchableDropdownFilter extends TableFilter<string> {
  // config: boolean;

  constructor(
    display: string,
    argName: string,
    private options: string[],
    settings?: FilterSettings
  ) {
    super(display, argName, settings);
  }

  Component: FilterComponent = ({ onChange, filterArgs, disabled }) => {
    return (
      <td>
        <Autocomplete
          options={this.options}
          onChange={(_, option) => onChange(option, this.argName)}
          freeSolo={this.isFreeSoloEnabled}
          disableClearable={this.isDisableClearable}
          size="small"
          PopperComponent={FullWidthPopper}
          value={filterArgs[this.argName] ?? ""}
          disabled={disabled}
          sx={{
            border: "2px solid #606060",
            borderRadius: "0.25em",
            marginTop: "0em",
            fontFamily: "BC Sans",
            "&.Mui-focused": {
              outlineStyle: "solid",
              outlineWidth: "4px",
              outlineColor: "#3B99FC",
              outlineOffset: "1px",
            },
          }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                onChange={(evt) => onChange(evt.target.value, this.argName)}
                placeholder="Filter"
                variant="standard"
                aria-label={`Filter by ${this.title}`}
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  style: {
                    fontFamily: "BC Sans",
                    padding: "0",
                    fontSize: "14.4px",
                  },
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  padding: "0.3em 0.4em",
                  borderRadius: "0.10em",
                  background: "white",
                }}
              />
            );
          }}
        />
      </td>
    );
  };
}
