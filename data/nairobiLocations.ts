/**
 * Nairobi Location Data
 * Hierarchical structure: Constituency → Ward → Roads/Landmarks
 */

export interface Landmark {
  id: string;
  name: string;
  type: 'road' | 'building' | 'business' | 'landmark' | 'estate';
  latitude: number;
  longitude: number;
  description?: string;
}

export interface Ward {
  id: string;
  name: string;
  landmarks: Landmark[];
}

export interface Constituency {
  id: string;
  name: string;
  wards: Ward[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const nairobiLocations: Constituency[] = [
  {
    id: 'westlands',
    name: 'Westlands',
    bounds: { north: -1.250, south: -1.285, east: 36.825, west: 36.795 },
    wards: [
      {
        id: 'kitisuru',
        name: 'Kitisuru',
        landmarks: [
          {
            id: 'kitisuru_1',
            name: 'Kitisuru Road',
            type: 'road',
            latitude: -1.2647,
            longitude: 36.8034,
            description: 'Main road through Kitisuru'
          },
          {
            id: 'kitisuru_2',
            name: 'Village Market',
            type: 'business',
            latitude: -1.2643,
            longitude: 36.8021,
            description: 'Major shopping center'
          },
          {
            id: 'kitisuru_3',
            name: 'Runda Estate',
            type: 'estate',
            latitude: -1.2589,
            longitude: 36.8012,
            description: 'Residential estate'
          }
        ]
      },
      {
        id: 'parklands',
        name: 'Parklands',
        landmarks: [
          {
            id: 'parklands_1',
            name: 'Limuru Road',
            type: 'road',
            latitude: -1.2645,
            longitude: 36.8585,
            description: 'Major highway through Parklands'
          },
          {
            id: 'parklands_2',
            name: 'Aga Khan Hospital',
            type: 'landmark',
            latitude: -1.2634,
            longitude: 36.8522,
            description: 'Major hospital facility'
          },
          {
            id: 'parklands_3',
            name: 'Parklands Mosque',
            type: 'landmark',
            latitude: -1.2658,
            longitude: 36.8543,
            description: 'Religious landmark'
          }
        ]
      },
      {
        id: 'highridge',
        name: 'Highridge',
        landmarks: [
          {
            id: 'highridge_1',
            name: 'Spring Valley Road',
            type: 'road',
            latitude: -1.2712,
            longitude: 36.8145,
            description: 'Residential road'
          },
          {
            id: 'highridge_2',
            name: 'Ridgeways Mall',
            type: 'business',
            latitude: -1.2698,
            longitude: 36.8123,
            description: 'Shopping center'
          }
        ]
      },
      {
        id: 'westlands_central',
        name: 'Westlands Central',
        landmarks: [
          {
            id: 'westlands_1',
            name: 'Waiyaki Way',
            type: 'road',
            latitude: -1.2697,
            longitude: 36.8084,
            description: 'Major highway'
          },
          {
            id: 'westlands_2',
            name: 'Westgate Shopping Mall',
            type: 'business',
            latitude: -1.2689,
            longitude: 36.8067,
            description: 'Major shopping mall'
          },
          {
            id: 'westlands_3',
            name: 'Sarit Centre',
            type: 'business',
            latitude: -1.2705,
            longitude: 36.8098,
            description: 'Shopping center'
          },
          {
            id: 'westlands_4',
            name: 'ABC Place',
            type: 'business',
            latitude: -1.2687,
            longitude: 36.8045,
            description: 'Business complex'
          }
        ]
      }
    ]
  },
  {
    id: 'kilimani',
    name: 'Kilimani',
    bounds: { north: -1.285, south: -1.315, east: 36.795, west: 36.765 },
    wards: [
      {
        id: 'kilimani_central',
        name: 'Kilimani Central',
        landmarks: [
          {
            id: 'kilimani_1',
            name: 'Argwings Kodhek Road',
            type: 'road',
            latitude: -1.2978,
            longitude: 36.7816,
            description: 'Main road through Kilimani'
          },
          {
            id: 'kilimani_2',
            name: 'Yaya Centre',
            type: 'business',
            latitude: -1.2985,
            longitude: 36.7823,
            description: 'Shopping center'
          },
          {
            id: 'kilimani_3',
            name: 'The Mall Westlands',
            type: 'business',
            latitude: -1.2967,
            longitude: 36.7845,
            description: 'Shopping mall'
          }
        ]
      },
      {
        id: 'kileleshwa',
        name: 'Kileleshwa',
        landmarks: [
          {
            id: 'kileleshwa_1',
            name: 'Mandera Road',
            type: 'road',
            latitude: -1.2945,
            longitude: 36.7789,
            description: 'Residential road'
          },
          {
            id: 'kileleshwa_2',
            name: 'Kasuku Centre',
            type: 'business',
            latitude: -1.2934,
            longitude: 36.7798,
            description: 'Local shopping center'
          }
        ]
      }
    ]
  },
  {
    id: 'karen',
    name: 'Karen',
    bounds: { north: -1.310, south: -1.340, east: 36.695, west: 36.665 },
    wards: [
      {
        id: 'karen_central',
        name: 'Karen Central',
        landmarks: [
          {
            id: 'karen_1',
            name: 'Karen Road',
            type: 'road',
            latitude: -1.3197,
            longitude: 36.6853,
            description: 'Main road through Karen'
          },
          {
            id: 'karen_2',
            name: 'Karen Country Club',
            type: 'landmark',
            latitude: -1.3212,
            longitude: 36.6834,
            description: 'Exclusive club'
          },
          {
            id: 'karen_3',
            name: 'Junction Mall',
            type: 'business',
            latitude: -1.3187,
            longitude: 36.6867,
            description: 'Shopping mall'
          },
          {
            id: 'karen_4',
            name: 'Karen Hospital',
            type: 'landmark',
            latitude: -1.3234,
            longitude: 36.6823,
            description: 'Private hospital'
          }
        ]
      },
      {
        id: 'nairobi_west',
        name: 'Nairobi West',
        landmarks: [
          {
            id: 'nairobi_west_1',
            name: 'Dagoretti Road',
            type: 'road',
            latitude: -1.3156,
            longitude: 36.6912,
            description: 'Major road'
          },
          {
            id: 'nairobi_west_2',
            name: 'Adams Arcade',
            type: 'business',
            latitude: -1.3145,
            longitude: 36.6923,
            description: 'Shopping area'
          }
        ]
      }
    ]
  },
  {
    id: 'lang_ata',
    name: "Lang'ata",
    bounds: { north: -1.315, south: -1.350, east: 36.835, west: 36.795 },
    wards: [
      {
        id: 'south_b',
        name: 'South B',
        landmarks: [
          {
            id: 'south_b_1',
            name: 'Mombasa Road',
            type: 'road',
            latitude: -1.3163,
            longitude: 36.8310,
            description: 'Major highway'
          },
          {
            id: 'south_b_2',
            name: 'Belle Vue Cinema',
            type: 'business',
            latitude: -1.3178,
            longitude: 36.8298,
            description: 'Entertainment center'
          },
          {
            id: 'south_b_3',
            name: 'South B Shopping Centre',
            type: 'business',
            latitude: -1.3189,
            longitude: 36.8287,
            description: 'Local shopping center'
          }
        ]
      },
      {
        id: 'south_c',
        name: 'South C',
        landmarks: [
          {
            id: 'south_c_1',
            name: 'Popo Road',
            type: 'road',
            latitude: -1.3234,
            longitude: 36.8234,
            description: 'Main road in South C'
          },
          {
            id: 'south_c_2',
            name: 'Galleria Shopping Mall',
            type: 'business',
            latitude: -1.3245,
            longitude: 36.8223,
            description: 'Major shopping mall'
          }
        ]
      },
      {
        id: 'nyayo_highrise',
        name: 'Nyayo Highrise',
        landmarks: [
          {
            id: 'nyayo_1',
            name: 'Nyayo Stadium',
            type: 'landmark',
            latitude: -1.3267,
            longitude: 36.8189,
            description: 'National stadium'
          },
          {
            id: 'nyayo_2',
            name: 'Enterprise Road',
            type: 'road',
            latitude: -1.3278,
            longitude: 36.8167,
            description: 'Industrial area road'
          }
        ]
      }
    ]
  },
  {
    id: 'dagoretti_north',
    name: 'Dagoretti North',
    bounds: { north: -1.285, south: -1.320, east: 36.760, west: 36.720 },
    wards: [
      {
        id: 'kilimani_kileleshwa',
        name: 'Kilimani/Kileleshwa',
        landmarks: [
          {
            id: 'dagoretti_1',
            name: 'Ngong Road',
            type: 'road',
            latitude: -1.3012,
            longitude: 36.7634,
            description: 'Major road to Ngong'
          },
          {
            id: 'dagoretti_2',
            name: 'Prestige Plaza',
            type: 'business',
            latitude: -1.3023,
            longitude: 36.7645,
            description: 'Shopping center'
          }
        ]
      }
    ]
  },
  {
    id: 'starehe',
    name: 'Starehe',
    bounds: { north: -1.270, south: -1.300, east: 36.845, west: 36.815 },
    wards: [
      {
        id: 'nairobi_central',
        name: 'Nairobi Central',
        landmarks: [
          {
            id: 'cbd_1',
            name: 'Kenyatta Avenue',
            type: 'road',
            latitude: -1.2864,
            longitude: 36.8230,
            description: 'Main street in CBD'
          },
          {
            id: 'cbd_2',
            name: 'KICC',
            type: 'landmark',
            latitude: -1.2876,
            longitude: 36.8219,
            description: 'Kenyatta International Conference Centre'
          },
          {
            id: 'cbd_3',
            name: 'Times Tower',
            type: 'building',
            latitude: -1.2854,
            longitude: 36.8243,
            description: 'Prominent office building'
          },
          {
            id: 'cbd_4',
            name: 'Sarit Centre',
            type: 'business',
            latitude: -1.2889,
            longitude: 36.8201,
            description: 'Shopping center'
          }
        ]
      },
      {
        id: 'pangani',
        name: 'Pangani',
        landmarks: [
          {
            id: 'pangani_1',
            name: 'Juja Road',
            type: 'road',
            latitude: -1.2756,
            longitude: 36.8334,
            description: 'Major road through Pangani'
          },
          {
            id: 'pangani_2',
            name: 'Pangani Shopping Centre',
            type: 'business',
            latitude: -1.2743,
            longitude: 36.8345,
            description: 'Local shopping center'
          }
        ]
      }
    ]
  }
];

export const findLocationByName = (name: string): Landmark | null => {
  for (const constituency of nairobiLocations) {
    for (const ward of constituency.wards) {
      for (const landmark of ward.landmarks) {
        if (landmark.name.toLowerCase().includes(name.toLowerCase())) {
          return landmark;
        }
      }
    }
  }
  return null;
};

export const getLocationHierarchy = (landmarkId: string): { constituency: Constituency; ward: Ward; landmark: Landmark } | null => {
  for (const constituency of nairobiLocations) {
    for (const ward of constituency.wards) {
      for (const landmark of ward.landmarks) {
        if (landmark.id === landmarkId) {
          return { constituency, ward, landmark };
        }
      }
    }
  }
  return null;
};
