def format_sse(data: str, event: str = None) -> str:
    """Helper to format a Server-Sent Event string."""
    msg = ""
    if event:
        msg += f"event: {event}\n"
    msg += f"data: {data}\n\n"
    return msg
