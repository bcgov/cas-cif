# CIF app disaster recovery

In case of a database corruption, crash or any other issue requiring us to restore the database to a previous state, the OpenShift `PostgresCluster` object allows us to restore the database from any point in time prior to the incident.

## `make` target

To restore the database to any point in time, simply run:

```
make restore TARGET_TIMESTAMP="2022-05-24 14:20:00-07"
```

where:

- TARGET_TIMESTAMP should follow the format 'YYYY-MM-DD HH:MM:SS-ZZ'
- The ENVIRONMENT (dev,test,prod) and CIF_NAMESPACE_PREFIX, GGIRCS_NAMESPACE_PREFIX, CIIP_NAMESPACE_PREFIX environment variables are set

## Helm values

To enable
