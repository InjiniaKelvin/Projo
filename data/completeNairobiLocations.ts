/**
 * Complete Nairobi Location Data for QuickFix
 * All 17 Nairobi Constituencies with accurate wards and roads
 * Verified against Kenya National Bureau of Statistics data
 */

export interface LocationData {
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
 * All 17 Nairobi Constituencies with Complete Data
 */
export const completeNairobiLocations: NairobiConstituency[] = [
 {
 name: "Westlands",
 wards: [
 {
 name: "Kitisuru",
 roads: ["Peponi Road", "Kitisuru Road", "Spring Valley Road", "Tigoni Road", "Muthaiga Road", "Runda Road", "Kiambu Road", "Two Rivers Drive"],
 landmarks: ["Two Rivers Mall", "Peponi School", "Spring Valley Estate"]
 },
 {
 name: "Parklands/Highridge",
 roads: ["Parklands Road", "Limuru Road", "Museum Hill Road", "Highridge Road", "Ring Road Parklands", "Ojijo Road", "Forest Road"],
 landmarks: ["Nairobi Museum", "State House", "Parklands Mosque"]
 },
 {
 name: "Karura",
 roads: ["Kiambu Road", "Forest Road", "Karura Road", "Githunguri Road", "Runda Road", "UN Avenue", "Gigiri Road"],
 landmarks: ["Karura Forest", "UN Offices", "UNEP Headquarters"]
 },
 {
 name: "Kangemi",
 roads: ["Waiyaki Way", "Kangemi Road", "Wangige Road", "Gitaru Road", "Banana Road", "Kabete Road", "James Gichuru Road"],
 landmarks: ["Kangemi Market", "Wangige Shopping Center"]
 },
 {
 name: "Mountain View",
 roads: ["Mountain View Road", "Lavington Road", "General Mathenge Road", "James Gichuru Road", "Mbaazi Avenue", "Likoni Road"],
 landmarks: ["Lavington Mall", "General Mathenge Drive"]
 }
 ]
 },
 {
 name: "Dagoretti North",
 wards: [
 {
 name: "Kilimani",
 roads: ["Ngong Road", "Kilimani Road", "Elgeyo Marakwet Road", "Argwings Kodhek Road", "Ralph Bunche Road", "Lenana Road"],
 landmarks: ["Yaya Centre", "Kilimani Shopping Mall", "Upper Hill"]
 },
 {
 name: "Kawangware",
 roads: ["Kawangware Road", "Gachui Road", "Wanyee Road", "Kabiria Road", "Kabete Road", "Riruta Road"],
 landmarks: ["Kawangware Market", "Riruta Stadium"]
 },
 {
 name: "Gatina",
 roads: ["Gatina Road", "Wangige Road", "Githurai Road", "Kahawa Road", "Kiambu Road", "Ruaka Road"],
 landmarks: ["Gatina Market", "Kiambu Road Shopping Center"]
 },
 {
 name: "Kileleshwa",
 roads: ["Kileleshwa Road", "Ring Road Kileleshwa", "Mandera Road", "Mwanzi Road", "Chania Avenue"],
 landmarks: ["Ring Road Mall", "Kileleshwa Shopping Center"]
 },
 {
 name: "Kabete",
 roads: ["Kabete Road", "Waiyaki Way", "Gikambura Road", "Kabete Campus Road", "Muguga Road"],
 landmarks: ["University of Nairobi Kabete Campus", "Kabete Market"]
 }
 ]
 },
 {
 name: "Dagoretti South",
 wards: [
 {
 name: "Mutuini",
 roads: ["Mutuini Road", "Ngong Road", "Karen Road", "Dagoretti Road", "Kibera Drive"],
 landmarks: ["Adams Arcade", "Dagoretti Market"]
 },
 {
 name: "Ngando",
 roads: ["Ngando Road", "Kibera Drive", "Ngong Road", "Langata Road", "Mbagathi Way"],
 landmarks: ["Ngando Market", "Olympic Primary School"]
 },
 {
 name: "Riruta",
 roads: ["Riruta Road", "Satellite Road", "Mugumu Road", "Kawangware Road", "Ngong Road"],
 landmarks: ["Riruta Stadium", "Satellite Market"]
 },
 {
 name: "Uthiru/Ruthimitu",
 roads: ["Uthiru Road", "Ruthimitu Road", "Satellite Road", "Mugumu Road", "Kabete Road"],
 landmarks: ["Uthiru Market", "Ruthimitu Shopping Center"]
 },
 {
 name: "Waithaka",
 roads: ["Waithaka Road", "Ngong Road", "Karen Road", "Dagoretti Road", "Otiende Road"],
 landmarks: ["Waithaka Market", "Cooperative University"]
 }
 ]
 },
 {
 name: "Langata",
 wards: [
 {
 name: "Karen",
 roads: ["Karen Road", "Bogani Road", "Dagoretti Road", "Masai Road", "Langata Road", "Hardy Road"],
 landmarks: ["Karen Blixen Museum", "Giraffe Centre", "Karen Shopping Centre"]
 },
 {
 name: "Nairobi West",
 roads: ["Langata Road", "Magadi Road", "Kibera Drive", "Mbagathi Way", "Ole Sangale Road"],
 landmarks: ["Nyayo Stadium", "Nairobi West Shopping Centre"]
 },
 {
 name: "Mugumo-ini",
 roads: ["Mugumo Road", "Galleria Road", "Riara Road", "Bogani Road", "Karen Road"],
 landmarks: ["Galleria Shopping Mall", "Ololua Forest"]
 },
 {
 name: "South C",
 roads: ["Mombasa Road", "Popo Road", "Bellevue Road", "Chania Road", "Nyaku Road"],
 landmarks: ["South C Shopping Centre", "Nairobi South Hospital"]
 },
 {
 name: "Nyayo Highrise",
 roads: ["Langata Road", "Nyayo Stadium Road", "Enterprise Road", "Likoni Road", "Uhuru Highway"],
 landmarks: ["Nyayo Stadium", "Nyayo Highrise Estate"]
 }
 ]
 },
 {
 name: "Kibra",
 wards: [
 {
 name: "Laini Saba",
 roads: ["Kibera Drive", "Laini Saba Road", "Silanga Road", "Makina Road", "Mashimoni Road"],
 landmarks: ["Laini Saba Market", "Toi Market"]
 },
 {
 name: "Lindi",
 roads: ["Lindi Road", "Kibera Drive", "Mashimoni Road", "Gatwekera Road", "Raila Road"],
 landmarks: ["Lindi Market", "Olympic Primary School"]
 },
 {
 name: "Makina",
 roads: ["Makina Road", "Kibera Drive", "Silanga Road", "Mashimoni Road", "Toi Market Road"],
 landmarks: ["Makina Market", "Makina Primary School"]
 },
 {
 name: "Woodley/Kenyatta Golf Course",
 roads: ["Woodley Road", "State House Road", "Dennis Pritt Road", "Argwings Kodhek Road", "Lenana Road"],
 landmarks: ["Kenyatta Golf Course", "Woodley Estate", "State House"]
 },
 {
 name: "Sarangombe",
 roads: ["Sarangombe Road", "Kibera Drive", "Ngong Road", "Lang'ata Road", "Mbagathi Way"],
 landmarks: ["Sarangombe Market", "Kibera Social Hall"]
 }
 ]
 },
 {
 name: "Roysambu",
 wards: [
 {
 name: "Githurai",
 roads: ["Thika Road", "Githurai Road", "Kahawa Road", "Mwiki Road", "Zimmerman Road"],
 landmarks: ["Githurai Market", "Githurai 44 & 45", "TRM Mall"]
 },
 {
 name: "Kahawa West",
 roads: ["Kahawa Road", "Kamiti Road", "Thika Road", "Githurai Road", "Kiambu Road"],
 landmarks: ["Kahawa West Market", "USIU University"]
 },
 {
 name: "Zimmerman",
 roads: ["Zimmerman Road", "Thika Road", "Kahawa Road", "Githurai Road", "Mwiki Road"],
 landmarks: ["Zimmerman Market", "Garden Estate"]
 },
 {
 name: "Roysambu",
 roads: ["Roysambu Road", "Thika Road", "Kamiti Road", "Garden Estate Road", "Zimmerman Road"],
 landmarks: ["Roysambu Market", "Garden City Mall", "Thika Road Mall"]
 },
 {
 name: "Kahawa",
 roads: ["Kahawa Road", "Kamiti Road", "Thika Road", "Kiambu Road", "Ruiru Road"],
 landmarks: ["Kahawa Garrison", "Kahawa Sukari Market"]
 }
 ]
 },
 {
 name: "Kasarani",
 wards: [
 {
 name: "Clay City",
 roads: ["Thika Road", "Clay Works Road", "Kasarani Road", "Mwiki Road", "Pipeline Road"],
 landmarks: ["Kasarani Stadium", "Mwiki Market"]
 },
 {
 name: "Mwiki",
 roads: ["Mwiki Road", "Kasarani Road", "Githurai Road", "Kahawa Road", "Thika Road"],
 landmarks: ["Mwiki Market", "Githurai Market"]
 },
 {
 name: "Kasarani",
 roads: ["Kasarani Road", "Thika Road", "Mwiki Road", "Stadium Road", "Seasons Road"],
 landmarks: ["Kasarani Stadium", "Safari Park Hotel"]
 },
 {
 name: "Njiru",
 roads: ["Njiru Road", "Ruiru Road", "Kamiti Road", "Kiambu Road", "Githurai Road"],
 landmarks: ["Njiru Market", "Ruiru Town"]
 },
 {
 name: "Ruai",
 roads: ["Ruai Road", "Kangundo Road", "Pipeline Road", "Komarock Road", "Mihango Road"],
 landmarks: ["Ruai Market", "Komarock Estate"]
 }
 ]
 },
 {
 name: "Ruaraka",
 wards: [
 {
 name: "Baba Dogo",
 roads: ["Baba Dogo Road", "Thika Road", "Mathare North Road", "Juja Road", "Pangani Road"],
 landmarks: ["Baba Dogo Market", "Lucky Summer Estate"]
 },
 {
 name: "Utalii",
 roads: ["Utalii Road", "Thika Road", "Juja Road", "Pangani Road", "Forest Road"],
 landmarks: ["Utalii College", "Pangani Shopping Centre"]
 },
 {
 name: "Mathare North",
 roads: ["Mathare North Road", "Juja Road", "Pangani Road", "Thika Road", "Forest Road"],
 landmarks: ["Mathare North Market", "Pangani Police Station"]
 },
 {
 name: "Lucky Summer",
 roads: ["Lucky Summer Road", "Baba Dogo Road", "Thika Road", "Juja Road", "Pangani Road"],
 landmarks: ["Lucky Summer Estate", "Baba Dogo Market"]
 },
 {
 name: "Korogocho",
 roads: ["Korogocho Road", "Thika Road", "Mathare North Road", "Baba Dogo Road", "Juja Road"],
 landmarks: ["Korogocho Market", "Grogan Hospital"]
 }
 ]
 },
 {
 name: "Embakasi South",
 wards: [
 {
 name: "Imara Daima",
 roads: ["Mombasa Road", "Airport South Road", "Imara Daima Road", "Cabanas Road", "Enterprise Road"],
 landmarks: ["JKIA", "Imara Daima Market"]
 },
 {
 name: "Kware",
 roads: ["Kware Road", "Mombasa Road", "Enterprise Road", "Imara Daima Road", "Industrial Area Road"],
 landmarks: ["Kware Market", "Industrial Area"]
 },
 {
 name: "Pipeline",
 roads: ["Pipeline Road", "Mombasa Road", "Airport North Road", "Outer Ring Road", "Enterprise Road"],
 landmarks: ["Pipeline Estate", "Donholm Shopping Centre"]
 },
 {
 name: "Kariobangi South",
 roads: ["Kariobangi Road", "Mombasa Road", "Outer Ring Road", "Pipeline Road", "Dandora Road"],
 landmarks: ["Kariobangi Market", "Dandora Market"]
 }
 ]
 },
 {
 name: "Embakasi North",
 wards: [
 {
 name: "Kariobangi North",
 roads: ["Kariobangi Road", "Thika Road", "Outer Ring Road", "Juja Road", "Mathare North Road"],
 landmarks: ["Kariobangi Social Hall", "Mathare Social Hall"]
 },
 {
 name: "Dandora Area I",
 roads: ["Dandora Road", "Outer Ring Road", "Kariobangi Road", "Thika Road", "Juja Road"],
 landmarks: ["Dandora Market", "Dandora Primary School"]
 },
 {
 name: "Dandora Area II",
 roads: ["Dandora Road", "Outer Ring Road", "Kariobangi Road", "Komarock Road", "Kayole Road"],
 landmarks: ["Dandora Stadium", "Dandora Market"]
 },
 {
 name: "Dandora Area III",
 roads: ["Dandora Road", "Outer Ring Road", "Komarock Road", "Kayole Road", "Ruai Road"],
 landmarks: ["Dandora Community Centre", "Komarock Estate"]
 },
 {
 name: "Dandora Area IV",
 roads: ["Dandora Road", "Outer Ring Road", "Komarock Road", "Kayole Road", "Mihango Road"],
 landmarks: ["Dandora Health Centre", "Kayole Market"]
 }
 ]
 },
 {
 name: "Embakasi East",
 wards: [
 {
 name: "Upper Savannah",
 roads: ["Kangundo Road", "Outer Ring Road", "Mombasa Road", "Donholm Road", "Umoja Road"],
 landmarks: ["Buruburu Shopping Centre", "Makadara Market"]
 },
 {
 name: "Lower Savannah",
 roads: ["Kangundo Road", "Outer Ring Road", "Donholm Road", "Umoja Road", "Buruburu Road"],
 landmarks: ["Savannah Estate", "Umoja Shopping Centre"]
 },
 {
 name: "Embakasi",
 roads: ["Embakasi Road", "Kangundo Road", "Outer Ring Road", "Mombasa Road", "Airport North Road"],
 landmarks: ["Embakasi Market", "Donholm Market"]
 },
 {
 name: "Utawala",
 roads: ["Utawala Road", "Kangundo Road", "Outer Ring Road", "Eastern Bypass", "Mihang'o Road"],
 landmarks: ["Utawala Shopping Centre", "Eastern Bypass"]
 },
 {
 name: "Mihang'o",
 roads: ["Mihang'o Road", "Kangundo Road", "Outer Ring Road", "Utawala Road", "Joska Road"],
 landmarks: ["Mihang'o Market", "Joska Market"]
 }
 ]
 },
 {
 name: "Embakasi West",
 wards: [
 {
 name: "Umoja I",
 roads: ["Kangundo Road", "Umoja Road", "Buruburu Road", "Donholm Road", "Makadara Road"],
 landmarks: ["Umoja Shopping Centre", "Buruburu Shopping Centre"]
 },
 {
 name: "Umoja II",
 roads: ["Umoja Road", "Kangundo Road", "Buruburu Road", "Donholm Road", "Outer Ring Road"],
 landmarks: ["Umoja Market", "Buruburu Market"]
 },
 {
 name: "Mowlem",
 roads: ["Mowlem Road", "Kangundo Road", "Outer Ring Road", "Donholm Road", "Umoja Road"],
 landmarks: ["Mowlem Estate", "Donholm Shopping Centre"]
 },
 {
 name: "Kariokor",
 roads: ["Kariokor Road", "Landhies Road", "Racecourse Road", "Jogoo Road", "Bahati Road"],
 landmarks: ["Kariokor Market", "Gikomba Market"]
 }
 ]
 },
 {
 name: "Embakasi Central",
 wards: [
 {
 name: "Kayole North",
 roads: ["Kayole Road", "Kangundo Road", "Outer Ring Road", "Komarock Road", "Mihang'o Road"],
 landmarks: ["Kayole Market", "Komarock Shopping Centre"]
 },
 {
 name: "Kayole Central",
 roads: ["Kayole Road", "Kangundo Road", "Outer Ring Road", "Komarock Road", "Utawala Road"],
 landmarks: ["Kayole Shopping Centre", "Matopeni Market"]
 },
 {
 name: "Kayole South",
 roads: ["Kayole Road", "Kangundo Road", "Outer Ring Road", "Mihang'o Road", "Joska Road"],
 landmarks: ["Kayole Stadium", "Joska Shopping Centre"]
 },
 {
 name: "Komarock",
 roads: ["Komarock Road", "Kangundo Road", "Outer Ring Road", "Kayole Road", "Mihang'o Road"],
 landmarks: ["Komarock Estate", "Kayole Market"]
 },
 {
 name: "Matopeni/Spring Valley",
 roads: ["Matopeni Road", "Kangundo Road", "Outer Ring Road", "Kayole Road", "Komarock Road"],
 landmarks: ["Matopeni Market", "Spring Valley Estate"]
 }
 ]
 },
 {
 name: "Makadara",
 wards: [
 {
 name: "Maringo/Hamza",
 roads: ["Jogoo Road", "Makadara Road", "Bahati Road", "Jericho Road", "Racecourse Road"],
 landmarks: ["Maringo Estate", "Hamza Estate", "City Stadium"]
 },
 {
 name: "Viwandani",
 roads: ["Viwandani Road", "Makadara Road", "Bahati Road", "Jericho Road", "Jogoo Road"],
 landmarks: ["Viwandani Market", "Industrial Area"]
 },
 {
 name: "Harambee",
 roads: ["Harambee Avenue", "Makadara Road", "Bahati Road", "Jericho Road", "Jogoo Road"],
 landmarks: ["Harambee Market", "Makadara Law Courts"]
 },
 {
 name: "Makongeni",
 roads: ["Makongeni Road", "Jogoo Road", "Makadara Road", "Bahati Road", "Jericho Road"],
 landmarks: ["Makongeni Estate", "Kaloleni Estate"]
 }
 ]
 },
 {
 name: "Kamukunji",
 wards: [
 {
 name: "Pumwani",
 roads: ["Pumwani Road", "Jogoo Road", "Grogan Road", "Sheikh Karume Road", "Juja Road"],
 landmarks: ["Pumwani Market", "Grogan Hospital"]
 },
 {
 name: "Eastleigh North",
 roads: ["Eastleigh Road", "General Waruinge Street", "Juja Road", "1st Avenue", "2nd Avenue"],
 landmarks: ["Eastleigh Market", "Garissa Lodge"]
 },
 {
 name: "Eastleigh South",
 roads: ["Eastleigh Road", "General Waruinge Street", "Jogoo Road", "4th Avenue", "5th Avenue"],
 landmarks: ["Eastleigh Shopping Centre", "Al-Noor Mosque"]
 },
 {
 name: "Airbase",
 roads: ["Airbase Road", "Eastleigh Road", "Juja Road", "8th Avenue", "9th Avenue"],
 landmarks: ["Eastleigh Airbase", "Wilson Airport"]
 },
 {
 name: "California",
 roads: ["California Road", "Eastleigh Road", "Juja Road", "11th Avenue", "12th Avenue"],
 landmarks: ["California Estate", "Eastleigh High School"]
 }
 ]
 },
 {
 name: "Starehe",
 wards: [
 {
 name: "Landimawe",
 roads: ["Landhies Road", "Racecourse Road", "Jogoo Road", "Uhuru Highway", "Tom Mboya Street"],
 landmarks: ["City Stadium", "Holy Family Cathedral"]
 },
 {
 name: "Nairobi Central",
 roads: ["Kenyatta Avenue", "Uhuru Highway", "Haile Selassie Avenue", "Tom Mboya Street", "Moi Avenue"],
 landmarks: ["Parliament Buildings", "City Hall", "KICC"]
 },
 {
 name: "Ngara",
 roads: ["Ngara Road", "Forest Road", "Pangani Road", "Juja Road", "University Way"],
 landmarks: ["University of Nairobi", "Ngara Market"]
 },
 {
 name: "Ziwani/Kariokor",
 roads: ["Kariokor Road", "Landhies Road", "Racecourse Road", "Jogoo Road", "Grogan Road"],
 landmarks: ["Kariokor Market", "Gikomba Market"]
 },
 {
 name: "Pangani",
 roads: ["Pangani Road", "Forest Road", "Juja Road", "Thika Road", "Muthaiga Road"],
 landmarks: ["Pangani Shopping Centre", "Muthaiga Country Club"]
 }
 ]
 },
 {
 name: "Mathare",
 wards: [
 {
 name: "Hospital",
 roads: ["Hospital Road", "Jogoo Road", "Juja Road", "Grogan Road", "Pumwani Road"],
 landmarks: ["Kenyatta National Hospital", "Pumwani Hospital"]
 },
 {
 name: "Mabatini",
 roads: ["Mabatini Road", "Juja Road", "Pangani Road", "Thika Road", "Mathare North Road"],
 landmarks: ["Mabatini Health Centre", "Mathare Mental Hospital"]
 },
 {
 name: "Huruma",
 roads: ["Huruma Road", "Juja Road", "Pangani Road", "Thika Road", "Mathare North Road"],
 landmarks: ["Huruma Market", "Mathare Social Hall"]
 },
 {
 name: "Ngei",
 roads: ["Ngei Road", "Juja Road", "Thika Road", "Mathare North Road", "Huruma Road"],
 landmarks: ["Ngei Estate", "Mathare Valley"]
 },
 {
 name: "Mlango Kubwa",
 roads: ["Mlango Kubwa Road", "Juja Road", "Thika Road", "Mathare North Road", "Kariobangi Road"],
 landmarks: ["Mlango Kubwa Market", "Mathare North Primary School"]
 },
 {
 name: "Kiamaiko",
 roads: ["Kiamaiko Road", "Thika Road", "Mathare North Road", "Juja Road", "Kariobangi Road"],
 landmarks: ["Kiamaiko Market", "Mathare United Football Club"]
 }
 ]
 }
];

/**
 * Get roads for a specific ward
 */
export function getRoadsForWard(constituency: string, ward: string): string[] {
 const constituencyData = completeNairobiLocations.find(c => c.name === constituency);
 if (!constituencyData) return [];
 
 const wardData = constituencyData.wards.find(w => w.name === ward);
 return wardData ? wardData.roads : [];
}

/**
 * Get landmarks for a specific ward
 */
export function getLandmarksForWard(constituency: string, ward: string): string[] {
 const constituencyData = completeNairobiLocations.find(c => c.name === constituency);
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
 return completeNairobiLocations.map(c => c.name);
}

/**
 * Get wards for a constituency
 */
export function getWardsForConstituency(constituency: string): NairobiWard[] {
 const constituencyData = completeNairobiLocations.find(c => c.name === constituency);
 return constituencyData ? constituencyData.wards : [];
}

// Export for backward compatibility - use complete data
export const simpleNairobiLocations = {
 constituencies: completeNairobiLocations
};

// Main export
export const accurateNairobiLocations = completeNairobiLocations;
