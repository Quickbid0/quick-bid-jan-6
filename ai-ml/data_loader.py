import pandas as pd
from sqlalchemy import create_engine
import os

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/quickmela')

def load_auction_training_data():
    engine = create_engine(DATABASE_URL)
    query = "SELECT * FROM auction_training_data"
    df = pd.read_sql(query, engine)
    return df

def load_fraud_training_data():
    engine = create_engine(DATABASE_URL)
    query = "SELECT * FROM fraud_training_data"
    df = pd.read_sql(query, engine)
    return df
