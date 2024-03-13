import { Api } from './api';

export const apiClient = new Api({
  baseUrl: 'https://api.vapi.ai',
  baseApiParams: {
    secure: true,
  },
  securityWorker: async (securityData) => {
    if (securityData) {
      return {
        headers: {
          Authorization: `Bearer ${securityData}`,
        },
      };
    }
  },
});
