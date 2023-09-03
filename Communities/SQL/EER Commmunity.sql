insert into users_has_communes (user_id, commune_id) values (1,2);
select * from communes;
insert into users (name, email, password) values ('Tim', 'kim@123.com',123);
insert into communes (name) values ('Test');

select commune_id, communes.name from users_has_communes join users on users.id = users_has_communes.user_id join communes on communes.id = users_has_communes.commune_id where users.id = 1; 
select events_has_communesents from communes;
INSERT INTO communes (events) VALUES ('{"name":"meetup", "location":"online", "time":"Monday"}');
SHOW VARIABLES LIKE 'sql_mode';
set global sql_mode='';
set global sql_mode='STRICT_TRANS_TABLES';
select * from events_has_communes join communes on communes.id = events_has_communes.communes_id;
select * from communes;
select * from events_has_communes;
select * from events;
insert into events (event) values ('test');
insert into communes (name, events) values ('community','test');
insert into events_has_communes (events_id,communes_id) values (2,1);

select communes.id,communes.name,events.id,events.event from events join events_has_communes on events_has_communes.events_id = events.id join communes on events_has_communes.communes_id = communes.id 
join users_has_communes on users_has_communes.commune_id = communes.id
join users on users.id = users_has_communes.user_id where users.id = 1;

select * from communes;
select * from users_has_communes;
delete from events_has_communes where events_id = 2;
delete from events where id = 4;
select * from communes order by id desc limit 1;
select user_id,isAdmin,name,email from users_has_communes join users on users_has_communes.user_id = users.id where commune_id = 1;
select * from users;
select users_id1 from users_has_users where users_id=2;
select * from users_has_messages;
select * from messages;
select messages.id,Message from messages join users_has_messages 
on messages.id = users_has_messages.messages_id 
join users on  users.id = users_has_messages.users_id
where isSender = 0 and users_id = 2;
select users_id from users_has_messages where isSender=1 and messages_id=13;
select * from activeid;
select * from users where id=1