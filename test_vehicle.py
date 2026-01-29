import subprocess
import time
import requests
import pytest
import json

BASE_URL = "http://localhost:3000/vehicle"

@pytest.fixture(scope="module", autouse=True)
def start_server():
    """Start Node server before tests and stop it after."""
    proc = subprocess.Popen(['node', 'server.js'])
    time.sleep(2)
    yield
    proc.terminate()
    proc.wait()

def test_post_vehicle_success():
    data = {
        "manufacturer_name": "Rimac",
        "description": "Nevera hypercar",
        "horsepower": 1914,
        "model_name": "Nevera",
        "model_year": 2026,
        "purchase_price": 2250000,
        "fuel_type": "Electric"
    }
    res = requests.post(BASE_URL, json=data)
    assert res.status_code == 201
    json_data = res.json()
    assert "vin" in json_data
    assert json_data["manufacturer_name"] == "Rimac"
    global TEST_VIN
    TEST_VIN = json_data["vin"]

def test_post_vehicle_empty_body():
    res = requests.post(BASE_URL, json={})
    assert res.status_code == 400
    assert "error" in res.json()

def test_post_vehicle_missing_fields():
    data = {
        "manufacturer_name": "Rimac",
        "horsepower": 1914
    }
    res = requests.post(BASE_URL, json=data)
    assert res.status_code == 422
    assert "errors" in res.json()
    assert len(res.json()["errors"]) > 0

def test_get_all_vehicles():
    res = requests.get(BASE_URL)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert any(v["vin"] == TEST_VIN for v in res.json())

def test_get_vehicle_by_vin():
    res = requests.get(f"{BASE_URL}/{TEST_VIN}")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["vin"] == TEST_VIN
    assert json_data["manufacturer_name"] == "Rimac"

def test_get_vehicle_invalid_vin():
    res = requests.get(f"{BASE_URL}/INVALIDVIN1234567")
    assert res.status_code in (400, 404)

def test_put_vehicle_success():
    data = {
        "manufacturer_name": "Rimac Updated",
        "description": "Nevera hypercar updated",
        "horsepower": 1920,
        "model_name": "Nevera X",
        "model_year": 2027,
        "purchase_price": 2300000,
        "fuel_type": "Electric"
    }
    res = requests.put(f"{BASE_URL}/{TEST_VIN}", json=data)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["manufacturer_name"] == "Rimac Updated"

def test_put_vehicle_not_found():
    data = {
        "manufacturer_name": "Test",
        "horsepower": 100,
        "model_name": "Test",
        "model_year": 2020,
        "purchase_price": 1000,
        "fuel_type": "Gas"
    }
    res = requests.put(f"{BASE_URL}/NONEXISTENTVIN123", json=data)
    assert res.status_code == 404

def test_delete_vehicle_success():
    res = requests.delete(f"{BASE_URL}/{TEST_VIN}")
    assert res.status_code == 204

def test_delete_vehicle_not_found():
    res = requests.delete(f"{BASE_URL}/{TEST_VIN}")
    assert res.status_code == 404

def test_post_vehicle_malformed_json():
    headers = {"Content-Type": "application/json"}
    malformed = '{"manufacturer_name": "Rimac", "horsepower": 1914'  
    res = requests.post(BASE_URL, data=malformed, headers=headers)
    assert res.status_code == 400
    assert "Malformed JSON" in res.json()["error"]