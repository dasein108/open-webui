# Open WebUI Models Documentation

This document provides an overview of the model entities used in the Open WebUI backend system.

## Core Models

### Users (`users.py`)

- Manages user accounts and authentication
- Key fields:
  - `id`: Unique identifier
  - `name`: User's display name
  - `email`: User's email address
  - `role`: User's role in the system
  - `profile_image_url`: URL to user's profile image
  - `api_key`: Optional API key for authentication
  - `settings`: User-specific settings
  - `oauth_sub`: OAuth subject identifier

### Authentication (`auths.py`)

- Handles user authentication and authorization
- Key fields:
  - `id`: Unique identifier
  - `email`: User's email
  - `password`: Hashed password
  - `active`: Account status

### Models (`models.py`)

- Manages AI model configurations and metadata
- Key fields:
  - `id`: Model identifier
  - `user_id`: Owner of the model
  - `base_model_id`: Optional reference to parent model
  - `name`: Display name
  - `params`: Model parameters (JSON)
  - `meta`: Model metadata including capabilities
  - `access_control`: Permission settings
  - `is_active`: Model availability status

## Chat-Related Models

### Chats (`chats.py`)

- Stores chat conversations and their metadata
- Key fields:
  - `id`: Chat identifier
  - `user_id`: Chat owner
  - `title`: Chat title
  - `chat`: Chat content (JSON)
  - `share_id`: Optional sharing identifier
  - `archived`: Archive status
  - `pinned`: Pin status
  - `folder_id`: Optional folder organization

### Messages (`messages.py`)

- Manages individual chat messages
- Key fields:
  - `id`: Message identifier
  - `user_id`: Message sender
  - `channel_id`: Optional channel reference
  - `parent_id`: Parent message reference
  - `content`: Message content
  - `data`: Additional message data
  - `meta`: Message metadata

### Channels (`channels.py`)

- Manages communication channels
- Key fields:
  - `id`: Channel identifier
  - `user_id`: Channel owner
  - `type`: Channel type
  - `name`: Channel name
  - `description`: Channel description
  - `access_control`: Permission settings

## Content Management

### Files (`files.py`)

- Handles file storage and management
- Key fields:
  - `id`: File identifier
  - `user_id`: File owner
  - `hash`: File hash
  - `filename`: Original filename
  - `path`: Storage path
  - `data`: File metadata
  - `access_control`: Permission settings

### Folders (`folders.py`)

- Organizes files and content
- Manages hierarchical content structure
- Includes access control and metadata

### Knowledge (`knowledge.py`)

- Manages knowledge base entries
- Key fields:
  - `id`: Entry identifier
  - `user_id`: Entry owner
  - `name`: Entry name
  - `description`: Entry description
  - `data`: Knowledge content
  - `access_control`: Permission settings

## Functionality Models

### Functions (`functions.py`)

- Manages custom functions and integrations
- Key fields:
  - `id`: Function identifier
  - `user_id`: Function owner
  - `name`: Function name
  - `type`: Function type
  - `content`: Function implementation
  - `meta`: Function metadata
  - `valves`: Function controls
  - `is_active`: Function status
  - `is_global`: Global availability flag

### Tools (`tools.py`)

- Manages system tools and utilities
- Key fields:
  - `id`: Tool identifier
  - `user_id`: Tool owner
  - `name`: Tool name
  - `content`: Tool implementation
  - `specs`: Tool specifications
  - `meta`: Tool metadata
  - `access_control`: Permission settings

### Prompts (`prompts.py`)

- Manages predefined prompts and templates
- Key fields:
  - `id`: Prompt identifier
  - `command`: Prompt command
  - `title`: Prompt title
  - `content`: Prompt content

## Feedback and Memory

### Feedbacks (`feedbacks.py`)

- Manages user feedback and ratings
- Key fields:
  - `id`: Feedback identifier
  - `user_id`: Feedback provider
  - `version`: Feedback version
  - `type`: Feedback type
  - `data`: Feedback content
  - `snapshot`: Context snapshot

### Memories (`memories.py`)

- Manages conversation memory and context
- Key fields:
  - `id`: Memory identifier
  - `user_id`: Memory owner
  - `content`: Memory content

## Organization

### Groups (`groups.py`)

- Manages user groups and permissions
- Key fields:
  - `id`: Group identifier
  - `user_id`: Group owner
  - `name`: Group name
  - `description`: Group description
  - `permissions`: Group permissions
  - `user_ids`: Group members

### Tags (`tags.py`)

- Provides content categorization
- Key fields:
  - `id`: Tag identifier
  - `name`: Tag name
  - `user_id`: Tag creator
  - `data`: Tag metadata

## Common Features

Most models include:

- Timestamps (`created_at`, `updated_at`)
- Access control mechanisms
- User ownership
- Metadata storage
- JSON-based data fields for flexibility

## Access Control

Many models implement a common access control pattern:

```json
{
	"read": {
		"group_ids": ["group1", "group2"],
		"user_ids": ["user1", "user2"]
	},
	"write": {
		"group_ids": ["group1"],
		"user_ids": ["user1"]
	}
}
```

This allows for fine-grained permission management across the system.
