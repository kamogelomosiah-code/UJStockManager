import { InventoryItem, StockMovement } from '../types';
import { authFetch } from './api';

export function getGeminiApiKey(): string {
  return localStorage.getItem('uj_gemini_api_key') || '';
}

export function saveGeminiApiKey(key: string) {
  localStorage.setItem('uj_gemini_api_key', key);
}

export async function clientMagicAdd(description: string): Promise<any> {
  try {
    const response = await authFetch('/api/gemini/magic', {
      method: 'POST',
      body: JSON.stringify({ description })
    });
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch from magic API endpoint', err);
    throw err;
  }
}

export async function clientAskAi(params: {
  question?: string;
  inventory: InventoryItem[];
  movements: StockMovement[];
}): Promise<any> {
  try {
    const response = await authFetch('/api/gemini/ask', {
      method: 'POST',
      body: JSON.stringify({ 
        question: params.question,
        inventory: params.inventory,
        movements: params.movements
      })
    });
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch from ask API endpoint', err);
    throw err;
  }
}
