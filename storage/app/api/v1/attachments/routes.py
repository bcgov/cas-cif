"""
Document storage endpoints
"""
from logging import getLogger
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header, Body, UploadFile, File
from app.schema import Attachment, Attachments, ApiKey
import app.api.v1.attachments.controller as controller
from app.core.api_key_authorization import get_api_key_authorizer

logger = getLogger("attachments")

router = APIRouter()


@router.post("/upload", response_model=Attachment)
def upload_attachement(
  files: UploadFile = File(...),
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Uploads a file attachment
    """
    return controller.upload_attachment(files)


@router.post("/delete", response_model=bool)
def delete_attachement(
  attachment: Attachment,
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Deletes a file attachment
    """
    return controller.delete_attachment(attachment.s3_path)


@router.post("/download")
def download_attachement(
  attachment: Attachment,
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Downloads a file attachment
    """
    return controller.download_attachment(attachment.s3_path)


@router.post("/zip")
def download_attachements(
  attachments: Attachments,
  api_key: ApiKey = Depends(get_api_key_authorizer())
):
    """
    Downloads multiple attachments in a zip file
    """
    return controller.download_attachments(attachments)
