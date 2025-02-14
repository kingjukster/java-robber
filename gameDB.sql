-- Active: 1725866537809@@localhost@3306
CREATE USER gameDB IDENTIFIED BY "SecurePass42";
GRANT CONNECT, RESOURCE TO gameDB;
ALTER USER gameDB QUOTA UNLIMITED ON USERS;


CREATE TABLE GameStats (
    game_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    total_turns NUMBER,
    winner VARCHAR2(20)
);

CREATE TABLE PlayerStats (
    player_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game_id NUMBER,
    role VARCHAR2(10) CHECK (role IN ('Robber', 'Police')),
    jewels_stolen NUMBER DEFAULT 0,
    arrests_made NUMBER DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES GameStats(game_id)
);

CREATE TABLE TurnLogs (
    turn_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game_id NUMBER,
    turn_number NUMBER,
    robber_positions CLOB,
    police_positions CLOB,
    jewels_remaining NUMBER,
    FOREIGN KEY (game_id) REFERENCES GameStats(game_id)
);


SELECT * FROM GameStats;
SELECT * FROM PlayerStats;

/*
DROP TABLE TurnLogs CASCADE CONSTRAINTS;
DROP TABLE PlayerStats CASCADE CONSTRAINTS;
DROP TABLE GameStats CASCADE CONSTRAINTS;
*/