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

      const orsBarola = localMedicines.find(m => m.facilityId === 'phc_barola' && m.name.toLowerCase().includes('ors'));
      const orsBadalpur = localMedicines.find(m => m.facilityId === 'phc_badalpur' && m.name.toLowerCase().includes('ors'));
      const pcmBarola = localMedicines.find(m => m.facilityId === 'phc_barola' && m.name.toLowerCase().includes('paracetamol'));
      const pcmBadalpur = localMedicines.find(m => m.facilityId === 'phc_badalpur' && m.name.toLowerCase().includes('paracetamol'));
      const dengueBarola = localMedicines.find(m => m.facilityId === 'phc_barola' && m.name.toLowerCase().includes('dengue'));
      const dengueBadalpur = localMedicines.find(m => m.facilityId === 'phc_badalpur' && m.name.toLowerCase().includes('dengue'));

      if (lowerQuery.includes('ors') || lowerQuery.includes('oral rehydration')) {
        return `Netra Database Scan: PHC Barola currently holds a substantial surplus of ORS (${orsBarola?.currentStock || 800} sachets, minimum requirement ${orsBarola?.minRequiredStock || 300}). PHC Badalpur has ${(orsBadalpur?.currentStock || 0) < (orsBadalpur?.minRequiredStock || 0) ? 'an active ORS shortage' : 'no active ORS shortages'}. You have sufficient ORS inventory across the district.`;
      }

      if (lowerQuery.includes('paracetamol')) {
        return `Netra Database Scan: PHC Badalpur is facing a critical Paracetamol shortage (${pcmBadalpur?.currentStock || 120} tablets remaining against a minimum requirement of ${pcmBadalpur?.minRequiredStock || 500}). PHC Barola has a surplus (${pcmBarola?.currentStock || 800} tablets). I recommend executing a manual transfer from Bisrakh to Badalpur.`;
      }

      if (lowerQuery.includes('dengue') || lowerQuery.includes('kit')) {
        return `Netra Database Scan: PHC Badalpur has a critical shortage of Dengue NS1 Antigen Test Kits (${dengueBadalpur?.currentStock || 15} kits remaining, minimum required ${dengueBadalpur?.minRequiredStock || 100}). PHC Barola has a healthy surplus (${dengueBarola?.currentStock || 200} kits). Netra has already generated an alert and a redistribution recommendation to transfer kits from Bisrakh.`;
      }

      if (lowerQuery.includes('status') || lowerQuery.includes('health') || lowerQuery.includes('critical')) {
        return 'Netra District Summary: Gautam Budh Nagar health index is currently at 68 (Stable/Warning). PHC Badalpur is flagged as CRITICAL (score 48) due to a Dengue surge and Paracetamol shortage. All other facilities are currently in stable green or warning yellow states.';
      }

      return `Netra Assistant: Thank you for your question. I am analyzing the district healthcare telemetry. Currently, the most critical issue is the Dengue surge in PHC Badalpur, causing a stockout of test kits and analgesics. We have sufficient redistribution routes available from PHC Barola to resolve these shortages. Let me know if you would like me to compile a specific report.`;
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
              sourceFacility: 'PHC Barola',
              targetFacility: 'PHC Mandi Shyam Nagar',
              item: 'ORAL REHYDRATION SALTS (ORS)',
              quantity: 250,
              confidence: 0.89,
              reasoning: 'PHC Mandi Shyam Nagar is predicted to experience a 180% surge in heat exhaustion admissions. Transferring surplus ORS from Bisrakh will secure supply.',
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
              sourceFacility: 'PHC Barola',
              targetFacility: 'PHC Badalpur',
              item: 'Dengue NS1 Antigen Test Kit',
              quantity: 50,
              confidence: 0.95,
              reasoning: 'Badalpur is the epicenter of the surge. Stock is near zero. Bisrakh holds a surplus of kits.',
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
        const baseScore = targetId === 'phc_badalpur' ? 48 : 72;
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
