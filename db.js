require('dotenv').config();
const { Pool } = require('pg');


let host = process.env.host;
let database = process.env.database;
let port = process.env.port;
let username = process.env.username;
let password = process.env.password;

let connectionString = 
`postgres://${username}:${password}@${host}:${port}/${database}`;

let connection = {
    connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL : connectionString,
    ssl : {rejectUnauthorized: false}
};

const pool = new Pool(connection);

let saveAddress = (street, city, state, postalCode) => {
    return pool.query('insert into mynearbyplaces.address(street, city, state, postalcode) values ($1, $2, $3, $4) returning id', [street, city, state, postalCode])
    .then(result => {console.log('the address was saved'); return result.rows[0].id});
   
}

let savePlace = (name, addressId) => 
{
    return pool.query('insert into mynearbyplaces.place(name, addressid) values ($1, $2)', [name, addressId])
    .then(() => {console.log('the place was saved'); });    

}

let saveReview = (comment, rating, placeId) => {
    return pool.query('insert into mynearbyplaces.review(comment, rating, placeid) values ($1, $2, $3)', [comment, rating, placeId])
    .then(result => {console.log('the review was saved'); return result.rows[0].id});
   
}
let getCustomerId = (name) =>{
    let sql = `select id from mynearbyplaces.customer c where c.name = '${name}'`
    return pool.query(sql)
    .then(result => result.rows);
}

let getPlaceId = (placeName) =>{
    let sql = `select id from mynearbyplaces.place p where p.name = '${placeName}'`
    return pool.query(sql)
    .then(result => result.rows);
}
let getPlaces = () => {
    let sql = `select p.name, a.street , a.city , a.state , a.postalcode, 
    json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'customer', c."name")) as reviews
    from mynearbyplaces.place p 
    inner join mynearbyplaces.address a on p.addressid  = a.id 
    inner join mynearbyplaces.review r on p.id = r.placeid 
    left join mynearbyplaces.customer c on r.customerid = c.id 
    group by p.name, a.street , a.city , a.state , a.postalcode`;
    return pool.query(sql)
    .then(result => result.rows);
    
}

let findPlaces = (name, street, city, state, postalcode) => {

    let sql = `select p.name, a.street , a.city , a.state , a.postalcode, 
    json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'customer', c."name")) as reviews
    from mynearbyplaces.place p 
    inner join mynearbyplaces.address a on p.addressid  = a.id 
    left join mynearbyplaces.review r on p.id = r.placeid 
    left join mynearbyplaces.customer c on r.customerid = c.id 
    where 
    (lower(p.name) like lower('${!name ? '%%' : `%${name}%`}')) 
    and (lower(a.street) like lower('${!street ? '%%' : `%${street}%`}')) 
    and (lower(a.city) like lower('${!city ? '%%' : `%${city}%`}')) 
    and (lower(a.state) like lower('${!state ? '%%' : `%${state}%`}')) 
    and (cast(a.postalcode as text) like '${!postalcode ? '%%' : `%${postalcode}%`}') 
    group by p.name, a.street , a.city , a.state , a.postalcode
    `;
    console.log(sql);
    return pool.query(sql)
    .then(result => result.rows);

}
let deletePlace = (id) => {
    console.log(connectionString)
    let sql = `DELETE FROM mynearbyplaces.place WHERE id=$1`;
    return pool.query(sql)
    .then(result => {console.log('the place was deleted'); });  
}

module.exports = { saveAddress, savePlace, getPlaces, findPlaces, saveReview, getPlaceId, getCustomerId, deletePlace}
