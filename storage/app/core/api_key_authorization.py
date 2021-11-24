from fastapi import Depends, Header
from starlette.exceptions import HTTPException
from starlette.status import HTTP_403_FORBIDDEN
from fastapi.security import APIKeyHeader
from app.schema import ApiKey
from app.config import STORAGE_API_KEY


def _get_api_key(api_key: str = Header(...)) -> str:
    return api_key


def get_api_key_authorizer(*, required: bool = True) -> ApiKey:
    return _get_authorize_api_request


async def _get_authorize_api_request(api_key: str = Depends(_get_api_key)) -> ApiKey:
    """
    checks whether the api key matches the environment variable
    """
    try:
        if api_key == STORAGE_API_KEY:
            return ApiKey(api_key=api_key)
        else:
            raise Exception('invalid api key')
    except Exception as exc:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="invalid api key"
        )

auth_scheme = APIKeyHeader
