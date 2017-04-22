import { OnInit, Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CurrencyModal } from '../../components/currency-modal/currency-modal';
import { Geolocation } from '@ionic-native/geolocation';
import { googlemaps } from 'googlemaps';

/**
 * Generated class for the Home page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var google;

//@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage implements OnInit {

    autocompleteItems: any;
    autocomplete: any;
    acService:any;
    placesService: any; 
    holdCurrency: string;
    needCurrency: string;
    field: string;

    @ViewChild('map') mapElement: ElementRef;
    map: any;

    markers: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation) {
    }

    ngOnInit() {
        this.acService = new google.maps.places.AutocompleteService();        
        this.autocompleteItems = [];
        this.markers = [];
        this.autocomplete = {
            query: ''
        };  
        this.needCurrency = '';
        this.holdCurrency = '';
    }

    ionViewDidLoad() {
        this.loadMap();
        console.log('ionViewDidLoad Home');
    }

    updateSearch() {
        console.log('modal > updateSearch');
        if (this.autocomplete.query == '') {
            this.autocompleteItems = [];
            return;
        }
        let self = this; 
        let config = { 
            //types:  ['geocode'], // other types available in the API: 'establishment', 'regions', and 'cities'
            input: this.autocomplete.query, 
            componentRestrictions: {  } 
        }

        this.acService.getPlacePredictions(config, function (predictions, status) {
            console.log('modal > getPlacePredictions > status > ', status);
            self.autocompleteItems = [];            
            predictions.forEach(function (prediction) {              
                self.autocompleteItems.push(prediction);
            });
        });
    }

    currencyPopup(field) {
        document.getElementById('currencyModal').style.display = 'block';
        this.field = field;
    }

    currencyChange(currency) {
        if (this.field == 'from') {
            this.holdCurrency = currency;
        } else {
            this.needCurrency = currency;
        }
        document.getElementById('currencyModal').style.display = 'none';
    }
    
    loadMap(){
 
        this.geolocation.getCurrentPosition().then((position) => {
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
     
            let mapOptions = {
              center: latLng,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            }
         
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            this.placesService = new google.maps.places.PlacesService(this.map);
         }, (err) => {
             console.log(err);
         });
     
    }
    
    createMarker(place) {
        let marker = new google.maps.Marker({
            map: this.map,
            title: 'Exchange location',
            position: place.geometry.location 
        });

        this.markers.push(marker);
        
        return marker;

    }
    
    chooseItem(item) {
        this.autocompleteItems = [];            
        this.placesService.getDetails( { placeId: item.place_id }, (place, status) => {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < this.markers.length; ++i) {
                    this.markers[i].setMap(null);
                }
                let marker = this.createMarker(place);
                this.map.setCenter(marker.getPosition());
            }

        });
    }

}
