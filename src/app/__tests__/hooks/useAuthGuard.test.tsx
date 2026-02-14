import { render } from "@testing-library/react";
import axios from "axios";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import "@testing-library/jest-dom";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>

function TestComponent() {
  useAuthGuard();
  return <div>Protected</div>;
}

describe("useAuthGuard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /login on 401 response", async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(<TestComponent />);

    await Promise.resolve();

    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("does not redirect for non-401 errors", async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500 },
    });

    render(<TestComponent />);

    await Promise.resolve();

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
