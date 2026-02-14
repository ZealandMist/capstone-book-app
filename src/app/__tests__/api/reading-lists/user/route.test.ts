import { GET } from "@/app/api/reading-lists/user/route";
import ReadingList from "@/models/ReadingList";
import ReadingListEntry from "@/models/ReadingListEntry";
import Book from "@/models/Book";
import { getUserFromCookie } from "@/lib/server/auth";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/ReadingList", () => ({
  __esModule: true,
  default: {
    find: jest.fn()
  }
}));

jest.mock("@/models/ReadingListEntry", ()=> ({
  __esModule: true,
  default: {},
}));

jest.mock("@/models/Book", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/lib/server/auth");
const mockedGetUserFromCookie = getUserFromCookie as jest.MockedFunction<typeof getUserFromCookie>;

describe("GET /api/reading-lists", () => {
  const userId = 'mock-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if user is not authed", async () => {
    mockedGetUserFromCookie.mockResolvedValue(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ message: "Unauthorized" });
  });

  it("returns 200 and lists when found", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    const mockLists = [
      {
        _id: "list-1",
        name: "Test List 1",
        entries: [
          {
            _id: "entry-1",
            book_id: { title: "Test Book"}
          }
        ],
      },
    ];

    const leanMock = jest.fn().mockResolvedValue(mockLists);
    const popMock = jest.fn().mockReturnValue({ lean: leanMock });

    (ReadingList.find as jest.Mock).mockReturnValue({ populate: popMock });

    const res = await GET();
    const data = await res.json();

    expect(ReadingList.find).toHaveBeenCalledWith({
      user_id: userId
    });
    expect(popMock).toHaveBeenCalledWith({
      path: "entries",
      populate: { path: "book_id" }
    });
    expect(leanMock).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(data).toEqual({ lists: mockLists });
  });

  it("returns 500 for a server error", async () => {
      mockedGetUserFromCookie.mockResolvedValue({ userId });
  
      (ReadingList.find as jest.Mock).mockImplementation(() => {
        throw new Error("DB failure");
      });
  
      const res = await GET();
      const data = await res.json();
  
      expect(res.status).toBe(500);
      expect(data).toEqual({ message: "Server error"});
    });
});