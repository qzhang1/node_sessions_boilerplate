create schema if not exists app_auth;
create table users (
    id uuid default gen_random_uuid(),
    email varchar(100) not null unique,
    password varchar(100),
    salt varchar(32),
    roles varchar(300) not null
    provider varchar(50) default 'self',    
    primary key (id)
);