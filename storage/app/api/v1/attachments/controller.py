import os
import io
import sys
import magic
import shutil
import uuid
import logging
import zipfile
from os import path, replace
from pathlib import Path
from fastapi.responses import StreamingResponse, Response
from tempfile import NamedTemporaryFile
from app.schema import Attachment, Attachments
from fastapi import UploadFile, HTTPException, Depends
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_415_UNSUPPORTED_MEDIA_TYPE
from app.core.minio import s3_upload_file, s3_delete_file, s3_list_directory, s3_get_file, s3_upload_raw_file
from app.utils import get_file_ext, get_file_name, generate_file_name
from app.config import ATTACHMENTS_BUCKET_NAME, ALLOWED_FILE_EXTENSIONS

logger = logging.getLogger("attachments")


def upload_attachment_raw(data):
    raw_data = io.BytesIO(data.read())
    raw_data_size = raw_data.getbuffer().nbytes
    uuid4 = str(uuid.uuid4())
    try:
        s3_upload_raw_file(ATTACHMENTS_BUCKET_NAME, uuid4, raw_data, raw_data_size)
    except Exception as exc:
        error_msg = f'error: {sys.exc_info()[0]}'
        logger.error(
            f'upload_file - Unknown Error During Upload Process {error_msg} {exc}')
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f'Unknown Error During Upload Process')

    return Attachment(uuid=uuid4)


def delete_attachment(uuid: str):
    """ deletes an attachment object from storage """
    try:
        try:
            file_deleted = s3_delete_file(ATTACHMENTS_BUCKET_NAME, uuid)
        except Exception as exc:
            error_msg = f'error: {sys.exc_info()[0]}'
            logger.error(
                f'delete_attachment - Unknown Error During Delete Process {error_msg} {exc}')
            raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f'Unknown Error During Document Delete Process')
        return True
    except FileNotFoundError as exc:
        logger.error(
                    f'delete_attachment - FileNotFound - {error_msg} {exc}')
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f'FileNotFound')
        return False


def download_attachment(uuid: str):
    """ downloads an attachment to the client by uuid """

    try:
        bucket_path = ATTACHMENTS_BUCKET_NAME
        response = StreamingResponse(s3_get_file(bucket_path, uuid))
        return response
    except Exception as error:
        logger.warning(error)


def download_attachments(attachments: Attachments):
    """ gets all attachments and downloads them as a zip file """
    attachment_files = []

    for attachment in attachments:
        result = s3_get_file(ATTACHMENTS_BUCKET_NAME, attachment.uuid)
        attachment_files.append({"uuid": attachment.uuid, "data": result.read()})

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
        for file in attachment_files:
            zip_file.writestr(file["uuid"], file["data"])
    try:
        response = Response(zip_buffer.getvalue())
        response.headers['Content-Disposition'] = 'attachments.zip'
        return response
    except Exception as error:
        logger.warning(error)
