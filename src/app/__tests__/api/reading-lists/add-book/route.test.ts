import { POST } from "@/app/api/reading-lists/add-book/route";
import { getUserFromCookie } from "@/lib/server/auth";
import ReadingList from "@/models/ReadingList";
import ReadingListEntry from "@/models/ReadingListEntry";
import Book from "@/models/Book";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/server/auth");

jest.mock("@/models/ReadingList", () => ({
  findOne: jest.fn(),
}));

jest.mock("@/models/Book", () => ({
  findOneAndUpdate: jest.fn(),
}));

jest.mock("@/models/ReadingListEntry", ()=> ({
  findOne: jest.fn(),
  create: jest.fn()
}));

const mockedGetUserFromCookie = getUserFromCookie as jest.MockedFunction<typeof getUserFromCookie>;

describe("POST /api/reading-lists/add-book", () => {
  const listId = 'mock-list-id';
  const userId = 'mock-user-id';

  const mockBook = {
    id: "google-book-id",
    volumeInfo: {
      title: "Failing",
      authors: ["Hope Died"],
      description: "A test book",
      imageLinks: { smallThubmnail: "thumb.jpg"},
      page_count: 150,
      publication_date: "2025"
    },
  };

  const mockDbBook = {
    _id: "db-book-id",
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if request data is invalid", async () => {
    mockedGetUserFromCookie.mockResolvedValue({ userId });

    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ message: "Invalid request data" });
  });

  it("retuns 404 if list not found", async () => {
      mockedGetUserFromCookie.mockResolvedValue({ userId });
  
      (ReadingList.findOne as jest.Mock).mockReturnValue(null);
  
      const req = {
        json: jest.fn().mockResolvedValue({
          list_id: listId,
          book: mockBook
        }),
      } as unknown as Request;

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ message: "Reading list not found" });
    });

    it("retuns 200 if already exists in list", async () => {
      mockedGetUserFromCookie.mockResolvedValue({ userId });
  
      (ReadingList.findOne as jest.Mock).mockResolvedValue({ _id: listId });
      (Book.findOneAndUpdate as jest.Mock).mockResolvedValue(mockDbBook);
      (ReadingListEntry.findOne as jest.Mock).mockResolvedValue({ _id: 'existing-entry'});


  
      const req = {
        json: jest.fn().mockResolvedValue({
          list_id: listId,
          book: mockBook
        }),
      } as unknown as Request;

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ message: "Book already in list" });
    });

    it("retuns 200 if book is added successfully", async () => {
      mockedGetUserFromCookie.mockResolvedValue({ userId });
  
      (ReadingList.findOne as jest.Mock).mockResolvedValue({ _id: listId });
      (Book.findOneAndUpdate as jest.Mock).mockResolvedValue(mockDbBook);
      (ReadingListEntry.findOne as jest.Mock).mockResolvedValue(null);
      (ReadingListEntry.create as jest.Mock).mockResolvedValue({});


  
      const req = {
        json: jest.fn().mockResolvedValue({
          list_id: listId,
          book: mockBook
        }),
      } as unknown as Request;

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ message: "Book added successfully" });
    });

    it("retuns 500 if a server error occurs", async () => {
      mockedGetUserFromCookie.mockResolvedValue({ userId });
  
      (ReadingList.findOne as jest.Mock).mockImplementation(() => {
        throw new Error("DB failure");
      });
      
      const req = {
        json: jest.fn().mockResolvedValue({
          list_id: listId,
          book: mockBook
        }),
      } as unknown as Request;

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ message: "Server error" });
    });
});