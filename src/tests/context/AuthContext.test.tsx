/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@testing-library/jest-dom";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

function TestComponent() {
  const { user, logout } = useAuth();

  return (
    <>
      <div data-testid="username">
        {user?.username ?? "no-user"}
      </div>
      <button onClick={logout}>Logout</button>
    </>
  );
}

describe("AuthContext", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and sets user on mount", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        _id: "1",
        username: "Test User",
        email: "testuser@example.com",
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // findBy* automatically waits
    const username = await screen.findByTestId("username");

    expect(username).toHaveTextContent("Test User");
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("sets user to null if profile request fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(
      new Error("Unauthorized")
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const username = await screen.findByTestId("username");

    expect(username).toHaveTextContent("no-user");
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("logs out and clears user", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        _id: "1",
        username: "Test User",
        email: "testuser@example.com",
      },
    });

    mockedAxios.post.mockResolvedValueOnce({});

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user to load
    expect(
      await screen.findByText("Test User")
    ).toBeInTheDocument();

    await user.click(screen.getByText("Logout"));

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    // After logout
    expect(
      await screen.findByText("no-user")
    ).toBeInTheDocument();
  });
});