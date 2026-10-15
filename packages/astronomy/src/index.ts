export type ObjectKind =
  | 'star'
  | 'planet'
  | 'moon'
  | 'dwarf planet'
  | 'asteroid'
  | 'comet'
  | 'galaxy'
  | 'exoplanet'
  | 'nebula'
  | 'black hole'
  | 'mission'
  | 'event';

export type Confidence = 'verified' | 'estimated' | 'modeled' | 'candidate' | 'unknown';

export interface ScientificFact {
  key: string;
  label: string;
  value: string;
  unit?: string;
  confidence: Confidence;
  sourceIds: string[];
  note?: string;
}

export interface SourceRecord {
  id: string;
  organization: string;
  title: string;
  url: string;
  description: string;
  lastReviewed: string;
  usage: string;
}

export interface OrbitalElements {
  /** JPL approximate mean orbital elements at J2000. */
  a: number;
  aRate: number;
  e: number;
  eRate: number;
  inclination: number;
  inclinationRate: number;
  meanLongitude: number;
  meanLongitudeRate: number;
  longitudePerihelion: number;
  longitudePerihelionRate: number;
  longitudeAscendingNode: number;
  longitudeAscendingNodeRate: number;
}

export interface CelestialObject {
  id: string;
  name: string;
  designation?: string;
  kind: ObjectKind;
  typeLabel: string;
  description: string;
  color: string;
  visualRadius: number;
  parentId?: string;
  system: string;
  family: 'solar-system' | 'moon' | 'mission' | 'event' | 'star' | 'galaxy' | 'catalog';
  order?: number;
  orbitalElements?: OrbitalElements;
  facts: ScientificFact[];
  tags: string[];
  lifeStatus?: string;
}

export interface MissionRecord {
  id: string;
  name: string;
  agency: string;
  launched: string;
  status: string;
  destination: string;
  description: string;
  sourceIds: string[];
}

const planetSource = 'nasa-factsheet';
const jplOrbits = 'jpl-orbits';
const moonsSource = 'nasa-moons';
const moonFactSheet = 'nssdc-moon';
const marsFactSheet = 'nssdc-mars';
const jovianFactSheet = 'nssdc-jovian-satellites';
const saturnianFactSheet = 'nssdc-saturnian-satellites';
const neptunianFactSheet = 'nssdc-neptunian-satellites';
const satellitePhysicalParameters = 'jpl-satellite-physical';
const sunSource = 'nasa-sun';
const missionsSource = 'nasa-missions';

