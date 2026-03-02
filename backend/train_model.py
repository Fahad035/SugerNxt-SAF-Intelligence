import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

df = pd.read_csv("saf_dataset.csv")

X = df.drop("saf_output", axis=1)
y = df["saf_output"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(n_estimators=150, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, "saf_model.pkl")
print("Model trained and saved!")