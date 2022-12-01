FROM alpine/k8s:1.23.14
ENV USER_ID=1001
ENV HOME=/root

WORKDIR ${HOME}
COPY database_backup_test/ ${HOME}/

RUN adduser --shell /bin/bash --home ${HOME} --uid ${USER_ID} helm_user
RUN chown -R helm_user:0 ${HOME} && chmod -R g+rwX ${HOME}

USER ${USER_ID}