export const SOURCES: SourceRecord[] = [
  {
    id: 'nasa-factsheet',
    organization: 'NASA / National Space Science Data Center',
    title: 'Planetary Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
    description: 'Reference values for the Sun and planets, including mass, mean radius, orbital period, and selected physical properties. Values are a curated static snapshot; consult the source for current revisions and definitions.',
    lastReviewed: '2026-10-15',
    usage: 'Public NASA reference material. Values in NexSolarix are reproduced with units and scientific labels; the source remains authoritative.'
  },
  {
    id: 'jpl-orbits',
    organization: 'NASA Jet Propulsion Laboratory',
    title: 'Approximate Positions of the Major Planets',
    url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
    description: 'Approximate mean orbital elements and secular rates used to calculate the schematic Solar System view. This low-precision model is not an ephemeris and should not be used for navigation or observation planning.',
    lastReviewed: '2026-10-15',
    usage: 'NASA/JPL public scientific reference. This application implements its published approximate-elements method; resulting visual positions are explicitly approximate.'
  },
  {
    id: 'nasa-moons',
    organization: 'NASA Science',
    title: 'Moons of the Solar System',
    url: 'https://science.nasa.gov/solar-system/moons/',
    description: 'NASA overview of natural satellites and exploration context. This is background context, not a substitute for the mission and fact-sheet references attached to numerical values.',
    lastReviewed: '2026-10-15',
    usage: 'Public NASA educational reference. Check the moon-specific pages and linked primary references for details.'
  },
  {
    id: 'nssdc-moon',
    organization: 'NASA / National Space Science Data Center',
    title: 'Moon Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',
    description: 'Reference values for the Moon, including mass, volumetric mean radius, orbital period, and surface acceleration.',
    lastReviewed: '2026-10-15',
    usage: 'Values are rounded to the precision shown by the reference; definitions and orbital context are retained in NexSolarix notes.'
  },
  {
    id: 'nssdc-mars',
    organization: 'NASA / National Space Science Data Center',
    title: 'Mars Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
    description: 'Reference orbital parameters for Phobos and Deimos, including their sidereal periods.',
    lastReviewed: '2026-10-15',
    usage: 'Orbital periods are converted from days to hours where displayed; the conversion is rounded.'
  },
  {
    id: 'nssdc-jovian-satellites',
    organization: 'NASA / National Space Science Data Center',
    title: 'Jovian Satellite Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html',
    description: 'Bulk physical parameters and orbital periods for Jupiter’s natural satellites, including the Galilean moons.',
    lastReviewed: '2026-10-15',
    usage: 'Values are curated from the reference table and rounded as displayed; current satellite counts can change as discoveries are confirmed.'
  },
  {
    id: 'nssdc-saturnian-satellites',
    organization: 'NASA / National Space Science Data Center',
    title: 'Saturnian Satellite Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturniansatfact.html',
    description: 'Bulk physical parameters and orbital periods for Saturn’s natural satellites, including Titan and Enceladus.',
    lastReviewed: '2026-10-15',
    usage: 'Irregular shape dimensions and volumetric mean radii are different quantities; values shown here follow the source’s stated reference.'
  },
  {
    id: 'nssdc-neptunian-satellites',
    organization: 'NASA / National Space Science Data Center',
    title: 'Neptunian Satellite Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptuniansatfact.html',
    description: 'Physical and orbital reference values for Neptune’s satellites, including Triton’s mass, radius, and retrograde orbital period.',
    lastReviewed: '2026-10-15',
    usage: 'Triton’s period is marked retrograde by the source; NexSolarix preserves the period magnitude and notes the retrograde orbit in the profile.'
  },
  {
    id: 'jpl-satellite-physical',
    organization: 'NASA Jet Propulsion Laboratory · Solar System Dynamics',
    title: 'Planetary Satellite Physical Parameters',
    url: 'https://ssd.jpl.nasa.gov/sats/phys_par/',
    description: 'JPL table of available satellite gravitational parameters, mean radii, uncertainties, and reference ephemerides.',
    lastReviewed: '2026-10-15',
    usage: 'Mean radii are volume-equivalent values with source-reported uncertainties; the table reports GM rather than mass.'
  },
  {
    id: 'nasa-europa',
    organization: 'NASA Science',
    title: 'Europa: Facts',
    url: 'https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/',
    description: 'NASA overview of Europa’s icy surface, subsurface ocean evidence, and potential for life.',
    lastReviewed: '2026-10-15',
    usage: 'Potential habitability is not evidence of life; NexSolarix uses the source to describe research interest, not to claim detection.'
  },
  {
    id: 'nasa-ganymede',
    organization: 'NASA Science',
    title: 'Ganymede',
    url: 'https://science.nasa.gov/jupiter/jupiter-moons/ganymede/facts/',
    description: 'NASA overview of Ganymede, including evidence for a subsurface saltwater ocean.',
    lastReviewed: '2026-10-15',
    usage: 'Ocean evidence is indirect; a subsurface ocean does not establish that life exists.'
  },
  {
    id: 'nasa-callisto',
    organization: 'NASA Science',
    title: 'Callisto',
    url: 'https://science.nasa.gov/jupiter/jupiter-moons/callisto/facts/',
    description: 'NASA overview of Callisto and evidence consistent with a possible subsurface ocean.',
    lastReviewed: '2026-10-15',
    usage: 'The subsurface ocean is described as possible, not confirmed; NexSolarix preserves that uncertainty.'
  },
  {
    id: 'nasa-enceladus',
    organization: 'NASA Science',
    title: 'Enceladus',
    url: 'https://science.nasa.gov/saturn/moons/enceladus/',
    description: 'NASA overview of Enceladus, including its active plumes and subsurface ocean evidence.',
    lastReviewed: '2026-10-15',
    usage: 'Ocean evidence and habitability are distinct from a detection of life; no life claim is made.'
  },
  {
    id: 'nasa-titan',
    organization: 'NASA Science',
    title: 'Titan',
    url: 'https://science.nasa.gov/saturn/moons/titan/facts/',
    description: 'NASA overview of Titan’s atmosphere, hydrocarbon seas, subsurface ocean evidence, and possible habitable environments.',
    lastReviewed: '2026-10-15',
    usage: 'Habitability is a research question; it does not imply evidence for life.'
  },
  {
    id: 'nasa-sun',
    organization: 'NASA Science',
    title: 'Sun Facts',
    url: 'https://science.nasa.gov/sun/facts/',
    description: 'NASA overview of the Sun and its physical properties.',
    lastReviewed: '2026-10-15',
    usage: 'Public NASA educational reference. Values are presented with the stated precision and context.'
  },
  {
    id: 'nasa-missions',
    organization: 'NASA',
    title: 'NASA Mission Directory',
    url: 'https://www.nasa.gov/missions/',
    description: 'NASA mission directory for launch, destination, and mission overview information.',
    lastReviewed: '2026-10-15',
    usage: 'Mission descriptions are concise summaries. Operational status can change; check the mission page for current status.'
  },
  {
    id: 'nasa-skywatching',
    organization: 'NASA Science',
    title: 'Skywatching & eclipse resources',
    url: 'https://science.nasa.gov/skywatching/',
    description: 'NASA skywatching guidance and observing resources. NexSolarix does not currently ingest a live event calendar.',
    lastReviewed: '2026-10-15',
    usage: 'Use the linked NASA resource for current observing information; no unverified event dates are shown here.'
  }
];

