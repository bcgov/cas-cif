

from unittest import TestCase
import app.api.v1.attachments.controller as controller
from unittest.mock import patch


class TestController(TestCase):

    @patch('app.api.v1.attachments.controller.s3_get_file_stats')
    @patch('app.api.v1.attachments.controller.s3_get_file')
    def test_download(self, mock_s3_get_file_stats, mock_s3_get_file):
        mock_s3_get_file_stats.return_value = {'size': 12345}
        mock_s3_get_file.return_value = {}

        result = controller.download_attachment("12345")
        assert result.status_code == 201


# LOOK HERE https://docs.python.org/3/library/unittest.mock.html#where-to-patch
