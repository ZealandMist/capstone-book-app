import { POST } from "@/app/api/auth/logout/route";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body) => body),
  },
}));

describe("POST /api/auth/logout", () => {
  it('clears the token cookie and returns success message', async () => {
    const setMock = jest.fn();

    (cookies as jest.Mock).mockResolvedValue({
      set: setMock,
    });

    const res = await POST();

    expect(setMock).toHaveBeenCalledWith(
      "token",
      "",
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        expires: expect.any(Date)
      })
    );

    expect(NextResponse.json).toHaveBeenCalledWith({
      message: "Logged out",
    });

    expect(res).toEqual({ message: "Logged out"});
  });
})