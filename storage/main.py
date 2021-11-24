"""
Main application entrypoint that initializes FastAPI and registers the endpoints defined in api/router.py.
"""

from fastapi import FastAPI
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.requests import Request
from starlette.responses import Response
import logging
# from app.core.auth import ApiKeyAuthorizer

from starlette_exporter import handle_metrics

from app import config
from app.api.router import api_router

storage_api = FastAPI(title=config.PROJECT_NAME,
                    openapi_url="/api/v1/openapi.json")

storage_api.add_route("/metrics", handle_metrics)

# storage_api.add_middleware(AuthenticationMiddleware, backend=ApiKeyAuthorizer())

# CORS
origins = ["*"]

# Set all CORS enabled origins
if config.BACKEND_CORS_ORIGINS:
    origins_raw = config.BACKEND_CORS_ORIGINS.split(",")
    for origin in origins_raw:
        use_origin = origin.strip()
        origins.append(use_origin)
    storage_api.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"]
    ),

storage_api.add_middleware(GZipMiddleware)

storage_api.include_router(api_router, prefix=config.API_V1_STR)

@storage_api.get("/health")
def health_check():
    return Response(status_code=200, content=b"")
