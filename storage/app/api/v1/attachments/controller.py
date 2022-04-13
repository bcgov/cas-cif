import io
import sys
import uuid
import logging
import zipfile
from fastapi.responses import StreamingResponse, Response
from app.schema import Attachment, Attachments
from fastapi import UploadFile, HTTPException, Depends
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from app.core.minio import s3_delete_file, s3_get_file, s3_get_file_stats, s3_upload_raw_file
from app.config import ATTACHMENTS_BUCKET_NAME

logger = logging.getLogger("attachments")


def s3_response_iterator(s3_response, chunk_size=2048):
    while 1:
        data = s3_response.read(chunk_size)
        if data:
            yield data
        else:
            break


def upload_attachment_raw(data):
    raw_data = io.BytesIO(data.read())
    raw_data_size = raw_data.getbuffer().nbytes
    uuid4 = str(uuid.uuid4())
    try:
        s3_upload_raw_file(ATTACHMENTS_BUCKET_NAME,
                           uuid4, raw_data, raw_data_size)
    except Exception as exc:
        error_msg = f'error: {sys.exc_info()[0]}'
        logger.error(
            f'upload_file - Unknown Error During Upload Process {error_msg} {exc} {exc.message}')
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

        stats = s3_get_file_stats(bucket_path, uuid)
        s3_response = s3_get_file(bucket_path, uuid)

        response = StreamingResponse(content=s3_response_iterator(s3_response))
        response.headers.update({
            'fastapi-content-length': str(stats.size),
        })

        return response
    except Exception as error:
        logger.warning(error)


def download_attachments(attachments: Attachments):
    """ gets all attachments and downloads them as a zip file """
    attachment_files = []

    for attachment in attachments:
        result = s3_get_file(ATTACHMENTS_BUCKET_NAME, attachment.uuid)
        attachment_files.append(
            {"uuid": attachment.uuid, "data": result.read()})

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
