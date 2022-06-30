--check installed extension
SELECT * FROM pg_extension
--install extension uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--check a random uuid4 generate
select uuid_generate_v4();
--create database
CREATE TABLE PRODUCT(
    product_id serial ,
    product_name VARCHAR(200),
    qty int,
    description VARCHAR(250),
    inStock int,
    unit VARCHAR(250),
    store_id VARCHAR(10),
    productType_id VARCHAR(10),
    price Numeric(10,2),
    status int
    PRIMARY KEY (product_id)
)
--insert into table
insert into Product (product_name, qty, description, inStock, unit, store_id, productType_id) 
values ('Banh Mi', 10,'Banh Mi Sai Gon, dac biet thom ngon, 3 ngan 1 o', 100, 'O', 1,1 );

insert into Product (product_name, qty, description, inStock, unit, store_id, productType_id) 
values ('Bun bo', 10,'Bún bò làm từ thịt heo', 100, 'Tô', 1,1 );

insert into Product (product_name, qty, description, inStock, unit, store_id, productType_id) 
values ('Bún chả cá', 10,'Làm từ thịt bò', 100, 'Tô', 1,1 );

insert into Product (product_name, qty, description, inStock, unit, store_id, productType_id) 
values ('Lẩu thái', 10,'Làm từ thịt thái XD', 100, 'Nồi', 1,1 );

select * from Product order by product_id desc


update Product set product_name = 'Bún bò huế', qty=1000, description = 'tuong doi ngon',
instock = 290, unit = 'tô', store_id=2, producttype_id = 2
where product_id = 1

delete from Product where product_id = 1

select product_id,product_name from product where product_id=2

select * from product order by price desc;

select * from product order by price desc offset 2 fetch next 2 rows only

select * from product offset 0 fetch next 2 rows only 

select * from product where cast(qty as varchar) = '10'

Select product_id,product_name,qty,price From product where qty > 1  and unit like '%N' order by price desc offset 0 fetch next 3 rows only

Select product_id,product_name,qty,price From product Where status != 3 and  ( qty > 0  and unit like '%Nồi%'  )

select * from product where unit like '%Nồi%'

update product set status = 3 where product_id = 2

select * from product where product_id = 2


select * from public.product
---------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------


CREATE TABLE PRODUCTS(
    id serial,
    product_name text,
    image_url text,
    landing_page_url text,
    category text,
    price numeric,
    status integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    product_id text,
    portal_id integer,
    PRIMARY KEY (id)
);
CREATE TABLE Users(
    id serial,
    uid text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    portal_id integer,
    PRIMARY KEY (id)
);
CREATE TABLE Event_histories(
    event text,
    uid text,
    portal_id integer,
    productsId text[]
)

drop table products;
drop table users;
drop table event_histories;

delete from products;
delete from users;
delete from event_histories;

insert into Products (product_name, image_url, landing_page_url, category, price, status, created_at, updated_at, product_id, portal_id) 
values ('banh mi', 'img_url', 'url', 'category',1000000, 1, current_timestamp, current_timestamp, 321, 000)



select * from products;
select * from users;
select * from event_histories;
insert into event_histories (event, uid, productsId) values ('view_product', '123', '{002}') 
insert into event_histories (event, uid) values ('view_product', '123')

insert into users (uid) values ('1')

select exists(select 1 from products where product_id='89049')
select exists(select 1 from products where product_id = $1
select * from products where product_id = '123-456-789123151231'
