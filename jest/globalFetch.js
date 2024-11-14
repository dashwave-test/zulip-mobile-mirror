global.fetch = jest.fn();

fetch.mockResponseSuccess = body => {
  fetch.mockImplementation(() =>
    Promise.resolve({ json: () => Promise.resolve(JSON.parse(body)), status: 200, ok: true }),
  );
};

fetch.mockResponseFailure = error => {
  fetch.mockImplementation(() => Promise.reject(error));
};

fetch.mockErrorStatusCode = status => {
  fetch.mockImplementation(() =>
    Promise.resolve({ status, ok: status >= 200 && status < 300 })
  );
};

fetch.reset = () => {
  fetch.mockReset();
};
