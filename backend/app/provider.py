import logging
from typing import List, Optional
import httpx
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.config import settings

logger = logging.getLogger("metaphor.provider")

class LLMProvider:
    def __init__(self):
        # Initialize clients lazily if keys are available, otherwise fail gracefully on actual calls.
        self._openai_client: Optional[AsyncOpenAI] = None
        self._anthropic_client: Optional[AsyncAnthropic] = None

    @property
    def openai_client(self) -> AsyncOpenAI:
        if not self._openai_client:
            key = settings.OPENAI_API_KEY
            if not key:
                logger.warning("OPENAI_API_KEY is not set. Embedding calls will fail.")
            self._openai_client = AsyncOpenAI(api_key=key)
        return self._openai_client

    @property
    def anthropic_client(self) -> AsyncAnthropic:
        if not self._anthropic_client:
            key = settings.ANTHROPIC_API_KEY
            if not key:
                logger.warning("ANTHROPIC_API_KEY is not set. Claude reasoning calls will fail.")
            self._anthropic_client = AsyncAnthropic(api_key=key)
        return self._anthropic_client

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate 1536-dimension embeddings using OpenAI's text-embedding-3-small.
        If API key is missing, returns a mock vector (all zeros) for local testing.
        """
        if not settings.OPENAI_API_KEY:
            logger.warning("Mocking embedding generation because OPENAI_API_KEY is not set.")
            return [0.0] * 1536

        try:
            response = await self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=[text.replace("\n", " ")]
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating OpenAI embedding: {e}")
            raise e

    async def query_claude(self, prompt: str, system_prompt: str = "You are Metaphor, a context engine.", max_tokens: int = 4000, temperature: float = 0.0) -> str:
        """
        Query Claude (claude-3-5-sonnet) for reasoning, parsing, and reflection tasks.
        If API key is missing, returns a mock response.
        """
        if not settings.ANTHROPIC_API_KEY:
            logger.warning("Mocking Claude reasoning response because ANTHROPIC_API_KEY is not set.")
            return "{\"mock\": \"Please set ANTHROPIC_API_KEY in backend/.env\"}"

        try:
            message = await self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            # The response content could be a list of blocks, extract text
            text = ""
            for block in message.content:
                if hasattr(block, 'text'):
                    text += block.text
            return text
        except Exception as e:
            logger.error(f"Error querying Anthropic Claude: {e}")
            raise e

llm_provider = LLMProvider()
