# FILE: ai-service/embeddings/build_index.py
# Standalone script to build the Pinecone RAG index from knowledge base docs
#
# Usage: python build_index.py
# Requires: GEMINI_API_KEY and PINECONE_API_KEY environment variables

import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="../../.env.example")

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Build the Pinecone vector index from knowledge base documents."""
    print("=" * 60)
    print("OmniCode RAG Index Builder")
    print("=" * 60)

    # Validate environment
    gemini_key = os.getenv("GEMINI_API_KEY")
    pinecone_key = os.getenv("PINECONE_API_KEY")
    pinecone_index = os.getenv("PINECONE_INDEX", "omnicode-rag")

    if not gemini_key:
        print("ERROR: GEMINI_API_KEY is not set")
        sys.exit(1)

    if not pinecone_key:
        print("ERROR: PINECONE_API_KEY is not set")
        sys.exit(1)

    print(f"Pinecone Index: {pinecone_index}")
    print(f"Gemini API Key: {'*' * 8}...{gemini_key[-4:]}")
    print(f"Pinecone API Key: {'*' * 8}...{pinecone_key[-4:]}")
    print()

    # Check docs directory
    docs_dir = Path(__file__).parent / "docs"
    if not docs_dir.exists():
        print(f"ERROR: Docs directory not found: {docs_dir}")
        sys.exit(1)

    md_files = list(docs_dir.glob("*.md"))
    if not md_files:
        print(f"ERROR: No .md files found in {docs_dir}")
        sys.exit(1)

    print(f"Found {len(md_files)} knowledge base documents:")
    for doc_file in sorted(md_files):
        size_kb = doc_file.stat().st_size / 1024
        print(f"  → {doc_file.name} ({size_kb:.1f} KB)")
    print()

    # Import after path setup
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from langchain_pinecone import PineconeVectorStore
    from langchain_community.document_loaders import TextLoader

    start_time = time.time()

    # Load documents one by one for progress tracking
    all_documents = []
    for md_file in sorted(md_files):
        try:
            loader = TextLoader(str(md_file), encoding="utf-8")
            docs = loader.load()
            all_documents.extend(docs)
            print(f"  ✓ Loaded {md_file.name} ({len(docs)} document(s))")
        except Exception as e:
            print(f"  ✗ Failed to load {md_file.name}: {e}")

    print(f"\nTotal documents loaded: {len(all_documents)}")

    # Split into chunks
    print("\nSplitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""],
    )
    chunks = text_splitter.split_documents(all_documents)
    print(f"Total chunks created: {len(chunks)}")

    # Create embeddings
    print("\nInitializing Google AI embeddings...")
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=gemini_key,
    )

    # Upsert to Pinecone
    print(f"\nUpserting {len(chunks)} chunks to Pinecone index '{pinecone_index}'...")
    os.environ["PINECONE_API_KEY"] = pinecone_key

    try:
        vectorstore = PineconeVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            index_name=pinecone_index,
        )

        elapsed = time.time() - start_time
        print(f"\n{'=' * 60}")
        print(f"Index build complete!")
        print(f"  Documents: {len(all_documents)}")
        print(f"  Chunks: {len(chunks)}")
        print(f"  Index: {pinecone_index}")
        print(f"  Time: {elapsed:.1f}s")
        print(f"{'=' * 60}")

    except Exception as e:
        print(f"\nERROR: Failed to upsert to Pinecone: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
