import { httpGet } from './HttpClient';

export async function getDistinctNames() {
  return httpGet('/api/materials');
}
