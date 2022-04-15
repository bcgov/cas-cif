

# import os
# from unittest import mock
# import pytest
# import minio
# from fastapi import FastAPI
# from fastapi.testclient import TestClient
# from app.api.router import api_router as router_under_test

# app = FastAPI()
# app.include_router(router_under_test)


# testClient = TestClient(app)


# @pytest.fixture(autouse=True)
# def mock_env_vars():
#     with mock.patch(os.environ, {'MINIO_HOST_URL': ''}):
#         yield


# @pytest.fixture()
# def mock_minio_client():

#     def f():
#         print("TEST!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
#         return {'test': 'test'}

#     with mock.patch(minio.Minio) as mock_minio:
#         minio.Minio = f


# def test_one():
#     response = testClient.get("/attachments/download/12345")
#     assert response.status_code == 200
