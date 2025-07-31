// Test connectivity between frontend and backend
import axios from "axios";
import { getBaseUrl } from "../utils/config";

const API_BASE = `${getBaseUrl()}/api`;

class APITester {
  constructor() {
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
    };
  }

  async runTest(name, testFunction) {
    console.log(`🧪 Testing: ${name}`);
    try {
      const result = await testFunction();
      console.log(`✅ ${name}: PASSED`);
      this.results.tests.push({ name, status: "PASSED", result });
      this.results.passed++;
      return result;
    } catch (error) {
      console.error(`❌ ${name}: FAILED`, error.message);
      this.results.tests.push({ name, status: "FAILED", error: error.message });
      this.results.failed++;
      return null;
    }
  }

  async testHealthCheck() {
    return this.runTest("Health Check", async () => {
      const response = await axios.get(`${API_BASE}/health`);
      return response.data;
    });
  }

  async testPlaylistFetch() {
    return this.runTest("Playlist Fetch", async () => {
      const response = await axios.get(
        `${API_BASE}/playlist/happy?goal=match&language=english&userId=test-user`
      );
      return response.data;
    });
  }

  async testInteractionLogging() {
    return this.runTest("Interaction Logging", async () => {
      const response = await axios.post(`${API_BASE}/log-interaction`, {
        userId: "test-user",
        action: "test_action",
        page: "test_page",
        metadata: { test: true },
      });
      return response.data;
    });
  }

  async testUserData() {
    return this.runTest("User Data Fetch", async () => {
      const response = await axios.get(`${API_BASE}/data?userId=test-user`);
      return response.data;
    });
  }

  async testAppStats() {
    return this.runTest("App Statistics", async () => {
      const response = await axios.get(`${API_BASE}/stats`);
      return response.data;
    });
  }

  async testAnalyticsData() {
    return this.runTest("Analytics Data", async () => {
      const response = await axios.get(`${API_BASE}/analytics-json?range=all`);
      return response.data;
    });
  }

  async runAllTests() {
    console.log("🚀 Starting API Tests...\n");

    await this.testHealthCheck();
    await this.testPlaylistFetch();
    await this.testInteractionLogging();
    await this.testUserData();
    await this.testAppStats();
    await this.testAnalyticsData();

    console.log("\n📊 Test Results:");
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(
      `📈 Success Rate: ${(
        (this.results.passed / (this.results.passed + this.results.failed)) *
        100
      ).toFixed(1)}%`
    );

    return this.results;
  }

  displayResults() {
    console.table(
      this.results.tests.map((test) => ({
        Test: test.name,
        Status: test.status,
        Details: test.result ? "Success" : test.error,
      }))
    );
  }
}

// Auto-run tests when imported
const tester = new APITester();

// Export for manual testing
export { APITester, tester };

// Auto-run if in development
if (import.meta.env.DEV) {
  console.log("🔧 Development mode detected - Running API tests...");
  setTimeout(async () => {
    try {
      await tester.runAllTests();
      tester.displayResults();
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    }
  }, 2000); // Wait 2 seconds for server to be ready
}

export default tester;
