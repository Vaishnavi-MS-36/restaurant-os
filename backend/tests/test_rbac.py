def test_login_then_access_protected_route(client):
    login_response = client.post(
        "/auth/login",
        data={"username": "owner@restaurantos.com", "password": "test1234"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    menu_response = client.get(
        "/menu/items",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert menu_response.status_code == 200

def test_waiter_cannot_create_menu_item(client):
    # Register a waiter account for this test
    client.post(
        "/auth/register",
        json={"name": "Test Waiter", "email": "test-waiter@restaurantos.com", "password": "waiter1234", "role": "waiter"},
    )
    login_response = client.post(
        "/auth/login",
        data={"username": "test-waiter@restaurantos.com", "password": "waiter1234"},
    )
    token = login_response.json()["access_token"]

    response = client.post(
        "/menu/items",
        json={"name": "Unauthorized Item", "price": 100},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
