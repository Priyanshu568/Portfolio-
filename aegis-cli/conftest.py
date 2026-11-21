import sys
from pathlib import Path

# Add the workspace root to sys.path so demo_repo can be imported as a package
sys.path.insert(0, str(Path(__file__).resolve().parent))
