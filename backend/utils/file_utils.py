import os
import json
from datetime import datetime

UPLOAD_DIR = "data/uploads"
METADATA_FILE = "data/metadata.json"

def ensure_dirs():
    """Make sure upload and index folders exist."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs("data/faiss_index", exist_ok=True)

def save_file(file_bytes: bytes, filename: str) -> str:
    """Save uploaded file to disk, return the saved path."""
    ensure_dirs()
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    return filepath

def load_metadata() -> list:
    """Load the list of uploaded documents from metadata.json."""
    if not os.path.exists(METADATA_FILE):
        return []
    with open(METADATA_FILE, "r") as f:
        return json.load(f)

def save_metadata(metadata: list):
    """Save updated metadata list to disk."""
    ensure_dirs()
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

def add_document_metadata(filename: str, filepath: str, chunk_count: int):
    """Add a new document entry to metadata."""
    metadata = load_metadata()
    # Avoid duplicates — remove old entry if same filename exists
    metadata = [m for m in metadata if m["filename"] != filename]
    metadata.append({
        "filename": filename,
        "filepath": filepath,
        "chunk_count": chunk_count,
        "uploaded_at": datetime.now().isoformat()
    })
    save_metadata(metadata)
