const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: function () { return this; },
  // Minimal isAxiosError implementation for tests that call axios.isAxiosError(err)
  isAxiosError: function (err) {
    return !!(err && err.response);
  },
};

module.exports = mockAxios;
