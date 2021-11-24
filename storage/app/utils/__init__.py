""" general utility functions """

import os
import uuid
from logging import getLogger

logger = getLogger("utils")


def get_file_ext(file_path: str) -> str:
    file_name, file_extension = os.path.splitext(file_path)
    return file_extension


def get_file_name(file_path: str) -> str:
    file_name, file_extension = os.path.splitext(file_path)
    return file_name


def generate_file_name(file_name: str) -> str:
    file_ext = get_file_ext(file_name)
    return f'{str(uuid.uuid4())}{file_ext}'


def validate_api_key(api_key: str) -> str:
    if api_key is None or len(api_key.strip()) != 32:
        raise ValueError('invalid api key')
    return api_key.strip()
