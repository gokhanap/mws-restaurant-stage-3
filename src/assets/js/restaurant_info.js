import '../css/normalize.css';
import '../css/styles.css';

import DBHelper from './dbhelper';
import { get, set } from 'idb-keyval';
import { debug } from 'util';

let restaurant;
window.newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  


/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();

      DBHelper.fetchReviewsAPI(id, (error, reviews) => {
        if (!reviews) {
          console.error(error);
          return;
        }
        // fill reviews
        fillReviewsHTML(reviews);
      });

      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  
  const isFavourite = document.createElement('span');
  isFavourite.innerHTML = "♥";
  isFavourite.id = "is-favourite";
  isFavourite.addEventListener("click", handleFavourite);

  if (restaurant.is_favorite === "true" || restaurant.is_favorite === true) {
    isFavourite.setAttribute("class", "active");
  }
  name.appendChild(isFavourite);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = restaurant.alt;

  const imgUrl = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = `${imgUrl}_400.jpg 400w, ${imgUrl}_720.jpg 720w, ${imgUrl}.jpg 800w`;
  image.sizes = "100%";
  image.src = `${imgUrl}.jpg`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);

  // Event handler for submit button
  const form = document.getElementById('form-submit');
  form.addEventListener("click", handleSubmit);
  
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);
  
  const date = document.createElement('p');
  var dateCreatedAt = new Date(review.createdAt);
  date.innerHTML = dateCreatedAt.toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/** 
 * Handle favourite click 
 */
const handleFavourite = (e) => {
  const favBtn = e.target;
  const id = self.restaurant.id;
  // Disable submit button
  favBtn.removeEventListener("click", handleFavourite)

  let currentFavBoolean = self.restaurant.is_favorite;
  if (currentFavBoolean === "true" || currentFavBoolean === true) {
    currentFavBoolean = true;
  } else {
    currentFavBoolean = false;
  }
  // update fav status on the server
  DBHelper.favRestaurantAPI(id, currentFavBoolean, (error, response) => {

    if (!response) {
      console.error(error);
      alert(error);
      return;
    } else {
      if (response.is_favorite === "false") {
        favBtn.setAttribute("class", "");
      } else {
        favBtn.setAttribute("class", "active");
      }
    }
  });
  // Enable submit button
  favBtn.addEventListener("click", handleFavourite);
}

/** 
 * Handle submit click 
 */
const handleSubmit = (e) => {
  // Disable submit button
  const submitBtn = e.target;
  submitBtn.removeEventListener("click", handleSubmit);
  // get form data
  const form = document.getElementById("review-form");
  const name = form[0].value;
  const comments = form[1].value;
  const rating = form[2].value;
  const id = self.restaurant.id;
  // prepare review object for server
  const review = {
    "restaurant_id": id,
    "name": name,
    "rating": rating,
    "comments": comments
  };
  // Send review to server
  sendReview(review);
  // createNewReviewHTML(review);
  // Enable submit button
  submitBtn.addEventListener("click", handleSubmit);
}

/** 
 * Send review 
 */ 
const sendReview = (review) => {
  DBHelper.postReviewAPI(review, (error, response) => {
    // self.restaurant = restaurant;
    if (!response) {
      window.addEventListener('online', syncReview);
      set('syncNeeded', true);
      alert(error + " Your review will be sent when the connection is re-established.");
      return;
    } else {
      createNewReviewHTML(response);
    }
  });
}

/** 
 * Create new review HTML 
 */ 
const createNewReviewHTML = (review) => {
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
  //reset form
  const form = document.getElementById("review-form");
  resetForm(form);
}

/** 
 * Sync review 
 */ 
const syncReview = () => {
  get('syncNeeded').then( response => {
    console.log('syncneeded', response);
    response &&
    get('idbReviewTemp')
    .then(review => sendReview(review))
    .then(()=> window.removeEventListener('online', syncReview))
    .then(()=> set('syncNeeded', false));
    
  });
}

/**
 * Reset form 
 */
const resetForm = (form) => {
  form[0].value = null; // name
  form[1].value = null; // comments
  form[2].value = 1; // rating
}
