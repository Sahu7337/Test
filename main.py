"""Train a simple model to predict a chosen column in a CSV file.

Run: python main.py data.csv target_column
Requires pandas and scikit-learn.
"""

import sys

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder


def predict_target(csv_path, target):
    data = pd.read_csv(csv_path)
    if target not in data.columns:
        raise ValueError(f"Column {target!r} is not in the CSV.")
    data = data.dropna(subset=[target])
    X, y = data.drop(columns=target), data[target]
    if X.empty or y.nunique() < 2:
        raise ValueError("The data must have input columns and at least two target values.")

    categorical = X.select_dtypes(include=["object", "category", "bool"]).columns
    numeric = X.select_dtypes(exclude=["object", "category", "bool"]).columns
    prep = ColumnTransformer([
        ("numbers", SimpleImputer(strategy="median"), numeric),
        ("categories", make_pipeline(
            SimpleImputer(strategy="most_frequent"),
            OneHotEncoder(handle_unknown="ignore")
        ), categorical),
    ])

    classification = (y.dtype == "object" or y.dtype.name == "category"
                      or y.dtype == "bool")
    stratify = y if classification and y.value_counts().min() >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify
    )
    estimator = (RandomForestClassifier(n_estimators=200, random_state=42)
                 if classification else RandomForestRegressor(n_estimators=200, random_state=42))
    model = make_pipeline(prep, estimator)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    metric = accuracy_score(y_test, predictions) if classification else r2_score(y_test, predictions)
    print(f"Target: {target}")
    print(f"{'Accuracy' if classification else 'R² score'}: {metric:.3f}")
    print("Predictors:", ", ".join(map(str, X.columns)))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python main.py <data.csv> <target_column>")
        raise SystemExit(2)
    predict_target(sys.argv[1], sys.argv[2])