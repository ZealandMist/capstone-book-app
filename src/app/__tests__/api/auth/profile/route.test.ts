import { GET, PUT } from "@/app/api/auth/profile/route.ts";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/app/dbConfig/dbConfig";
import { getUserFromCookie } from "@/lib/server/auth";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/lib/server/auth", () => ({
  getUserFromCookie: jest.fn(),
}));

jest.mock("@/models/User", () => ({
  findById: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, init})),
  },
}));

describe("User API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("returns a 401 if not authenticated", async () => {
      (getUserFromCookie as jest.Mock).mockResolvedValue(null);

      const res = await GET();

      expect(res).toEqual({
        body: { message: "Not authenticated" },
        init: { status: 401 },
      })
    });

    it("returns user data with authentication", async () => {
      (getUserFromCookie as jest.Mock).mockResolvedValue({ userId: '123' });

      const selectMock = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'testuser@example.com'
      });

      (User.findById as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const res = await GET();

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(res.body).toEqual({
        _id: '123',
        email: 'testuser@example.com'
      })
    })
  });

  describe("PUT", () => {
    const mockRequest = (body: any) => ({
      json: jest.fn().mockResolvedValue(body),
    } as any);


    it('returns a 401 if not authenticated', async () => {
      (getUserFromCookie as jest.Mock).mockResolvedValue(null);

      const res = await PUT(mockRequest({}));

      expect(res).toEqual({
        body: { message: "Not authenticated" },
        init: { status: 401 },
      }); 
    });
    
    it('returns a 404 if user not found', async () => {
      (getUserFromCookie as jest.Mock).mockResolvedValue({ userId: '123' });
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await PUT(mockRequest({ username: 'new user'}));

      expect(res).toEqual({
        body: { message: 'User not found' }, 
        init: { status: 404 }
      });
    });

    it('updates user profile and password', async () => {
      (getUserFromCookie as jest.Mock).mockResolvedValue({ userId: '123' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const saveMock = jest.fn();

      const user = {
        username: "User One",
        email: "userone@example.com",
        password: "123g",
        save: saveMock
      };

      (User.findById as jest.Mock).mockResolvedValue(user);

      const res = await PUT(mockRequest({
        username: 'User1',
        email: 'user12example.com',
        password: 'newpass',
      }));

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(user.username).toBe('User1');
      expect(user.email).toBe('user12example.com');
      expect(user.password).toBe('hashed-password');
      expect(saveMock).toHaveBeenCalled();

      expect(res.body).toEqual({
        message: "Profile updated"
      })
    })
  });
});