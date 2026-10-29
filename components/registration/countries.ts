import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

// Copy of the backend allowlist (Africa + diaspora, excluding EU and
// IR/KP/CU/SY). Must stay in sync with
// internal/shared/validation/phone.go allowedRegions.
const BACKEND_ALLOWLIST = new Set([
  'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','CI','KE','LS','LR',
  'LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN',
  'SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW',
  'US','CA','AE','SA','QA','KW','BH','OM','IL','JO','LB',
  'IN','PK','BD','PH','AU','NZ','JM','TT',
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