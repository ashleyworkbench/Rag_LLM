from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from services.extract_text import extract_text
from services.chunking import chunk_text
from services.embeddings import get_embeddings
from services.vector_store import add_to_store
from utils.file_utils import save_file, add_document_metadata, load_metadata
import os

router = APIRouter()

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    file_bytes = await file.read()
    filepath = save_file(file_bytes, file.filename)

    try:
        text = extract_text(filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="No text could be extracted. Make sure the PDF contains selectable text (not a scanned image).")

    chunks = chunk_text(text)
    embeddings = get_embeddings(chunks)
    total_chunks = add_to_store(embeddings, chunks, file.filename)
    add_document_metadata(file.filename, filepath, len(chunks))

    return {
        "message": "File processed successfully",
        "filename": file.filename,
        "chunks": len(chunks),
        "total_indexed": total_chunks
    }

@router.get("/documents")
def list_documents():
    return load_metadata()

@router.get("/open/{filename}")
def open_file(filename: str):
    """Serve the file for inline viewing in browser."""
    filepath = os.path.join("data/uploads", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found.")
    # Use inline content disposition so browser renders it instead of downloading
    media_type = "application/pdf" if filename.lower().endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type=media_type,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

@router.delete("/delete/{filename}")
def delete_file(filename: str):
    """Delete an uploaded file and remove it from metadata."""
    filepath = os.path.join("data/uploads", filename)
    # Remove file from disk
    if os.path.exists(filepath):
        os.remove(filepath)
    # Remove from metadata
    metadata = load_metadata()
    metadata = [m for m in metadata if m["filename"] != filename]
    from utils.file_utils import save_metadata
    save_metadata(metadata)
    return {"message": f"{filename} deleted successfully"}
