# Tic-Tac-Toe AI

A responsive browser-based Tic-Tac-Toe game where a human plays against an unbeatable AI using the Minimax algorithm with alpha-beta pruning.

## Features

- Unbeatable AI opponent powered by Minimax with alpha-beta pruning.
- Choose whether to play as `X` or `O`.
- In-session score tracking for player wins, AI wins, and draws.
- Toggleable generated sound effects with no external audio assets.
- Move pop animation and highlighted winning cells.
- Built with plain HTML, CSS, and JavaScript.

## Files

- `index.html` - App structure and controls.
- `style.css` - Styling, layout, responsiveness, and animations.
- `script.js` - Game logic, AI logic, score handling, and audio feedback.
- `task2.png` - Original task reference image.

## How to Run

1. Open `index.html` in any modern browser.
2. Choose your symbol.
3. Click an empty cell to make a move.
4. Use `New Game` to restart the board.
5. Use `Sound: On/Off` to toggle audio.

## Run on Localhost

1. Open a terminal in the project folder.
2. Run `python -m http.server 8000`
3. Open `http://127.0.0.1:8000/index.html` in your browser.
4. Stop the server anytime with `Ctrl + C`.

## AI Logic

The AI uses the Minimax algorithm to evaluate every valid board state and choose the best move. Alpha-beta pruning removes branches that cannot improve the final decision, making the search more efficient while keeping the AI unbeatable.

## Submission Summary

This project satisfies CodeSoft Task 2 by implementing a Tic-Tac-Toe AI agent that plays perfectly against a human player in a clean browser interface.
