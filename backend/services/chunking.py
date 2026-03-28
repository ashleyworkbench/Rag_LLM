def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into overlapping chunks.
    
    Why overlap? So that context isn't lost at chunk boundaries.
    e.g. if a sentence spans two chunks, both chunks will contain it.
    
    chunk_size: number of characters per chunk
    overlap: how many characters to repeat between consecutive chunks
    """
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap  # move forward, but keep some overlap

    return chunks
