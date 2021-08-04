import { Component, Inject, Renderer2, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { } from 'google.maps';
import { StoreLocatorService } from './store-locator.service';
import { Store, Miles, SearchType, AddressCityZipSearchType } from './store-locator.models';

@Component({
  selector: 'app-store-locator',
  templateUrl: './store-locator.component.html',
  styleUrls: ['./store-locator.component.css']
})
export class StoreLocatorComponent implements OnInit {

  @Input() stores: Store[];
  @Input() apiKey: string;
  foundStores: Store[];
  filteredFoundStores: Store[];

  map: google.maps.Map;
  markers: google.maps.Marker[];

  lat: number;
  lng: number;

  otherLocationLat: number;
  otherLocationLng: number;

  totalPages: number;
  currentPage: number;
  showResults: boolean;
  resultsPerPage: number;

  reverseGeocodedAddress: string;

  searchRadius: number;
  searchType: SearchType;
  searchTypeString: string;

  addressCityZipSearchType: AddressCityZipSearchType;

  selectedState;
  geocodedSelectedState;

  autocomplete;

  selectedZipCode;

  selectedCity;

  public get Miles() {
    return Miles;
  }

  public get SearchType() {
    return SearchType;
  }

  constructor(@Inject(DOCUMENT) private document: Document,
    private renderer2: Renderer2, private storeLocatorService: StoreLocatorService,
    @Inject(ChangeDetectorRef) private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.markers = [];
    this.showResults = false;
    this.currentPage = 1;
    this.resultsPerPage = 5;
    this.reverseGeocodedAddress = '';
    this.searchRadius = 10;
    this.searchType = SearchType.currentLocation
    this.searchTypeString = 'Your Current Location';
    this.selectedState = 'AL';


    /*const url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBvq2BIC6n5Xa7i6vWrUGxbLNiW9sU73e4';
    this.loadScript(url).then(() => {
      this.initMap();
      this.storeLocatorService.setStores(this.stores);
      this.setMarkers(this.stores);
    });*/

  }

  ngOnChanges() {
    if (!this.stores) return;
    //if map exists delete it

    const url = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=geometry,places`;
    //const url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBvq2BIC6n5Xa7i6vWrUGxbLNiW9sU73e4&libraries=geometry,places';

    this.loadScript(url).then(() => {
      this.storeLocatorService.setStores(this.stores);
      this.initMap();
      //this.initAutocomplete();
    })

    /*const url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBvq2BIC6n5Xa7i6vWrUGxbLNiW9sU73e4';
    this.loadScript(url).then(() => {
      this.initMap();
      this.storeLocatorService.setStores(this.stores);
      this.setMarkers(this.stores);
    });*/
  }

  private initMap() {

    //const uluru = { lat: -25.344, lng: 131.036 };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        const centerGeoLocation = { lat: this.lat, lng: this.lng };
        let mapOptions: google.maps.MapOptions = {
          center: centerGeoLocation,
          zoom: 8
        }
        this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions);
        this.reverseGeocode(this.lat, this.lng);

        //this.foundStores = this.storeLocatorService.getByLocationQuery(this.lat, this.lng, 25);
        //this.setMarkersAndCenter(this.foundStores);
      })
    } else {
      this.lat = -25.344;
      this.lng = 131.036;
      const centerGeoLocation = { lat: this.lat, lng: this.lng };
      let mapOptions: google.maps.MapOptions = {
        center: centerGeoLocation,
        zoom: 8
      }
      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions);

      //this.foundStores = this.storeLocatorService.getByLocationQuery(this.lat, this.lng, 25);
      //this.setMarkersAndCenter(this.foundStores);
    }
  }

  private loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = this.renderer2.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.text = ``;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      this.renderer2.appendChild(this.document.body, script);
    })
  }

  private setMarkers(stores: Store[]) {
    //remove all current markers
    this.setMapOnAll(null);
    this.markers = [];

    for (const store of stores) {
      const pos = { lat: store.latitude, lng: store.longitude };

      const marker = new google.maps.Marker({
        position: pos,
        map: this.map
      })

      this.markers.push(marker);
    }
  }

  private setMarkersAndCenter(stores: Store[]) {
    //remove all current markers
    this.setMapOnAll(null);
    this.markers = [];

    //create new bounds
    let bounds = new google.maps.LatLngBounds();


    //place all the markers

    for (const store of stores) {
      const pos = { lat: store.latitude, lng: store.longitude };

      const marker = new google.maps.Marker({
        position: pos,
        map: this.map
      })

      const contentString =
        '<div id="content">' +
        '<h6>' + store.businessname + '</h6>' +
        '<p>' + store.address + ', ' + store.state + ' ' + store.zip + '<br>' +
        'Phone: ' + store.phone + '</p>';

      const infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map: this.map,
          shouldFocus: false
        });
      });

      bounds.extend(marker.getPosition());

      this.markers.push(marker);
    }

    //center map around markers
    this.map.fitBounds(bounds);
    //this.map.setCenter(this.markers[0].getPosition());
  }

  setMapOnAll(map: google.maps.Map | null) {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }

  filterResult() {
    const startPos = (this.currentPage - 1) * this.resultsPerPage;
    const endPos = this.currentPage * this.resultsPerPage;

    this.filteredFoundStores = this.foundStores.slice(startPos, endPos)
  }

  search() {

    switch (this.searchType) {
      case SearchType.addressCityZip:
        this.searchByAddressCityZip();
        break;
      case SearchType.currentLocation:
        this.searchByCurrentLocation();
        break;
      case SearchType.state:
        this.searchByState(this.selectedState);
        break;

    }
  }

  searchByOtherLocation() {
    this.foundStores = this.storeLocatorService.getByLatLngWithRadius(this.otherLocationLat, this.otherLocationLng, this.searchRadius);
    this.totalPages = Math.ceil(this.foundStores.length / this.resultsPerPage);
    this.filterResult();

    this.setMarkersAndCenter(this.filteredFoundStores);
    this.showResults = true;
  }

  searchByCurrentLocation() {
    this.foundStores = this.storeLocatorService.getByLatLngWithRadius(this.lat, this.lng, this.searchRadius);
    this.totalPages = Math.ceil(this.foundStores.length / this.resultsPerPage);
    this.filterResult();

    this.setMarkersAndCenter(this.filteredFoundStores);
    this.showResults = true;
  }

  searchByAddressCityZip() {
    switch (this.addressCityZipSearchType) {
      case AddressCityZipSearchType.address:
        this.searchByOtherLocation();
        break;
      case AddressCityZipSearchType.zip:
        this.searchByZip();
        break;
    }
  }

  searchByZip() {
    this.foundStores = this.storeLocatorService.getAllMatchingZipCode(this.selectedZipCode);
    this.totalPages = Math.ceil(this.foundStores.length / this.resultsPerPage);
    this.filterResult();

    this.setMarkersAndCenter(this.filteredFoundStores);
    this.showResults = true;
  }

  searchByState(stateCode) {
    this.foundStores = this.storeLocatorService.getAllMatchingStateCode(stateCode);
    this.totalPages = Math.ceil(this.foundStores.length / this.resultsPerPage);
    this.filterResult();

    this.setMarkersAndCenter(this.filteredFoundStores);
    this.showResults = true;
  }

  incrementCurrentPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterResult();
      this.setMarkersAndCenter(this.filteredFoundStores);
    }
  }

  decrementCurrentPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterResult();
      this.setMarkersAndCenter(this.filteredFoundStores);
    }
  }

  reverseGeocode(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    const latlng = {
      lat: lat,
      lng: lng
    };
    geocoder
      .geocode({ location: latlng }, (results, status) => {
        if (status == 'OK') {
          this.reverseGeocodedAddress = results[0].formatted_address;
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    /*.then((response) => {
      if (response.results[0]) {
        this.reverseGeocodedAddress = response.results[0].formatted_address;
      }
    })
    .catch((e) => window.alert("Geocoder failed due to: " + e));*/
  }

  createDirectionsUrl(address) {

    let origin = encodeURI(this.reverseGeocodedAddress);

    let destination = encodeURI(address);

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    return url;
  }

  setMiles(miles) {
    switch (miles) {
      case Miles.tenMiles:
        this.searchRadius = 10;
        break;
      case Miles.twentyFiveMiles:
        this.searchRadius = 25;
        break;
      case Miles.fiftyMiles:
        this.searchRadius = 50;
        break;
      case Miles.hundredMiles:
        this.searchRadius = 100;
        break;
    }
  }

  setSearchType(searchType) {
    this.searchType = searchType;
    switch (searchType) {
      case SearchType.addressCityZip:
        this.searchTypeString = "Address, City, or Zip";
        this.changeDetectorRef.detectChanges();
        this.initAutocomplete();
        break;
      case SearchType.currentLocation:
        this.searchTypeString = "Your Current Location";
        break;
      case SearchType.state:
        this.searchTypeString = "State";
        break;
    }
  }

  initAutocomplete() {
    const input = document.getElementById('autocomplete') as HTMLInputElement
    const options = {
      componentRestrictions: { country: 'us' }
    };
    this.autocomplete = new google.maps.places.Autocomplete(input, options);

    this.autocomplete.addListener('place_changed', () => {
      var place = this.autocomplete.getPlace();

      if (!place.geometry) {
        const input = document.getElementById('autocomplete') as HTMLInputElement;
        input.placeholder = 'Enter Address, City, or Zip';
      } else {

        if (place.types[0] === 'postal_code') {
          this.selectedZipCode = place.address_components[0].short_name;
          this.addressCityZipSearchType = AddressCityZipSearchType.zip;
          return;
        }

        if (place.types[0] === 'administrative_area_level_1') {
          this.geocodedSelectedState = place.address_components[0].short_name;
          this.addressCityZipSearchType = AddressCityZipSearchType.state;
          return;
        }

        if (place.types[0] === 'locality') {
          this.selectedCity = place.address_components[0].short_name;
          this.addressCityZipSearchType = AddressCityZipSearchType.state;
          return;
        }

        //do this by default
        this.addressCityZipSearchType = AddressCityZipSearchType.address;
        const geocoder = new google.maps.Geocoder();
        geocoder
          .geocode({ address: place.formatted_address }, (results, status) => {
            if (status == 'OK') {
              const location = results[0].geometry.location;
              this.otherLocationLat = location.lat();
              this.otherLocationLng = location.lng();
            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
          });
      }
    });
  }

  formatAddress(store) {
    let formattedAddress = `${store.address}, ${store.address2}, ${store.zip}`;
    return formattedAddress;
  }

  onRadiusChange(value) {
    if (value === 'ten') {
      this.searchRadius = 10;
    }
    if (value === 'twentyfive') {
      this.searchRadius = 25;
    }
    if (value === 'fifty') {
      this.searchRadius = 50;
    }
    if (value === 'hundred') {
      this.searchRadius = 100;
    }
  }

  onSearchTypeChange(value) {
    if (value === 'current') {
      this.searchType = SearchType.currentLocation;
    }
    if (value === 'address') {
      this.searchType = SearchType.addressCityZip;
      this.changeDetectorRef.detectChanges();
      this.initAutocomplete();
    }
    if (value === 'state') {
      this.searchType = SearchType.state;
    }
  }

}