const fact = (
  key: string,
  label: string,
  value: string,
  unit: string | undefined,
  sourceIds: string[],
  confidence: Confidence = 'verified',
  note?: string
): ScientificFact => ({ key, label, value, unit, sourceIds, confidence, note });

const orbit = (
  a: number, aRate: number, e: number, eRate: number, inclination: number, inclinationRate: number,
  meanLongitude: number, meanLongitudeRate: number, longitudePerihelion: number, longitudePerihelionRate: number,
  longitudeAscendingNode: number, longitudeAscendingNodeRate: number
): OrbitalElements => ({
  a, aRate, e, eRate, inclination, inclinationRate, meanLongitude, meanLongitudeRate,
  longitudePerihelion, longitudePerihelionRate, longitudeAscendingNode, longitudeAscendingNodeRate
});

const planets: CelestialObject[] = [
  {
    id: 'mercury', name: 'Mercury', designation: 'Inner planet · I', kind: 'planet', typeLabel: 'Terrestrial planet',
    description: 'The smallest planet and the closest to the Sun. Its heavily cratered surface preserves a long record of impacts.',
    color: '#a6a39d', visualRadius: 0.14, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 1,
    orbitalElements: orbit(0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.25032350, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081),
    facts: [
      fact('mean-radius', 'Mean radius', '2,439.7', 'km', [planetSource]),
      fact('mass', 'Mass', '3.3011 × 10²³', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '0.3871', 'AU', [planetSource], 'estimated', 'Mean orbital distance; not the instantaneous distance.'),
      fact('orbital-period', 'Orbital period', '87.969', 'Earth days', [planetSource]),
      fact('surface-gravity', 'Surface gravity', '3.70', 'm/s²', [planetSource]),
      fact('mean-temperature', 'Mean surface temperature', '167', '°C', [planetSource], 'estimated', 'Temperature varies greatly between day and night.')
    ], tags: ['inner planet', 'rocky'], lifeStatus: 'No confirmed evidence'
  },
  {
    id: 'venus', name: 'Venus', designation: 'Inner planet · II', kind: 'planet', typeLabel: 'Terrestrial planet',
    description: 'A rocky world with a dense carbon-dioxide atmosphere and a persistent global cloud layer.',
    color: '#e6b97c', visualRadius: 0.21, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 2,
    orbitalElements: orbit(0.72333566, 0.00000390, 0.00677672, -0.00004107, 3.39467605, -0.00078890, 181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418),
    facts: [
      fact('mean-radius', 'Mean radius', '6,051.8', 'km', [planetSource]),
      fact('mass', 'Mass', '4.8675 × 10²⁴', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '0.7233', 'AU', [planetSource], 'estimated', 'Mean orbital distance; not the instantaneous distance.'),
      fact('orbital-period', 'Orbital period', '224.701', 'Earth days', [planetSource]),
      fact('surface-gravity', 'Surface gravity', '8.87', 'm/s²', [planetSource]),
      fact('mean-temperature', 'Mean surface temperature', '464', '°C', [planetSource], 'estimated', 'Approximate surface value; atmosphere and elevation affect local conditions.'),
      fact('atmosphere', 'Atmosphere', 'Carbon dioxide dominant', undefined, [planetSource], 'verified', 'Trace constituents and exact proportions vary by reference and altitude.')
    ], tags: ['inner planet', 'rocky', 'dense atmosphere'], lifeStatus: 'No confirmed evidence'
  },
  {
    id: 'earth', name: 'Earth', designation: 'Inner planet · III', kind: 'planet', typeLabel: 'Terrestrial planet',
    description: 'Our home world: an ocean-rich terrestrial planet with a dynamic atmosphere, active geology, and the only confirmed life known to science.',
    color: '#56a9c8', visualRadius: 0.22, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 3,
    orbitalElements: orbit(1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0),
    facts: [
      fact('mean-radius', 'Mean radius', '6,371.0', 'km', [planetSource]),
      fact('mass', 'Mass', '5.9722 × 10²⁴', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '1.0000', 'AU', [planetSource], 'estimated', 'Mean orbital distance; exactly 1 AU by definition is a unit, while Earth’s orbit is slightly non-circular.'),
      fact('orbital-period', 'Orbital period', '365.256', 'days', [planetSource]),
      fact('surface-gravity', 'Surface gravity', '9.807', 'm/s²', [planetSource]),
      fact('mean-temperature', 'Global mean surface temperature', '~15', '°C', [planetSource], 'estimated', 'Climate-dependent long-term mean; not a fixed local temperature.'),
      fact('atmosphere', 'Atmosphere', 'Nitrogen and oxygen dominant', undefined, [planetSource]),
      fact('life-status', 'Life status', 'Confirmed life', undefined, [planetSource], 'verified', 'Earth is the only world on which life is confirmed.')
    ], tags: ['inner planet', 'rocky', 'ocean', 'home'], lifeStatus: 'Confirmed life'
  },
  {
    id: 'mars', name: 'Mars', designation: 'Inner planet · IV', kind: 'planet', typeLabel: 'Terrestrial planet',
    description: 'A cold desert world with ancient river valleys, polar ice, and a record of past environments that may once have supported liquid water.',
    color: '#d5765e', visualRadius: 0.18, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 4,
    orbitalElements: orbit(1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343),
    facts: [
      fact('mean-radius', 'Mean radius', '3,389.5', 'km', [planetSource]),
      fact('mass', 'Mass', '6.4171 × 10²³', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '1.5237', 'AU', [planetSource], 'estimated', 'Mean orbital distance; not the instantaneous distance.'),
      fact('orbital-period', 'Orbital period', '686.980', 'Earth days', [planetSource]),
      fact('surface-gravity', 'Surface gravity', '3.71', 'm/s²', [planetSource]),
      fact('mean-temperature', 'Mean surface temperature', '−65', '°C', [planetSource], 'estimated', 'Approximate global mean; local temperatures vary widely.'),
      fact('life-status', 'Life status', 'Evidence of past habitability; no confirmed life', undefined, [planetSource], 'estimated', 'Habitability is not evidence that life existed.')
    ], tags: ['inner planet', 'rocky', 'rovers', 'ancient water'], lifeStatus: 'Evidence of past habitability'
  },
  {
    id: 'jupiter', name: 'Jupiter', designation: 'Outer planet · V', kind: 'planet', typeLabel: 'Gas giant',
    description: 'The largest planet in the Solar System, a hydrogen-rich gas giant with an extensive system of moons and rings.',
    color: '#d5a77e', visualRadius: 0.57, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 5,
    orbitalElements: orbit(5.20288700, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106),
    facts: [
      fact('mean-radius', 'Mean radius', '69,911', 'km', [planetSource]),
      fact('mass', 'Mass', '1.8982 × 10²⁷', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '5.2029', 'AU', [planetSource], 'estimated', 'Mean orbital distance; not the instantaneous distance.'),
      fact('orbital-period', 'Orbital period', '4,332.59', 'Earth days', [planetSource]),
      fact('surface-gravity', 'Cloud-top gravity', '24.79', 'm/s²', [planetSource], 'estimated', 'Gas giant; no solid surface is defined at this reference level.'),
      fact('mean-temperature', 'Temperature near 1-bar level', '−110', '°C', [planetSource], 'estimated', 'Atmospheric reference level; conditions vary with depth.')
    ], tags: ['outer planet', 'gas giant', 'moons', 'Juno'], lifeStatus: 'No confirmed evidence'
  },
  {
    id: 'saturn', name: 'Saturn', designation: 'Outer planet · VI', kind: 'planet', typeLabel: 'Gas giant',
    description: 'A gas giant distinguished by its broad, bright ring system, made primarily of water-ice particles with a wide range of sizes.',
    color: '#d8c18d', visualRadius: 0.49, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 6,
    orbitalElements: orbit(9.53667594, -0.00125060, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794),
    facts: [
      fact('mean-radius', 'Mean radius', '58,232', 'km', [planetSource]),
      fact('mass', 'Mass', '5.6834 × 10²⁶', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '9.5367', 'AU', [planetSource], 'estimated', 'Mean orbital distance; not the instantaneous distance.'),
      fact('orbital-period', 'Orbital period', '10,759.22', 'Earth days', [planetSource]),
      fact('surface-gravity', 'Cloud-top gravity', '10.44', 'm/s²', [planetSource], 'estimated', 'Gas giant; no solid surface is defined at this reference level.'),
      fact('mean-temperature', 'Temperature near 1-bar level', '−140', '°C', [planetSource], 'estimated', 'Atmospheric reference level; conditions vary with depth.'),
      fact('rings', 'Rings', 'Prominent ring system', undefined, [planetSource])
    ], tags: ['outer planet', 'gas giant', 'rings', 'Cassini'], lifeStatus: 'No confirmed evidence'
  },
  {
    id: 'uranus', name: 'Uranus', designation: 'Outer planet · VII', kind: 'planet', typeLabel: 'Ice giant',
    description: 'An ice giant with a faint ring system and an extreme axial tilt that gives it unusual seasonal geometry.',
    color: '#88cbd0', visualRadius: 0.34, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 7,
    orbitalElements: orbit(19.18916464, -0.00196176, 0.04725744, -0.00004397, 0.77263783, -0.00242939, 313.23810451, 428.48202785, 170.95427630, 0.40805281, 74.01692503, 0.04240589),
    facts: [
      fact('mean-radius', 'Mean radius', '25,362', 'km', [planetSource]),
      fact('mass', 'Mass', '8.6810 × 10²⁵', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '19.189', 'AU', [planetSource], 'estimated', 'Mean orbital distance; not the instantaneous distance.'),
      fact('orbital-period', 'Orbital period', '30,688.5', 'Earth days', [planetSource]),
      fact('surface-gravity', 'Cloud-top gravity', '8.69', 'm/s²', [planetSource], 'estimated', 'Ice giant; no solid surface is defined at this reference level.'),
      fact('mean-temperature', 'Temperature near 1-bar level', '−195', '°C', [planetSource], 'estimated', 'Atmospheric reference level; conditions vary with depth.')
    ], tags: ['outer planet', 'ice giant', 'Voyager 2'], lifeStatus: 'No confirmed evidence'
  },
  {
    id: 'neptune', name: 'Neptune', designation: 'Outer planet · VIII', kind: 'planet', typeLabel: 'Ice giant',
    description: 'A distant ice giant with dynamic atmospheric weather and a large moon, Triton, on a retrograde orbit.',
    color: '#5578dc', visualRadius: 0.33, parentId: 'sun', system: 'Solar System', family: 'solar-system', order: 8,
    orbitalElements: orbit(30.06992276, 0.00026291, 0.00859048, 0.00005105, 1.77004347, 0.00035372, -55.12002969, 218.45945325, 44.96476227, -0.32241464, 131.78422574, -0.00508664),
    facts: [
      fact('mean-radius', 'Mean radius', '24,622', 'km', [planetSource]),
      fact('mass', 'Mass', '1.02413 × 10²⁶', 'kg', [planetSource]),
      fact('semi-major-axis', 'Mean distance from Sun', '30.070', 'AU', [planetSource], 'estimated', 'Mean orbital distance; not the instantaneous distance.'),
      fact('orbital-period', 'Orbital period', '60,182', 'Earth days', [planetSource]),
      fact('surface-gravity', 'Cloud-top gravity', '11.15', 'm/s²', [planetSource], 'estimated', 'Ice giant; no solid surface is defined at this reference level.'),
      fact('mean-temperature', 'Temperature near 1-bar level', '−200', '°C', [planetSource], 'estimated', 'Atmospheric reference level; conditions vary with depth.')
    ], tags: ['outer planet', 'ice giant', 'Voyager 2'], lifeStatus: 'No confirmed evidence'
  }
];

