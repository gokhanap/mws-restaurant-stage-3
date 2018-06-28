import '../css/normalize.css';
import '../css/styles.css';
import DBHelper from './dbhelper';
import lazyLoad from './lazyload';

let restaurants,
neighborhoods,
cuisines
self.newMap;
window.markers = [];

window.fetchRestaurantsAPI = () => {
  DBHelper.fetchRestaurantsAPI((error, restaurants) => {
    if (error) { // Got an error
      console.log(error);
    } else {
      console.log('Restaurant API Success:', restaurants);
      // fetchNeighborhoods();
      // fetchCuisines();
      // updateRestaurants();
    }
  });
};
fetchRestaurantsAPI();

/**
 * Do it when DOMContentLoaded.
 */
window.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
window.fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
    }
    fillNeighborhoodsHTML();
  });
}

/**
 * Set neighborhoods HTML.
 */
window.fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
window.fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
    }
    fillCuisinesHTML();
  });
}

/**
 * Set cuisines HTML.
 */

window.fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    option.id = cuisine + "-opt";
   
    const label = document.createElement('label');
    label.innerHTML = cuisine;
    label.htmlFor = cuisine + "-opt";
       
    select.append(label);
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
window.initMap = () => {
  // if (self.newMap) {
    // self.newMap.off();
    // self.newMap.remove();
  // }

  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiZ29raGFuYXAiLCJhIjoiY2ppeHM4OWl2MDJzaDNrcXBqN25tZzNrZCJ9.cxPDTLgFdjaMdmj06H_DUg',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
window.updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;
  
  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
      // addMarkersToMap();
    }
  })
}
// self.updateRestaurants = updateRestaurants;

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
window.resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';
  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
    self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
window.fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  lazyLoad();
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
window.createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';

  const imgUrl = DBHelper.imageUrlForRestaurant(restaurant);
  // image.dataset.srcset = `${imgUrl}_400.jpg 400w, ${imgUrl}_720.jpg 720w, ${imgUrl}.jpg 800w`;
  image.sizes = "100%";
  image.dataset.src = `${imgUrl}.jpg`;
  image.alt = restaurant.alt;
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
window.addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}
// window.toggleMap = (e) => {
//   const map = document.getElementById('map-container');
//   if (map.style.display !== 'block') {
//     map.style.display = 'block';
//     // window.initMap();
//   } else {
//     map.style.display = 'none';
//   }
// }