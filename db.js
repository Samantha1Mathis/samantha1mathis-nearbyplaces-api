require('dotenv').config();
const { Pool } = require('pg');


let host = process.env.host;
let database = process.env.database;
let port = process.env.port;
let username = 'chekgokddlntpp';
let password = process.env.password;

let connectionString = 
`postgres://${username}:${password}@${host}:${port}/${database}`;

let connection = {
    connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL : connectionString,
    ssl : {rejectUnauthorized: false}
};

const pool = new Pool(connection);

let saveAddress = (street, city, state, postalCode) => {
    return pool.query('insert into mynearbyplaces.address(street, city, state, zip) values ($1, $2, $3, $4) returning id', [street, city, state, postalCode])
    .then(result => {console.log('the address was saved'); return result.rows[0].id});
   
}

let savePlace = (name, addressId) => 
{
    return pool.query('insert into mynearbyplaces.place(placename, addressid) values ($1, $2)', [name, addressId])
    .then(() => {console.log('the place was saved'); });    

}

let saveReview = (comment, rating, placeId, customerId) => {
    return pool.query('insert into mynearbyplaces.review(comment, rating, placeid, customerid) values ($1, $2, $3, $4)', [comment, rating, placeId, customerId])
    .then(() => {console.log('the review was saved');});
   
}
let getCustomerId = (name) => {
    let sql = `select id from mynearbyplaces.customer c where c.name = '${name}'`
    return pool.query(sql)
    .then(result => result.rows[0].id);
}

let getAddressId = (street, city, state, zip) => {
    let sql = `select id from mynearbyplaces.address a where a.street= '${street}' and a.city='${city}' and a.state='${state}' and a.zip=${zip}`
    return pool.query(sql)
    .then(result => result.rows[0].id);
}

let getPlaceId = (placeName) =>{
    let sql = `select id from mynearbyplaces.place p where p.placename = '${placeName}'`
    return pool.query(sql)
    .then(result => result.rows[0].id);
}
let getPlaces = () => {
    let sql = `select p.placename, p.id, a.street , a.city , a.state , a.zip,
    json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'customer', c."name", "reviewid", r.id)) as reviews
    from mynearbyplaces.place p 
    inner join mynearbyplaces.address a on p.addressid  = a.id 
    inner join mynearbyplaces.review r on p.id = r.placeid 
    left join mynearbyplaces.customer c on r.customerid = c.id 
    group by p.placename, p.id, a.street , a.city , a.state , a.zip`;
    console.log(sql);
    return pool.query(sql)
    .then(result => result.rows);
    
}

let findPlaces = (name, street, city, state, postalcode) => {

    let sql = `select p.placename, a.street , a.city , a.state , a.zip, 
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
    group by p.name, a.street , a.city , a.state , a.zip
    `;
    console.log(sql);
    return pool.query(sql)
    .then(result => result.rows);

}
let deletePlace = (addressId) => {
    let sql = `DELETE FROM mynearbyplaces.place p WHERE p.addressid=${addressId}`;
    return pool.query(sql)
    .then(result  => addressId);  
}

let deleteAddress = (addressId) => {

    let sql = `DELETE FROM mynearbyplaces.address WHERE id=${addressId}`;
    return pool.query(sql)
    .then(result => {console.log('the address was deleted'); });  
}

let deleteReview = (text, rating, customerid) => {
    let sql = `DELETE FROM mynearbyplaces.review WHERE comment='${text}' and rating='${rating}' and customerid=${customerid}`;
    return pool.query(sql)
    .then(result => {console.log('the review was deleted'); });  
}

let addCustomer = (name, email, password) => {
    return pool.query('insert into mynearbyplaces.customer(name, email, password) values ($1, $2, $3)', [name, email, password])
    .then(() => console.log('The customer was saved.'))
    .catch(e => console.log(e));
}

let updatePlace =(street, city, state, zip, addressid) =>{
    let sql = `UPDATE mynearbyplaces.address set street='${street}',
    city='${city}',state='${state}', zip=${zip} where id=${addressid}`
    return pool.query(sql)
    .then(result => {console.log('the address is updated')});
}


module.exports = { 
    saveAddress, 
    savePlace, 
    getPlaces, 
    findPlaces, 
    saveReview, 
    getPlaceId, 
    getCustomerId, 
    deletePlace, 
    addCustomer, 
    deleteReview,
    getAddressId, 
    deleteAddress,
    updatePlace}
