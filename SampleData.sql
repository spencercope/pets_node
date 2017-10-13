USE `snowremoval`;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE roles;
INSERT INTO roles (name) VALUES ('Administrator');
INSERT INTO roles (name) VALUES ('QA');
INSERT INTO roles (name) VALUES ('Property Manager');
INSERT INTO roles (name) VALUES ('Crew Manager');
INSERT INTO roles (name) VALUES ('Crew');

TRUNCATE users;
INSERT INTO users (username, email, `password`) VALUES
    ('admin', 'chuff@bsrservices.com', md5('adminpassword'))
    ,('qa', 'chuff@bsrservices.com', md5('qapassword'))
    ,('mhenman', 'mark.henman@tdktech.com', md5('password'))
    ,('ngilbert', 'norm.gilbert@tdktech.com', md5('password'))
    ,('cwolfe', 'craig.wolfe@tdktech.com', md5('password'))
    ,('colleen', 'chuff@bsrservices.com', md5('password'))
    ,('sherri', 'sherri.wieczorek@tdktech.com', md5('password'))
;

TRUNCATE user_roles;
insert into user_roles (UserID, RoleID) select u.id, r.id from users u, roles r where u.username = 'admin' and r.name = 'Administrator';
insert into user_roles (UserID, RoleID) select u.id, r.id from users u, roles r where u.username = 'qa' and r.name = 'QA';
insert into user_roles (UserID, RoleID) select u.id, r.id from users u, roles r where u.username = 'mhenman' and r.name = 'Administrator';
insert into user_roles (UserID, RoleID) select u.id, r.id from users u, roles r where u.username = 'ngilbert' and r.name = 'Administrator';
insert into user_roles (UserID, RoleID) select u.id, r.id from users u, roles r where u.username = 'cwolfe' and r.name = 'Administrator';
insert into user_roles (UserID, RoleID) select u.id, r.id from users u, roles r where u.username = 'colleen' and r.name = 'Administrator';
insert into user_roles (UserID, RoleID) select u.id, r.id from users u, roles r where u.username = 'sherri' and r.name = 'Administrator';

TRUNCATE permissions;
insert INTO permissions (name) VALUES
    ('readOwnSnowEvent')
    ,('readSnowEvents')
    ,('createUsers')
    ,('readUsers')
    ,('readOwnUser')
;

TRUNCATE role_permissions;
insert into role_permissions (RoleID, PermissionID) select r.id,p.id from  roles r, permissions p where p.name = 'readUsers' and r.name = 'Administrator';
insert into role_permissions (RoleID, PermissionID) select r.id,p.id from  roles r, permissions p where p.name = 'createUsers' and r.name = 'Administrator';
insert into role_permissions (RoleID, PermissionID) select r.id,p.id from  roles r, permissions p where p.name = 'readSnowEvents';
insert into role_permissions (RoleID, PermissionID) select r.id,p.id from  roles r, permissions p where p.name = 'readOwnUser';

TRUNCATE snowevents;
INSERT INTO `snowevents` (startDateTime, eventNumber, endDateTime, billingDate, snowDepth, forecastConditions, actualConditions, state)
VALUES ('2016-01-01 20:14:22',1,'2016-01-02 06:00:00','2016-01-04 06:00:00',2,'Cloudy','Blizzard','closed')
    ,('2016-01-08 20:14:48',3,NULL,NULL,0,NULL,NULL,'closed')
    ,('2016-01-05 21:39:38',2,'2016-01-08 06:00:00','2016-01-09 06:00:00',4,'Snow','Ice','live');

truncate materials;
INSERT INTO materials (name, unit, defaultPrice) VALUES
    ('Ice Control Salt Applied', 'ton', 125.0)
    ,('Calcium Cloride Applied', 'Bag', 40.0)
    ,('Magnesium', 'Bag', 40.0)
    ,('Potasium Cloride', 'Bag', 45.0)
    ,('Calcium Magnesium Acetate - CMA', 'Bag', 115.0)
;

truncate availableservices;
INSERT IGNORE INTO `availableservices` (name, invoiceName, qbName, serviceTypeName, surfaceTypeName, applicationType, equipmentFlag, material_id)
VALUES
     ('Full Chemical','Full Chemical Application to Parking Lots','Salt','Chemical','Lots','Full','0', (select id from materials where name = 'Ice Control Salt Applied'))
    ,('Partial Chemical','Partial Chemical Application to Parking Lots','Salt','Chemical','Lots','Partial','0', (select id from materials where name = 'Ice Control Salt Applied'))
    ,('Full Chemical','Full Chemical Application to Sidewalk Areas','Calcium','Chemical','Sidewalks','Full','0', (select id from materials where name = 'Calcium Cloride Applied'))
    ,('Partial Chemical','Partial Chemical Application to Sidewalk Areas','Calcium','Chemical','Sidewalks','Partial','0', (select id from materials where name = 'Calcium Cloride Applied'))
    ,('Full Chemical','Full Chemical Application to Garage Decks','Calcium','Chemical','Garage Decks','Full','0', (select id from materials where name = 'Ice Control Salt Applied'))
    ,('Partial Chemical','Partial Chemical Application to Garage Decks','Calcium','Chemical','Garage Decks','Partial','0', (select id from materials where name = 'Ice Control Salt Applied'))

    ,('Full Plow','Full Plowing of Parking Lots and Roadways','Plowing of Lots','Plow','Lots','Full','1', null)
    ,('Partial Plow','Partial Plowing of Parking Lots and Roadways','Plowing of Lots','Plow','Lots','Partial','1', null)
    ,('Pathing Plow','Pathing entrances','Plowing of Lots','Plow','Lots','Pathing','1', null)

    ,('Full Shovel','Full Shoveling of Sidewalk Areas','Walk Clearing (Shoveling)','Shovel','Sidewalks','Full','0', null)
    ,('Partial shovel','Partial Shoveling of Sidewalk Areas','Walk Clearing (Shoveling)','Shovel','Sidewalks','Partial','0', null)

    ,('Pathing Plow','Pathing garage decks','Garage Plowing','Plow','Garage Decks','Pathing','1', null)
    ,('Full Plow', 'Full Plowing of Garage Decks','Garage Plowing','Plow', 'Garage Decks', 'Full', '1', null)
