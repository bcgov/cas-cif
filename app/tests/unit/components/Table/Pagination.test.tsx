import React from "react";
import { render, screen } from "@testing-library/react";
import Pagination from "components/Table/Pagination";

describe("PaginationBar", () => {
  it("should render disabled buttons if there is a single page", async () => {
    render(
      <table>
        <tfoot>
          <tr>
            <Pagination
              totalCount={5}
              onOffsetChange={jest.fn()}
              onPageSizeChange={jest.fn()}
            />
          </tr>
        </tfoot>
      </table>
    );
    expect(screen.getByText(/1\u20135 of 5/)).toBeInTheDocument();
    expect(screen.getByTitle(/go to first page/i)).toBeDisabled();
    expect(screen.getByTitle(/go to previous page/i)).toBeDisabled();
    expect(screen.getByTitle(/go to next page/i)).toBeDisabled();
    expect(screen.getByTitle(/go to last page/i)).toBeDisabled();
  });

  it("should enable the next/last buttons if there is a more than one page", async () => {
    render(
      <table>
        <tfoot>
          <tr>
            <Pagination
              totalCount={50}
              onOffsetChange={jest.fn()}
              onPageSizeChange={jest.fn()}
            />
          </tr>
        </tfoot>
      </table>
    );
    expect(screen.getByText(/1\u201320 of 50/)).toBeInTheDocument();
    expect(screen.getByTitle(/go to first page/i)).toBeDisabled();
    expect(screen.getByTitle(/go to previous page/i)).toBeDisabled();
    expect(screen.getByTitle(/go to next page/i)).toBeEnabled();
    expect(screen.getByTitle(/go to last page/i)).toBeEnabled();
  });

  it("should enable the first/previous buttons if there is a more than one page and we are not on the first page", async () => {
    render(
      <table>
        <tfoot>
          <tr>
            <Pagination
              totalCount={50}
              offset={20}
              onOffsetChange={jest.fn()}
              onPageSizeChange={jest.fn()}
            />
          </tr>
        </tfoot>
      </table>
    );
    expect(screen.getByText(/21\u201340 of 50/)).toBeInTheDocument();
    expect(screen.getByTitle(/go to first page/i)).toBeEnabled();
    expect(screen.getByTitle(/go to previous page/i)).toBeEnabled();
    expect(screen.getByTitle(/go to next page/i)).toBeEnabled();
    expect(screen.getByTitle(/go to last page/i)).toBeEnabled();
  });

  it("should disable the next/last buttons on the last page", async () => {
    render(
      <table>
        <tfoot>
          <tr>
            <Pagination
              totalCount={50}
              offset={40}
              onOffsetChange={jest.fn()}
              onPageSizeChange={jest.fn()}
            />
          </tr>
        </tfoot>
      </table>
    );
    expect(screen.getByText(/41\u201350 of 50/)).toBeInTheDocument();
    expect(screen.getByTitle(/go to first page/i)).toBeEnabled();
    expect(screen.getByTitle(/go to previous page/i)).toBeEnabled();
    expect(screen.getByTitle(/go to next page/i)).toBeDisabled();
    expect(screen.getByTitle(/go to last page/i)).toBeDisabled();
  });
});
