const express = require('express');

const app = express();
const port = process.env.PORT || 4002;

app.get('/', (request, response) =>{
    response.send(`Welcome to Imagequiz-Serverside`);
})


app.post('/place', (request, response) => {  
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

app.post('/review/:placeName', (request, response) => {  
    let placeName = request.params.placeName;
    let name = request.body.name;
    let comment = request.body.comment
    let rating = request.body.rating
    db.getPlaceId(placeName)
    .then(customerid => getCustomerId(name))
    .then(placeid => saveReview(comment,rating,placeid, customerid))                  
    .then(() => response.send('The review was added.'))
    .catch(e => {console.log(e); response.status(500).send('There was an error in adding the place.')});

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
    console.log(`name: ${name} - ${typeof(name)}`);
    console.log(`street: ${street} - ${typeof(street)}`);
    db.findPlaces(name, street, city, state, postalcode)
    .then(places => response.json(places))
    .catch(e => {console.log(e); response.status(500).send('There was an error in finding the places.')});  
    
  });
  app.post('/deletePlace', (request, response) => {
    db.deletePlace(request.body.id)
    .then(places => response.json(places))
    .catch(e => {console.log(e); response.status(500).send('there was an error in delete the place')})
 });

app.listen(port, () => console.log("Listening on port " + port))