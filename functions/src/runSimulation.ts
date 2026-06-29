import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const runSimulation = onCall(async (request) => {
  const { scenarioName, customParameters } = request.data || {};

  if (!scenarioName) {
    throw new HttpsError('invalid-argument', 'The function must be called with a scenarioName.');
  }

  const db = admin.firestore();

  try {
    // 1. Fetch current clinics and stocks context from Firestore
    const facilitiesSnap = await db.collection('facilities').get();
    const facilities = facilitiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const inventorySnap = await db.collection('inventory').get();
    const inventory = inventorySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // 2. Setup standard mock responses as robust fallbacks
    const lowerName = scenarioName.toLowerCase();
    let fallbackResult: any;

    if (lowerName.includes('heatwave')) {
      fallbackResult = {
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
            reasoning: 'Sewapur PHC is predicted to experience a 180% surge in heat exhaustion admissions.',
            timestamp: new Date().toISOString(),
          },
        ],
        confidenceScore: 0.91,
      };
    } else {
      fallbackResult = {
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
            reasoning: 'Rampur Kalan is the epicenter of the surge. Stock is near zero.',
            timestamp: new Date().toISOString(),
          },
        ],
        confidenceScore: 0.94,
      };
    }

    // 3. Trigger Gemini reasoning if API key is present
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PLACEHOLDER_GEMINI_API_KEY') {
      return { success: true, result: fallbackResult };
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are a District Health Simulation Engine. Simulate the following public health scenario in the district:
Scenario Name: ${scenarioName}
Parameters: ${JSON.stringify(customParameters)}
Clinics: ${JSON.stringify(facilities)}
Medicines: ${JSON.stringify(inventory)}

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

    const genResult = await model.generateContent(prompt);
    const text = genResult.response.text();
    const resultObj = JSON.parse(text);

    return { success: true, result: resultObj };
  } catch (error: any) {
    console.error('Error running simulation', error);
    throw new HttpsError('internal', 'Internal simulation execution failed: ' + error.message);
  }
});
