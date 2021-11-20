FROM python:3.7

WORKDIR /storage

RUN useradd cif -M -G root -u 1021 && chmod -R 775 /storage \
  && chown -R cif:root /storage \
  && apt-get update

COPY . ./
RUN pip install -r ./requirements.txt

ENV PYTHONPATH=/storage

EXPOSE 8000
USER 1021

ENTRYPOINT ["/storage/start.sh"]
