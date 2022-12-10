create schema if not exists app_auth;
create table app_auth.users (
    id uuid default gen_random_uuid(),
    email varchar(100) not null unique,
    password varchar(100),
    salt varchar(32),
    roles varchar(300) not null,
    provider_id varchar(100),
    provider varchar(50) default 'self',    
    primary key (id)
);

create index provider_id_idx ON app_auth.users (provider_id);
