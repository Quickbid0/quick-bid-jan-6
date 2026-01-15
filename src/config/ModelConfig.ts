export const CAR_MODELS: Record<string, string[]> = {
  'Maruti Suzuki': ['Alto', 'Wagon R', 'Swift', 'Baleno', 'Dzire', 'Ertiga', 'Brezza', 'Celerio'],
  'Hyundai': ['i10', 'i20', 'Grand i10 Nios', 'Creta', 'Venue', 'Verna', 'Aura'],
  'Tata': ['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari'],
  'Kia': ['Sonet', 'Seltos', 'Carens'],
  'Toyota': ['Innova Crysta', 'Fortuner', 'Glanza', 'Urban Cruiser'],
  'Honda': ['City', 'Amaze', 'WR-V', 'Jazz'],
  'Mahindra': ['Bolero', 'Scorpio', 'XUV300', 'XUV700', 'Thar'],
  'Volkswagen': ['Polo', 'Vento', 'Taigun'],
  'Skoda': ['Rapid', 'Slavia', 'Kushaq'],
};

export const BIKE_MODELS: Record<string, string[]> = {
  'Royal Enfield': ['Classic 350', 'Bullet 350', 'Hunter 350', 'Meteor 350', 'Himalayan'],
  'Bajaj': ['Pulsar 150', 'Pulsar NS200', 'Dominar 400', 'Platina 110'],
  'TVS': ['Apache RTR 160', 'Apache RR 310', 'Raider 125', 'Star City Plus'],
  'Yamaha': ['FZ-S', 'R15', 'MT-15', 'Fascino'],
  'Hero': ['Splendor Plus', 'Passion Pro', 'Glamour', 'Xtreme 160R'],
  'Honda': ['Shine', 'Unicorn', 'Hornet 2.0', 'Activa 6G'],
  'KTM': ['Duke 200', 'Duke 390', 'RC 200', 'RC 390'],
};

export const SCOOTER_MODELS: Record<string, string[]> = {
  'Honda': ['Activa 6G', 'Dio', 'Aviator'],
  'TVS': ['Jupiter', 'NTorq 125', 'Wego'],
  'Suzuki': ['Access 125', 'Burgman Street'],
  'Yamaha': ['RayZR', 'Fascino'],
  'Ather': ['450X', '450S'],
  'Ola Electric': ['S1 Air', 'S1 Pro'],
};

export function getModelsForBrand(category: string, subcategory: string, brand: string): string[] {
  const b = brand || '';
  if (!b) return [];

  if (category === 'Automobiles') {
    if (subcategory === 'Cars') {
      return CAR_MODELS[b] || [];
    }
    if (subcategory === 'Bikes') {
      return BIKE_MODELS[b] || [];
    }
    if (subcategory === 'Scooters') {
      return SCOOTER_MODELS[b] || [];
    }
  }

  return [];
}
