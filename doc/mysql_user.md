create database test_db;
create user test;
grant all on test_db.* to test; 
alter user test identified  by 'test_password';
