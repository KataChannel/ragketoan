"""
RAG Service Configuration
Quản lý tất cả environment variables và settings
"""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # PostgreSQL Database
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/n8n",
        alias="DATABASE_URL"
    )
    
    # Qdrant Vector Database
    qdrant_host: str = Field(default="localhost", alias="QDRANT_HOST")
    qdrant_port: int = Field(default=6333, alias="QDRANT_PORT")
    qdrant_collection: str = Field(default="ketoan_invoices", alias="QDRANT_COLLECTION")
    
    # LLM Provider Configuration
    llm_provider: str = Field(
        default="ollama",
        alias="LLM_PROVIDER",
        description="LLM provider: 'ollama' (local) or 'google' (Google AI Studio)"
    )
    
    # Ollama LLM (Local)
    ollama_host: str = Field(default="localhost", alias="OLLAMA_HOST")
    ollama_port: int = Field(default=11434, alias="OLLAMA_PORT")
    ollama_model: str = Field(default="llama3.2:latest", alias="OLLAMA_MODEL")
    
    # Google AI Studio (Cloud)
    google_api_key: str = Field(default="", alias="GOOGLE_API_KEY")
    google_model: str = Field(
        default="gemini-1.5-flash",
        alias="GOOGLE_MODEL",
        description="Options: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp"
    )
    
    # Embedding
    embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        alias="EMBEDDING_MODEL"
    )
    embedding_dimension: int = Field(default=384, alias="EMBEDDING_DIMENSION")
    
    # RAG Configuration
    chunk_size: int = Field(default=500, alias="CHUNK_SIZE")
    chunk_overlap: int = Field(default=50, alias="CHUNK_OVERLAP")
    top_k_results: int = Field(default=5, alias="TOP_K_RESULTS")
    
    @property
    def ollama_base_url(self) -> str:
        return f"http://{self.ollama_host}:{self.ollama_port}"
    
    @property
    def qdrant_url(self) -> str:
        return f"http://{self.qdrant_host}:{self.qdrant_port}"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
