import sys
import os

# Point to the ml/ folder
ML_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml")
sys.path.insert(0, os.path.abspath(ML_PATH))

from sentiment_service import analyse, analyse_batch