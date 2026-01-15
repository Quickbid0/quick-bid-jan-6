export const CAR_BODY_TYPES = [
  'Hatchback',
  'Sedan',
  'SUV',
  'MUV',
  'Coupe',
  'Convertible',
];

export const BIKE_BODY_TYPES = [
  'Commuter',
  'Cruiser',
  'Sports Bike',
  'Adventure Tourer',
  'Electric Bike',
];

export const SCOOTER_BODY_TYPES = [
  'Scooter',
  'Electric Scooter',
];

export type VehicleSubcategory = 'Cars' | 'Bikes' | 'Scooters';

export function getBodyTypesForSubcategory(sub: VehicleSubcategory) {
  if (sub === 'Cars') return CAR_BODY_TYPES;
  if (sub === 'Bikes') return BIKE_BODY_TYPES;
  return SCOOTER_BODY_TYPES;
}

export function getBodyTypesForMainCategoryFilter(mainCategory: string) {
  const c = (mainCategory || '').toLowerCase();
  if (!c) return [...CAR_BODY_TYPES, ...BIKE_BODY_TYPES, ...SCOOTER_BODY_TYPES];
  if (c.includes('vehicle') || c.includes('auto')) {
    return [...CAR_BODY_TYPES, ...BIKE_BODY_TYPES, ...SCOOTER_BODY_TYPES];
  }
  return [];
}
