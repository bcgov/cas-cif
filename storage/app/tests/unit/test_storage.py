import os
import unittest
import warnings
from app.tests.ordered_test_helper import ordered


class TestStorage(unittest.TestCase):
    test_file_path = f'../test_files/cif-test-document.docx'

    def setUp(self) -> None:
        warnings.simplefilter("ignore")

    @ordered
    def test_upload_file(self):
        pass

    @ordered
    def test_download_file(self):
        pass
