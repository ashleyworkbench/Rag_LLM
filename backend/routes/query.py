from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.rag_pipeline import stream_answer

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/")
def query(request: QueryRequest):
    """
    Receives a question, runs the RAG pipeline,
    and streams the answer back as Server-Sent Events (SSE).
    The frontend listens to this stream and renders tokens as they arrive.
    """
    return StreamingResponse(
        stream_answer(request.question),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"  # prevents nginx from buffering the stream
        }
    )
