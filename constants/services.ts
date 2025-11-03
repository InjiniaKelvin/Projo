/**
 * QuickFix Service Categories
 * Predefined services for technician registration
 */

export interface QuickFixService {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export const QUICKFIX_SERVICES: QuickFixService[] = [
  { 
    id: 'plumbing', 
    name: 'Plumbing', 
    icon: 'water',
    description: 'Pipes, drains, water systems'
  },
  { 
    id: 'electrical', 
    name: 'Electrical', 
    icon: 'flash',
    description: 'Wiring, lighting, power issues'
  },
  { 
    id: 'appliance', 
    name: 'Appliance Repair', 
    icon: 'construct',
    description: 'Fridges, washers, ovens'
  },
  { 
    id: 'automotive', 
    name: 'Automotive', 
    icon: 'car',
    description: 'Car repairs and maintenance'
  },
  { 
    id: 'cleaning', 
    name: 'Cleaning', 
    icon: 'sparkles',
    description: 'Home and office cleaning'
  },
  { 
    id: 'hvac', 
    name: 'HVAC', 
    icon: 'thermometer',
    description: 'Heating and cooling systems'
  },
  { 
    id: 'carpentry', 
    name: 'Carpentry', 
    icon: 'hammer',
    description: 'Furniture, doors, woodwork'
  },
  { 
    id: 'painting', 
    name: 'Painting', 
    icon: 'color-palette',
    description: 'Interior and exterior painting'
  },
  { 
    id: 'masonry', 
    name: 'Masonry', 
    icon: 'cube',
    description: 'Brick, concrete, stonework'
  },
  { 
    id: 'welding', 
    name: 'Welding', 
    icon: 'flame',
    description: 'Metal fabrication and repair'
  },
  { 
    id: 'landscaping', 
    name: 'Landscaping', 
    icon: 'leaf',
    description: 'Gardening and outdoor work'
  },
  { 
    id: 'pest-control', 
    name: 'Pest Control', 
    icon: 'bug',
    description: 'Insect and rodent removal'
  },
];

export const SERVICE_ICONS: Record<string, string> = {
  plumbing: 'water',
  electrical: 'flash',
  appliance: 'construct',
  automotive: 'car',
  cleaning: 'sparkles',
  hvac: 'thermometer',
  carpentry: 'hammer',
  painting: 'color-palette',
  masonry: 'cube',
  welding: 'flame',
  landscaping: 'leaf',
  'pest-control': 'bug',
};

export const getServiceIcon = (serviceId: string): string => {
  return SERVICE_ICONS[serviceId] || 'construct';
};
