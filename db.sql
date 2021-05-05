create table mynearbyplaces.place
(
	id bigserial primary key,
	placeName text not null,
	addressid integer references mynearbyplaces.address(id),
);

create table mynearbyplaces.address
(
	id bigserial primary key,
	street text,
	city text,
    state text,
    zip integer
);

create table mynearbyplaces.customer
(
	id bigserial primary key,
	name text not null,
);

create table mynearbyplaces.review
(
	id bigserial primary key,
	comment text,
    rating integer,
    placeid integer references mynearbyplaces.place(id),
    customerid integer references mynearbyplaces.customer(id),
);