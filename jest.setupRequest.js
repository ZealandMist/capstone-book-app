// Polyfills for Web Fetch primitives used by Next's server helpers in tests
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map();
      if (init instanceof Headers) {
        for (const [k, v] of init.entries()) this.map.set(k.toLowerCase(), String(v));
      } else if (typeof init === 'object') {
        for (const k of Object.keys(init)) this.map.set(k.toLowerCase(), String(init[k]));
      }
    }
    set(key, value) {
      this.map.set(String(key).toLowerCase(), String(value));
    }
    get(key) {
      return this.map.get(String(key).toLowerCase()) || null;
    }
    has(key) {
      return this.map.has(String(key).toLowerCase());
    }
    entries() {
      return this.map.entries();
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body = null, init = {}) {
      this.body = body;
      this.bodyUsed = false;
      this.headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers || {});
      this.status = init.status ?? 200;
      this.statusText = init.statusText || '';
      this.ok = this.status >= 200 && this.status < 300;
      this.type = 'default';
      this.redirected = false;
    }

    async json() {
      this.bodyUsed = true;
      try {
        return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
      } catch (e) {
        return this.body;
      }
    }

    static json(body, init = {}) {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      const headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers || {});
      return new Response(bodyString, { ...init, headers });
    }
  };
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      if (typeof input === 'string') {
        this.url = input;
      } else if (input && input.url) {
        this.url = input.url;
      } else {
        this.url = '';
      }
      this.method = init.method || 'GET';
      this.headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers || {});
      this.body = init.body ?? null;
    }
  };
}
