# Fluent Crypto Tapper

A simple clicker game exported from the Hatch canvas. It is built as a React component and includes a minimal Express backend for storing player progress.

## Project Structure
- `component.jsx` – main React component implementing the game logic
- `component.js` – compiled JavaScript version of the component
- `index.html` – standalone page that embeds the component with Hatch runtime
- `server.js` – Express server exposing REST endpoints for saving and loading player data
- `db.json` – JSON data store used by the server
- `storedState.json` – default state used when running offline

## Features
- Coins, energy, levels and experience mechanics
- Passive income, offline progress and daily rewards
- Combo multipliers and in-app notifications
- Persistent state via Hatch's `useStoredState` hook
- REST API endpoints:
  - `GET /api/user/:id` – fetch user data
  - `POST /api/user/:id/save` – update user data
  - `POST /api/user/:id/click` – process a tap and return updated stats

## Getting Started
1. Install dependencies:
   ```
   npm install
   ```
2. Start the server:
   ```
   node server.js
   ```
   The game will be available at http://localhost:3001.
3. For an offline preview, simply open `index.html` in a browser.

## Usage
```jsx
import Component from './component';

function App() {
  return <Component />;
}

export default App;
```
