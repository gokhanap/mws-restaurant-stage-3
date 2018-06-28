import { get, set } from 'idb-keyval';

/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    // const port = 8000 // Change this to your server port
    // return `http://localhost:${port}/data/restaurants.json`;

    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants from API.
   */
/*   static fetchRestaurantsAPI(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        self.restaurants = json;
        set('idbRestaurants', self.restaurants);
        callback(null, self.restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  } */


  /**
   * Fetch all restaurants from API. Fetch method
   */
  static fetchRestaurantsAPI(callback) {
    fetch(DBHelper.DATABASE_URL + "/restaurants")
    .then(response => {
      if (response.status === 200) { // Got a success response from server!
        return response.json();
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${response.status}`);
        callback(error, null);
      }
    })
    .then(data => {
        self.restaurants = data;
        set('idbRestaurants', self.restaurants);
        callback(null, self.restaurants);
    });
  }

  /**
   * Fetch restaurant reviews from API. Fetch method
   */
  static fetchReviewsAPI(id, callback) {
    fetch(DBHelper.DATABASE_URL + "/reviews/?restaurant_id=" + id)
    .then(response => {
      if (response.status === 200) { // Got a success response from server!
        return response.json();
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${response.status}`);
        callback(error, null);
      }
    })
    .then(data => {
        self.restaurant.reviews = data;
        set('idbReviews', self.restaurant.reviews);
        callback(null, self.restaurant.reviews);
    });
  }

  /**
   * Fetch all restaurants from IndexedDB.
   */
  static fetchRestaurants(callback) {
    // get('idbRestaurants').then(res => console.log(res));
    get('idbRestaurants').then(res => {
      
      if (typeof res !== "undefined") {
        console.log("IBD fetch success", res);
        callback(null, res);
      } else {
        callback('No Data at IndexedDB', null);
      }
    
    });
    
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./assets/media/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }


  /**
   * Post a restaurant review to server.
   */
  static postReviewAPI(review, callback) {
      fetch(`${DBHelper.DATABASE_URL}/reviews/`, {
        method: "post",
        body: JSON.stringify(review)
      })
      .then(response => {
        if (response.status === 201) { // Got a success response from server!
          return response.json();
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${response.status}`);
          callback(error, null);
        }
      })
      .then(data => {
        self.restaurant.reviews.push(data);
        set('idbReviews', self.restaurant.reviews);
        callback(null, data);
      })
      .catch((error) => {
        DBHelper.saveOnIdbReviewTemp(review);
        return callback(error, null); // Failed to fetch.
      });
  }



  /**
   * Save review on IdbReviewTemp.
   */
  static saveOnIdbReviewTemp(review) {
    set('idbReviewTemp', review);
  }

  
  /**
   * Change favourite status of a restaurant on the server.
   */
  static favRestaurantAPI(id, fav, callback) {

    fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}/?is_favorite=${fav}`, {
      method: "put"/* ,
      body: JSON.stringify(review) */
    })
    .then(response => {
      if (response.status === 200) { // Got a success response from server!
        return response.json();
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${response.status}`);
        return callback(error, null);
      }
    })
    .then(data => {
      // response object returns 'is_favorite' as a string
      // it has to be boolean. fixing issue...
      const newFavStatus = data.is_favorite == 'true';
      // console.log(typeof newFavStatus);
      // console.log(newFavStatus);

      self.restaurant.is_favorite = newFavStatus;
      
      // get recent Idb data and update
      get('idbRestaurants').then(restaurants => {
    
        if (typeof restaurants !== "undefined") {
          restaurants.map( restaurant => {
            if(restaurant.id === data.id) {
              restaurant.is_favorite = newFavStatus;
              return;
            }
          });
          // update idb
          set('idbRestaurants', restaurants);
        } else {
          callback('No Data at IndexedDB', null);
        }
      });
      callback(null, data);
    })
    .catch((error) => {
      return callback(error, null); // Failed to fetch.
    });
  }
}

export default DBHelper;
