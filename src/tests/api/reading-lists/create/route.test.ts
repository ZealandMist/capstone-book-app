import { POST } from "@/app/api/reading-lists/create/route";
import ReadingList from "@/models/ReadingList";
import { getUserFromCookie } from "@/lib/server/auth";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/ReadingList", () => ({
  create: jest.fn(),
}));

jest.mock("@/lib/server/auth");
const mockedGetUserFromCookie = getUserFromCookie as jest.MockedFunction<typeof getUserFromCookie>;

describe("POST /api/reading-lists/create", () => {
  const userId = 'mock-user-id';

  const mockList = {
    _id: "list-id",
    name: "My List",
    description: "Test description",
    user_id: userId
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if user is not authed", async () => {
    mockedGetUserFromCookie.mockResolvedValue(null);

    const req = {
      json: jest.fn()
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ message: "Unauthorized" });
  }); 

  it("returns 200 and creates a reading list", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingList.create as jest.Mock).mockResolvedValue(mockList);

    const req = {
      json: jest.fn().mockResolvedValue({
        name: "My List",
        description: "Test description",
      }),
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(ReadingList.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        name: "My List",
        description: "Test description"
      })
    )
    expect(res.status).toBe(200);
    expect(data).toEqual({ 
      message: "List created",
      list: mockList
     });
  });


  it("returns 500 if a server error occurs", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingList.create as jest.Mock).mockImplementation(() => { 
      throw new Error("DB failure");
    });

    const req = {
      json: jest.fn().mockResolvedValue({
        name: "My List",
        description: "Test description",
      }),
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ message: "Server error" });
  });
})