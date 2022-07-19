# CIF app disaster recovery

In case of a database corruption, crash or any other issue requiring us to restore the database to a previous state, the OpenShift `PostgresCluster` object allows us to restore the database from any point in time prior to the incident.

---

## Makefile target

To restore the database to any point in time, simply run:

```
make restore TARGET_TIMESTAMP="2022-05-24 14:20:00-07"
```

where:

- TARGET_TIMESTAMP should follow the format 'YYYY-MM-DD HH:MM:SS-ZZ'
- The ENVIRONMENT (dev,test,prod) and CIF_NAMESPACE_PREFIX, GGIRCS_NAMESPACE_PREFIX, CIIP_NAMESPACE_PREFIX environment variables are set

---

## Helm values

This section goes in depth with how to manually restore the database, all of the following is automated in the above `make` target.

To allow restoring with the [helm chart](https://github.com/bcgov/cas-cif/tree/develop/chart/cas-cif), the bucket provisioning and database pre-upgrade jobs have been disabled directly in the chart when the restore option is enabled.
A few more values need to be adjusted:

To avoid running some jobs and airflow DAGs:

```yaml
# chart/cas-cif/values.yaml
deploy-db:
  enabled: false
download-dags:
  enabled: false
```

To enable the restore option,

```yaml
# chart/cas-cif/values.yaml
db:
  restore:
    enabled: false
    targetTimestamp: "2022-06-06 13:00:00-07" # or the point in time at which to restore
```

Finally, to deploy the chart and restore the db,

```
helm upgrade <Deployment Name> chart/cas-cif/
```

---

## PostgresCluster object and Disaster recovery

The full documentation is available [here](https://access.crunchydata.com/documentation/postgres-operator/v5/tutorial/disaster-recovery/)
