const request = require("supertest");

// Mock card model BEFORE requiring the app
jest.mock("../model/card", () => {
  return {
    createCard: jest.fn().mockResolvedValue({
      id: 1,
      title: "Test task from Jest",
      description: "Hello from test",
      list_id: 1,
      position: 0,
      created_by: 1,
      created_at: new Date()
    }),
    getMaxPosition: jest.fn().mockResolvedValue(-1)
  };
});

const app = require("../index");

describe("Create Task API", () => {
  it("should create a new task", async () => {
    const response = await request(app)
      .post("/api/cards")
      .send({
        title: "Test task from Jest",
        description: "Hello from test",
        listId: 1
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body.title).toBe("Test task from Jest");
    expect(response.body.description).toBe("Hello from test");
    expect(response.body.list_id).toBe(1);
  });
});