export enum Category {
  RECOMMENDED = '廚師推薦',
  MAINS = '主食',
  DIM_SUM = '點心',
  SOUPS = '湯品',
  DRINKS = '飲品',
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageId: number; // For picsum
  spiciness?: 0 | 1 | 2 | 3; // 0: none, 3: very spicy
  isVegetarian?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  recommendedItemIds?: string[];
}