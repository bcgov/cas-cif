# -*- coding: utf-8 -*-
from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.standard.operators.python import PythonOperator
from datetime import datetime, timedelta
from airflow.decorators import dag, task
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

TWO_DAYS_AGO = datetime.now() - timedelta(days=2)

DEPLOY_DB_DAG_NAME = 'cas_cif_deploy_db'
TEST_DB_BACKUPS_DAG_NAME = 'cas_cif_test_db_backups'
INSERT_BACKUP_TIMESTAMP_DAG_NAME = 'cas_cif_insert_backup_timestamp'

cif_namespace = os.getenv('CIF_NAMESPACE')

default_args = {
    **default_dag_args,
    'start_date': TWO_DAYS_AGO
}

default_backup_test_args = {
    **default_dag_args,
    'start_date': TWO_DAYS_AGO,
    'retries': 0
}

CIF_DEPLOY_DB_DOC = """
DAG triggering cron jobs to setup the cif database
"""

@dag(
    dag_id=DEPLOY_DB_DAG_NAME,
    schedule=None,
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=CIF_DEPLOY_DB_DOC,
)
def cif_deploy_db():
    @task
    def cif_db_init():
        trigger_k8s_cronjob('cas-cif-db-init', cif_namespace)

    @task
    def cif_app_schema():
        trigger_k8s_cronjob('cas-cif-deploy-data', cif_namespace)

    @task
    def cif_import_operator():
        trigger_k8s_cronjob('cas-cif-swrs-operator-import', cif_namespace)

    cif_db_init() >> cif_app_schema() >> cif_import_operator()

cif_deploy_db()


CIF_BACKUP_TEST_DOC = """
DAG to test database backup integrity
"""

@dag(
    dag_id=TEST_DB_BACKUPS_DAG_NAME,
    schedule=None,
    default_args=default_backup_test_args,
    is_paused_upon_creation=False,
    doc_md=CIF_BACKUP_TEST_DOC,
)
def cif_backup_test():
    @task
    def deploy_and_restore():
        trigger_k8s_cronjob('deploy-database-backups', cif_namespace)

    @task
    def test_backups():
        trigger_k8s_cronjob('test-database-backups', cif_namespace)

    deploy_and_restore() >> test_backups()

cif_backup_test()


CIF_INSERT_TIMESTAMP_DOC = """
DAG to insert timestamp for backup testing
"""

@dag(
    dag_id=INSERT_BACKUP_TIMESTAMP_DAG_NAME,
    schedule=None,
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=CIF_INSERT_TIMESTAMP_DOC,
)
def cif_insert_timestamp():
    @task
    def insert_timestamp():
        trigger_k8s_cronjob('insert-backup-test-timestamp', cif_namespace)

    insert_timestamp()

cif_insert_timestamp
