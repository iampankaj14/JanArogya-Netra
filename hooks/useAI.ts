import { useState } from 'react';
import { geminiService } from '../services/ai/geminiService';
import { ScenarioSimulationResult } from '@/shared/types/ai';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateScenario = async (scenarioName: string, customParameters: any): Promise<ScenarioSimulationResult> => {
    setLoading(true);
    setError(null);
    try {
      return await geminiService.simulateScenario(scenarioName, customParameters);
    } catch (e: any) {
      setError(e.message || 'AI/SERVICE_ERROR');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async (targetId: string, type: 'PHC_HEALTH' | 'MEDICINE_DEMAND'): Promise<number[]> => {
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

  const askNetra = async (
    queryText: string,
    chatHistory: Array<{ role: 'user' | 'model'; parts: string }>
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      return await geminiService.askNetra(queryText, chatHistory);
    } catch (e: any) {
      setError(e.message || 'AI/SERVICE_ERROR');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    simulateScenario,
    generateForecast,
    askNetra,
  };
}
export default useAI;
