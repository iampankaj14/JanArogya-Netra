import { useState } from 'react';
import { geminiService } from '../services/ai/geminiService';

export function useForecast() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getForecast = async (targetId: string, type: 'PHC_HEALTH' | 'MEDICINE_DEMAND') => {
    setLoading(true);
    setError(null);
    try {
      return await geminiService.generateForecast(targetId, type);
    } catch (e: any) {
      setError(e.message || 'AI/FORECAST_UNAVAILABLE');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    getForecast,
    loading,
    error,
  };
}
export default useForecast;
