import { PATCH } from "@/app/api/reading-lists/update-book/route";
import ReadingListEntry from "@/models/ReadingListEntry";
import { getUserFromCookie } from "@/lib/server/auth";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/ReadingListEntry", ()=> ({
  __esModule: true,
  default: {
    findById: jest.fn()
  },
}));

jest.mock("@/lib/server/auth");
const mockedGetUserFromCookie = getUserFromCookie as jest.MockedFunction<typeof getUserFromCookie>;

describe("PATCH /api/reading-lists/update-book", () => {
  const userId = "user-542";
  const entryId = "entry-542";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 if if user is not auth", async() => {
    mockedGetUserFromCookie.mockResolvedValue(null);

    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ message: "Unauthorized" });
  });

  it("returns 404 if entry is not found", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    const mockPop = jest.fn().mockResolvedValue(null);
    (ReadingListEntry.findById as jest.Mock).mockReturnValue({
      populate: mockPop
    });

    const req = {
      json: jest.fn().mockResolvedValue({ entryId }),
    } as unknown as Request;

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ message: "Entry not found" });
  })

  it("returns 403 current user doesn't own the list", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    const entry = {
      list_id: {
        user_id: {
          toString: () => 'other-user'
        },
      },
    };

    const mockPop = jest.fn().mockResolvedValue(entry);
    (ReadingListEntry.findById as jest.Mock).mockReturnValue({
      populate: mockPop
    });

    const req = {
      json: jest.fn().mockResolvedValue({ entryId }),
    } as unknown as Request;

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ message: "Forbidden" });
  });

  it("returns 200 and updates readling list book entry", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    const saveMock = jest.fn().mockResolvedValue(undefined);
    const popBookMock = jest.fn().mockResolvedValue(undefined);

    const entry = {
      status: "reading",
      date_started: null,
      date_finished: null,
      reading_notes: "",
      list_id: {
        user_id: {
          toString: () => userId,
        },
      },
      save: saveMock,
      populate: popBookMock,
    };

    const popListMock = jest.fn().mockResolvedValue(entry);
    (ReadingListEntry.findById as jest.Mock).mockReturnValue({
      populate: popListMock
    });

    const req = {
      json: jest.fn().mockResolvedValue({ 
        entryId,
        status: "completed",
        date_started: "2025-12-31",
        date_finished: "2026-01-15",
        reading_notes: "I finally finished"
      }),
    } as unknown as Request;

    const res = await PATCH(req);
    const data = await res.json();

    expect(saveMock).toHaveBeenCalled();
    expect(popBookMock).toHaveBeenCalledWith("book_id");
    expect(res.status).toBe(200);
    expect(data).toEqual({ 
      entry: {
        status: "completed",
        date_started: "2025-12-31",
        date_finished: "2026-01-15",
        reading_notes: "I finally finished",
        list_id: expect.any(Object)
      } 
    });
  });

  it("returns 500 for a server error", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingListEntry.findById as jest.Mock).mockImplementation(() => {
      throw new Error("DB failure");
    });

    const req = {
      json: jest.fn().mockResolvedValue({ entryId }),
    } as unknown as Request;

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ message: "Server error"});
  });
});