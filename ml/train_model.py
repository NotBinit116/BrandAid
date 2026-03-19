import os, re, joblib, pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

RANDOM_STATE = 42

def clean_tweet(text):
    text = str(text)
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#(\w+)", r"\1", text)
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)
    text = re.sub(r"[^a-zA-Z\s!?]", "", text)
    return text.lower().strip()

print("Loading Sentiment140...")
df = pd.read_csv(
    "data/training.1600000.processed.noemoticon.csv",
    encoding="latin-1", header=None
)
df.columns = ["label","id","date","query","user","text"]
df = df[["text","label"]]
df["label"] = df["label"].map({0: "negative", 4: "positive"})
df = df.sample(n=500_000, random_state=RANDOM_STATE)
df["text"] = df["text"].apply(clean_tweet)
df = df[df["text"].str.len() > 2]

X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["label"],
    test_size=0.2, random_state=RANDOM_STATE, stratify=df["label"]
)

print("Vectorizing...")
tfidf = TfidfVectorizer(
    max_features=18000,
    ngram_range=(1, 3),
    stop_words="english",
    min_df=5, max_df=0.9,
    sublinear_tf=True
)
X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf  = tfidf.transform(X_test)

print("Training...")
model = LogisticRegression(
    max_iter=3000,
    solver="liblinear",
    class_weight="balanced"
)
model.fit(X_train_tfidf, y_train)

y_pred = model.predict(X_test_tfidf)
acc = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {acc:.4f} ({acc*100:.2f}%)")
print(classification_report(y_test, y_pred))

os.makedirs("model", exist_ok=True)
joblib.dump(model, "model/sentiment_model.pkl")
joblib.dump(tfidf, "model/tfidf_vectorizer.pkl")
joblib.dump({
    "model_type": "LogisticRegression + TF-IDF",
    "accuracy": acc,
    "classes": list(model.classes_),
    "neutral_threshold": 0.65
}, "model/metadata.pkl")

print("\n✅ Model saved       → model/sentiment_model.pkl")
print("✅ Vectorizer saved  → model/tfidf_vectorizer.pkl")
print(f"✅ Final Accuracy:     {acc*100:.2f}%")