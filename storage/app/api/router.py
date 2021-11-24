"""
Registers endpoints from different apps.
"""
from fastapi import APIRouter

from app.api.v1.attachments import routes as attachments


api_router = APIRouter()

api_router.include_router(
    attachments.router,
    prefix="/attachments",
    tags=["attachments"],
    responses={404: {"description": "Not found"}},
)
