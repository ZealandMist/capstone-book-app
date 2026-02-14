import { GET } from "@/app/api/books/search/route";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GET api/books/search", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty items when q is missing", async () => {
    // Minimal mock of the Request object
    const req = {
      url: "http://localhost/api/books/search", 
    } as unknown as Request;

    const res = await GET(req);
    const data = await res.json();

    expect(data).toEqual({ items: [] });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("calls Google Books API and returns data", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        items: [{ id: "1", volumeInfo: { title: "Test Book" } }],
      },
    } as any);

    const req = new Request("http://localhost/api/books/search?q=test%20book");
    const res = await GET(req);
    const data = await res.json();
    
    expect(data.items).toHaveLength(1);
    expect(data.items[0].volumeInfo.title).toBe("Test Book");
  });

  it("returns 500 when axios throws", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Google Books API error"));

    const req = new Request("http://localhost/api/books/search?q=fail");

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ message: "Server error" });
  })
});
