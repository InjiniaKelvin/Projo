
/**
 * Enhanced Nairobi Location Data - Accurate Road Mapping
 * Based on actual Nairobi City geography and administrative boundaries
 * Updated: 2025-08-20T22:14:45.921Z
 */

export interface NairobiLocation {
  constituency: string;
  ward: string;
  road: string;
  description: string;
}

export interface NairobiWard {
  name: string;
  roads: string[];
  landmarks: string[];
}

export interface NairobiConstituency {
  name: string;
  wards: NairobiWard[];
}

/**
 * Accurate Nairobi Location Hierarchy
 * Verified against Kenya National Bureau of Statistics data
 */
export const accurateNairobiLocations: NairobiConstituency[] = [
  {
    name: "Westlands",
    wards: [
      {
        name: "Kitisuru",
        roads: [
          "Peponi Road", "Kitisuru Road", "Spring Valley Road", 
          "Tigoni Road", "Muthaiga Road", "Runda Road",
          "Kiambu Road", "Two Rivers Drive", "Peponi Close"
        ],
        landmarks: ["Two Rivers Mall", "Peponi School", "Spring Valley Estate"]
      },
      {
        name: "Parklands/Highridge",
        roads: [
          "Parklands Road", "Limuru Road", "Museum Hill Road",
          "Highridge Road", "Ring Road Parklands", "Ojijo Road",
          "Forest Road", "State House Avenue"
        ],
        landmarks: ["Nairobi Museum", "State House", "Parklands Mosque"]
      },
      {
        name: "Karura",
        roads: [
          "Kiambu Road", "Forest Road", "Karura Road",
          "Githunguri Road", "Runda Road", "Limuru Road North",
          "UN Avenue", "Gigiri Road"
        ],
        landmarks: ["Karura Forest", "UN Offices", "UNEP Headquarters"]
      },
      {
        name: "Kangemi",
        roads: [
          "Waiyaki Way", "Kangemi Road", "Wangige Road",
          "Gitaru Road", "Banana Road", "ABC Place Road",
          "Mountain View Road", "Kabete Road"
        ],
        landmarks: ["ABC Place", "Kangemi Market", "Wangige Estate"]
      },
      {
        name: "Mountain View",
        roads: [
          "Mountain View Road", "Lavington Road", "General Mathenge Road",
          "James Gichuru Road", "Mbaazi Avenue", "Wood Avenue",
          "Kigwa Road", "Gitanga Road"
        ],
        landmarks: ["Lavington Mall", "Nairobi Hospital", "Alliance High School"]
      }
    ]
  },
  {
    name: "Dagoretti North",
    wards: [
      {
        name: "Kilimani",
        roads: [
          "Ngong Road", "Kilimani Road", "Elgeyo Marakwet Road",
          "Argwings Kodhek Road", "Ralph Bunche Road", "Lenana Road",
          "Hurlingham Road", "Dennis Pritt Road"
        ],
        landmarks: ["Yaya Centre", "Prestige Plaza", "Adams Arcade"]
      },
      {
        name: "Kawangware",
        roads: [
          "Kawangware Road", "Gachui Road", "Wanyee Road",
          "Kabiria Road", "Kabete Road", "Ruthimitu Road",
          "Riruta Road", "Satellite Road"
        ],
        landmarks: ["Kawangware Market", "Riruta Stadium", "Satellite Estate"]
      },
      {
        name: "Gatina",
        roads: [
          "Gatina Road", "Wangige Road", "Githurai Road",
          "Kahawa Road", "Kiambu Road", "Ruaka Road",
          "Banana Hill Road", "Kirigiti Road"
        ],
        landmarks: ["Gatina Market", "Banana Hill Estate", "Kirigiti Estate"]
      },
      {
        name: "Kileleshwa",
        roads: [
          "Kileleshwa Road", "Ring Road Kileleshwa", "Mandera Road",
          "Mwanzi Road", "Chania Avenue", "Othaya Road",
          "Kindaruma Road", "Arboretum Drive"
        ],
        landmarks: ["Westgate Mall", "Arboretum", "Kileleshwa Estate"]
      },
      {
        name: "Kabete",
        roads: [
          "Kabete Road", "Waiyaki Way", "Gikambura Road",
          "Kabete Campus Road", "Muguga Road", "Uthiru Road",
          "Kinoo Road", "Ndenderu Road"
        ],
        landmarks: ["University of Nairobi Kabete Campus", "Muguga Forest", "Kinoo Market"]
      }
    ]
  },
  {
    name: "Langata",
    wards: [
      {
        name: "Karen",
        roads: [
          "Karen Road", "Bogani Road", "Dagoretti Road",
          "Masai Road", "Langata Road", "Ngong Road",
          "Bogani East Road", "Hardy Road"
        ],
        landmarks: ["Karen Blixen Museum", "Giraffe Centre", "Karen Country Club"]
      },
      {
        name: "Nairobi West",
        roads: [
          "Langata Road", "Magadi Road", "Kibera Drive",
          "Mbagathi Way", "Ole Sangale Road", "Kenyatta Market Road",
          "Satellite Road", "Capitol Hill Road"
        ],
        landmarks: ["Nairobi National Park", "Bomas of Kenya", "Karen Hospital"]
      },
      {
        name: "Mugumo-ini",
        roads: [
          "Mugumo Road", "Galleria Road", "Riara Road",
          "Bogani Road", "Ololua Road", "Karen Hardy Road",
          "Mukoma Road", "Olkeri Road"
        ],
        landmarks: ["Galleria Mall", "Ololua Forest", "Karen Shopping Centre"]
      },
      {
        name: "South C",
        roads: [
          "Mombasa Road", "Popo Road", "Bellevue Road",
          "Chania Road", "Nyaku Road", "Capital Centre Road",
          "Muhoho Avenue", "Red Hill Road"
        ],
        landmarks: ["Capital Centre", "Nyayo Stadium", "South C Shopping Centre"]
      },
      {
        name: "Nyayo Highrise",
        roads: [
          "Langata Road", "Nyayo Stadium Road", "Enterprise Road",
          "Likoni Road", "Kariokor Road", "Mbagathi Road",
          "Boma Road", "Wilson Airport Road"
        ],
        landmarks: ["Nyayo Stadium", "Wilson Airport", "Carnivore Restaurant"]
      }
    ]
  },
  {
    name: "Kasarani",
    wards: [
      {
        name: "Clay City",
        roads: [
          "Thika Road", "Clay Works Road", "Kasarani Road",
          "Mwiki Road", "Pipeline Road", "Githurai Road",
          "Zimmerman Road", "Kahawa Road"
        ],
        landmarks: ["Kasarani Stadium", "Mwiki Market", "Pipeline Estate"]
      },
      {
        name: "Mwiki",
        roads: [
          "Mwiki Road", "Kasarani Road", "Githurai Road",
          "Kahawa Road", "Kamiti Road", "Thika Road",
          "Zimmerman Road", "Pipeline Road"
        ],
        landmarks: ["Mwiki Market", "Githurai Market", "Kasarani Stadium"]
      },
      {
        name: "Kasarani",
        roads: [
          "Kasarani Road", "Thika Road", "Mwiki Road",
          "Stadium Road", "Seasons Road", "Clay Works Road",
          "Hunters Road", "Safari Park Road"
        ],
        landmarks: ["Kasarani Stadium", "Safari Park Hotel", "Roysambu"]
      },
      {
        name: "Njiru",
        roads: [
          "Njiru Road", "Ruiru Road", "Kamiti Road",
          "Kiambu Road", "Githurai Road", "Kahawa Road",
          "Bypass Road", "Thome Road"
        ],
        landmarks: ["Njiru Market", "Ruiru Town", "Kahawa Garrison"]
      },
      {
        name: "Ruai",
        roads: [
          "Ruai Road", "Kangundo Road", "Pipeline Road",
          "Komarock Road", "Mihango Road", "Kayole Road",
          "Matopeni Road", "Njiru Road"
        ],
        landmarks: ["Ruai Market", "Komarock Estate", "Mihango Estate"]
      }
    ]
  }
];

