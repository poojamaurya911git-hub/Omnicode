# FILE: ai-service/routers/embeddings.py
# Embeddings index management endpoint

from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import BuildIndexResponse
from services.rag import build_index

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("/build", response_model=BuildIndexResponse)
async def build_embeddings_index(background_tasks: BackgroundTasks):
    """
    POST /embeddings/build — Trigger Pinecone index build as a background task.
    
    Loads knowledge base docs, chunks, embeds with Google AI embeddings,
    and upserts to Pinecone vector store.
    """
    try:
        # Run index build as a background task (non-blocking)
        background_tasks.add_task(_build_index_task)

        return BuildIndexResponse(
            message="Index build started. This may take several minutes.",
            status="started",
        )

    except Exception as e:
        print(f"[Embeddings] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start index build: {str(e)}")


def _build_index_task():
    """Background task to build the Pinecone index."""
    try:
        print("[Embeddings] Background index build started...")
        build_index()
        print("[Embeddings] Background index build completed successfully")
    except Exception as e:
        print(f"[Embeddings] Background index build failed: {e}")
