SHELL := /usr/bin/env bash
__FILENAME := $(lastword $(MAKEFILE_LIST))
__DIRNAME := $(abspath $(realpath $(lastword $(MAKEFILE_LIST)))/../)
PERL=perl
PERL_VERSION=${shell ${PERL} -e 'print substr($$^V, 1)'}
PERL_MIN_VERSION=5.10
PSQL=psql -h localhost
CPAN=cpan
# CPANM home has to be in the current directory, so that it can find the
# pg_config executable, installed via asdf
CPANM=PERL_CPANM_HOME=$(__DIRNAME)/.cpanm cpanm --notest
SQITCH=sqitch
SQITCH_VERSION=${word 3,${shell ${SQITCH} --version}}
SQITCH_MIN_VERSION=1.1.0
DB_NAME=cif
PG_PROVE=pg_prove -h localhost
PGTAP_VERSION=1.3.3

help: ## Show this help.
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

.PHONY: install_asdf_tools
install_asdf_tools: ## install languages runtimes and tools specified in .tool-versions
install_asdf_tools:
	@cat .tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin-add || true
	@asdf plugin-update --all
	@#MAKELEVEL=0 is required because of https://www.postgresql.org/message-id/1118.1538056039%40sss.pgh.pa.us
	@MAKELEVEL=0 POSTGRES_EXTRA_CONFIGURE_OPTIONS='--with-libxml' asdf install
	@asdf reshim
	@pip install -r requirements.txt
	@asdf reshim

.PHONY: install_pgtap
install_pgtap: ## install pgTAP extension into postgres
install_pgtap: start_pg
install_pgtap:
	@$(PSQL) -d postgres -tc "select count(*) from pg_available_extensions where name='pgtap' and default_version='$(PGTAP_VERSION)';" | \
		grep -q 1 || \
		(git clone https://github.com/theory/pgtap.git --depth 1 --branch v$(PGTAP_VERSION) && \
		$(MAKE) -C pgtap && \
		$(MAKE) -C pgtap install && \
		$(MAKE) -C pgtap installcheck && \
		rm -rf pgtap)

.PHONY: install_cpanm
install_cpanm: ## install the cpanm tool
install_cpanm:
ifeq ($(shell which $(word 2,$(CPANM))),)
	# install cpanm
	@$(CPAN) App::cpanminus
endif

.PHONY: install_cpandeps
install_cpandeps: ## install Perl dependencies from cpanfile
install_cpandeps:
	@$(CPANM) --installdeps .
	@rm -rf $(__DIRNAME)/.cpanm

.PHONY: postinstall_check
postinstall_check: ## check that the installation was successful and that the correct sqitch version is available in the PATH
postinstall_check:
	@printf '%s\n%s\n' "${SQITCH_MIN_VERSION}" "${SQITCH_VERSION}" | sort -CV ||\
 	(echo "FATAL: sqitch version should be at least ${SQITCH_MIN_VERSION}. Make sure the sqitch executable installed by cpanminus is available has the highest priority in the PATH" && exit 1);

.PHONY: install_perl_tools
install_perl_tools: ## install cpanm and sqitch
install_perl_tools: install_cpanm install_cpandeps postinstall_check

.PHONY: install_dev_tools
install_dev_tools: ## install development tools
install_dev_tools: stop_pg install_asdf_tools install_perl_tools install_pgtap

.PHONY: start_pg
start_pg: ## start the database server if it is not running
start_pg:
	@pg_ctl status || pg_ctl start

.PHONY: stop_pg
stop_pg: ## stop the database server. Always exits with 0
stop_pg:
	@pg_ctl stop; true

.PHONY: create_db
create_db: ## Ensure that the $(DB_NAME) database exists
create_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 1 || \
		$(PSQL) -d postgres -c "CREATE DATABASE $(DB_NAME)" && \
		$(PSQL) -d $(DB_NAME) -c "create extension if not exists pgtap";

.PHONY: drop_db
drop_db: ## Drop the $(DB_NAME) database if it exists
drop_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 0 || \
		$(PSQL) -d postgres -c "DROP DATABASE $(DB_NAME)";

.PHONY: create_test_db
create_test_db: ## Ensure that the $(DB_NAME)_test database exists
create_test_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)_test'" | \
		grep -q 1 || \
		$(PSQL) -d postgres -c "CREATE DATABASE $(DB_NAME)_test" &&\
		$(PSQL) -d $(DB_NAME)_test -c "create extension if not exists pgtap";

.PHONY: drop_foreign_test_db
drop_foreign_test_db: ## Drop the $(DB_NAME) database if it exists
drop_foreign_test_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = 'foreign_test_db'" | \
		grep -q 0 || \
		$(PSQL) -d postgres -c "DROP DATABASE foreign_test_db" && \
		$(PSQL) -d postgres -c "DROP USER IF EXISTS foreign_user";

