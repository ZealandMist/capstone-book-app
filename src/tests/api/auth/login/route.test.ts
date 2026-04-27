import { POST } from "@/app/api/auth/login/route";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/app/dbConfig/dbConfig";
import { signToken } from "@/lib/server/jwt";
import { NextResponse } from "next/server";

jest.mock("@/app/dbConfig/dbConfig", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  }
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("@/lib/server/jwt", () => ({
  signToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      body,
      status: init?.status ?? 200,
      cookies: {
        set: jest.fn(),
      },
    })),
  },
}));

const mockRequest = (body: any) => ({
  json: async () => body,
} as any);

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return 400 if user does not exit", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const res: any = await POST(
      mockRequest({ email: "test@example.com", password: "password" })
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email");
  });

  it("returns 400 if password is incorrect", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: '123',
      password: "hashed",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res: any = await POST(
      mockRequest({ email: 'test@example.com', password: 'wrong' })
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid password");
  });

  it("logs in successfully and sets cookies", async () => {
    const mockUser = {
      _id: '1',
      email: "test1@example.com",
      password: 'hashed',
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (signToken as jest.Mock).mockReturnValue("jwt-token");

    const res: any = await POST(
      mockRequest({ email: 'test1@example.com', password: "password" })
    )

    expect(connectDB).toHaveBeenCalled();
    expect(signToken).toHaveBeenCalledWith('1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged in");
    expect(res.cookies.set).toHaveBeenCalledWith(
      "token",
      "jwt-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    )
  });

  it("returns 500 on unexpected error", async () => {
    (User.findOne as jest.Mock).mockRejectedValue(
      new Error("DB Failure")
    );

    const res: any = await POST(
      mockRequest({ email: "test@example.com", password: "password" })
    );

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB Failure");
  });
})