const sun: CelestialObject = {
  id: 'sun', name: 'Sun', designation: 'Sol · G2V', kind: 'star', typeLabel: 'G-type main-sequence star',
  description: 'The star at the center of the Solar System. Its gravity governs the orbits of the planets and smaller bodies.',
  color: '#ffb15e', visualRadius: 0.82, system: 'Solar System', family: 'solar-system', order: 0,
  facts: [
    fact('mean-radius', 'Mean radius', '695,700', 'km', [sunSource]),
    fact('mass', 'Mass', '1.9885 × 10³⁰', 'kg', [sunSource]),
    fact('spectral-type', 'Spectral type', 'G2V', undefined, [sunSource]),
    fact('effective-temperature', 'Effective temperature', '≈5,500', '°C', [sunSource], 'estimated', 'Photospheric effective temperature; the solar atmosphere has a much wider temperature range.'),
    fact('distance-earth', 'Mean Earth–Sun distance', '1', 'AU', [planetSource], 'verified', 'The astronomical unit is defined as exactly 149,597,870.7 km; actual Earth–Sun distance varies through the year.'),
    fact('life-status', 'Life status', 'Not applicable', undefined, [sunSource], 'unknown')
  ], tags: ['star', 'solar system', 'G2V', 'Parker Solar Probe']
};

