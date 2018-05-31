/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';


var query = firebase.firestore().collection('restaurants');

FriendlyEats.prototype.addRestaurant = function(data) {
  /*
    Implement adding a document
  */

  var collection = firebase.firestore().collection('restaurants');
  return collection.add(data);
};

FriendlyEats.prototype.getAllRestaurants = function(render) {
  /*
    Retrieve list of restaurants
  */
  var query = firebase.firestore().collection('restaurants').orderBy('avgRating', 'desc').limit(30);
  this.getDocumentsInQuery(query, render);
};

FriendlyEats.prototype.getDocumentsInQuery = function(query, render) {
  /*
     Render all documents in the provided query
  */
  query.onSnapshot(function(snapshot){
    if (!snapshot.size) {return render();}
    
    snapshot.docChanges.forEach(function(change){
      if (change.type === 'added') {
        render(change.doc);
        
      }
    });
  });
};

FriendlyEats.prototype.getRestaurant = function(id) {
  /*
    Retrieve a single restaurant
  */

  return firebase.firestore().collection('restaurants').doc(id).get();
};

FriendlyEats.prototype.getFilteredRestaurants = function(filters, render) {
  /*
    Retrieve filtered list of restaurants
  */

  if (filters.category !== 'Any') {
    query = query.where('category', '==', filters.category);
  }

  if (filters.city !== 'Any'){
    query = query.where('city', '==', filters.city);
  }

  if (filters.price !== 'Any'){
    query = query.where('price', '==', filters.price);
  }

  if (filters.sort === 'Rating'){
    query = query.orderBy('avgRating', 'desc');
  } else if (filters.sort === 'Reviews'){
    query = query.orderBy('numRatings', 'desc');
  }
  
  this.getDocumentsInQuery(query, render);
};

FriendlyEats.prototype.addRating = function(restaurantID, rating) {
  /*
    TODO: Retrieve add a rating to a restaurant
  */
};