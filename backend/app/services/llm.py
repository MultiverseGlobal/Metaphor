import json
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger("metaphor.services.llm")

class LLMService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    async def query_llm(self, prompt: str, system_prompt: str = "", temperature: float = 0.7) -> str:
        if not self.model:
            logger.warning("No LLM configured or key missing.")
            raise ValueError("LLM not configured: missing GEMINI_API_KEY")
            
        full_prompt = f"{system_prompt}\n\n{prompt}"
        response = await self.model.generate_content_async(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
            )
        )
        return response.text

    async def generate_embedding(self, text: str) -> list[float]:
        if not settings.GEMINI_API_KEY:
            raise ValueError("LLM not configured: missing GEMINI_API_KEY for embedding generation")
            
        result = await genai.embed_content_async(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        return result['embedding']

llm_service = LLMService()
