import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { ScenarioSimulationResult } from '@/shared/types/ai';
import { localPHCs, localMedicines } from '../repositories/localDb';

export const geminiService = {
  // Ask Netra Chat assistant
  askNetra: async (
    queryText: string,
    chatHistory: Array<{ role: 'user' | 'model'; parts: string }>
  ): Promise<string> => {
    if (!isFirebaseConfigured) {
      // High-fidelity local fallback based on common query patterns
      const lowerQuery = queryText.toLowerCase();

      if (lowerQuery.includes('ors') || lowerQuery.includes('oral rehydration')) {
        return 'Netra Database Scan: Dharampur PHC currently holds a substantial surplus of ORS (800 sachets, minimum requirement 300). Rampur Kalan PHC has no active ORS shortages. You have sufficient ORS inventory across the district.';
      }

      if (lowerQuery.includes('paracetamol')) {
        return 'Netra Database Scan: Rampur Kalan PHC is facing a critical Paracetamol shortage (120 tablets remaining against a minimum requirement of 500). Dharampur and Sewapur PHCs have adequate stocks. I recommend executing a manual transfer of 200 tablets from Sewapur to Rampur Kalan.';
      }

      if (lowerQuery.includes('dengue') || lowerQuery.includes('kit')) {
        return 'Netra Database Scan: Rampur Kalan PHC has a critical shortage of Dengue NS1 Antigen Test Kits (15 kits remaining, minimum required 100). Dharampur PHC has a healthy surplus. Netra has already generated an alert and a redistribution recommendation to transfer 50 kits from Dharampur.';
      }

      if (lowerQuery.includes('status') || lowerQuery.includes('health') || lowerQuery.includes('critical')) {
        return 'Netra District Summary: Devgarh District health index is currently at 68 (Stable/Warning). Rampur Kalan PHC is flagged as CRITICAL (score 48) due to a Dengue surge and Paracetamol shortage. All other facilities are currently in stable green or warning yellow states.';
      }

      return `Netra Assistant: Thank you for your question. I am analyzing the district healthcare telemetry. Currently, the most critical issue is the Dengue surge in Rampur Kalan PHC, causing a stockout of test kits and analgesics. We have sufficient redistribution routes available from Dharampur PHC to resolve these shortages. Let me know if you would like me to compile a specific report.`;
    }

    try {
      const fn = httpsCallable<{ query: string; chatHistory: any }, { success: boolean; answer: string }>(functions, 'askNetra');
      const response = await fn({ query: queryText, chatHistory });
      return response.data.answer;
    } catch (e) {
      console.error('Gemini askNetra error, falling back', e);
      throw new Error('AI/SERVICE_ERROR');
    }
  },

  // Scenario Simulator
  simulateScenario: async (scenarioName: string, customParameters: any): Promise<ScenarioSimulationResult> => {
    if (!isFirebaseConfigured) {
      // Artificial delay to make simulation feel realistic in mock mode
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const lowerName = scenarioName.toLowerCase();
      if (lowerName.includes('heatwave')) {
        return {
          estimatedMedicineDemand: {
            m4: 650, // ORS demand spikes
            m1: 300,
          },
          estimatedStaffRequirement: 3,
          estimatedBedRequirement: 18,
          suggestedTransfers: [
            {
              id: 'sim_rec_' + Date.now() + '_1',
              title: 'Heatwave Support Transfer',
              sourceFacility: 'Dharampur PHC',
              targetFacility: 'Sewapur PHC',
              item: 'ORAL REHYDRATION SALTS (ORS)',
              quantity: 250,
              confidence: 0.89,
              reasoning: 'Sewapur PHC is predicted to experience a 180% surge in heat exhaustion admissions. Transferring surplus ORS from Dharampur will secure supply.',
              timestamp: new Date().toISOString(),
            },
          ],
          confidenceScore: 0.91,
        };
      } else {
        return {
          estimatedMedicineDemand: {
            m2: 200, // Dengue Kits
            m1: 800,
          },
          estimatedStaffRequirement: 4,
          estimatedBedRequirement: 22,
          suggestedTransfers: [
            {
              id: 'sim_rec_' + Date.now() + '_2',
              title: 'Dengue Outbreak Supply',
              sourceFacility: 'Dharampur PHC',
              targetFacility: 'Rampur Kalan PHC',
              item: 'Dengue NS1 Antigen Test Kit',
              quantity: 50,
              confidence: 0.95,
              reasoning: 'Rampur Kalan is the epicenter of the surge. Stock is near zero. Dharampur holds a surplus of kits.',
              timestamp: new Date().toISOString(),
            },
          ],
          confidenceScore: 0.94,
        };
      }
    }

    try {
      const fn = httpsCallable<{ scenarioName: string; customParameters: any }, { success: boolean; result: ScenarioSimulationResult }>(functions, 'runSimulation');
      const response = await fn({ scenarioName, customParameters });
      return response.data.result;
    } catch (e) {
      console.error('Gemini simulateScenario error, using fallback', e);
      throw new Error('AI/SERVICE_ERROR');
    }
  },

  // Forecast Service
  generateForecast: async (
    targetId: string,
    type: 'PHC_HEALTH' | 'MEDICINE_DEMAND'
  ): Promise<number[]> => {
    if (!isFirebaseConfigured) {
      // Artificial load delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (type === 'PHC_HEALTH') {
        const baseScore = targetId === 'phc_kalan' ? 48 : 72;
        return [baseScore, baseScore - 2, baseScore + 3, baseScore + 8, baseScore + 12, baseScore + 15, baseScore + 18].map(
          (s) => Math.min(100, Math.max(0, s))
        );
      } else {
        return [100, 140, 220, 290, 310, 260, 180];
      }
    }

    try {
      const fn = httpsCallable<{ targetId: string; type: string }, { success: boolean; timeline: number[] }>(functions, 'forecastGeneration');
      const response = await fn({ targetId, type });
      return response.data.timeline;
    } catch (e) {
      console.error('Gemini generateForecast error', e);
      throw new Error('AI/FORECAST_UNAVAILABLE');
    }
  },
};

export default geminiService;
