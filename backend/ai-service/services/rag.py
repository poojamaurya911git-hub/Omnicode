# FILE: ai-service/services/rag.py
# RAG pipeline with LangChain + Pinecone for competitive programming coaching

import os
import asyncio
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_community.document_loaders import DirectoryLoader, TextLoader

# ──────────────────────────────────────────────
# Index Builder
# ──────────────────────────────────────────────

def build_index():
    """
    Build the Pinecone vector index from knowledge base docs.
    Loads all .md files from embeddings/docs/, chunks, embeds, and upserts.
    """
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_index = os.getenv("PINECONE_INDEX", "omnicode-rag")
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY environment variable is not set")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    docs_dir = Path(__file__).parent.parent / "embeddings" / "docs"
    if not docs_dir.exists():
        raise FileNotFoundError(f"Knowledge base directory not found: {docs_dir}")

    print(f"[RAG] Loading documents from {docs_dir}")

    # Load all markdown files
    loader = DirectoryLoader(
        str(docs_dir),
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    documents = loader.load()
    print(f"[RAG] Loaded {len(documents)} documents")

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""],
    )
    chunks = text_splitter.split_documents(documents)
    print(f"[RAG] Split into {len(chunks)} chunks")

    # Create embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=gemini_api_key,
    )

    # Upsert to Pinecone
    print(f"[RAG] Upserting to Pinecone index: {pinecone_index}")
    os.environ["PINECONE_API_KEY"] = pinecone_api_key

    vectorstore = PineconeVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        index_name=pinecone_index,
    )

    print(f"[RAG] Index build complete: {len(chunks)} chunks indexed")
    return vectorstore


# ──────────────────────────────────────────────
# RAG Response Generator
# ──────────────────────────────────────────────

async def get_rag_response(message, problem_context=None, history=None, hint_mode=False):
    """
    Generate a RAG-augmented response using Pinecone similarity search + Gemini.
    
    Args:
        message: User's message/question
        problem_context: Current problem context (if any)
        history: Conversation history (list of {role, content})
        hint_mode: If True, give hints instead of direct answers
        
    Yields:
        SSE-formatted chunks: "data: {chunk}\n\n"
    """
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_index = os.getenv("PINECONE_INDEX", "omnicode-rag")
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if not pinecone_api_key or not gemini_api_key:
        yield "data: Error: API keys not configured\n\n"
        yield "data: [DONE]\n\n"
        return

    os.environ["PINECONE_API_KEY"] = pinecone_api_key

    try:
        # Create embeddings for similarity search
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=gemini_api_key,
        )

        # Connect to existing Pinecone index
        vectorstore = PineconeVectorStore(
            index_name=pinecone_index,
            embedding=embeddings,
        )

        # Similarity search for relevant context
        relevant_docs = await asyncio.to_thread(
            vectorstore.similarity_search, message, k=5
        )
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

        # Build hint mode instruction
        hint_instruction = ""
        if hint_mode:
            hint_instruction = (
                "IMPORTANT: The user has enabled hint mode. "
                "Do NOT give direct answers or complete solutions. "
                "Instead, guide them with hints, leading questions, and partial explanations. "
                "Help them think through the problem step by step."
            )

        # Build problem context section
        problem_section = ""
        if problem_context:
            problem_section = f"\nCurrent problem context: {problem_context}"

        # Build system prompt
        system_prompt = f"""You are OmniCode AI Coach, an expert competitive programming mentor. 
You help programmers improve their algorithmic problem-solving skills.
You explain concepts clearly with examples and guide learning.
{hint_instruction}

Use this retrieved knowledge base context to inform your responses:
{context}
{problem_section}

Guidelines:
- Be encouraging and supportive
- Provide code examples in Python or C++ when relevant
- Reference specific algorithms and data structures
- If the context doesn't cover the topic, use your general knowledge
- Keep responses focused and actionable"""

        # Build chat messages
        messages = [SystemMessage(content=system_prompt)]

        # Include last 6 history messages
        if history:
            for msg in history[-6:]:
                role = msg.get("role", "user") if isinstance(msg, dict) else msg.role
                content = msg.get("content", "") if isinstance(msg, dict) else msg.content
                if role == "user":
                    messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    messages.append(AIMessage(content=content))

        messages.append(HumanMessage(content=message))

        # Create Gemini chat model
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=gemini_api_key,
            temperature=0.5,
            max_output_tokens=2000,
            streaming=True,
        )

        # Stream response
        async for chunk in llm.astream(messages):
            if chunk.content:
                # SSE format
                yield f"data: {chunk.content}\n\n"

        yield "data: [DONE]\n\n"

    except Exception as e:
        print(f"[RAG] Error: {e}")
        yield f"event: error\ndata: {str(e)}\n\n"
        yield "data: [DONE]\n\n"
