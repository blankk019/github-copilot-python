# Quick Start Guide - Refactored Sudoku App

## Starting the Application

### With Virtual Environment (.venv)

```powershell
cd d:\Udacity\github-copilot-python\starter
.\.venv\Scripts\Activate.ps1
python run.py
```

### Without Virtual Environment

```powershell
cd d:\Udacity\github-copilot-python\starter
python run.py
```

### One-Line Command (Recommended)

```powershell
cd d:\Udacity\github-copilot-python\starter; if (Test-Path .venv\Scripts\Activate.ps1) { .\.venv\Scripts\Activate.ps1; python run.py } else { python run.py }
```

## Accessing the Application

Once running, open your browser and navigate to:

```
http://127.0.0.1:5000
```

## Stopping the Application

Press `CTRL+C` in the terminal where the app is running.

## What Changed?

The refactored application uses `run.py` instead of `app.py`:

**Old**: `python app.py`
**New**: `python run.py`

All functionality remains the same, but the code is now:

- ✅ Modular and organized
- ✅ Uses modern Python and JavaScript features
- ✅ Easier to maintain and extend
- ✅ Better documented
- ✅ Type-safe with hints

See `README_REFACTORED.md` for complete documentation.
