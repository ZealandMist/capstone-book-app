// Global Jest setup: mock axios and provide lightweight Next.js Request/Response shims

// Mock axios globally so tests can import modules that use axios without network
jest.mock('axios');

// Minimal Request/Response polyfills for environments without web globals
if (typeof (global as any).Request === 'undefined') {
  (global as any).Request = class Request {
    url: string;
    constructor(input?: any) {
      if (typeof input === 'string') {
        this.url = input;
      } else if (input && typeof input.url === 'string') {
        this.url = input.url;
      } else {
        this.url = '';
      }
    }
  };
}
if (typeof (global as any).Response === 'undefined') {
  (global as any).Response = class Response {
    constructor() {}
  };
}

// Provide a minimal NextResponse to satisfy imports from 'next/server'
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, opts?: any) => ({
      json: async () => JSON.parse(JSON.stringify(body)),
      status: opts?.status ?? 200,
    }),
    redirect: (url: string) => ({
      json: async () => ({}),
      status: 302,
      redirect: url,
    }),
  },
  headers: {},
}));

// Mock next/navigation to provide a minimal router for App Router components in tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
