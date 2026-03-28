import faiss
import numpy as np
import json
import os

INDEX_PATH = "data/faiss_index/index.faiss"
CHUNKS_PATH = "data/faiss_index/chunks.json"

def load_store() -> tuple:
    """Load existing FAISS index and chunks from disk. Returns (index, chunks)."""
    if os.path.exists(INDEX_PATH) and os.path.exists(CHUNKS_PATH):
        index = faiss.read_index(INDEX_PATH)
        with open(CHUNKS_PATH, "r") as f:
            chunks = json.load(f)
        return index, chunks
    return None, []

def save_store(index, chunks: list):
    """Persist FAISS index and chunks metadata to disk."""
    os.makedirs("data/faiss_index", exist_ok=True)
    faiss.write_index(index, INDEX_PATH)
    with open(CHUNKS_PATH, "w") as f:
        json.dump(chunks, f, indent=2)

def add_to_store(embeddings: np.ndarray, chunks: list[str], filename: str):
    """
    Add new embeddings + chunk metadata to the FAISS index.
    Appends to existing index so multi-doc search works.
    """
    index, existing_chunks = load_store()

    dim = embeddings.shape[1]  # embedding dimension (384 for MiniLM)

    if index is None:
        # First time — create a new flat L2 index
        index = faiss.IndexFlatL2(dim)

    index.add(embeddings)

    # Store chunk text + source filename for reference panel
    new_chunks = [{"text": c, "source": filename} for c in chunks]
    existing_chunks.extend(new_chunks)

    save_store(index, existing_chunks)
    return len(existing_chunks)

def search_store(query_embedding: np.ndarray, top_k: int = 5) -> list[dict]:
    """
    Search FAISS index for the top_k most relevant chunks.
    Returns list of {text, source, score} dicts.
    """
    index, chunks = load_store()

    if index is None or index.ntotal == 0:
        return []

    distances, indices = index.search(query_embedding, top_k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < len(chunks):
            results.append({
                "text": chunks[idx]["text"],
                "source": chunks[idx]["source"],
                "score": float(dist)
            })

    return results
