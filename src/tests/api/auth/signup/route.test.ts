import { POST } from "@/app/api/auth/signup/route.ts";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/app/dbConfig/dbConfig";
import { signToken } from "@/lib/server/jwt";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

jest.mock("@/lib/server/jwt", () => ({
  signToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => {
      const cookies = {
        set: jest.fn(),
      };

      return {
        body,
        init,
        cookies,
      };
    }),
  },
}));

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body),
  } as any);

  it('returns a 400 error is user already exists', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ _id: 'existing'})

    const res: any = await POST(
      mockRequest({ 
        username: "TestOne",
        email: "test@example.com", 
        password: "password" })
    );

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com'});
    expect(res).toEqual({
      body: { message: "Email already exists"},
      init: { status: 400 },
      cookies: expect.any(Object),
    })
  });

  it('create a new user, hashed password, sets cookies and returns 201', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hash-password");

    const createUser = {
      _id: '345',
      username: "Pirate",
      email: "pirate@example.com"
    };

    (User.create as jest.Mock).mockResolvedValue(createUser);
    (signToken as jest.Mock).mockReturnValue("signed-token");

    const res = await POST(
      mockRequest({
        username: "Pirate",
        email: "pirate@example.com",
        password: "arghghhh"
      })
    );

    expect(connectDB).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith("arghghhh", 10);
    expect(User.create).toHaveBeenCalledWith({
      username: "Pirate",
      email: "pirate@example.com",
      password: "hash-password"
    });

    expect(signToken).toHaveBeenCalledWith('345');

    expect(res.body).toEqual({
      message: "User created",
      user: {
        id: "345",
        username: "Pirate",
        email: "pirate@example.com"
      },
    });

    expect(res.init).toEqual({ status: 201});

    expect(res.cookies.set).toHaveBeenCalledWith(
      "token",
      "signed-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax"
      })
    );
  });

  it("returns 500 on unexpect error", async () => {
    (User.findOne as jest.Mock).mockRejectedValue( new Error("DB exploded"));

    const res = await POST(
      mockRequest({
        username: "More test",
        email: "moretest@example.com",
        password: "stupidd"
      })
    );

    expect(res).toEqual({
      body: { error: "DB exploded"},
      init: { status: 500 },
      cookies: expect.any(Object)
    });
  });
});