const moonRecords: CelestialObject[] = [
  {
    id: 'moon', name: 'Moon', designation: 'Earth I · Luna', kind: 'moon', typeLabel: 'Natural satellite', description: 'Earth’s only natural satellite and the first world beyond Earth visited by humans.', color: '#c4c9d0', visualRadius: 0.09, parentId: 'earth', system: 'Solar System', family: 'moon', order: 1,
    facts: [fact('mean-radius', 'Mean radius', '1,737.4', 'km', [moonFactSheet]), fact('mass', 'Mass', '7.346 × 10²²', 'kg', [moonFactSheet]), fact('orbital-period', 'Sidereal orbital period', '27.322', 'days', [moonFactSheet]), fact('surface-gravity', 'Surface gravity', '1.62', 'm/s²', [moonFactSheet]), fact('life-status', 'Life status', 'No confirmed evidence', undefined, [moonsSource], 'unknown')], tags: ['Earth', 'Apollo', 'lunar', 'rocky']
  },
  {
    id: 'phobos', name: 'Phobos', designation: 'Mars I', kind: 'moon', typeLabel: 'Natural satellite', description: 'The larger and closer of Mars’ two small, irregularly shaped moons.', color: '#9b8276', visualRadius: 0.055, parentId: 'mars', system: 'Solar System', family: 'moon', order: 2,
    facts: [fact('mean-radius', 'Mean radius', '≈11.1', 'km', [satellitePhysicalParameters], 'estimated', 'Rounded from the JPL mean radius of 11.08 ± 0.04 km.'), fact('orbital-period', 'Sidereal orbital period', '7.65', 'hours', [marsFactSheet], 'estimated', 'Converted from the cited 0.31891-day sidereal period and rounded.'), fact('life-status', 'Life status', 'No confirmed evidence', undefined, [moonsSource], 'unknown')], tags: ['Mars', 'irregular moon']
  },
  {
    id: 'deimos', name: 'Deimos', designation: 'Mars II', kind: 'moon', typeLabel: 'Natural satellite', description: 'The smaller and more distant of Mars’ two known moons.', color: '#9c8981', visualRadius: 0.045, parentId: 'mars', system: 'Solar System', family: 'moon', order: 3,
    facts: [fact('mean-radius', 'Mean radius', '≈6.2', 'km', [satellitePhysicalParameters], 'estimated', 'JPL reports 6.2 ± 0.24 km; this value is rounded.'), fact('orbital-period', 'Sidereal orbital period', '30.3', 'hours', [marsFactSheet], 'estimated', 'Converted from the cited 1.26244-day sidereal period and rounded.'), fact('life-status', 'Life status', 'No confirmed evidence', undefined, [moonsSource], 'unknown')], tags: ['Mars', 'irregular moon']
  },
  {
    id: 'io', name: 'Io', designation: 'Jupiter I', kind: 'moon', typeLabel: 'Natural satellite', description: 'A volcanically active moon of Jupiter shaped by tidal interactions with the giant planet.', color: '#e3ba61', visualRadius: 0.08, parentId: 'jupiter', system: 'Solar System', family: 'moon', order: 4,
    facts: [fact('mean-radius', 'Mean radius', '1,821.5', 'km', [jovianFactSheet]), fact('mass', 'Mass', '8.932 × 10²²', 'kg', [jovianFactSheet]), fact('orbital-period', 'Orbital period', '1.769', 'days', [jovianFactSheet]), fact('life-status', 'Life status', 'No confirmed evidence', undefined, [moonsSource], 'unknown')], tags: ['Jupiter', 'volcanism', 'Galileo']
  },
  {
    id: 'europa', name: 'Europa', designation: 'Jupiter II', kind: 'moon', typeLabel: 'Natural satellite', description: 'An icy moon whose surface and induced magnetic signature support the presence of a subsurface ocean; this does not establish life.', color: '#d7cbb2', visualRadius: 0.075, parentId: 'jupiter', system: 'Solar System', family: 'moon', order: 5,
    facts: [fact('mean-radius', 'Mean radius', '1,560.8', 'km', [jovianFactSheet]), fact('mass', 'Mass', '4.800 × 10²²', 'kg', [jovianFactSheet]), fact('orbital-period', 'Orbital period', '3.551', 'days', [jovianFactSheet]), fact('ocean-evidence', 'Ocean evidence', 'Strong evidence for a subsurface ocean', undefined, ['nasa-europa'], 'estimated', 'NASA notes that the ocean’s presence awaits confirmation by a future mission.'), fact('life-status', 'Life status', 'Potentially habitable; no confirmed life', undefined, ['nasa-europa'], 'estimated', 'Potential habitability is not evidence of life.')], tags: ['Jupiter', 'ice', 'ocean evidence', 'Europa Clipper'], lifeStatus: 'Potentially habitable'
  },
  {
    id: 'ganymede', name: 'Ganymede', designation: 'Jupiter III', kind: 'moon', typeLabel: 'Natural satellite', description: 'The largest natural satellite in the Solar System; evidence indicates a complex interior that may include a subsurface ocean.', color: '#afa8a1', visualRadius: 0.1, parentId: 'jupiter', system: 'Solar System', family: 'moon', order: 6,
    facts: [fact('mean-radius', 'Mean radius', '2,631.2', 'km', [jovianFactSheet]), fact('mass', 'Mass', '1.4819 × 10²³', 'kg', [jovianFactSheet]), fact('orbital-period', 'Orbital period', '7.155', 'days', [jovianFactSheet]), fact('ocean-evidence', 'Ocean evidence', 'Strong evidence for a subsurface saltwater ocean', undefined, ['nasa-ganymede'], 'estimated', 'NASA describes evidence from magnetic-field observations; the ocean is beneath the ice shell.'), fact('life-status', 'Life status', 'Potentially habitable; no confirmed life', undefined, ['nasa-ganymede'], 'estimated', 'Potential habitability is not evidence of life.')], tags: ['Jupiter', 'largest moon', 'ocean evidence'], lifeStatus: 'Potentially habitable'
  },
  {
    id: 'callisto', name: 'Callisto', designation: 'Jupiter IV', kind: 'moon', typeLabel: 'Natural satellite', description: 'A heavily cratered outer Galilean moon with an ancient surface and evidence consistent with a subsurface ocean.', color: '#8c8178', visualRadius: 0.09, parentId: 'jupiter', system: 'Solar System', family: 'moon', order: 7,
    facts: [fact('mean-radius', 'Mean radius', '2,410.3', 'km', [jovianFactSheet]), fact('mass', 'Mass', '1.0759 × 10²³', 'kg', [jovianFactSheet]), fact('orbital-period', 'Orbital period', '16.689', 'days', [jovianFactSheet]), fact('ocean-evidence', 'Ocean evidence', 'Possible subsurface ocean', undefined, ['nasa-callisto'], 'estimated', 'NASA notes the ocean may not exist; available evidence is indirect.'), fact('life-status', 'Life status', 'Potentially habitable; no confirmed life', undefined, ['nasa-callisto'], 'estimated', 'Potential habitability is not evidence of life.')], tags: ['Jupiter', 'cratered', 'ocean evidence'], lifeStatus: 'Potentially habitable'
  },
  {
    id: 'titan', name: 'Titan', designation: 'Saturn VI', kind: 'moon', typeLabel: 'Natural satellite', description: 'Saturn’s largest moon, with a dense nitrogen-rich atmosphere and surface lakes and seas of liquid hydrocarbons.', color: '#d29a57', visualRadius: 0.095, parentId: 'saturn', system: 'Solar System', family: 'moon', order: 8,
    facts: [fact('mean-radius', 'Mean radius', '2,575', 'km', [saturnianFactSheet]), fact('mass', 'Mass', '1.3455 × 10²³', 'kg', [saturnianFactSheet]), fact('orbital-period', 'Orbital period', '15.945', 'days', [saturnianFactSheet]), fact('ocean-evidence', 'Ocean evidence', 'Evidence for a subsurface water ocean', undefined, ['nasa-titan'], 'estimated', 'The ocean is inferred from spacecraft measurements; the subsurface environment is not directly observed.'), fact('life-status', 'Life status', 'Potentially habitable; no confirmed life', undefined, ['nasa-titan'], 'estimated', 'NASA discusses possible habitable environments; no evidence of life has been detected.')], tags: ['Saturn', 'atmosphere', 'hydrocarbon lakes', 'Cassini'], lifeStatus: 'Potentially habitable'
  },
  {
    id: 'enceladus', name: 'Enceladus', designation: 'Saturn II', kind: 'moon', typeLabel: 'Natural satellite', description: 'An icy moon with active water-rich plumes and strong evidence for a global subsurface ocean.', color: '#d9e4e5', visualRadius: 0.055, parentId: 'saturn', system: 'Solar System', family: 'moon', order: 9,
    facts: [fact('mean-radius', 'Mean radius', '252.1', 'km', [satellitePhysicalParameters], 'estimated', 'JPL reports the volume-equivalent mean radius; the Saturnian fact sheet separately lists three-axis dimensions.'), fact('mass', 'Mass', '1.08 × 10²⁰', 'kg', [saturnianFactSheet]), fact('orbital-period', 'Orbital period', '1.370', 'days', [saturnianFactSheet]), fact('ocean-evidence', 'Ocean evidence', 'Strong evidence for a global subsurface ocean', undefined, ['nasa-enceladus'], 'estimated', 'The global ocean is inferred from gravity and plume measurements.'), fact('life-status', 'Life status', 'Potentially habitable; no confirmed life', undefined, ['nasa-enceladus'], 'estimated', 'Organic molecules and ocean conditions do not establish life.')], tags: ['Saturn', 'ice', 'plumes', 'ocean evidence', 'Cassini'], lifeStatus: 'Potentially habitable'
  },
  {
    id: 'triton', name: 'Triton', designation: 'Neptune I', kind: 'moon', typeLabel: 'Natural satellite', description: 'Neptune’s largest moon, moving on a retrograde orbit and showing evidence of geological activity.', color: '#b5b3c7', visualRadius: 0.075, parentId: 'neptune', system: 'Solar System', family: 'moon', order: 10,
    facts: [fact('mean-radius', 'Mean radius', '1,353.4', 'km', [neptunianFactSheet]), fact('mass', 'Mass', '2.14 × 10²²', 'kg', [neptunianFactSheet]), fact('orbital-period', 'Retrograde orbital period', '5.877', 'days', [neptunianFactSheet]), fact('life-status', 'Life status', 'No confirmed evidence', undefined, [moonsSource], 'unknown')], tags: ['Neptune', 'retrograde', 'Voyager 2']
  }
];

