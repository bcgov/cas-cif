# Dev Setup

To use docker-compose to setup the database and run migrations run the following.

```
docker-compose up
```

In a different terminal run the following after docker-compose has done it's thing.

```
bash setup-dev.sh
```

Some notes:

- dev/db/data is volume mapped to the database, delete this directory to reset the db
- sqitch runs during docker-compose and database is seeded with setup-dev.sh
