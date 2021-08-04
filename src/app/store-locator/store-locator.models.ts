export interface Store {
  id: number;
  businessname: string;
  address: string;
  address2: string
  state: string;
  city: string;
  zip: number;
  country: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
}

export enum Miles {
  tenMiles,
  twentyFiveMiles,
  fiftyMiles,
  hundredMiles
}

export enum SearchType {
  addressCityZip,
  state,
  currentLocation
}

export enum AddressCityZipSearchType {
  zip,
  state,
  address,
  city
}
