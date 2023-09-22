import { Agent } from 'https';
import request from 'supertest';

export const authenticatedRequest = (app: Agent, token: string) => {
  const agent = request.agent(app);
  return {
    get: (url: string) =>
      agent.get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) =>
      agent.post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) =>
      agent.put(url).set('Authorization', `Bearer ${token}`),
    del: (url: string) =>
      agent.del(url).set('Authorization', `Bearer ${token}`),
  };
};
