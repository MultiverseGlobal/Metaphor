import logging
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.mcp_server import mcp

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("metaphor.mcp_main")
    logger.info("Starting Metaphor MCP Server (Streamable HTTP)")
    
    # Run the MCP server using Streamable HTTP transport
    # In production, this would be deployed behind an HTTP proxy/load balancer
    mcp.run(transport="streamable-http")
