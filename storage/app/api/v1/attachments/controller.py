import os
import io
import sys
import magic
import shutil
import logging
import zipfile
from os import path
from pathlib import Path
from fastapi.responses import StreamingResponse, Response
from tempfile import NamedTemporaryFile
from app.schema import Attachment, Attachments
from fastapi import UploadFile, HTTPException, Depends
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_415_UNSUPPORTED_MEDIA_TYPE
from app.core.minio import s3_upload_file, s3_delete_file, s3_list_directory, s3_get_file
from app.utils import get_file_ext, get_file_name, generate_file_name
from app.config import ATTACHMENTS_BUCKET_NAME, ALLOWED_FILE_EXTENSIONS

logger = logging.getLogger("attachments")


def upload_attachment(files: UploadFile):
    file = files

    file_ext = get_file_ext(file.filename)
    # Kept for future use case
    # if file_ext not in ALLOWED_FILE_EXTENSIONS:
    #     logger.warning("upload_document - Unsupported media type")
    #     raise HTTPException(status_code=HTTP_415_UNSUPPORTED_MEDIA_TYPE,
    #                         detail=f'unsupported media type: {file_ext}')
    try:
        replacement_file_name = generate_file_name(file.filename)
        with NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_upload_file_path = Path(tmp.name)
            new_file_path = str(tmp_upload_file_path.resolve())
    except Exception as exc:
        error_msg = f'error: {sys.exc_info()[0]}'
        logger.error(
            f'upload_document - Unknown Error During Upload Process {error_msg}')
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f'Unknown Error During Upload Process - Stage 1')
    finally:
        if file.file:
            file.file.close()

    try:
        # get the content type
        mime = magic.Magic(mime=True)
        content_type = mime.from_file(new_file_path)
        s3_path = '{}'.format(replacement_file_name)
        # send file to minio
        upload = s3_upload_file(
            s3_path, new_file_path, content_type, ATTACHMENTS_BUCKET_NAME)

        attachment = Attachment(s3_path=s3_path, filename=file.filename)
        return attachment
    except FileNotFoundError as exc:
        logger.error(f'upload_file - unknown upload error - {str(exc)}')
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f'Unknown Error Uploading File - FileNotFound - {str(exc)}')
    except Exception as exc:
        error_msg = f'error: {sys.exc_info()[0]}'
        logger.error(
            f'upload_file - Unknown Error During Upload Process {error_msg} {exc}')
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f'Unknown Error During Upload Process')
    finally:
        try:
            tmp_upload_file_path.unlink()
        except:
            pass


def delete_attachment(s3_path: str):
    """ deletes an attachment object from storage """
    try:
        try:
            file_deleted = s3_delete_file(ATTACHMENTS_BUCKET_NAME, s3_path)
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


def download_attachment(attachment: Attachment):
    """ downloads an attachment to the client by s3_path """

    try:
        bucket_path = ATTACHMENTS_BUCKET_NAME
        response = StreamingResponse(s3_get_file(bucket_path, attachment.s3_path))
        # response.headers['Content-Disposition'] = attachment.filename
        return response
    except Exception as error:
        logger.warning(error)


def download_attachments(attachments: Attachments):
    """ gets all attachments and downloads them as a zip file """
    attachment_files = []

    for attachment in attachments:
        result = s3_get_file(ATTACHMENTS_BUCKET_NAME, attachment.s3_path)
        attachment_files.append({"filename": attachment.filename, "data": result.read()})

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
        for file in attachment_files:
            zip_file.writestr(file["filename"], file["data"])
    try:
        response = Response(zip_buffer.getvalue())
        response.headers['Content-Disposition'] = 'attachments.zip'
        return response
    except Exception as error:
        logger.warning(error)
