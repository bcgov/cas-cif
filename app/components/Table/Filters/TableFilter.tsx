import { Input } from "@button-inc/bcgov-theme";
import camelToSnakeCase from "lib/helpers/camelToSnakeCase";
import React from "react";
import type { FilterComponent } from "./types";

export interface FilterSettings {
  filterable?: boolean;
  sortable?: boolean;
  orderByPrefix?: string;
}

export default abstract class TableFilter<T = string | number | boolean> {
  constructor(title: string, argName: string, settings?: FilterSettings) {
    this.title = title;
    this.argName = argName;
    this.isSearchEnabled = settings?.filterable ?? true;
    this.isSortEnabled = settings?.sortable ?? true;
    this.orderByPrefix =
      settings?.orderByPrefix ??
      (argName ? camelToSnakeCase(argName).toUpperCase() : argName);
  }

  /**
   * The name of the relay argument that this filter manages.
   */
  argName: string;

  title: string;

  /**
   * The prefix to use when generating the orderBy argument for this filter.
   * Defaults to an uppercase version of the argName.
   * e.g. "projectName" => "PROJECT_NAME"
   */
  orderByPrefix: string;

  isSearchEnabled: boolean;

  isSortEnabled: boolean;

  /**
   * The array of all relay arguments managed by this filter.
   * Most filters will manage a single argument, but some may manage more,
   * e.g. to control both an "isEqual" and an "isNull" relay filter.
   * Used to know which arguments should be removed from the query when the filters are reset
   */
  get argNames() {
    return [this.argName];
  }

  castValue: (value: string) => T = (value) => value as any;

  Component: FilterComponent = ({ filterArgs, onChange }) => {
    return (
      <td>
        <Input
          placeholder="Filter"
          name={this.argName}
          size="small"
          value={(filterArgs[this.argName] ?? "") as string}
          aria-label={`Filter by ${this.title}`}
          onChange={(evt) =>
            onChange(this.castValue(evt.target.value) as any, this.argName)
          }
        />
        <style jsx>{`
          :global(.pg-input > input) {
            width: 100%;
          }
        `}</style>
      </td>
    );
  };
}
