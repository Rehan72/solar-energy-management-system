import api from "./axios";

/* =========================
   HTTP METHODS
========================= */

export const getRequest = (url, params = {}, config = {}) =>
  api.get(url, { params, ...config });

export const postRequest = (url, data = {}, config = {}) =>
  api.post(url, data, config);

export const putRequest = (url, data = {}, config = {}) =>
  api.put(url, data, config);

export const patchRequest = (url, data = {}, config = {}) =>
  api.patch(url, data, config);

export const deleteRequest = (url, config = {}) =>
  api.delete(url, config);
