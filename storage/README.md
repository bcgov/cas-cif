# Storage Micro-Service Application for CIF

## Description
The storage directory contains the FastAPI S3 api wrapper that is used to
upload and download attachment documents related to CIF Projects.

## Notes
The api allows upload, download, delete, and download files as a zip

## Test curl examples

### upload
curl -H "api-key: <api-key>" --form "files=@cif-test-document.docx" http://localhost:8000/api/v1/attachments/upload

### download
curl -X POST http://localhost:8000/api/v1/attachments/download -H "api-key: <api-key>" -H 'Content-Type: application/json' -d '{"attachment":{"uuid":"f16b738c-3afb-4c24-a64a-88d0d98dca1a"}}'
