const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4002;
const db = require('./db');

app.use(express.json());
app.use(cors());
var crypto = require('crypto');

app.get('/', (request, response) =>{
    response.send(`Welcome to nearbyplaces-Serverside`);
})


app.post('/place', (request, response) => {  
    console.log("hello");
    let name = request.body.name;
    let street = request.body.street; 
    let city = request.body.city;
    let state = request.body.state;
    let postalcode = request.body.postalcode; 
    db.saveAddress(street, city, state, postalcode)
    .then(addressid => db.savePlace(name, addressid))
    .then(() => response.send('The place was added.'))
    .catch(e => {console.log(e); response.status(500).send('There was an error in adding the place.')});

});

app.post('/review/:placeName', async (request, response) => {  
    let placeName = request.params.placeName;
    let name = request.body.name;
    let comment = request.body.comment;
    let rating = request.body.rating;
    let placeId;
    await db.getPlaceId(placeName)
    .then(placeid => placeId = placeid)

    db.getCustomerId(name)
    .then(customerid => db.saveReview(comment, rating, placeId, customerid))                  
    .then(() => response.send('The review was added.'))
    .catch(e => {console.log(e); response.status(500).send('There was an error in adding the review.')});

});

app.get('/places', (request, response) => {  
    db.getPlaces()
    .then(places => response.json(places))
    .catch(e => {console.log(e); response.status(500).send('There was an error in finding the places.')});  
   
  });

  app.get('/search/:name?/:street?/:city?/:state?/:postalcode?', (request, response) => {  
    let name = request.query.name;
    let street = request.query.street;
    let city = request.query.city;
    let state = request.query.state;
    let postalcode = request.query.postalcode;
    db.findPlaces(name, street, city, state, postalcode)
    .then(places => response.json(places))
    .catch(e => {console.log(e); response.status(500).send('There was an error in finding the places.')});  
    
  });
  app.post('/deletePlace', async(request, response) => {
      //let addressId;
    db.getAddressId(request.body.street, request.body.city, request.body.state, request.body.zip)
    .then(addressid  => db.deletePlace(addressid))
    .then(addressID => db.deleteAddress(addressID))
    .catch(e => {console.log(e); response.status(500).send('there was an error in delete the place')})
 });

 app.post('/deleteReview', (request, response) => {
    db.getCustomerId(request.body.username)
    .then(customerid => db.deleteReview(request.body.reviewName, request.body.rating, customerid))
    .then(() => response.send('The review was deleted.'))
    .catch(e => {console.log(e); response.status(500).send('there was an error in delete the place')})
 });

 app.post('/customer', (request, response) => {
    let name = request.body.name;
    let email = request.body.email;
    var password = crypto.createHash('md5').update(request.body.password).digest('hex');
    db.addCustomer(name, email, password)
    .then(() => response.send('The customer was added.'))
    .catch(e => response.status(500).send('There was an error in adding the customer'));
});

app.post('/updatePlace', (request, response) => {
    let placeName = request.body.newAdd.placeName;
    let street = request.body.newAdd.street; 
    let city = request.body.newAdd.city;
    let state = request.body.newAdd.state;
    let zip= request.body.newAdd.zip; 
    console.log("inside", request.body.oldAdd.zip);
    db.getAddressId(request.body.oldAdd.street, request.body.oldAdd.city, request.body.oldAdd.state, request.body.oldAdd.zip)
    .then(addressid  => db.updatePlace(street, city, state, zip, addressid))
    .then(() => response.send('The place was updated.'))
    .catch(e => response.status(500).send('There was an error in updating place'));
});

app.listen(port, () => console.log("Listening on port " + port))