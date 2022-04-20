from fastapi import HTTPException
import io
from unittest import TestCase
from unittest.mock import patch
import uuid
import app.api.v1.attachments.controller as controller

import fastapi
import pytest
from pytest_mock import mocker
from app.schema import Attachment

# More info on patching: https://docs.python.org/3/library/unittest.mock.html#where-to-patch


@patch('app.api.v1.attachments.controller.s3_get_file_stats')
@patch('app.api.v1.attachments.controller.s3_get_file')
async def test_download_returns_a_streaming_response_with_headers(mock_s3_get_file, mock_s3_get_file_stats):
    mock_s3_get_file_stats.return_value.size = 12345
    mock_s3_get_file.return_value.read.side_effect = [b'1234', None]
    mock_s3_get_file.return_value.headers = {"test-header": "test-value"}

    result = controller.download_attachment("12345")

    assert isinstance(result, fastapi.responses.StreamingResponse)
    assert result.status_code == 200
    TestCase().assertDictEqual(dict(result.headers), {
        "test-header": "test-value", "fastapi-content-length": "12345"})
    async for item in result.body_iterator:
        assert item == b'1234'


@patch('app.api.v1.attachments.controller.s3_upload_raw_file')
@patch('uuid.uuid4')
def test_upload_returns_the_minio_response(mock_uuid, mock_upload):
    mock_uuid.return_value = uuid.UUID(int=0)

    result = controller.upload_attachment_raw(io.BytesIO(b"twelve bytes"))

    assert isinstance(result, Attachment)
    assert result.uuid == "00000000-0000-0000-0000-000000000000"

    call_args = mock_upload.call_args
    assert call_args[0][0] == 'attachments'
    assert call_args[0][1] == '00000000-0000-0000-0000-000000000000'
    assert call_args[0][2].read() == b'twelve bytes'
    assert call_args[0][3] == 12


@patch('app.api.v1.attachments.controller.s3_upload_raw_file')
def test_upload_throws_if_the_upload_fails(mock_upload):
    mock_upload.side_effect = Exception("test")

    with pytest.raises(HTTPException) as exc:
        controller.upload_attachment_raw(io.BytesIO(b"twelve bytes"))

    assert exc.value.status_code == 500
    assert exc.value.detail == "Unknown Error During Upload Process"
