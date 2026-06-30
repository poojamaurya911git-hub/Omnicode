# FILE: ai-service/routers/chat.py
# AI Chat endpoint with RAG-augmented streaming responses

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest
from services.rag import get_rag_response

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    POST /chat — AI coaching chat with RAG-augmented streaming response.
    
    Body: { message, problemContext, history, hintMode }
    Returns: StreamingResponse with SSE media type
    """
    try:
        if not request.message or len(request.message.strip()) == 0:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Convert history to list of dicts
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.history
        ] if request.history else []

        # Stream RAG response
        return StreamingResponse(
            get_rag_response(
                message=request.message,
                problem_context=request.problemContext,
                history=history,
                hint_mode=request.hintMode,
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Chat] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
