# Quick Start Guide - Sudoku Game

This guide will help you get the Sudoku game running on your local machine after cloning the repository.

## Prerequisites

Before you start, make sure you have:

- **Python 3.7+** installed on your system
- **pip** (Python package installer, usually comes with Python)
- A modern web browser (Chrome, Firefox, Edge, Safari)

To check if Python is installed:

```powershell
python --version
```

## First-Time Setup

### 1. Navigate to the Project Directory

After cloning the repository, navigate to the starter folder:

```powershell
cd github-copilot-python\starter
```

### 2. Create a Virtual Environment (Recommended)

Creating a virtual environment keeps your project dependencies isolated:

**Windows PowerShell:**

```powershell
python -m venv .venv
```

**macOS/Linux:**

```bash
python3 -m venv .venv
```

### 3. Activate the Virtual Environment

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

> **Note:** If you get an execution policy error, run:
>
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

You should see `(.venv)` at the beginning of your terminal prompt when activated.

### 4. Install Dependencies

Install the required Python packages:

```powershell
pip install -r requirements.txt
```

This will install:

- Flask 3.1.2 (web framework)
- pytest 7.4.3 (for running tests)

## Running the Application

### Start the Server

With your virtual environment activated, run:

```powershell
python run.py
```

You should see output like:

```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### Access the Game

Open your web browser and go to:

```
http://127.0.0.1:5000
```

or

```
http://localhost:5000
```

## Stopping the Application

Press `CTRL+C` in the terminal where the app is running.

## Running Tests

To verify everything is working correctly, run the test suite:

```powershell
pytest
```

For more detailed output:

```powershell
pytest -v
```

## Quick Reference Commands

### Subsequent Runs (After First-Time Setup)

Once you've completed the first-time setup, starting the app is simple:

**Windows:**

```powershell
cd github-copilot-python\starter
.\.venv\Scripts\Activate.ps1
python run.py
```

**macOS/Linux:**

```bash
cd github-copilot-python/starter
source .venv/bin/activate
python run.py
```

### One-Line Startup (Windows)

```powershell
cd github-copilot-python\starter; .\.venv\Scripts\Activate.ps1; python run.py
```

## Troubleshooting

### Virtual Environment Not Activating

**Issue:** PowerShell execution policy prevents script execution.

**Solution:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use

**Issue:** Error message about port 5000 being in use.

**Solution:** Stop any other Flask applications or processes using port 5000, or change the port in `run.py`.

### Module Not Found Errors

**Issue:** ImportError or ModuleNotFoundError when running the app.

**Solution:** Make sure you've:

1. Activated your virtual environment
2. Installed dependencies with `pip install -r requirements.txt`

### Browser Shows "Connection Refused"

**Issue:** Browser can't connect to the application.

**Solution:**

1. Make sure the Flask server is running in the terminal
2. Check that you're using the correct URL: `http://127.0.0.1:5000`
3. Check for error messages in the terminal

## What's Included

This refactored application features:

- ✅ **Modular Architecture** - Clean separation of concerns (models, services, routes)
- ✅ **Modern Python** - Type hints, dataclasses, application factory pattern
- ✅ **ES6 JavaScript** - Modular frontend with classes and async/await
- ✅ **Full Game Features** - Difficulty levels, timer, hints, validation, leaderboard
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Test Suite** - Unit tests with pytest

## Next Steps

- See `README_REFACTORED.md` for detailed documentation on the application architecture
- Explore the codebase starting from `run.py` (entry point) and `app/__init__.py` (application factory)
- Check out `static/js/main.js` to see the frontend entry point
- Run tests to understand the game logic: `pytest -v`

## Getting Help

If you encounter issues:

1. Check the terminal for error messages
2. Review the Troubleshooting section above
3. Check that all prerequisites are installed correctly
4. Ensure you're in the correct directory (`starter/`)

Happy coding! 🎮
