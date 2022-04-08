# -*- coding: utf-8 -*-
from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from reload_nginx_containers import reload_nginx_containers
from walg_backups import create_backup_task
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from airflow import DAG
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

TWO_DAYS_AGO = datetime.now() - timedelta(days=2)

DEPLOY_DB_DAG_NAME = 'cas_cif_deploy_db'
CERT_RENEWAL_DAG_NAME = 'cas_cif_acme_renewal'
CERT_ISSUE_DAG_NAME = 'cas_cif_acme_issue'
BACKUP_DAG_NAME = 'cas_cif_backup'

cif_namespace = os.getenv('CIF_NAMESPACE')

default_args = {
    **default_dag_args,
    'start_date': TWO_DAYS_AGO
}

"""
###############################################################################
#                                                                             #
# DAG triggering cron jobs to setup the cif database                       #
#                                                                             #
###############################################################################
"""


deploy_db_dag = DAG(DEPLOY_DB_DAG_NAME, schedule_interval=None,
    default_args=default_args, is_paused_upon_creation=False)

cif_db_init = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cif_db_init',
    op_args=['cas-cif-db-init', cif_namespace],
    dag=deploy_db_dag)

cif_app_schema = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cif_app_schema',
    op_args=['cas-cif-deploy-data', cif_namespace],
    dag=deploy_db_dag)

cif_import_operator = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cif_import_operator',
    op_args=['cas-cif-swrs-operator-import', cif_namespace],
    dag=deploy_db_dag)


cif_db_init >> cif_app_schema >> cif_import_operator

"""
###############################################################################
#                                                                             #
# DAG triggering the cas-cif-acme-renewal cron job                         #
#                                                                             #
###############################################################################
"""
SCHEDULE_INTERVAL = '0 8 * * *'

acme_renewal_args = {
    **default_dag_args,
    'start_date': TWO_DAYS_AGO,
    'is_paused_upon_creation': False
}

"""
DAG cas_cif_issue
Issues site certificates for the cif app
"""
acme_issue_dag = DAG(CERT_ISSUE_DAG_NAME,
                     schedule_interval=None, default_args=acme_renewal_args)

cron_acme_issue_task = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cas_cif_cert_issue',
    op_args=['cas-cif-acme-issue', cif_namespace],
    dag=acme_issue_dag)

"""
DAG cas_cif_acme_renewal
Renews site certificates for the cif app
"""
acme_renewal_dag = DAG(CERT_RENEWAL_DAG_NAME, schedule_interval=SCHEDULE_INTERVAL,
                       default_args=acme_renewal_args, is_paused_upon_creation=True)

cert_renewal_task = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cas_cif_cert_renewal',
    op_args=['cas-cif-acme-renewal', cif_namespace],
    dag=acme_renewal_dag)

reload_nginx_task = PythonOperator(
    python_callable=reload_nginx_containers,
    task_id='cas_cif_reload_nginx',
    op_args=['cas-cif', cif_namespace],
    dag=acme_renewal_dag)

cert_renewal_task >> reload_nginx_task
