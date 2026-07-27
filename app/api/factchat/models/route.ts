import { apiError, parseConfig, proxyJson } from '../_utils';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const config = parseConfig(await req.json());
    return proxyJson(`${config.baseUrl}/models/`, config.apiKey, { method: 'GET' });
  } catch (error) {
    return apiError(error);
  }
}
