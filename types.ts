
export interface FruitTree {
  name: string;
  scientificName: string;
  description: string;
  care: {
    sunlight: string;
    watering: string;
    soil: string;
  };
  pruningHarvest: string;
  pests: {
    name: string;
    description: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type Page = 'home' | 'detail' | 'chat';
