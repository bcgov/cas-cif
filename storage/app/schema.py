"""
API data models for Attachments.
"""
from pydantic import BaseModel, validator
from typing import Optional, List
from app.utils import validate_api_key


class Attachment(BaseModel):
    s3_path: Optional[str]

    class Config:
        orm_mode = True


class Attachments(BaseModel):
    attachments: List[Attachment]


class ApiKey(BaseModel):
    """
    an api key is a prettified simplified (dashes are removed) uuidv4
    """
    api_key: str

    @validator("api_key")
    def api_key_must_be_valid(cls, v):
        return validate_api_key(v)