.PHONY: create_foreign_test_db
create_foreign_test_db: ## Ensure that the $(DB_NAME)_test database exists
create_foreign_test_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = 'foreign_test_db'" | \
		grep -q 1 || \
		$(PSQL) -d postgres -c "CREATE DATABASE foreign_test_db" &&\
		$(PSQL) -d foreign_test_db -f "./schema/data/test_setup/external_database_setup.sql" &&\
		$(PSQL) -d $(DB_NAME)_test -c "create extension if not exists postgres_fdw";

.PHONY: drop_test_db
drop_test_db: ## Drop the $(DB_NAME)_test database if it exists
drop_test_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)_test'" | \
		grep -q 0 || \
		$(PSQL) -d postgres -c "DROP DATABASE $(DB_NAME)_test";

.PHONY: deploy_db_migrations
deploy_db_migrations: ## deploy the database migrations with sqitch
deploy_db_migrations: start_pg create_db
deploy_db_migrations:
	@$(SQITCH) --chdir schema deploy
	@$(SQITCH) --chdir mocks_schema deploy

deploy_dev_data: ## deploy the database migrations with sqitch and load the data for local development
deploy_dev_data: | deploy_db_migrations
deploy_dev_data:
	@for file in $(__DIRNAME)/schema/data/dev/*; do \
		$(PSQL) -d $(DB_NAME) -f "$${file}"; \
	done;

.PHONY: revert_db_migrations
revert_db_migrations: ## revert the database migrations with sqitch
revert_db_migrations: start_pg
revert_db_migrations:
	@$(SQITCH) --chdir schema revert
	@$(SQITCH) --chdir mocks_schema revert

.PHONY: test_revert_migrations
test_revert_migrations: ## revert the database migrations with sqitch
test_revert_migrations: | deploy_db_migrations
test_revert_migrations:
	@$(SQITCH) --chdir schema revert -y
	@$(SQITCH) --chdir schema deploy

.PHONY: verify_db_migrations
verify_db_migrations: ## verify the database migrations with sqitch
verify_db_migrations: start_pg
verify_db_migrations:
	@$(SQITCH) --chdir schema verify
	@$(SQITCH) --chdir mocks_schema verify

.PHONY: deploy_test_db_migrations
deploy_test_db_migrations: ## deploy the test database migrations with sqitch
deploy_test_db_migrations: start_pg create_test_db
deploy_test_db_migrations:
	@SQITCH_TARGET="db:pg:" PGHOST=localhost PGDATABASE=$(DB_NAME)_test $(SQITCH) --chdir schema deploy
	@SQITCH_TARGET="db:pg:" PGHOST=localhost PGDATABASE=$(DB_NAME)_test $(SQITCH) --chdir mocks_schema deploy

.PHONY: revert_test_db_migrations
revert_test_db_migrations: ## revert the test database migrations with sqitch
revert_test_db_migrations: start_pg
revert_test_db_migrations:
	@SQITCH_TARGET="db:pg:" PGHOST=localhost PGDATABASE=$(DB_NAME)_test $(SQITCH) --chdir schema revert
	@SQITCH_TARGET="db:pg:" PGHOST=localhost PGDATABASE=$(DB_NAME)_test $(SQITCH) --chdir mocks_schema revert

.PHONY: verify_test_db_migrations
verify_test_db_migrations: ## verify the test database migrations with sqitch
verify_test_db_migrations: start_pg
verify_test_db_migrations:
	@SQITCH_TARGET="db:pg:" PGHOST=localhost PGDATABASE=$(DB_NAME)_test $(SQITCH) --chdir schema verify
	@SQITCH_TARGET="db:pg:" PGHOST=localhost PGDATABASE=$(DB_NAME)_test $(SQITCH) --chdir mocks_schema verify

.PHONY: db_unit_tests
db_unit_tests: ## run the database unit tests
db_unit_tests: PGDATABASE=$(DB_NAME)_test
db_unit_tests: | start_pg drop_test_db create_test_db drop_foreign_test_db create_foreign_test_db deploy_test_db_migrations
db_unit_tests:
	@$(PG_PROVE) --failures -d $(PGDATABASE) schema/test/unit/**/*_test.sql
	@$(PG_PROVE) --failures -d $(PGDATABASE) mocks_schema/test/**/*_test.sql

