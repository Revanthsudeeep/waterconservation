export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  date: string;
  tags: string[];
}

export interface SoilType {
  id: string;
  name: string;
  description: string;
  waterRetention: number;
  suitableCrops: string[];
  irrigationRecommendations: string[];
}

export interface WaterCalculation {
  area: number;
  rainfall: number;
  runoffCoefficient: number;
  harvestableWater: number;
}