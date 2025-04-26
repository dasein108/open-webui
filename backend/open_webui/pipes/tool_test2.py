import logging
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

# Configure logging
log = logging.getLogger(__name__)

# Create file handler
file_handler = logging.FileHandler('logs/tool_interceptor.log')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
log.addHandler(file_handler)

class Filter:
    id = "tool_test"
    """A filter that intercepts specific tool calls and modifies their responses"""
    
    class Valves(BaseModel):
        """Configuration for the tool interceptor filter"""
        ENABLED_TOOLS: list[str] = []  # Tools to intercept
        LOG_LEVEL: str = "INFO"
        PRIORITY: int = 0  # Priority for filter execution order
        LOG_REQUEST_BODY: bool = True  # Whether to log request bodies
        LOG_RESPONSE_BODY: bool = True  # Whether to log response bodies
    
    def __init__(self):
        self.type = "filter"  # This is a filter type pipe
        self.valves = self.Valves()
        self.is_global = True  # Make this a global filter
        # Configure logging
        log.setLevel(getattr(logging, self.valves.LOG_LEVEL))
    
    def inlet(self, body: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        log.info(f"[TOOL INTERCEPTOR] Inlet - : {body}")

        """Intercept incoming tool calls"""
        if not isinstance(body, dict):
            return body
            
        # Get the tool name if this is a tool call
        tool_name = body.get("name", "")
        
        if tool_name in self.valves.ENABLED_TOOLS:
            log.info(f"[TOOL INTERCEPTOR] Inlet - Tool: {tool_name}")
            if self.valves.LOG_REQUEST_BODY:
                log.debug(f"[TOOL INTERCEPTOR] Request body: {body}")
            
        return body
    
    def outlet(self, body: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Modify tool responses"""
        if not isinstance(body, dict):
            return body
        print(f"[TOOL INTERCEPTOR] Outlet - : {body}")
        # Get the tool name if this is a tool response
        tool_name = body.get("name", "")
        
        if tool_name in self.valves.ENABLED_TOOLS:
            log.info(f"[TOOL INTERCEPTOR] Outlet - Tool: {tool_name}")
            if self.valves.LOG_RESPONSE_BODY:
                log.debug(f"[TOOL INTERCEPTOR] Response body: {body}")
            
        return body
    
    def stream(self, event: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        log.info(f"[TOOL INTERCEPTOR] Stream - : {event}")
        """Handle streaming events"""
        if not isinstance(event, dict):
            return event
            
        # Get the tool name if this is a tool event
        tool_name = event.get("name", "")
        
        if tool_name in self.valves.ENABLED_TOOLS:
            log.info(f"[TOOL INTERCEPTOR] Stream - Tool: {tool_name}")
            if self.valves.LOG_REQUEST_BODY:
                log.debug(f"[TOOL INTERCEPTOR] Stream event: {event}")
            
        return event 