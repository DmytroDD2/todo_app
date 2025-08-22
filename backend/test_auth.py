#!/usr/bin/env python3
"""
Simple test script to verify authentication is working.
"""
import requests
import json
import random

BASE_URL = "http://localhost:8000"

def test_auth():
    print("Testing Authentication System...")
    
    # Generate a unique email
    random_num = random.randint(1000, 9999)
    test_email = f"test{random_num}@example.com"
    
    # Test registration
    print(f"\n1. Testing user registration with email: {test_email}")
    register_data = {
        "email": test_email,
        "password": "testpassword123",
        "confirm_password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Registration status: {response.status_code}")
        print(f"Registration response: {response.text}")
        if response.status_code == 201:
            print("✅ Registration successful!")
            user_data = response.json()
            print(f"User ID: {user_data['user']['id']}")
            print(f"User Email: {user_data['user']['email']}")
            token = user_data['token']['access_token']
        else:
            print(f"❌ Registration failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return
    
    # Test login
    print(f"\n2. Testing user login with email: {test_email}")
    login_data = {
        "email": test_email,
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.text}")
        if response.status_code == 200:
            print("✅ Login successful!")
            login_response = response.json()
            print(f"User ID: {login_response['user']['id']}")
            print(f"User Email: {login_response['user']['email']}")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test protected endpoint
    print("\n3. Testing protected endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Protected endpoint status: {response.status_code}")
        print(f"Protected endpoint response: {response.text}")
        if response.status_code == 200:
            print("✅ Protected endpoint accessible!")
            me_data = response.json()
            print(f"User ID: {me_data['id']}")
            print(f"User Email: {me_data['email']}")
        else:
            print(f"❌ Protected endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Protected endpoint error: {e}")
    
    # Test tasks endpoint
    print("\n4. Testing tasks endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/tasks/", headers=headers)
        print(f"Tasks endpoint status: {response.status_code}")
        print(f"Tasks endpoint response: {response.text}")
        if response.status_code == 200:
            print("✅ Tasks endpoint accessible!")
            tasks_data = response.json()
            print(f"Total tasks: {tasks_data['total']}")
        else:
            print(f"❌ Tasks endpoint failed: {response.text}")
    except Exception as e:
        print(f"❌ Tasks endpoint error: {e}")
    
    print("\n✅ Authentication test completed!")

if __name__ == "__main__":
    test_auth()
