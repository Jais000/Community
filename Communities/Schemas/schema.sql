CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    email VARCHAR(255) NOT NULL UNIQUE, 
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL);
        community_ids INT,

    FOREIGN KEY (community_ids) REFERENCES communities (id) ON DELETE CASCADE
CREATE TABLE communities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    events TEXT,
    user_ids INT,
    FOREIGN KEY (user_ids) REFERENCES users (id) ON DELETE CASCADE
);