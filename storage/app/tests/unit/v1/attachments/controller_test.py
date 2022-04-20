import io
from unittest import TestCase
from unittest.mock import patch
import uuid
import app.api.v1.attachments.controller as controller

import fastapi
from pytest_mock import mocker


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
    mock_upload.return_value = "abcd"

    result = controller.upload_attachment_raw(io.BytesIO(b"twelve bytes"))

    assert result == "abcd"

    call_args = mock_upload.call_args
    assert call_args[0][0] == 'attachments'
    assert call_args[0][1] == '00000000-0000-0000-0000-000000000000'
    assert call_args[0][2].read() == b'twelve bytes'
    assert call_args[0][3] == 12

    # LOOK HERE https://docs.python.org/3/library/unittest.mock.html#where-to-patch
