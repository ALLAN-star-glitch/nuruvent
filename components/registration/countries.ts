import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

// Copy of the backend allowlist (Africa + diaspora, excluding EU and
// IR/KP/CU/SY). Must stay in sync with
// internal/shared/validation/phone.go allowedRegions.
const BACKEND_ALLOWLIST = new Set([
  // Africa
  'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','CI','KE','LS','LR',
  'LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN',
  'SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW',
  
  // Diaspora
  'US','CA','AE','SA','QA','KW','BH','OM','IL','JO','LB',
  'IN','PK','BD','PH','AU','NZ','JM','TT',

  // Europe
  'GB','DE','FR','NL','IE','IT','ES','PT','BE','CH','AT','SE','NO','DK','FI',
  'PL','CZ','GR','HU','RO','BG','HR','SK','SI','EE','LV','LT','LU','MT','CY'
]);

const ISO_NAMES: Record<string, string> = {
  DZ: 'Algeria', AO: 'Angola', BJ: 'Benin', BW: 'Botswana',
  BF: 'Burkina Faso', BI: 'Burundi', CM: 'Cameroon', CV: 'Cape Verde',
  CF: 'Central African Republic', TD: 'Chad', KM: 'Comoros',
  CG: 'Congo (Brazzaville)', CD: 'Congo (Kinshasa)', DJ: 'Djibouti',
  EG: 'Egypt', GQ: 'Equatorial Guinea', ER: 'Eritrea', SZ: 'Eswatini',
  ET: 'Ethiopia', GA: 'Gabon', GM: 'Gambia', GH: 'Ghana', GN: 'Guinea',
  GW: 'Guinea-Bissau', CI: 'Ivory Coast', KE: 'Kenya', LS: 'Lesotho',
  LR: 'Liberia', LY: 'Libya', MG: 'Madagascar', MW: 'Malawi',
  ML: 'Mali', MR: 'Mauritania', MU: 'Mauritius', MA: 'Morocco',
  MZ: 'Mozambique', NA: 'Namibia', NE: 'Niger', NG: 'Nigeria',
  RW: 'Rwanda', ST: 'Sao Tome and Principe', SN: 'Senegal',
  SC: 'Seychelles', SL: 'Sierra Leone', SO: 'Somalia',
  ZA: 'South Africa', SS: 'South Sudan', SD: 'Sudan', TZ: 'Tanzania',
  TG: 'Togo', TN: 'Tunisia', UG: 'Uganda', ZM: 'Zambia', ZW: 'Zimbabwe',
  US: 'United States', CA: 'Canada',
  AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar',
  KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman', IL: 'Israel',
  JO: 'Jordan', LB: 'Lebanon',
  IN: 'India', PK: 'Pakistan', BD: 'Bangladesh', PH: 'Philippines',
  AU: 'Australia', NZ: 'New Zealand', JM: 'Jamaica',
  TT: 'Trinidad and Tobago',
    // Europe
  GB: 'United Kingdom', DE: 'Germany', FR: 'France', NL: 'Netherlands',
  IE: 'Ireland', IT: 'Italy', ES: 'Spain', PT: 'Portugal', BE: 'Belgium',
  CH: 'Switzerland', AT: 'Austria', SE: 'Sweden', NO: 'Norway', DK: 'Denmark',
  FI: 'Finland', PL: 'Poland', CZ: 'Czech Republic', GR: 'Greece',
  HU: 'Hungary', RO: 'Romania', BG: 'Bulgaria', HR: 'Croatia',
  SK: 'Slovakia', SI: 'Slovenia', EE: 'Estonia', LV: 'Latvia', LT: 'Lithuania',
  LU: 'Luxembourg', MT: 'Malta', CY: 'Cyprus'
};

export type Country = {
  iso: string;
  name: string;
  dial: string;
};

export const COUNTRIES: Country[] = getCountries()
  .filter((iso) => BACKEND_ALLOWLIST.has(iso))
  .map((iso) => ({
    iso,
    name: ISO_NAMES[iso] ?? iso,
    dial: `+${getCountryCallingCode(iso)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY = 'KE';

/**
 * A lightweight map of common timezones to ISO country codes.
 * If the timezone isn't here, it falls back to the default.
 */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Africa/Nairobi': 'KE',
  'Africa/Kampala': 'UG',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Kigali': 'RW',
  'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Johannesburg': 'ZA',
  'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA',
  'Africa/Algiers': 'DZ',
  'Africa/Tunis': 'TN',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Khartoum': 'SD',
  'Africa/Juba': 'SS',
  'Africa/Mogadishu': 'SO',
  'Africa/Dakar': 'SN',
  'Africa/Abidjan': 'CI',
  'Africa/Douala': 'CM',
  'Africa/Lusaka': 'ZM',
  'Africa/Harare': 'ZW',
  'Africa/Maputo': 'MZ',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Kolkata': 'IN',
  'Asia/Karachi': 'PK',
  'Asia/Manila': 'PH',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Pacific/Auckland': 'NZ',
  'America/Jamaica': 'JM',
  'America/Port_of_Spain': 'TT',
  // Europe
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Amsterdam': 'NL',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Lisbon': 'PT',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Athens': 'GR',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Sofia': 'BG',
  'Europe/Zagreb': 'HR',
  'Europe/Bratislava': 'SK',
  'Europe/Ljubljana': 'SI',
  'Europe/Tallinn': 'EE',
  'Europe/Riga': 'LV',
  'Europe/Vilnius': 'LT',
  'Europe/Luxembourg': 'LU',
  'Europe/Malta': 'MT',
  'Asia/Nicosia': 'CY',
};

/**
 * Detects the user's country using their browser's timezone.
 * Falls back to DEFAULT_COUNTRY if detection fails, the timezone isn't 
 * mapped, or the detected country isn't in the allowed list.
 */
export function detectDefaultCountry(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) return DEFAULT_COUNTRY;

    const detectedIso = TIMEZONE_TO_COUNTRY[timezone];
    if (!detectedIso) return DEFAULT_COUNTRY;

    // Double-check that the detected country is actually allowed
    const isAllowed = COUNTRIES.some((c) => c.iso === detectedIso);
    return isAllowed ? detectedIso : DEFAULT_COUNTRY;
  } catch {
    return DEFAULT_COUNTRY;
  }
}