export const OBJECTS: CelestialObject[] = [sun, ...planets, ...moonRecords];
export const PLANETS = planets;
export const MOONS = moonRecords;

export const MISSIONS: MissionRecord[] = [
  { id: 'voyager-1', name: 'Voyager 1', agency: 'NASA', launched: '1977-09-05', status: 'Active; interstellar mission', destination: 'Outer Solar System and interstellar space', description: 'A robotic spacecraft that explored the outer planets and continues to return measurements from beyond the heliosphere.', sourceIds: [missionsSource] },
  { id: 'voyager-2', name: 'Voyager 2', agency: 'NASA', launched: '1977-08-20', status: 'Active; interstellar mission', destination: 'Jupiter, Saturn, Uranus, Neptune, and interstellar space', description: 'The only spacecraft to have visited Uranus and Neptune, in addition to flybys of Jupiter and Saturn.', sourceIds: [missionsSource] },
  { id: 'cassini', name: 'Cassini–Huygens', agency: 'NASA / ESA / ASI', launched: '1997-10-15', status: 'Completed · 2017', destination: 'Saturn system', description: 'A long-running Saturn orbiter and Titan lander mission that transformed understanding of Saturn, its rings, and moons.', sourceIds: [missionsSource] },
  { id: 'juno', name: 'Juno', agency: 'NASA', launched: '2011-08-05', status: 'Mission extended; check source for current operations', destination: 'Jupiter', description: 'A Jupiter orbiter studying the planet’s origin, interior structure, atmosphere, and magnetosphere.', sourceIds: [missionsSource] },
  { id: 'perseverance', name: 'Perseverance', agency: 'NASA', launched: '2020-07-30', status: 'Operating at Mars; check source for current status', destination: 'Mars · Jezero Crater', description: 'A Mars rover investigating past environments and collecting samples for possible future return.', sourceIds: [missionsSource] },
  { id: 'new-horizons', name: 'New Horizons', agency: 'NASA', launched: '2006-01-19', status: 'Active; extended Kuiper Belt mission', destination: 'Pluto and the Kuiper Belt', description: 'The first spacecraft to make a close flyby of Pluto, later continuing exploration in the Kuiper Belt.', sourceIds: [missionsSource] },
  { id: 'jwst', name: 'James Webb Space Telescope', agency: 'NASA / ESA / CSA', launched: '2021-12-25', status: 'Operating; check source for current status', destination: 'L2 · space observatory', description: 'A space observatory designed to study the early universe, galaxies, stars, and planetary systems in infrared light.', sourceIds: [missionsSource] },
  { id: 'parker-solar-probe', name: 'Parker Solar Probe', agency: 'NASA', launched: '2018-08-12', status: 'Active; check source for current operations', destination: 'Solar corona', description: 'A mission designed to make repeated close approaches to the Sun and investigate the solar wind and corona.', sourceIds: [missionsSource] },
  { id: 'europa-clipper', name: 'Europa Clipper', agency: 'NASA', launched: '2024-10-14', status: 'Cruise to Jupiter system; check source for current status', destination: 'Europa / Jupiter system', description: 'A mission designed to conduct detailed reconnaissance of Europa and investigate whether the moon has conditions suitable for life.', sourceIds: [missionsSource] }
];