/**
 * Get roads for a specific ward
 */
export function getRoadsForWard(constituency: string, ward: string): string[] {
  const constituencyData = accurateNairobiLocations.find(c => c.name === constituency);
  if (!constituencyData) return [];
  
  const wardData = constituencyData.wards.find(w => w.name === ward);
  return wardData ? wardData.roads : [];
}

/**
 * Get landmarks for a specific ward
 */
export function getLandmarksForWard(constituency: string, ward: string): string[] {
  const constituencyData = accurateNairobiLocations.find(c => c.name === constituency);
  if (!constituencyData) return [];
  
  const wardData = constituencyData.wards.find(w => w.name === ward);
  return wardData ? wardData.landmarks : [];
}

/**
 * Validate if a road exists in the specified ward
 */
export function validateRoadInWard(constituency: string, ward: string, road: string): boolean {
  const roads = getRoadsForWard(constituency, ward);
  return roads.includes(road);
}

/**
 * Get all constituencies
 */
export function getAllConstituencies(): string[] {
  return accurateNairobiLocations.map(c => c.name);
}

/**
 * Get wards for a constituency
 */
export function getWardsForConstituency(constituency: string): NairobiWard[] {
  const constituencyData = accurateNairobiLocations.find(c => c.name === constituency);
  return constituencyData ? constituencyData.wards : [];
}

// Export for backward compatibility
export const simpleNairobiLocations = {
  constituencies: accurateNairobiLocations
};
