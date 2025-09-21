---
description: Generalized Read & Analyze workflow for any files specified in $ARGUMENTS
---

# Prime

Execute the `Run` `Read` and `Report` sections, your goal is to fully understand the $ARGUMENTS.

# Run

- Search and scan all files in the specified path
- Identify all main components and their dependencies, both internal and external
- Map out directory and file structure, highlighting relationships and areas of complexity

# Read

For each identified component:

- Analyze its purpose, responsibilities, and interactions (data sources, state, side effects—what data is used, from where, and how is it transformed or displayed)
- Track data flow: describe what’s received as input and what’s rendered or exposed as output
- Annotate cross-file and cross-component dependencies, referencing where possible

# Report

Generate a comprehensive analysis report structured as follows:

## High-Level Overview
- **Role in Codebase**: Describe the file's primary function and its relationship to the greater system
- **Purpose**: What problem does this component solve and why does it exist

## Directory & File Structure
```
visual-representation/
├── main-file/
│   ├── sub-components/
│   └── dependencies/
└── related-files/
```
- Map relationships and highlight areas of complexity
- Show dependency hierarchy and interconnections

## Component Analysis

### Main Components (for each identified component):
- **Purpose**: Core responsibility and functionality
- **Responsibilities**: Specific tasks and operations handled
- **Key Logic**: Important algorithms, calculations, or business rules
- **Data Flow**:
  - **Input**: What data is received and from where
  - **Processing**: How data is transformed or manipulated
  - **Output**: What is rendered, exposed, or returned

## Data Flow Architecture
```
visual-flow-diagram showing:
Source → Processing → Components → UI
```
- Trace data movement through the system
- Highlight transformation points and state management

## Key Dependencies & Integrations
- **External Dependencies**: Third-party libraries and their usage
- **Internal Dependencies**: Cross-file relationships and imports
- **Cross-Component Communication**: How components interact and share data

## Specialized Features
- Unique functionality or domain-specific logic
- Performance optimizations or architectural patterns
- Notable implementation details or design decisions
