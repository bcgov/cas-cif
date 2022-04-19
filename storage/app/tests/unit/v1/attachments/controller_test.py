from unittest import TestCase
from unittest.mock import patch
import app.api.v1.attachments.controller as controller

import fastapi


@patch('app.api.v1.attachments.controller.s3_get_file_stats')
@patch('app.api.v1.attachments.controller.s3_get_file')
async def test_download_returns_a_streaming_response(mock_s3_get_file, mock_s3_get_file_stats):
    mock_s3_get_file_stats.return_value.size = 12345
    mock_s3_get_file.return_value.read.side_effect = [b'1234', None]

    result = controller.download_attachment("12345")

    assert isinstance(result, fastapi.responses.StreamingResponse)
    assert result.status_code == 200
    assert result.headers['fastapi-content-length'] == '12345'
    async for item in result.body_iterator:
        assert item == b'1234'


# LOOK HERE https://docs.python.org/3/library/unittest.mock.html#where-to-patch
