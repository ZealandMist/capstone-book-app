import { GET } from "@/app/api/reading-lists/[listId]/route";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/server/auth";
import ReadingList from "@/models/ReadingList";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/ReadingList", () => ({
  findOne: jest.fn(),
}));

jest.mock("@/lib/server/auth");
const mockedGetUserFromCookie = getUserFromCookie as jest.MockedFunction<typeof getUserFromCookie>;

describe("GET /api/reading-lists/[listId]", () => {
  const listId = 'mock-list-id';
  const userId = 'mock-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return 401 if user is not authed", async () => {
    mockedGetUserFromCookie.mockResolvedValue(null);

    const res = await GET({} as Request, { params: Promise.resolve({ listId}) });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ message: "Unauthorized" });
  });

  it("retuns 404 if list not found", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingList.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });


    const res = await GET({} as Request, { params: Promise.resolve({ listId }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ message: "List not found" });
  });

  it("returns 200 and list data if found", async () => {
    const mockList = { _id: listId, name: "Test List", entries: [] };
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingList.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockList),
    });
    
    const res = await GET({} as Request, { params: Promise.resolve({ listId }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ list: mockList });
  });

  it("returns 500 if a server error occurs", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingList.findOne as jest.Mock).mockImplementation(() => { 
      throw new Error("DB failure");
    });
 
    const res = await GET({} as Request, { params: Promise.resolve({ listId }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ message: "Server error" });
  });
});
