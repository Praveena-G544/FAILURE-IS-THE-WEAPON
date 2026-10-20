# Python folder

The 8 algorithms live in `../src/algorithms/*.py`. The game runs them in the browser through Pyodide (`src/algorithms.js`).
Here you can run the SAME files on their own:

    python demo.py                              # every algorithm on a game-style example
    python -m unittest discover -s tests -v     # 13 unit tests

## analyze_profile.py - analyse a saved player profile
Export a profile: play the game, F12 -> Console, run `copy(localStorage.getItem('fitw:YOURNAME'))`, paste into `my_profile.json`.

    pip install matplotlib
    python analyze_profile.py sample_profile.json
    python analyze_profile.py my_profile.json --out report
