"""
Document storage endpoints
"""
from logging import getLogger
from typing import List
from tempfile import SpooledTemporaryFile
from fastapi import APIRouter, Depends, HTTPException, Header, Body, UploadFile, File, Request
from app.schema import Attachment, Attachments, ApiKey
import app.api.v1.attachments.controller as controller
from app.core.api_key_authorization import get_api_key_authorizer

logger = getLogger("attachments")

router = APIRouter()


@router.post("/upload", response_model=Attachment)
async def upload_attachement(
  request: Request,
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Uploads a raw file attachment
    """
    data_file = SpooledTemporaryFile(mode='w+b')
    async for chunk in request.stream():
        data_file.write(chunk)
    data_file.seek(0)
    return controller.upload_attachment_raw(data_file)



@router.post("/delete", response_model=bool)
def delete_attachement(
  attachment: Attachment,
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Deletes a file attachment
    """
    return controller.delete_attachment(attachment.uuid)


@router.post("/download")
def download_attachement(
  attachment: Attachment,
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Downloads a file attachment
    """
    return controller.download_attachment(attachment.uuid)


@router.post("/zip")
def download_attachements(
  attachments: Attachments,
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Downloads multiple attachments in a zip file
    """
    return controller.download_attachments(attachments)
