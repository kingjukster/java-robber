-- Active: 1725866537809@@localhost@3306
CREATE USER gameDB IDENTIFIED BY "SecurePass42";
GRANT CONNECT, RESOURCE TO gameDB;
ALTER USER gameDB QUOTA UNLIMITED ON USERS;


CREATE TABLE GameStats (
    game_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    total_turns NUMBER,
    robber_goal NUMBER,
    total_jewel_value NUMBER,
    winner VARCHAR2(20)
);

CREATE TABLE RobberStats (
  game_id NUMBER,
  robber_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  jewels_stolen NUMBER DEFAULT 0,
  FOREIGN KEY (game_id) REFERENCES GameStats(game_id)
);

CREATE TABLE PoliceStats (
  game_id NUMBER,
  police_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  jewels_recovered NUMBER DEFAULT 0,
  arrests_made NUMBER DEFAULT 0,
  FOREIGN KEY (game_id) REFERENCES GameStats(game_id)
);
