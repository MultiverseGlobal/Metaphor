import urllib.parse
import logging
from arq.connections import RedisSettings

logger = logging.getLogger("metaphor.redis")

def parse_redis_settings(url: str) -> RedisSettings:
    """
    Parses a Redis connection string into an arq RedisSettings instance.
    Seamlessly supports Upstash and cloud-hosted Redis with SSL/TLS (rediss://)
    and password authentication, falling back to localhost if unconfigured.
    """
    if not url:
        return RedisSettings(host="localhost", port=6379)
    try:
        return RedisSettings.from_dsn(url)
    except Exception as e:
        logger.warning(f"RedisSettings.from_dsn failed ({e}), falling back to manual parse for URL: {url}")
        parsed = urllib.parse.urlparse(url)
        return RedisSettings(
            host=parsed.hostname or "localhost",
            port=parsed.port or 6379,
            password=parsed.password or None,
            ssl=(parsed.scheme == "rediss")
        )