;

TRUNCATE accounttypes;
INSERT IGNORE INTO accounttypes (name, propertyFlag, shortName, billingType) values
    ('All Accounts', '-', 'All', 'Both'),
    ('24/7 Accounts', 'open24HoursFlag', 'Open 24/7', 'PO'),
    ('Saturday Accounts', 'openSaturdayFlag', 'Open Saturday', 'PO'),
    ('Sunday Accounts', 'openSundayFlag', 'Open Sunday','PO'),
    ('T&M Accounts', 'TM', 'T&M','TM');

TRUNCATE contractranges;
INSERT INTO contractranges (name, minInches) VALUES
    ('0.0-0.9', '0')
    ,('1.0-1.99', '1')
    ,('2.0-2.99', '2')
    ,('3.0-4.0', '3')
    ,('4.1-5.0', '4.1')
    ,('5.1-6.0', '5.1')
    ,('6.1-7.0', '6.1')
    ,('7.1-8.0', '7.1')
    ,('8.1-9.0', '8.1')
    ,('9.1-10.0', '9.1')
    ,('10.1-11.0', '10.1')
    ,('11.1-12.0', '11.1')
    ,('12.1-13.0', '12.1')
    ,('13.1-14.0', '13.1')
;

truncate holidays;
insert into holidays (name, approxDate) values
    ('Thanksgiving', '11-27')
    ,('Christmas Eve', '12-24')
    ,('Christmas Day', '12-25')
    ,('New Years Eve', '12-31')
    ,('New Years Day', '01-01')
    ,('MLK Day', '01-16')
    ,('President''s Day', '02-15')
;

TRUNCATE labortypes;
INSERT INTO labortypes (name) VALUES
    ('Plow')
    ,('Shovel')
    ,('Chemical')
;

TRUNCATE equipmenttypes;
INSERT INTO equipmenttypes (name, serviceTypeName, defaultPrice) VALUES
    ('Plow', 'Plow', 80.0)
    ,('Backhoe', 'Plow', 120.0)
    ,('Backhoe w/ Containment Plow 12''', 'Plow', 160.0)
    ,('Wheel Loader', 'Plow', 150.0)
    ,('Wheel Loader w/ Containment Plow 14''', 'Plow', 200.0)
    ,('Wheel Loader w/ Containment Plow 18''', 'Plow', 240.0)
    ,('AG Tractor', 'Plow', 120.0)
    ,('AG Tractor w/ Containment Plow 16'' - 20''', 'Plow', 240.0)
    ,('Bobcat / Skid Steer', 'Plow', 95.0)
    ,('Dump Truck', 'Plow', 95.0)
    ,('ATV/UTV with blade and spreader', 'Plow', 60.0)
    ,('Powerbroom', 'Shovel', 60.0)
    ,('ATV', 'Shovel', 60.0)
    ,('Shovel', 'Shovel', 45.0)
;

truncate rates;

source SpreadSheetData.sql

delete from contractrates where availableService_id = 0;

TRUNCATE equipmentrates;
insert IGNORE into equipmentrates (price, property_id, equipmentType_id)
    select e.defaultPrice, p.id, e.id from properties p cross join equipmenttypes e;

truncate materialrates;
insert IGNORE into materialrates (price, property_id, material_id)
    select m.defaultPrice, p.id, m.id from properties p cross join materials m;


insert into invoices (id, createdDate, invoiceDate, totalAmountDue, totalAmountPaid, poNumber, notes, state, entityType, snowEvent_id, property_id) values
    (1,'2016-01-01 10:14:22','2016-01-01 20:14:22',500,300,12345678910,'test','pending','Invoice',1,1);
insert into invoices (id, createdDate, invoiceDate, totalAmountDue, totalAmountPaid, poNumber, notes, state, entityType, snowEvent_id, property_id) values
    (2,'2016-01-02 10:14:22','2016-01-02 20:14:22',200,0,32454378910,'test','pending','Invoice',1,3);
insert into invoices (id, createdDate, invoiceDate, totalAmountDue, totalAmountPaid, poNumber, notes, state, entityType, snowEvent_id, property_id) values
    (3,'2015-12-02 10:14:22','2015-12-02 20:14:22',1000,0,76512322334,'test','pending','Invoice',2,4);
insert into invoices (id, createdDate, invoiceDate, totalAmountDue, totalAmountPaid, poNumber, notes, state, entityType, snowEvent_id, property_id) values
    (4,'2015-12-02 10:14:22','2015-12-02 20:14:22',3000,0,43244422334,'test','paid','Invoice',2,4);
insert into invoices (id, createdDate, invoiceDate, totalAmountDue, totalAmountPaid, poNumber, notes, state, entityType, snowEvent_id, property_id) values
    (5,'2015-12-02 10:14:22','2015-12-22 20:14:22',400,0,44247422334,'test','pending','Invoice',2,4);

SET FOREIGN_KEY_CHECKS = 1;
