import { Component, Inject, Renderer2, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { } from 'google.maps';
import { Store } from '../store-locator/store-locator.models';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  stores: Store[];

  apiKey = 'AIzaSyBvq2BIC6n5Xa7i6vWrUGxbLNiW9sU73e4';

  constructor(@Inject(DOCUMENT) private document: Document,
    private renderer2: Renderer2,
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    const url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBvq2BIC6n5Xa7i6vWrUGxbLNiW9sU73e4&libraries=geometry';
    this.loadStoresFromJsonFile();
    //this.loadScript(url).then(() => this.loadStoresFromJsonFile());
    //this.stores = this.service.getStores();
  }

  private initMap() {

    const uluru = { lat: -25.344, lng: 131.036 };

    let mapOptions: google.maps.MapOptions = {
      center: uluru,
      zoom: 8
    }

    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions);

    const marker = new google.maps.Marker({
      position: uluru,
      map: map
    })
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

  private createFakeStores() {
    const stores = [
      {
        id: 2673,
        businessname: 'Bentley Floor',
        address: '22411 Antonio Pkwy',
        state: 'CA',
        city: 'Rancho Santa Margarita',
        zip: 92688,
        country: 'USA',
        phone: '(949) 709-1111',
        fax: '(949) 713-2726',
        email: '',
        latitude: 33.637192,
        longitude: -117.590190
      },
      {
        id: 2673,
        businessname: 'US Floor Kitchen &amp; Bath',
        address: '30092 Santa Margarita Pkwy',
        state: 'CA',
        city: 'Rancho Santa Margarita',
        zip: 92688,
        country: 'USA',
        phone: '(949) 589-9226',
        fax: '(949) 589-9216',
        email: 'info@usfloorkb.com',
        latitude: 33.64038,
        longitude: -117.6045
      }
    ]
    return stores;
  }

  private loadStoresFromJsonFile() {
    this.httpClient.get<Store[]>("assets/Showrooms.json").subscribe(data => {
      this.stores = data['dealers'].map(x => {
        return {
          id: x.id,
          businessname: x.businessName,
          address: x.address,
          address2: x.address2,
          state: x.state,
          city: x.city,
          zip: x.zip,
          country: x.country,
          phone: x.phone,
          email: x.email,
          latitude: Number(x.latitude),
          longitude: Number(x.longitude)
        }
      })
    })
  }

  /*  map: google.maps.Map;
    center: google.maps.LatLngLiteral = { lat: 30, lng: -110 };
  
    initMap(): void {
      let mapOptions: google.maps.MapOptions = {
        center: { lat: 30, lng: -110 },
        zoom: 8,
        mapId: '1234'
      }
      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions);
    }*/


}
