import { useState } from 'react';
import { geminiService } from '../services/ai/geminiService';
import { ScenarioSimulationResult } from '@/shared/types/ai';

export function useScenario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = async (scenarioName: string, customParameters: any): Promise<ScenarioSimulationResult> => {
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

  return {
    simulate,
    loading,
    error,
  };
}
export default useScenario;
