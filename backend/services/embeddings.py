from sentence_transformers import SentenceTransformer
import numpy as np

# Load model once at startup — this downloads ~90MB on first run
MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)

def get_embeddings(texts: list[str]) -> np.ndarray:
    """Convert a list of text chunks into embedding vectors."""
    embeddings = model.encode(texts, show_progress_bar=False)
    return np.array(embeddings, dtype="float32")

def get_query_embedding(query: str) -> np.ndarray:
    """Convert a single query string into an embedding vector."""
    embedding = model.encode([query], show_progress_bar=False)
    return np.array(embedding, dtype="float32")
