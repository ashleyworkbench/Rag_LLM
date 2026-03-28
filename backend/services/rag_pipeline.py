import os
import json
from groq import Groq
from dotenv import load_dotenv
from services.embeddings import get_query_embedding
from services.vector_store import search_store

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def build_prompt(question: str, context_chunks: list[dict]) -> list[dict]:
    """
    Build messages array for Groq.
    If docs are available, inject them as context.
    If no docs, just answer like a normal chatbot.
    """
    system_msg = """You are Aether, a smart and friendly AI assistant — like ChatGPT.
You can answer any question on any topic.
When document context is provided, prefer using it to give accurate answers.
When no context is available, answer from your own knowledge naturally and helpfully.
Be conversational, clear, and concise."""

    if context_chunks:
        context_text = "\n\n".join([
            f"[From: {c['source']}]\n{c['text']}" for c in context_chunks
        ])
        user_content = f"""Here is some context from uploaded documents that may help:

{context_text}

---
User question: {question}"""
    else:
        user_content = question

    return [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_content}
    ]

def get_sources(context_chunks: list[dict]) -> list[dict]:
    """Format source references for the frontend reference panel."""
    seen = set()
    sources = []
    for chunk in context_chunks:
        key = (chunk["source"], chunk["text"][:80])
        if key not in seen:
            seen.add(key)
            sources.append({
                "filename": chunk["source"],
                "snippet": chunk["text"][:200],
                "score": round(chunk["score"], 4)
            })
    return sources

def stream_answer(question: str):
    """
    RAG pipeline with streaming.
    - If docs exist, retrieve relevant chunks and use as context
    - If no docs, answer like a normal chatbot
    - Always streams response token by token
    """
    try:
        # Try to find relevant chunks from uploaded docs
        query_embedding = get_query_embedding(question)
        context_chunks = search_store(query_embedding, top_k=5)

        # Build messages
        messages = build_prompt(question, context_chunks)

        # Stream from Groq
        stream = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
            temperature=0.7,
            max_tokens=1024
        )

        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                safe_token = token.replace("\n", "\\n")
                yield f"data: {safe_token}\n\n"

        # Send sources if we used docs
        if context_chunks:
            sources = get_sources(context_chunks)
            yield f"event: sources\ndata: {json.dumps(sources)}\n\n"

        yield "data: [DONE]\n\n"

    except Exception as e:
        yield f"data: Sorry, something went wrong: {str(e)}\n\n"
        yield "data: [DONE]\n\n"
