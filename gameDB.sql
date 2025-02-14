-- Active: 1725866537809@@localhost@3306

CREATE TABLE GameStats (
    game_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
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
