CREATE DATABASE SMS;
use sms;

CREATE TABLE department (
    dept_name VARCHAR(50) PRIMARY KEY,
    building VARCHAR(50)
);

CREATE TABLE course (
    course_id VARCHAR(8) PRIMARY KEY,
    title VARCHAR(100),
    dept_name VARCHAR(50),
    credits INT,
    FOREIGN KEY (dept_name) REFERENCES department(dept_name)
);

CREATE TABLE instructor (
    ID INT,
    email VARCHAR(50),
    name VARCHAR(50),
    dept_name VARCHAR(50),
    salary DECIMAL(10, 2),
    PRIMARY KEY (email, ID),
    FOREIGN KEY (dept_name) REFERENCES department(dept_name)
);
SHOW CREATE TABLE instructor;
ALTER TABLE instructor DROP FOREIGN KEY instructor_ibfk_2;

ALTER TABLE instructor
ADD FOREIGN KEY (email) REFERENCES users(email);

insert into instructor
values
(1,'swetha.prof@gmail.com','Swetha Mishra','Civil',100),
(2,'ankit.prof@gmail.com','Ankit Guptha','Civil',150),
(3,'pooja.prof@gmail.com','Pooja Malik','CSE',100),
(4,'ashraf.prof@gmail.com','Md Ashraf','CSE',200),
(5,'sonia.prof@gmail.com',"Sonia D'souza",'CSE',150),
(6,'atul.prof@gmail.com','Atul Vir Singh','ECE',200),
(7,'naveen.prof@gmail.com','Naveen Babu','ECE',250),
(8,'ajit.prof@gmail.com','Ajit Kumar','Math',100),
(9,'neha.prof@gmail.com','Neha Bhoge','ME',100),
(10,'ramesh.prof@gmail.com','Ramesh Guptha','ME',150),
(11,'mayuk.prof@gmail.com','Mayuk Majumdhar','Physics',150);

CREATE TABLE studnt (
    ID INT,
    name VARCHAR(50),
    dept_name VARCHAR(50),
    tot_cred INT,
    email VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (dept_name) REFERENCES department(dept_name)
);

SHOW CREATE TABLE studnt;
ALTER TABLE studnt DROP FOREIGN KEY studnt_ibfk_2;

ALTER TABLE studnt
ADD FOREIGN KEY (email) REFERENCES users(email);

CREATE TABLE users (
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
ALTER TABLE users
ADD PRIMARY KEY (email);

alter table users
add column Rights INT;

select * from users;

insert into users (Rights)
values
(1),(0),(1),(1),(1),(0),(1),(1),(1),(0),(0),(0),(1),(0),(1),(0),(1),(1);

update users
set Rights=0
where email like '_____@gmail.com';

insert into users (email,password)
values
('swetha.prof@gmail.com','swetha@123'),
('ankit.prof@gmail.com','ankit@123'),
('pooja.prof@gmail.com','pooja@111'),
('ashraf.prof@gmail.com','ashraf@111'),
('sonia.prof@gmail.com',"sonia@111"),
('atul.prof@gmail.com','atul@100'),
('naveen.prof@gmail.com','navven@100'),
('ajit.prof@gmail.com','ajit@121'),
('neha.prof@gmail.com','neha@234'),
('ramesh.prof@gmail.com','ramesh@234'),
('mayuk.prof@gmail.com','mayuk@345'),
('an193@gmail.com','aaryan31'),
('pv800@gmail.com','prithvi41'),
('ph870@gmail.com','pyla453'),
('pd856@gmail.com','puni55'),
('gv177@gmail.com','vega177'),
('sc656@gmail.com','ramchow41'),
('pa277@gmail.com','akbhai32');

CREATE TABLE takes (
    email VARCHAR(50),
    course_id VARCHAR(8),
    quiz1 INT,
    midsem INT,
    quiz2 INT,
    endsem INT,
    grade CHAR(1),
    PRIMARY KEY (email, course_id),
    FOREIGN KEY (email) REFERENCES studnt(email),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);

INSERT INTO takes (email, course_id)
SELECT s.email, c.course_id
FROM studnt s
JOIN course c ON s.dept_name = c.dept_name;

select * from takes;

CREATE TABLE teaches (
	email VARCHAR(50),
    course_id VARCHAR(8),
    semester VARCHAR(25),
    PRIMARY KEY (email, course_id, semester),
    FOREIGN KEY (email) REFERENCES instructor(email)
);

insert into teaches
values
('swetha.prof@gmail.com','CED101',"Monsoon'24"),
('ankit.prof@gmail.com','CED102',"Spring'24"),
('pooja.prof@gmail.com','CSD101',"Monsoon'24"),
('ashraf.prof@gmail.com','CSD102',"Spring'24"),
('sonia.prof@gmail.com','CSD203',"Monsoon'24"),
('atul.prof@gmail.com','EED101',"Monsoon'24"),
('atul.prof@gmail.com','EED102',"Spring'24"),
('naveen.prof@gmail.com','EED201',"Monsoon'24"),
('ajit.prof@gmail.com','MAT101',"Spring'24"),
('neha.prof@gmail.com','MED101',"Monsoon'24"),
('ramesh.prof@gmail.com','MED201',"Spring'24"),
('ramesh.prof@gmail.com','MED203',"Monsoon'24"),
('mayuk.prof@gmail.com','PHY101',"Spring'24");

INSERT INTO takes (email,course_id)
SELECT s.email,'CSD101'
FROM studnt s
where s.dept_name in ('CSE','ECE','ME','Civil');

select * from takes;
CREATE TABLE section (
    course_id VARCHAR(8),
    sec_id INT,
    semester VARCHAR(6),
    year INT,
    building VARCHAR(50),
    room_number VARCHAR(10),
    time_slot_id INT,
    PRIMARY KEY (course_id, sec_id, semester, year),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (building, room_number) REFERENCES classroom(building, room_number)
);

CREATE TABLE classroom (
    building VARCHAR(50),
    room_number VARCHAR(10),
    capacity INT,
    PRIMARY KEY (building, room_number)
);

CREATE TABLE prereq (
    course_id VARCHAR(8),
    prereq_id VARCHAR(8),
    PRIMARY KEY (course_id, prereq_id),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (prereq_id) REFERENCES course(course_id)
);


ALTER USER 'root'@'localhost' IDENTIFIED BY 'vegamysql@24';
select @@hostname;
-- Create user with the specified host
CREATE USER 'root'@'DESKTOP-0GHCGA5' IDENTIFIED BY 'vegamysql@24';
-- Grant all privileges to the newly created user
GRANT ALL PRIVILEGES ON * TO 'root'@'DESKTOP-0GHCGA5';
-- Apply the changes
FLUSH PRIVILEGES;

GRANT ALL PRIVILEGES ON sms.* TO 'root'@'desktop-0ghcga5';
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'root'@'desktop-0ghcga5';
ALTER USER 'root'@'localhost' IDENTIFIED BY 'vegamysql24';

set SQL_SAFE_UPDATES=0;
update studnt s
join(
select dept_name,sum(credits) as tdc
from course
group by dept_name
) c on s.dept_name=c.dept_name
set s.tot_cred=s.tot_cred+c.tdc;

select * from course;

insert into users(email,password) 
values
('an193@gmail.com','aaryan31'),
('pv800@gmail.com','prithvi41'),
('ph870@gmail.com','pyla453'),
('pd856@gmail.com','puni55'),
('gv177@gmail.com','vega177'),
('sc656@gmail.com','ramchow41'),
('pa277@gmail.com','akbhai32');


select user();
select current_user();
select database();
select @@hostname;
select @@port;











