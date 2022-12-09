# Database Records History Tracking

In this document we explain the intent and approach used in this project regarding the use of the `form_change` table to track the changes performed by users.

## Intent

One of the main requirements of the CIF system is to track the history of changes made to projects: projects often updated at least once during their lifespan, with changes to timelines and budgets. These changes must be tracked in our database, so that users can understand how a project was updated, and why.

From a database design perspective, we want the tables records to represent the current information, so that we do not have to filter older versions of records in every query. For instance, every CIF project will have a single record in the `project` table, containing the latest information.

Some updates may require to be reviewed by another user prior to being applied, e.g. if a `project` timeline changes significantly, shifting the program's budget across fiscal years.

Additionally, a desirable behaviour of our application is to have an "auto-save" functionality, ensuring that users do not lose their work if they leave a page, or close their browser.

## Approach

One approach often seen to track history of updates is to use and audit table, that would records all of the `insert`, `update` or `delete` operation on a table, using triggers. We also want to track changes **before** they are applied, e.g. when they are pending review, or when they are being auto-saved. Rather than having a separate table to track those changes, we decided to use a single `form_change` table, which allows us to track a change to a given database record. To avoid creating a table for every table we want to track, the `form_change` table supports tracking changes of every table, on the one condition that the tracked table has an `id` primary key of type `integer`.

### Example: tracking changes to a `contact`

In this example, we assume that our `contact` table only has the following columns: `id`, `given_name` and `family_name`.
When the user opens the page to create a new contact in the system, the following database record will be created (we use a JavaScript object literal here, omitting some field, for an easier representation of the data):

```js
{
  id: 123, // auto-generated
  new_form_data: '{"givenName": "Bob", "familyName": "Loblaw"}', // a JSON, camelCase representation of the data, for easy use with front-end form libraries
  operation: 'create', // a new contact record will be created
  change_status: 'pending', // a pending change corresponds to a form that the user has not submitted yet
  form_data_table_name: 'contact', // the table in which the data should be inserted
  form_data_record_id: null // once the form is submitted and the contact is created, this will be populated
}
```

When the user click the form's `submit` button, the `change_status` is updated to `committed`. A database trigger will then apply the change. In this case, the following SQL query would be performed:

```sql
insert into contact(given_name, family_name) values ('Bob', 'Loblaw') returning id;
```

In the same transaction, the returned id will be inserted in the `form_data_record_id` column, resulting in the following object

```js
{
  id: 123,
  new_form_data: '{"givenName": "Bob", "familyName": "Loblaw"}',
  operation: 'create',
  change_status: 'committed',
  form_data_table_name: 'contact',
  form_data_record_id: 42
}
```

Now that the `form_change` is committed, it cannot be modified (triggers are ensuring that the record is immutable), providing an audit trail. If a user were to open the form to edit the contact and submit it, a new `form_change` record, would be created, like so:

```js
{
  id: 124,
  new_form_data: '{"givenName": "Rob", "familyName": "Labla"}',
  operation: 'update',
  change_status: 'committed',
  form_data_table_name: 'contact',
  form_data_record_id: 42,
  previous_form_change_id: 123
}
```

The `previous_form_change_id`, automatically created via a trigger when a `form_change` is inserted, can be used to easily retrieve the previous versions of a record.

### Archiving records

If a `form_change` with `operation: 'archive'` is committed, the corresponding records will be archived, i.e. its `archived_at` and `archived_by` properties will be set.

Archived records are automatically filtered out by default by our GraphQL API, thanks to the [`pg-omit-archive`](https://github.com/graphile-contrib/pg-omit-archived) PostGraphile plugin.

### Deleting pending `form_change`

As mentioned above, committed `form_change` records are immutable. Pending `form_change` records however, can be updated, or even deleted. When a user wants to discard their changes, e.g. if they start editing a contact, but then decide to cancel the edit, we delete the `form_change` record. Deleting a pending `form_change` is okay given that the corresponding form was never submitted by the user.

## Batch `form_change`, aka Project Revisions

To ensure data consistency, multiple database records may need to be updated in the same transaction. This is the case for the `project` records, which have multiple entities associated to them. At the time of writing, `project_manager` and `project_contact` are examples of tables with a foreign key to a `project`. More tables will be added in future iterations of the CIF application.

To allow the user to commit multiple `form_change` records within the same transaction, we use a `project_revision` table. `form_change` records have a nullable `project_revision_id` foreign key. A `project_revision` has a `change_status` and updates to that column cascade to the individual `form_change`. This means that committing a `project_revision` will automatically commit all of its `form_change`, allowing to batch updates within the same transaction. Following the logic above, `project_revision` records where `change_status = 'pending'` can be deleted and the deletion will cascade to the corresponding `form_change` records.

### Tracking history of project revisions

When looking at version control, one of two options is often used to store the history of changes: either a snapshot is used, storing the complete state of the documents at each revision, or a delta is used, only storing the changes between each revision and its parent.

When tracking the history of projects, using the `project_revision` table, we are using the snapshot approach. This means that:

- for a given `project_revision`, the complete snapshot of the project and its associated forms can be retrieved with a simple `join on form_change where form_change.project_revision_id = project_revision.id`
- when a `project_revision` is created (see the `cif.create_project_revision` function), all the `form_change` records from the previous revision are copied into the new revision.

Although it comes with a higher storage cost, with potentially unnecessary `form_change` records being created, this approach is simpler and results in more maintainable code.

A change to test CI
