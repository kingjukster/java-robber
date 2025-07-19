---

# Cops vs Robbers (java-robber)

A grid‐based simulation game where **Robbers** try to collect enough loot (jewels) while **Police** attempt to catch them. The game ends when either the robbers meet their loot goal, all robbers are caught, or a turn limit is reached. This project uses **Node.js**, **Express**, and an **Oracle** database for storing stats.

## Table of Contents
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Usage](#usage)
- [Simulating Multiple Games](#simulating-multiple-games)
- [All-Time Stats Page](#all-time-stats-page)
- [Linting & Formatting](#linting--formatting)

---

## Features
- **Turn-based simulation** of robbers and police moving around a 10×10 grid.
- **Jewel pickup** by robbers, and **arrests** by police.
- **Win conditions**:
  - Robbers gather enough loot (340 by default).
  - All robbers caught.
  - Turn limit reached.
- **Oracle database** integration for storing:
  - Game results (winner, turn count).
  - Player stats (robber loot, police arrests).
- **All-time stats** page showing aggregated data (wins, top players, etc.).

---

## Setup & Installation

1. **Clone** this repository:
   ```bash
   git clone https://github.com/kingjukster/java-robber.git
   cd java-robber
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Oracle DB**:
   - Ensure you have the Oracle Instant Client and the `oracledb` Node driver installed.
   - Create your schema / tables as needed (GameStats, PlayerStats, etc.).
   - Make sure the database is running and accessible at `127.0.0.1:1521`, or update
     `DB_CONNECT_STRING` in your `.env` accordingly.

---

## Environment Variables

Create a **.env** file in the project root to store your Oracle DB credentials and any other config:

```
DB_USER=system
DB_PASS=42
DB_CONNECT_STRING=localhost/FREE
PORT=3000
```

> **Never** commit `.env` to version control (it should be in your `.gitignore`).

---

## Running the App

1. **Start** the server:
   ```bash
   npm start
   ```
   This runs `node ./backend/routes/server.js` by default (per the `start` script in `package.json`).
2. **Open** [http://localhost:3000](http://localhost:3000) in your browser.  
   - If you see “Cannot GET /,” make sure you have a route or static file set up for `/`.

---

## Usage

- **Start Game**: On the title screen, click **Start Game**. This initializes a new 10×10 grid with robbers, police, and jewels.
- **Next Turn**: Each click on **Next Turn** moves all robbers and police.  
- **New Game**: Resets everything for a fresh session.  
- **Simulate X Games**: If implemented, a button or input that triggers multiple game simulations server-side.

---

## Simulating Multiple Games

If you’ve added a route like `/simulate-multiple` and a button in your frontend:
1. **Click** “Sim X Games.”
2. **Enter** how many games to simulate.
3. The server quickly runs each game to completion and stores results in the DB.

---

## All-Time Stats Page

If you have a **stats.html** or “All-Time Stats” page:
- Access it at `[http://localhost:3000/stats.html](http://localhost:3000/stats.html)` or a similar route.
- Displays **aggregated** data:
  - Total games, total robber/police wins, average turns, etc.
  - Top 10 robbers by jewels stolen.
  - Top 10 police by arrests.

---

## Linting & Formatting

1. **ESLint** is configured via `eslint.config.js` (flat config).  
   - Run `npx eslint .` or `npm run lint` to check for code issues.  
2. **Prettier** is installed for formatting.  
   - You can auto-format code with `npx prettier --write .` if you wish.

> If you see errors like `'require' is not defined`, ensure your ESLint config includes `globals.node` and the correct `sourceType` (e.g., `"script"` for CommonJS).

---

Thanks for checking out the **Cops vs Robbers** project! If you have any questions or suggestions, feel free to open an issue or PR. Have fun coding!