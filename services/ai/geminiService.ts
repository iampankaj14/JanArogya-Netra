import { GoogleGenerativeAI } from '@google/generative-ai';
import { localPHCs, localMedicines } from '../repositories/localDb';
import { ScenarioSimulationResult } from '@/shared/types/ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const simulationApiKey = process.env.EXPO_PUBLIC_GEMINI_SIMULATION_API_KEY || '';

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const simGenAI = new GoogleGenerativeAI(simulationApiKey);
const simModel = simGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const getMockSimulation = async (scenarioName: string): Promise<ScenarioSimulationResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const lowerName = scenarioName.toLowerCase();
  if (lowerName.includes('heatwave')) {
    return {
      estimatedMedicineDemand: { m4: 650, m1: 300 },
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
          reasoning: 'PHC Mandi Shyam Nagar is predicted to experience a 180% surge in heat exhaustion admissions.',
          timestamp: new Date().toISOString(),
        },
      ],
      confidenceScore: 0.91,
    };
  } else {
    return {
      estimatedMedicineDemand: { m2: 200, m1: 800 },
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
          reasoning: 'Badalpur is the epicenter of the surge. Stock is near zero.',
          timestamp: new Date().toISOString(),
        },
      ],
      confidenceScore: 0.94,
    };
  }
};

export const geminiService = {
  // Ask Netra Chat assistant
  askNetra: async (
    queryText: string,
    chatHistory: Array<{ role: 'user' | 'model'; parts: string }>
  ): Promise<string> => {
    if (!apiKey) {
      return "I'm sorry, my AI connection is not configured yet. Please provide a valid Gemini API key.";
    }

    try {
      // Format chat history manually to avoid strict role validation errors from startChat
      const formattedHistory = chatHistory
        .map(h => `${h.role === 'user' ? 'User' : 'Netra'}: ${h.parts}`)
        .join('\n\n');

      const contextPrompt = `
You are Netra, an advanced District Health Intelligence Assistant for the 'JanArogya Netra' app. 
Your goal is to help District Medical Officers (BMO/CMO) manage PHC (Primary Health Center) operations, monitor disease outbreaks, coordinate supply redistributions, and manage beds/staff.

Here is the current real-time data for the district:
PHCs: ${JSON.stringify(localPHCs)}
Inventory/Medicines: ${JSON.stringify(localMedicines)}

--- CHAT HISTORY ---
${formattedHistory}
--------------------

Current User Query: ${queryText}

CRITICAL RULES FOR RESPONDING:
1. ALWAYS keep your answers extremely short and concise (max 2-3 sentences if not using bullets).
2. Use bullet points whenever possible to make the information scannable.
3. Do NOT write long paragraphs. 
4. Base your answers strictly on the provided real-time data if the user asks about specific PHCs, stocks, or conditions.
      `;

      const result = await model.generateContent(contextPrompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error('Gemini askNetra error', e);
      return "I encountered an error connecting to my intelligence network. Please verify your API key or try again later.";
    }
  },

  // Scenario Simulator
  simulateScenario: async (scenarioName: string, customParameters: any): Promise<ScenarioSimulationResult> => {
    if (!simulationApiKey) {
      console.warn("Simulation API key missing, falling back to basic mock.");
      return getMockSimulation(scenarioName);
    }

    try {
      const prompt = `
You are Netra, an advanced Health Intelligence AI. You are performing a disease outbreak/disaster simulation.

Here is the real-time local data:
PHCs: ${JSON.stringify(localPHCs)}
Inventory: ${JSON.stringify(localMedicines)}

Scenario Name: ${scenarioName}
Custom Parameters: ${JSON.stringify(customParameters)}

Your task is to generate a realistic prediction of the impact of this scenario on the district's health resources.
Return a JSON object that strictly adheres to the following structure:
{
  "estimatedMedicineDemand": { "m1": 500, "m2": 200 }, // object mapping medicine IDs (m1, m2, etc) to integer demand numbers
  "estimatedStaffRequirement": 5, // integer
  "estimatedBedRequirement": 25, // integer
  "suggestedTransfers": [
    {
      "id": "unique_string_id",
      "title": "Transfer Title",
      "sourceFacility": "Source PHC Name",
      "targetFacility": "Target PHC Name",
      "item": "Item Name",
      "quantity": 100, // integer
      "confidence": 0.95, // float between 0 and 1
      "reasoning": "Short explanation",
      "timestamp": "ISO timestamp string"
    }
  ],
  "confidenceScore": 0.92 // float between 0 and 1
}

Output ONLY valid JSON without any markdown formatting blocks like \`\`\`json.
      `;

      const result = await simModel.generateContent(prompt);
      const text = await result.response.text();
      
      // Attempt to parse JSON. Sometimes AI includes markdown blocks despite instructions.
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedText);

      return {
        estimatedMedicineDemand: parsedData.estimatedMedicineDemand || {},
        estimatedStaffRequirement: parsedData.estimatedStaffRequirement || 0,
        estimatedBedRequirement: parsedData.estimatedBedRequirement || 0,
        suggestedTransfers: parsedData.suggestedTransfers || [],
        confidenceScore: parsedData.confidenceScore || 0.8,
      } as ScenarioSimulationResult;

    } catch (error) {
      console.error('Gemini simulateScenario error:', error);
      console.warn('Falling back to mock scenario generation.');
      return getMockSimulation(scenarioName);
    }
  },

  // Forecast Service (Leaving as mock)
  generateForecast: async (
    targetId: string,
    type: 'PHC_HEALTH' | 'MEDICINE_DEMAND'
  ): Promise<number[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (type === 'PHC_HEALTH') {
      const baseScore = targetId === 'phc_badalpur' ? 48 : 72;
      return [baseScore, baseScore - 2, baseScore + 3, baseScore + 8, baseScore + 12, baseScore + 15, baseScore + 18].map(
        (s) => Math.min(100, Math.max(0, s))
      );
    } else {
      return [100, 140, 220, 290, 310, 260, 180];
    }
  },
};

export default geminiService;
