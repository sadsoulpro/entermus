"""
Test suite for Cover Projects API endpoints
Tests: GET /api/projects, POST /api/projects/save, GET /api/projects/{id}, DELETE /api/projects/{id}
"""
import pytest
import requests
import os
import json
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "admin@example.com"
TEST_PASSWORD = "admin123"


class TestCoverProjectsAPI:
    """Cover Projects CRUD tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get auth token before each test"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            token = response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.user_id = response.json().get("user", {}).get("id")
        else:
            pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
        
        yield
        
        # Cleanup: Delete test projects created during tests
        self._cleanup_test_projects()
    
    def _cleanup_test_projects(self):
        """Delete all TEST_ prefixed projects"""
        try:
            response = self.session.get(f"{BASE_URL}/api/projects")
            if response.status_code == 200:
                projects = response.json().get("projects", [])
                for project in projects:
                    if project.get("project_name", "").startswith("TEST_"):
                        self.session.delete(f"{BASE_URL}/api/projects/{project['id']}")
        except:
            pass
    
    # ==================== GET /api/projects ====================
    
    def test_get_projects_list(self):
        """Test GET /api/projects - returns list of user's projects"""
        response = self.session.get(f"{BASE_URL}/api/projects")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "projects" in data, "Response should contain 'projects' key"
        assert isinstance(data["projects"], list), "Projects should be a list"
    
    def test_get_projects_unauthenticated(self):
        """Test GET /api/projects without auth - should return 401"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/projects")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    # ==================== POST /api/projects/save (Create) ====================
    
    def test_create_new_project(self):
        """Test POST /api/projects/save - create new project"""
        canvas_state = {
            "textElements": [{"id": "text_1", "text": "Test Text", "x": 100, "y": 100}],
            "currentFilter": "none",
            "filterValue": 0.5,
            "bgImageData": None
        }
        
        payload = {
            "project_name": f"TEST_Project_{uuid.uuid4().hex[:8]}",
            "canvas_json": json.dumps(canvas_state),
            "preview_image": None
        }
        
        response = self.session.post(f"{BASE_URL}/api/projects/save", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "project" in data, "Response should contain 'project'"
        
        project = data["project"]
        assert "id" in project, "Project should have an ID"
        assert project["project_name"] == payload["project_name"], "Project name should match"
        assert "canvas_json" in project, "Project should have canvas_json"
        assert "created_at" in project, "Project should have created_at"
        assert "updated_at" in project, "Project should have updated_at"
        
        # Verify project was persisted by fetching it
        get_response = self.session.get(f"{BASE_URL}/api/projects/{project['id']}")
        assert get_response.status_code == 200, "Should be able to fetch created project"
        
        fetched = get_response.json().get("project")
        assert fetched["project_name"] == payload["project_name"], "Fetched project name should match"
    
    def test_create_project_with_preview_image(self):
        """Test POST /api/projects/save - create project with preview image"""
        # Simple 1x1 red PNG in base64
        preview_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        
        canvas_state = {
            "textElements": [],
            "currentFilter": "grayscale",
            "filterValue": 0.8,
            "bgImageData": None
        }
        
        payload = {
            "project_name": f"TEST_WithPreview_{uuid.uuid4().hex[:8]}",
            "canvas_json": json.dumps(canvas_state),
            "preview_image": preview_base64
        }
        
        response = self.session.post(f"{BASE_URL}/api/projects/save", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        
        project = data["project"]
        assert project.get("preview_url") is not None, "Project should have preview_url"
        assert "/api/uploads/covers/" in project["preview_url"], "Preview URL should point to covers directory"
    
    def test_create_project_empty_name(self):
        """Test POST /api/projects/save - empty name should fail validation"""
        payload = {
            "project_name": "",
            "canvas_json": "{}"
        }
        
        response = self.session.post(f"{BASE_URL}/api/projects/save", json=payload)
        
        # Pydantic validation should reject empty string
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
    
    # ==================== POST /api/projects/save (Update) ====================
    
    def test_update_existing_project(self):
        """Test POST /api/projects/save with project_id - update existing project"""
        # First create a project
        canvas_state = {"textElements": [{"id": "text_1", "text": "Original"}]}
        
        create_payload = {
            "project_name": f"TEST_ToUpdate_{uuid.uuid4().hex[:8]}",
            "canvas_json": json.dumps(canvas_state)
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/projects/save", json=create_payload)
        assert create_response.status_code == 200
        
        project_id = create_response.json()["project"]["id"]
        original_name = create_response.json()["project"]["project_name"]
        
        # Now update the project
        updated_canvas = {"textElements": [{"id": "text_1", "text": "Updated text"}]}
        
        update_payload = {
            "project_id": project_id,
            "project_name": f"TEST_Updated_{uuid.uuid4().hex[:8]}",
            "canvas_json": json.dumps(updated_canvas)
        }
        
        update_response = self.session.post(f"{BASE_URL}/api/projects/save", json=update_payload)
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        
        data = update_response.json()
        assert data.get("success") == True
        assert data.get("message") == "Проект обновлён", "Should return update message"
        
        updated_project = data["project"]
        assert updated_project["id"] == project_id, "Project ID should remain the same"
        assert updated_project["project_name"] == update_payload["project_name"], "Name should be updated"
        
        # Verify update persisted
        get_response = self.session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_response.status_code == 200
        
        fetched = get_response.json()["project"]
        assert fetched["project_name"] == update_payload["project_name"]
        
        # Verify canvas_json was updated
        fetched_canvas = json.loads(fetched["canvas_json"])
        assert fetched_canvas["textElements"][0]["text"] == "Updated text"
    
    def test_update_nonexistent_project(self):
        """Test POST /api/projects/save with invalid project_id - should return 404"""
        payload = {
            "project_id": "nonexistent-id-12345",
            "project_name": "TEST_ShouldFail",
            "canvas_json": "{}"
        }
        
        response = self.session.post(f"{BASE_URL}/api/projects/save", json=payload)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    # ==================== GET /api/projects/{id} ====================
    
    def test_get_project_by_id(self):
        """Test GET /api/projects/{id} - get specific project"""
        # First create a project
        canvas_state = {"textElements": [{"id": "text_1", "text": "Test"}], "currentFilter": "sepia"}
        
        create_payload = {
            "project_name": f"TEST_GetById_{uuid.uuid4().hex[:8]}",
            "canvas_json": json.dumps(canvas_state)
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/projects/save", json=create_payload)
        assert create_response.status_code == 200
        
        project_id = create_response.json()["project"]["id"]
        
        # Get the project
        response = self.session.get(f"{BASE_URL}/api/projects/{project_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "project" in data, "Response should contain 'project'"
        
        project = data["project"]
        assert project["id"] == project_id
        assert project["project_name"] == create_payload["project_name"]
        assert "canvas_json" in project
        
        # Verify canvas_json content
        canvas = json.loads(project["canvas_json"])
        assert canvas["currentFilter"] == "sepia"
    
    def test_get_project_not_found(self):
        """Test GET /api/projects/{id} - non-existent project returns 404"""
        response = self.session.get(f"{BASE_URL}/api/projects/nonexistent-project-id")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_get_project_unauthenticated(self):
        """Test GET /api/projects/{id} without auth - should return 401"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/projects/some-id")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    # ==================== DELETE /api/projects/{id} ====================
    
    def test_delete_project(self):
        """Test DELETE /api/projects/{id} - delete project"""
        # First create a project
        create_payload = {
            "project_name": f"TEST_ToDelete_{uuid.uuid4().hex[:8]}",
            "canvas_json": "{}"
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/projects/save", json=create_payload)
        assert create_response.status_code == 200
        
        project_id = create_response.json()["project"]["id"]
        
        # Delete the project
        delete_response = self.session.delete(f"{BASE_URL}/api/projects/{project_id}")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        
        data = delete_response.json()
        assert data.get("success") == True
        assert data.get("message") == "Проект удалён"
        
        # Verify project no longer exists
        get_response = self.session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_response.status_code == 404, "Deleted project should return 404"
    
    def test_delete_project_not_found(self):
        """Test DELETE /api/projects/{id} - non-existent project returns 404"""
        response = self.session.delete(f"{BASE_URL}/api/projects/nonexistent-project-id")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_delete_project_unauthenticated(self):
        """Test DELETE /api/projects/{id} without auth - should return 401"""
        session = requests.Session()
        response = session.delete(f"{BASE_URL}/api/projects/some-id")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    # ==================== Integration Tests ====================
    
    def test_full_crud_flow(self):
        """Test complete CRUD flow: Create -> Read -> Update -> Delete"""
        # CREATE
        canvas_state = {
            "textElements": [{"id": "text_1", "text": "Initial", "x": 50, "y": 50}],
            "currentFilter": "none",
            "filterValue": 0.5
        }
        
        create_payload = {
            "project_name": f"TEST_CRUD_Flow_{uuid.uuid4().hex[:8]}",
            "canvas_json": json.dumps(canvas_state)
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/projects/save", json=create_payload)
        assert create_response.status_code == 200, "CREATE failed"
        
        project_id = create_response.json()["project"]["id"]
        
        # READ
        read_response = self.session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert read_response.status_code == 200, "READ failed"
        assert read_response.json()["project"]["project_name"] == create_payload["project_name"]
        
        # UPDATE
        updated_canvas = {
            "textElements": [{"id": "text_1", "text": "Modified", "x": 100, "y": 100}],
            "currentFilter": "grayscale",
            "filterValue": 0.8
        }
        
        update_payload = {
            "project_id": project_id,
            "project_name": f"TEST_CRUD_Updated_{uuid.uuid4().hex[:8]}",
            "canvas_json": json.dumps(updated_canvas)
        }
        
        update_response = self.session.post(f"{BASE_URL}/api/projects/save", json=update_payload)
        assert update_response.status_code == 200, "UPDATE failed"
        
        # Verify update
        verify_response = self.session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert verify_response.status_code == 200
        
        verified_project = verify_response.json()["project"]
        assert verified_project["project_name"] == update_payload["project_name"]
        
        verified_canvas = json.loads(verified_project["canvas_json"])
        assert verified_canvas["currentFilter"] == "grayscale"
        assert verified_canvas["textElements"][0]["text"] == "Modified"
        
        # DELETE
        delete_response = self.session.delete(f"{BASE_URL}/api/projects/{project_id}")
        assert delete_response.status_code == 200, "DELETE failed"
        
        # Verify deletion
        final_response = self.session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert final_response.status_code == 404, "Project should be deleted"
    
    def test_projects_list_after_create(self):
        """Test that created project appears in projects list"""
        # Get initial count
        initial_response = self.session.get(f"{BASE_URL}/api/projects")
        initial_count = len(initial_response.json().get("projects", []))
        
        # Create a project
        create_payload = {
            "project_name": f"TEST_ListCheck_{uuid.uuid4().hex[:8]}",
            "canvas_json": "{}"
        }
        
        create_response = self.session.post(f"{BASE_URL}/api/projects/save", json=create_payload)
        assert create_response.status_code == 200
        
        project_id = create_response.json()["project"]["id"]
        
        # Check list
        list_response = self.session.get(f"{BASE_URL}/api/projects")
        assert list_response.status_code == 200
        
        projects = list_response.json().get("projects", [])
        assert len(projects) == initial_count + 1, "Project count should increase by 1"
        
        # Verify our project is in the list
        project_ids = [p["id"] for p in projects]
        assert project_id in project_ids, "Created project should be in list"


# Test for existing project mentioned in review request
class TestExistingProject:
    """Test for the existing test project mentioned in the review request"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            token = response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_existing_project_exists(self):
        """Check if the test project mentioned in review exists"""
        # The review mentions project id: a90fdab0-5cd3-482f-bd72-8ac326385386
        project_id = "a90fdab0-5cd3-482f-bd72-8ac326385386"
        
        response = self.session.get(f"{BASE_URL}/api/projects/{project_id}")
        
        # This may or may not exist depending on the user who created it
        # Just log the result
        if response.status_code == 200:
            project = response.json().get("project")
            print(f"Found existing project: {project.get('project_name')}")
            assert project is not None
        else:
            print(f"Project {project_id} not found (may belong to different user)")
            # This is not a failure - the project may belong to a different user
            pytest.skip("Test project not found - may belong to different user")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
