FROM alpine/helm:3.10.2
ENV USER_ID=1001
ENV HOME=/root

WORKDIR ${HOME}
COPY database_backup_test/ ${HOME}/

RUN adduser --shell /bin/bash --home ${HOME} --uid ${USER_ID} --disabled-password helm_user
RUN chown -R helm_user:0 ${HOME} && chmod -R g+rwX ${HOME}

USER ${USER_ID}
