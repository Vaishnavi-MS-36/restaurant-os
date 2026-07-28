def test_login_with_invalid_credentials_fails(client):
    response = client.post(
        "/auth/login",
        data={"username": "nonexistent@test.com", "password": "wrongpass"},
    )
    assert response.status_code == 401

def test_register_requires_valid_email(client):
    response = client.post(
        "/auth/register",
        json={"name": "Test User", "email": "not-an-email", "password": "test1234", "role": "waiter"},
    )
    assert response.status_code == 422

def test_protected_route_requires_auth(client):
    response = client.get("/menu/items")
    assert response.status_code == 401
