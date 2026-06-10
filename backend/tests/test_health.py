def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "backend"}

def test_dashboard_stats(client):
    response = client.get("/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_fruits" in data
    assert "fresh_count" in data
    assert "rotten_count" in data
    assert "pending_count" in data
    assert "orphanage_count" in data
    assert "livestock_count" in data
    assert "compost_count" in data
    assert "total_kg" in data
