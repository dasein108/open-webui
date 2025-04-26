import json
import logging
import os
from typing import Dict, Any
from pydantic import BaseModel
from datetime import datetime

log = logging.getLogger(__name__)

class Filter:
    id = "flow_logger"
    """A filter that logs all flow data to a JSON file"""
    
    class Valves(BaseModel):
        """Configuration for the flow logger filter"""
        LOG_FILE: str = "pipe.json"
        LOG_LEVEL: str = "INFO"
        PRIORITY: int = 0
        PRETTY_PRINT: bool = True  # Whether to format JSON with indentation
    
    def __init__(self):
        self.type = "filter"
        self.valves = self.Valves()
        self.is_global = True
        log.setLevel(getattr(logging, self.valves.LOG_LEVEL))
        
        # Ensure the file exists and is a valid JSON
        if not os.path.exists(self.valves.LOG_FILE):
            with open(self.valves.LOG_FILE, 'w') as f:
                json.dump({"flows": []}, f)
    
    def _append_to_json(self, data: Dict[str, Any], flow_type: str):
        """Append new flow data to the JSON file"""
        try:
            with open(self.valves.LOG_FILE, 'r') as f:
                file_data = json.load(f)
            
            # Add new flow entry
            flow_entry = {
                "timestamp": datetime.now().isoformat(),
                "type": flow_type,
                "data": data
            }
            file_data["flows"].append(flow_entry)
            
            # Write back to file
            with open(self.valves.LOG_FILE, 'w') as f:
                if self.valves.PRETTY_PRINT:
                    json.dump(file_data, f, indent=2)
                else:
                    json.dump(file_data, f)
                    
            log.debug(f"Successfully logged {flow_type} flow to {self.valves.LOG_FILE}")
        except Exception as e:
            log.error(f"Error logging flow to JSON: {str(e)}")
    
    def inlet(self, body: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Log incoming flow"""
        if isinstance(body, dict):
            self._append_to_json(body, "inlet")
        return body
    
    def outlet(self, body: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Log outgoing flow"""
        if isinstance(body, dict):
            self._append_to_json(body, "outlet")
        return body
    
    def stream(self, event: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Log streaming events"""
        if isinstance(event, dict):
            self._append_to_json(event, "stream")
        return event 