import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScenarioSimulationResult } from '@/shared/types/ai';
import { localPHCs, localMedicines } from '../repositories/localDb';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const isGeminiConfigured = GEMINI_API_KEY !== '' && GEMINI_API_KEY !== 'PLACEHOLDER_GEMINI_API_KEY';

// Initialize the Gemini API client if configured
let genAI: GoogleGenerativeAI | null = null;
if (isGeminiConfigured) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

export const geminiService = {
  // Ask Netra Chat assistant
  askNetra: async (
    queryText: string,
    chatHistory: Array<{ role: 'user' | 'model'; parts: string }>
  ): Promise<string> => {
    if (!isGeminiConfigured || !genAI) {
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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Ground the model with current clinic and stock context
      const phcDataStr = JSON.stringify(localPHCs);
      const medicineDataStr = JSON.stringify(localMedicines);

      const systemInstruction = `You are Netra, the AI District Health Intelligence Officer for Devgarh District.
Your task is to answer conversational queries about district healthcare facilities, medicine stock levels, and active alerts.
Ground your answers strictly on the current district data:
Clinics: ${phcDataStr}
Medicines: ${medicineDataStr}

Be concise, professional, and action-oriented. Never output markdown code formats other than standard bolding or bullet points.`;

      const contents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...chatHistory.map((h) => ({
          role: h.role,
          parts: [{ text: h.parts }],
        })),
        { role: 'user', parts: [{ text: queryText }] },
      ];

      const result = await model.generateContent({ contents });
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error('Gemini askNetra error, falling back', e);
      throw new Error('AI/SERVICE_ERROR');
    }
  },

  // Scenario Simulator
  simulateScenario: async (scenarioName: string, customParameters: any): Promise<ScenarioSimulationResult> => {
    // Generate base outcomes based on scenario type
    const lowerName = scenarioName.toLowerCase();
    let result: ScenarioSimulationResult;

    if (lowerName.includes('heatwave')) {
      result = {
        estimatedMedicineDemand: {
          m4: 650, // ORS demand spikes
          m1: 300, // Paracetamol demand
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
    } else if (lowerName.includes('dengue') || lowerName.includes('outbreak')) {
      result = {
        estimatedMedicineDemand: {
          m2: 200, // Dengue Kits
          m1: 800, // Paracetamol
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
    } else {
      // General default simulation
      result = {
        estimatedMedicineDemand: {
          m1: 400,
          m3: 300,
        },
        estimatedStaffRequirement: 2,
        estimatedBedRequirement: 12,
        suggestedTransfers: [],
        confidenceScore: 0.85,
      };
    }

    if (!isGeminiConfigured || !genAI) {
      // Artificial delay to make simulation feel realistic in mock mode
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return result;
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `You are a District Health Simulation Engine. Simulate the following public health scenario in the district:
Scenario Name: ${scenarioName}
Parameters: ${JSON.stringify(customParameters)}
Clinics: ${JSON.stringify(localPHCs)}
Medicines: ${JSON.stringify(localMedicines)}

Calculate the estimated medicine demands, additional staff needed, additional beds occupied, suggested medicine transfers, and a simulation confidence score.
Return a JSON object conforming exactly to this structure:
{
  "estimatedMedicineDemand": { "[medicineId]": number },
  "estimatedStaffRequirement": number,
  "estimatedBedRequirement": number,
  "suggestedTransfers": [
    {
      "id": "string",
      "title": "string",
      "sourceFacility": "string",
      "targetFacility": "string",
      "item": "string",
      "quantity": number,
      "confidence": number,
      "reasoning": "string",
      "timestamp": "string"
    }
  ],
  "confidenceScore": number
}`;

      const resultCall = await model.generateContent(prompt);
      const response = await resultCall.response;
      const text = response.text();
      return JSON.parse(text) as ScenarioSimulationResult;
    } catch (e) {
      console.error('Gemini simulateScenario error, using fallback', e);
      return result;
    }
  },

  // Forecast Service
  generateForecast: async (
    targetId: string,
    type: 'PHC_HEALTH' | 'MEDICINE_DEMAND'
  ): Promise<number[]> => {
    // Artificial load delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (type === 'PHC_HEALTH') {
      const baseScore = targetId === 'phc_kalan' ? 48 : 72;
      // Health score forecast returning a 7-day projection timeline
      return [baseScore, baseScore - 2, baseScore + 3, baseScore + 8, baseScore + 12, baseScore + 15, baseScore + 18].map(
        (s) => Math.min(100, Math.max(0, s))
      );
    } else {
      // Medicine demand forecast returning units projected over next 7 days
      return [100, 140, 220, 290, 310, 260, 180];
    }
  },
};
export default geminiService;
