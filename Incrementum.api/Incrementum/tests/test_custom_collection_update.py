import pytest
from django.test import Client
from unittest.mock import patch, MagicMock
from Incrementum.models.custom_collection import CustomCollection
from Incrementum.models.account import Account


@pytest.fixture
def client():
    return Client()


@pytest.fixture
def mock_account():
    # mock account for testing.
    account = MagicMock(spec=Account)
    account.api_key = 'test-api-key-123'
    account.id = 1
    return account


@pytest.fixture
def mock_collection(mock_account):
    # mock account for testing.
    collection = MagicMock(spec=CustomCollection)
    collection.id = 1
    collection.collection_name = 'Original Collection'
    collection.c_desc = 'Original description'
    collection.account = mock_account
    collection.save = MagicMock()
    return collection


@pytest.mark.django_db
class TestCustomCollectionUpdate:
    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_collection_name(self, mock_service, client, mock_collection):
        mock_instance = mock_service.return_value
        mock_instance.update_collection.return_value = mock_collection
        mock_collection.collection_name = 'New Collection Name'

        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Original Collection',
                'new_name': 'New Collection Name'
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['collection']['name'] == 'New Collection Name'
        mock_instance.update_collection.assert_called_once_with(
            'test-api-key-123',
            'Original Collection',
            new_name='New Collection Name',
            new_desc=None
        )

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_collection_description(self, mock_service, client, mock_collection):
        mock_instance = mock_service.return_value
        mock_instance.update_collection.return_value = mock_collection
        mock_collection.c_desc = 'New description here'

        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Original Collection',
                'new_desc': 'New description here'
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['collection']['desc'] == 'New description here'
        mock_instance.update_collection.assert_called_once_with(
            'test-api-key-123',
            'Original Collection',
            new_name=None,
            new_desc='New description here'
        )

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_collection_name_and_description(self, mock_service, client, mock_collection):
        mock_instance = mock_service.return_value
        mock_instance.update_collection.return_value = mock_collection
        mock_collection.collection_name = 'Updated Collection'
        mock_collection.c_desc = 'Updated description'

        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Original Collection',
                'new_name': 'Updated Collection',
                'new_desc': 'Updated description'
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['collection']['name'] == 'Updated Collection'
        assert data['collection']['desc'] == 'Updated description'
        mock_instance.update_collection.assert_called_once_with(
            'test-api-key-123',
            'Original Collection',
            new_name='Updated Collection',
            new_desc='Updated description'
        )

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_nonexistent_collection(self, mock_service, client):
        mock_instance = mock_service.return_value
        mock_instance.update_collection.side_effect = ValueError(
            "Collection 'Nonexistent' not found"
        )

        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Nonexistent',
                'new_name': 'New Name'
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        assert "not found" in data['error']

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_to_existing_name(self, mock_service, client):
        mock_instance = mock_service.return_value
        mock_instance.update_collection.side_effect = ValueError(
            "Collection 'Existing Collection' already exists"
        )

        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Original Collection',
                'new_name': 'Existing Collection'
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        assert "already exists" in data['error']

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_without_parameters(self, mock_service, client):
        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Original Collection'
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        assert 'new_name or new_desc is required' in data['error']

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_without_api_key(self, mock_service, client):
        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Original Collection',
                'new_name': 'New Name'
            },
            content_type='application/json'
        )

        assert response.status_code == 401
        data = response.json()
        assert 'error' in data
        assert 'X-User-Id required' in data['error']

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_without_collection_name(self, mock_service, client):
        response = client.put(
            '/custom-collection/',
            data={
                'new_name': 'New Name'
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        assert 'collection name is required' in data['error']

    @patch('Incrementum.custom_collection_controller.CustomCollectionService')
    def test_update_collection_clear_description(self, mock_service, client, mock_collection):
        mock_instance = mock_service.return_value
        mock_instance.update_collection.return_value = mock_collection
        mock_collection.c_desc = ''

        response = client.put(
            '/custom-collection/',
            data={
                'collection': 'Original Collection',
                'new_desc': ''
            },
            content_type='application/json',
            HTTP_X_USER_ID='test-api-key-123'
        )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['collection']['desc'] == ''
