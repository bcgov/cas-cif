import { Dropdown } from "@button-inc/bcgov-theme";
import React from "react";
import TableFilter, { FilterSettings } from "./TableFilter";
import { FilterComponent } from "./types";

interface EnumSettings extends FilterSettings {
  renderEnumValue?: (x: string) => string;
}

export default class EnumFilter<T> extends TableFilter {
  enumValues: T[];

  renderEnumValue?: (x: string) => string;

  constructor(display, argName, enumValues: T[], settings?: EnumSettings) {
    super(display, argName, settings);
    this.renderEnumValue = settings?.renderEnumValue ?? ((x) => x);
    this.enumValues = enumValues;
    this.searchOptionValues = enumValues.map((val) => {
      return { display: String(val), value: val };
    });
  }

  castValue = (val) => {
    if (this.enumValues.includes(val)) return val;
    return null;
  };

  searchOptionValues: Array<{ display: string; value: T }>;

  Component: FilterComponent = ({ filterArgs, disabled, onChange }) => {
    return (
      <td>
        <Dropdown
          name={this.argName}
          disabled={disabled}
          value={(filterArgs[this.argName] ?? "") as string}
          aria-label={`Filter by ${this.title}`}
          onChange={(evt) =>
            onChange(this.castValue(evt.target.value), this.argName)
          }
        >
          <option key={this.argName + "-placeholder"} value="">
            ...
          </option>
          {this.searchOptionValues.map((kvp) => (
            <option
              key={this.argName + "-" + kvp.display}
              value={kvp.value as any}
            >
              {this.renderEnumValue(kvp.display)}
            </option>
          ))}
        </Dropdown>
      </td>
    );
  };
}