.PHONY: db_style_tests
db_style_tests: ## run the database style tests
db_style_tests: | start_pg deploy_test_db_migrations
db_style_tests:
	@$(PG_PROVE) --failures -d $(DB_NAME)_test schema/test/style/*_test.sql --set schemas_to_test=cif,cif_private

.PHONY: lint_chart
lint_chart: ## Checks the configured helm chart template definitions against the remote schema
lint_chart:
	@set -euo pipefail; \
	helm dep up ./chart/cas-cif; \
	helm template --set ggircs.namespace=dummy-namespace --set ciip.prefix=ciip-prefix -f ./chart/cas-cif/values-dev.yaml cas-cif ./chart/cas-cif --validate;


check_environment: ## Making sure the environment is properly configured for helm
check_environment:
	@set -euo pipefail; \
	if [ -z '$(CIF_NAMESPACE_PREFIX)' ]; then \
		echo "CIF_NAMESPACE_PREFIX is not set"; \
		exit 1; \
	fi; \
	if [ -z '$(GGIRCS_NAMESPACE_PREFIX)' ]; then \
		echo "GGIRCS_NAMESPACE_PREFIX is not set"; \
		exit 1; \
	fi; \
	if [ -z '$(CIIP_NAMESPACE_PREFIX)' ]; then \
		echo "CIIP_NAMESPACE_PREFIX is not set"; \
		exit 1; \
	fi; \
	if [ -z '$(ENVIRONMENT)' ]; then \
		echo "ENVIRONMENT is not set"; \
		exit 1; \
	fi; \


.PHONY: install
install: ## Installs the helm chart on the OpenShift cluster
install: check_environment
install:
install: GIT_SHA1=$(shell git rev-parse HEAD)
install: IMAGE_TAG=$(GIT_SHA1)
install: NAMESPACE=$(CIF_NAMESPACE_PREFIX)-$(ENVIRONMENT)
install: GGIRCS_NAMESPACE=$(GGIRCS_NAMESPACE_PREFIX)-$(ENVIRONMENT)
install: CHART_DIR=./chart/cas-cif
install: CHART_INSTANCE=cas-cif
install: HELM_OPTS=--atomic --wait-for-jobs --timeout 2400s --namespace $(NAMESPACE) \
										--set defaultImageTag=$(IMAGE_TAG) \
	  								--set download-dags.dagConfiguration="$$dagConfig" \
										--set ggircs.namespace=$(GGIRCS_NAMESPACE) \
										--set ciip.prefix=$(CIIP_NAMESPACE_PREFIX) \
										--values $(CHART_DIR)/values-$(ENVIRONMENT).yaml
install:
	@set -euo pipefail; \
	dagConfig=$$(echo '{"org": "bcgov", "repo": "cas-cif", "ref": "$(GIT_SHA1)", "path": "dags/cas_cif_dags.py"}' | base64 -w0); \
	helm dep up $(CHART_DIR); \
	if ! helm status --namespace $(NAMESPACE) $(CHART_INSTANCE); then \
		echo 'Installing the application and issuing SSL certificate'; \
		helm install $(HELM_OPTS) $(CHART_INSTANCE) $(CHART_DIR); \
	elif [ $(ISSUE_CERT) ]; then \
		helm upgrade $(HELM_OPTS) $(CHART_INSTANCE) $(CHART_DIR); \
	else \
		helm upgrade $(HELM_OPTS) $(CHART_INSTANCE) $(CHART_DIR); \
	fi;


restore_prereq: ## Prerequisites for the restore target
restore_prereq:
	@set -euo pipefail; \
	if [ -z '$(TARGET_TIMESTAMP)' ]; then \
		echo "TARGET_TIMESTAMP value for the database restore is not set"; \
		echo "usage:"; \
		echo "  make restore TARGET_TIMESTAMP=\"YYYY-MM-DD HH:MM:SS-ZZ\""; \
		exit 1; \
	fi; \


.PHONY: restore
restore: # Restores the database to the latest backed-up state available at or before the TARGET_TIMESTAMP
restore: # TARGET_TIMESTAMP must be in the format "2020-08-22 19:31:00-07"
restore: check_environment
restore: restore_prereq
restore:
restore: GIT_SHA1=$(shell git rev-parse HEAD)
restore: IMAGE_TAG=$(GIT_SHA1)
restore: NAMESPACE=$(CIF_NAMESPACE_PREFIX)-$(ENVIRONMENT)
restore: GGIRCS_NAMESPACE=$(GGIRCS_NAMESPACE_PREFIX)-$(ENVIRONMENT)
restore: CHART_DIR=./chart/cas-cif
restore: CHART_INSTANCE=cas-cif
restore: # We make sure to use the same image tag as the current release
restore: HELM_OPTS=--atomic --wait-for-jobs --timeout 2400s --namespace $(NAMESPACE) \
										--set defaultImageTag=$$(helm get values cas-cif | grep defaultImageTag | cut -d' ' -f 2-) \
										--set ggircs.namespace=$(GGIRCS_NAMESPACE) \
										--set ciip.prefix=$(CIIP_NAMESPACE_PREFIX) \
										--set deploy-db.enabled=false \
										--set download-dags.enabled=false \
										--set db.restore.enabled=true \
										--set db.restore.targetTimestamp="$(TARGET_TIMESTAMP)" \
										--values $(CHART_DIR)/values-$(ENVIRONMENT).yaml
restore:
	@set -euxo pipefail; \
	if ! helm status --namespace $(NAMESPACE) $(CHART_INSTANCE); then \
		echo 'Could not find an installed helm release of $(CHART_INSTANCE) in $(NAMESPACE)'; \
		exit 1; \
	fi; \
	helm dep up $(CHART_DIR); \
	helm upgrade $(HELM_OPTS) $(CHART_INSTANCE) $(CHART_DIR); \
	echo "Restore initiated - wait until restore pod is completed to redeploy with 'make install'.";


.PHONY: release
release: ## Tag a release using release-it
release:
	@yarn
	@yarn release-it
