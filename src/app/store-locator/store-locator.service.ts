import { Store } from './store-locator.models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StoreLocatorService {

  private stores: Store[] = [];

  private METERS_TO_MILES_CONSTANT = 0.000621371;

  setStores(stores: Store[]) {
    this.stores = stores;
  }

  getStores() {
    return this.stores;
  }

  getStoresInsideFence(latitude, longitude, radius) {
    let foundStores = [];

    this.stores.forEach(store => {
      if (this.insideFence(latitude, longitude, store.latitude, store.longitude, radius)) {
        foundStores.push(store);
      }
    })

    return foundStores;
  }

  getByLatLngWithRadius(latitude, longitude, radius) {
    let storesWithinFence = this.getStoresInsideFence(latitude, longitude, radius);
    return storesWithinFence;
  }

  getAllMatchingStateCode(stateCode) {
    let foundStores = [];
    this.stores.forEach(store => {
      if (store.state === stateCode) {
        foundStores.push(store);
      }
    })
    return foundStores;
  }

  getAllMatchingZipCode(zipCode) {
    let foundStores = [];
    this.stores.forEach(store => {
      if (store.zip === zipCode) {
        foundStores.push(store);
      }
    })

    return foundStores;
  }

  private insideFence(centerLatitude, centerLongitude, testLatitude, testLongitude, radius) {
    const fromLatLng = new google.maps.LatLng(centerLatitude, centerLongitude);
    const testLatLng = new google.maps.LatLng(testLatitude, testLongitude);
    const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, testLatLng);
    return distanceInMeters * this.METERS_TO_MILES_CONSTANT < radius;
  }

}
