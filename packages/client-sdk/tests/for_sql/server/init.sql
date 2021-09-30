create table IF NOT EXISTS categories (
  id int not null auto_increment,
  name varchar(64) not null, 
  created_at int, 
  primary key(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table IF NOT EXISTS articles (
  id int not null auto_increment,
  title varchar(64) not null, 
  category_id int,
  content text,
  created_at int, 
  updated_at int,
  created_by int,
  primary key(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;