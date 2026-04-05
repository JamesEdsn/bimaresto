export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  station: string;
  image: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Station {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  printer: string;
}

export interface StationOrder {
  stationId: string;
  items: { itemId: string; name: string; qty: number }[];
  sentAt: string;
}

export interface TableInfo {
  id: number;
  name: string;
  seats: number;
  status: "available" | "occupied";
  orders: OrderItem[];
  sentItems: Record<string, number>; // itemId → sent quantity
  stationOrders: StationOrder[];
  splitCount: number;
}

export interface BuffetPackage {
  id: string;
  name: string;
  type: "Indonesian" | "Western" | "International" | "Breakfast";
  price: number;
  category: string;
  station: string;
  image: string;
  courses: {
    Appetizer: string[];
    Soup: string[];
    "Main Course": string[];
    Dessert: string[];
  };
}

export const stations: Station[] = [
  {
    id: "kitchen",
    name: "Dapur Utama",
    color: "bg-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-700",
    printer: "Printer Dapur",
  },
  {
    id: "beverage",
    name: "Station Minuman",
    color: "bg-sky-500",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    textColor: "text-sky-700",
    printer: "Printer Bar",
  },
  {
    id: "snack",
    name: "Station Snack",
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    printer: "Printer Snack",
  },
  {
    id: "dessert",
    name: "Station Dessert",
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    printer: "Printer Dessert",
  },
];


export const categories = [
  { id: "all", name: "Semua Paket" },
  { id: "Indonesian", name: "Indonesian" },
  { id: "Western", name: "Western" },
  { id: "International", name: "International" },
  { id: "Breakfast", name: "Breakfast" },
];

export const buffetPackages: BuffetPackage[] = [
  {
    id: "bp1",
    name: "Indonesian Buffet Delight",
    type: "Indonesian",
    price: 75000,
    category: "buffet",
    station: "kitchen",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwYnVmZmV0fGVufDF8fHx8MTc3Mjk2MjA4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    courses: {
      Appetizer: ["Lumpia Goreng", "Sate Ayam", "Gado-Gado"],
      Soup: ["Soto Ayam", "Sup Buntut"],
      "Main Course": ["Nasi Goreng Spesial", "Rendang Sapi", "Ayam Bakar"],
      Dessert: ["Es Campur", "Pisang Goreng"],
    },
  },
  {
    id: "bp2",
    name: "Western Buffet Feast",
    type: "Western",
    price: 95000,
    category: "buffet",
    station: "kitchen",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZXN0ZXJuJTIwYnVmZmV0fGVufDF8fHx8MTc3Mjk2MjA4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    courses: {
      Appetizer: ["Caesar Salad", "Garlic Bread", "Shrimp Cocktail"],
      Soup: ["Tomato Soup", "Chicken Noodle Soup"],
      "Main Course": ["Grilled Steak", "Roast Chicken", "Pasta Carbonara"],
      Dessert: ["Chocolate Lava Cake", "Tiramisu"],
    },
  },
  {
    id: "bp3",
    name: "International Buffet Variety",
    type: "International",
    price: 85000,
    category: "buffet",
    station: "kitchen",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfGludGVybmF0aW9uYWwlMjBidWZmZXR8ZW58MXx8fHwxNzcyOTYyMDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    courses: {
      Appetizer: ["Spring Rolls", "Bruschetta", "Calamari"],
      Soup: ["Miso Soup", "Minestrone"],
      "Main Course": ["Sushi Platter", "Lamb Curry", "Fish and Chips"],
      Dessert: ["Mango Sticky Rice", "Crème Brûlée"],
    },
  },
  {
    id: "bp4",
    name: "Breakfast Buffet Special",
    type: "Breakfast",
    price: 55000,
    category: "buffet",
    station: "kitchen",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfGJyZWFrZmFzdCUyMGJ1ZmZldHxlbnwxfHx8fDE3NzI5NjIwODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    courses: {
      Appetizer: ["Fresh Fruit Platter", "Yogurt Parfait", "Cereal"],
      Soup: ["Vegetable Soup", "Cream of Mushroom"],
      "Main Course": ["Pancakes with Syrup", "Omelette Station", "Bacon and Eggs"],
      Dessert: ["Waffles", "Doughnuts"],
    },
  },
];

export const initialTables: TableInfo[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Meja ${i + 1}`,
  seats: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
  status: "available" as const,
  orders: [],
  sentItems: {},
  stationOrders: [],
  splitCount: 1,
}));
