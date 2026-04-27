import { POST } from "@/app/api/reading-lists/remove-book/route";
import ReadingList from "@/models/ReadingList";
import ReadingListEntry from "@/models/ReadingListEntry";
import { getUserFromCookie } from "@/lib/server/auth";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/ReadingList", () => ({
  __esModule: true,
  default: {
    findById: jest.fn()
  }
}));

jest.mock("@/models/ReadingListEntry", ()=> ({
  __esModule: true,
  default: {
    findOneAndDelete: jest.fn(),
    find: jest.fn()
  },
}));

jest.mock("@/lib/server/auth");
const mockedGetUserFromCookie = getUserFromCookie as jest.MockedFunction<typeof getUserFromCookie>;

describe("POST /api/reading-lists/remove-book", () => {
  const listId = 'mock-list-id';
  const userId = 'mock-user-id';
  const entryId = 'mock-entry-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return 401 if user is not authed", async () => {
    mockedGetUserFromCookie.mockResolvedValue(null);

    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ message: "Unauthorized" });
  });

  it("return 404 if user is not authed", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingListEntry.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const req = {
      json: jest.fn().mockResolvedValue({ listId, entryId }),
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(ReadingListEntry.findOneAndDelete).toHaveBeenCalledWith({
      _id: entryId,
      list_id: listId,
    });

    expect(res.status).toBe(404);
    expect(data).toEqual({ message: "Entry not found" });
  });

  it("returns 200 and updated lists when entry is removed", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    const removeEntry = { _id: entryId };
    const mockEntries = [{ _id: "1"}, { _id: "2" }];
    const mockList = { _id: listId, name: "Test List" };

    (ReadingListEntry.findOneAndDelete as jest.Mock).mockResolvedValue(removeEntry);

    const populateMock = jest.fn().mockResolvedValue(mockEntries);
    (ReadingListEntry.find as jest.Mock).mockReturnValue({
      populate: populateMock,
    });

    const leanMock = jest.fn().mockResolvedValue(mockList);
    (ReadingList.findById as jest.Mock).mockReturnValue({ lean: leanMock });

    const req = {
      json: jest.fn().mockResolvedValue({ listId, entryId }),
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      list: { 
        ...mockList,
        entries: mockEntries 
      },
    });
   });

   it("returns 500 if a server error occurs", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    (ReadingListEntry.findOneAndDelete as jest.Mock).mockImplementation(()=> {
      throw new Error("DB failure");
    });

    const req = {
      json: jest.fn().mockResolvedValue({ listId, entryId }),
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ message: "Server error" });
   })
});