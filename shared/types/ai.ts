export interface AIRecommendation {
  id: string;
  title: string;
  sourceFacility: string;
  targetFacility: string;
  item: string;
  quantity: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export interface ScenarioSimulationResult {
  estimatedMedicineDemand: { [medicineId: string]: number };
  estimatedStaffRequirement: number;
  estimatedBedRequirement: number;
  suggestedTransfers: AIRecommendation[];
  confidenceScore: number;
}
