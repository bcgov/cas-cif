# Handling of Concurrent Revisions

The purpose of this document is to outline how we allow concurrent revisions to be made to a proeject.

## Introduction

By "concurrent revisions" we are referring to the ability for two discrete sets of changes to a project to exist at the same time. In CIF, we limit the number of concurrent revisions on any given project to be two: one "Amendment", and one "General Revision". While this was never intended to be a functionality of CIF, a new user flow was introduced that required it. As such, the approach taken is more of an adaptaion of the existing CIF architecture (which is described in `docs/dbRecordsHistory.md`) than an architecture designed to handle concurrency. The result is that any divergence from the original architecture pre-concureency also appears in the concurrent behaviour. For example, project contacts are handled using a different pattern than the project form in the original architecture, therfore they behave differently from the genral pattern in the concurrent approach as well.

### Terminology

There are three terms we need to use to identify the three `form_change` records in question: "committing", "pending", and "original parent". I'll use the more common scenario to outline the terminology used throughout this document.
An Amendment is opened on a project, and left open while it is being negotiated. While it is open, a General Revision is opened on that same project, a small change is made, and the revision is committed. The point in time of the General Revision being committed is where the terminology gets its roots. In this example, the General Revision is **committing**, the still-open amendment is **pending**, and the parent revision of the Amendment is the **original parent**.

## Approach

A solution that would allow us to handle concurrency without user input on conflict resolution was needed. To achieve this, the approach taken is comparable to a git rebase. When committing and pending are in conflict, the changes made in pending are applied on top of the committing form change, as if the committing `form_change` were the original parent of the pending `form_change`. While users commit on a `project_revision` level, the change propogates down to the `form_change` level, so when we're talking about this here it is at the `form_change` granularity, and the heart it takes place in the function `cif.commit_form_change_internal`.

One of the ways our various forms can be categorized would be:

- forms a project can have at most one of (`funding_parameter_EP`, `funding_parameter_IA`, `emission_intensity`, `project_summary_report`)
- 'project_contact' are either primary or secondary, and have a `contactIndex`
- 'project_manager' are categorized by `projectManagerLabelId`
- 'reporting_requirement' have a `reportingRequirementIndex` based on the `json_schema_name`

Form changes can have an operation of `create`, `update`, or `archive`, each of which need to be handled for all of the above categories. This results in several unique cases, which have been explained using in-line in the `commit_form_change_internal` where they have more context.