export const EVENTS: never[] = [];

export const getObject = (id: string): CelestialObject | undefined => OBJECTS.find((object) => object.id === id.toLowerCase());
export const getSource = (id: string): SourceRecord | undefined => SOURCES.find((source) => source.id === id);
export const getChildren = (id: string): CelestialObject[] => OBJECTS.filter((object) => object.parentId === id);
export const getPlanet = (id: string): CelestialObject | undefined => PLANETS.find((object) => object.id === id.toLowerCase());
export const searchObjects = (query: string): CelestialObject[] => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return OBJECTS.filter((object) => `${object.name} ${object.designation ?? ''} ${object.kind} ${object.tags.join(' ')}`.toLocaleLowerCase().includes(normalized));
};

export function objectRelationshipPath(id: string): CelestialObject[] {
  const path: CelestialObject[] = [];
  let current = getObject(id);
  while (current) {
    path.unshift(current);
    current = current.parentId ? getObject(current.parentId) : undefined;
  }
  return path;
}

export const DATA_SNAPSHOT_DATE = '2026-10-15';
export const ORBIT_MODEL_NOTE = 'Planet positions use the JPL approximate mean orbital elements, valid approximately 1800–2050. Orbital paths and body sizes are rescaled for visibility; the display is not to scale and is not suitable for precise ephemeris or navigation.';
