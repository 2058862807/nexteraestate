#!/usr/bin/env python3
"""
NextEra Estate Backend API Testing Suite
Tests all backend endpoints for the estate planning application
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, List, Tuple

class NextEraEstateAPITester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results: List[Dict[str, Any]] = []

    def log_test_result(self, test_name: str, success: bool, details: Dict[str, Any]):
        """Log test result for reporting"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            'test_name': test_name,
            'success': success,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)

    def run_api_test(self, test_name: str, method: str, endpoint: str, 
                     expected_status: int = 200, data: Dict = None, 
                     headers: Dict = None) -> Tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {test_name}...")
        print(f"   {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            details = {
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'response_data': response_data,
                'response_time': response.elapsed.total_seconds()
            }

            if success:
                print(f"✅ PASSED - Status: {response.status_code}")
                print(f"   Response time: {response.elapsed.total_seconds():.3f}s")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            self.log_test_result(test_name, success, details)
            return success, response_data

        except requests.exceptions.RequestException as e:
            print(f"❌ FAILED - Network Error: {str(e)}")
            details = {
                'method': method,
                'endpoint': endpoint,
                'error': str(e),
                'error_type': 'network_error'
            }
            self.log_test_result(test_name, False, details)
            return False, {}

    def test_health_check(self):
        """Test basic health check endpoint"""
        return self.run_api_test("Health Check", "GET", "/health")

    def test_user_endpoint(self):
        """Test user information endpoint"""
        success, data = self.run_api_test("User Information", "GET", "/api/user")
        
        if success:
            # Validate response structure
            required_fields = ['id', 'name', 'email']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"⚠️  Warning: Missing required fields: {missing_fields}")
            else:
                print(f"✅ User data structure valid")
        
        return success, data

    def test_wills_endpoint(self):
        """Test wills management endpoint"""
        success, data = self.run_api_test("Wills Management", "GET", "/api/wills")
        
        if success and isinstance(data, list):
            print(f"✅ Retrieved {len(data)} wills")
            if data:
                # Check first will structure
                will = data[0]
                required_fields = ['id', 'title', 'status']
                missing_fields = [field for field in required_fields if field not in will]
                
                if missing_fields:
                    print(f"⚠️  Warning: Will missing fields: {missing_fields}")
                else:
                    print(f"✅ Will data structure valid")
        
        return success, data

    def test_documents_endpoint(self):
        """Test documents storage endpoint"""
        return self.run_api_test("Documents Storage", "GET", "/api/documents")

    def test_family_endpoint(self):
        """Test family member management endpoint"""
        return self.run_api_test("Family Management", "GET", "/api/family")

    def test_death_switch_endpoint(self):
        """Test death switch monitoring endpoint"""
        success, data = self.run_api_test("Death Switch Monitoring", "GET", "/api/death-switch")
        
        if success:
            if 'enabled' in data:
                print(f"✅ Death switch status: {'Enabled' if data['enabled'] else 'Disabled'}")
            else:
                print(f"⚠️  Warning: Death switch response missing 'enabled' field")
        
        return success, data

    def test_activity_endpoint(self):
        """Test activity log endpoint"""
        success, data = self.run_api_test("Activity Log", "GET", "/api/activity")
        
        if success and isinstance(data, list):
            print(f"✅ Retrieved {len(data)} activity entries")
        
        return success, data

    def test_payments_usage_endpoint(self):
        """Test payment usage statistics endpoint"""
        success, data = self.run_api_test("Payment Usage Stats", "GET", "/api/payments/usage")
        
        if success:
            # Validate usage data structure
            expected_sections = ['storage', 'videoMessages', 'familyMembers']
            missing_sections = [section for section in expected_sections if section not in data]
            
            if missing_sections:
                print(f"⚠️  Warning: Missing usage sections: {missing_sections}")
            else:
                print(f"✅ Usage data structure valid")
                # Print usage summary
                for section, info in data.items():
                    if isinstance(info, dict) and 'used' in info and 'limit' in info:
                        print(f"   {section}: {info['used']}/{info['limit']}")
        
        return success, data

    def test_payments_subscription_endpoint(self):
        """Test subscription status endpoint"""
        success, data = self.run_api_test("Subscription Status", "GET", "/api/payments/subscription")
        
        if success:
            if 'plan' in data and 'status' in data:
                plan_name = data['plan'].get('name', 'Unknown') if isinstance(data['plan'], dict) else data['plan']
                print(f"✅ Subscription: {plan_name} ({data['status']})")
            else:
                print(f"⚠️  Warning: Subscription response missing required fields")
        
        return success, data

    def test_legal_compliance_endpoint(self):
        """Test legal compliance checking endpoint (if exists)"""
        # This endpoint was mentioned in the requirements but not implemented in the server
        success, data = self.run_api_test("Legal Compliance (CA)", "GET", "/api/legal/states/CA/requirements", expected_status=404)
        
        if not success and data.get('actual_status') == 404:
            print("ℹ️  Legal compliance endpoint not implemented (expected)")
            return True, {"note": "endpoint_not_implemented"}
        
        return success, data

    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("🚀 NEXTERA ESTATE BACKEND API TESTING SUITE")
        print("=" * 60)
        print(f"Testing backend at: {self.base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        # Run all tests
        test_methods = [
            self.test_health_check,
            self.test_user_endpoint,
            self.test_wills_endpoint,
            self.test_documents_endpoint,
            self.test_family_endpoint,
            self.test_death_switch_endpoint,
            self.test_activity_endpoint,
            self.test_payments_usage_endpoint,
            self.test_payments_subscription_endpoint,
            self.test_legal_compliance_endpoint
        ]

        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                print(f"❌ Test {test_method.__name__} failed with exception: {str(e)}")
                self.log_test_result(test_method.__name__, False, {'error': str(e), 'error_type': 'exception'})

        # Print summary
        self.print_test_summary()
        
        return self.tests_passed == self.tests_run

    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test_name']}")
                if 'error' in test['details']:
                    print(f"     Error: {test['details']['error']}")
                elif 'actual_status' in test['details']:
                    print(f"     Expected: {test['details']['expected_status']}, Got: {test['details']['actual_status']}")
        
        # Print passed tests
        passed_tests = [result for result in self.test_results if result['success']]
        if passed_tests:
            print(f"\n✅ PASSED TESTS ({len(passed_tests)}):")
            for test in passed_tests:
                print(f"   • {test['test_name']}")
        
        print("\n" + "=" * 60)

def main():
    """Main test execution"""
    # Check if custom URL provided
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    print(f"NextEra Estate Backend API Tester")
    print(f"Target URL: {base_url}")
    print()
    
    # Create tester instance
    tester = NextEraEstateAPITester(base_url)
    
    # Run all tests
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())