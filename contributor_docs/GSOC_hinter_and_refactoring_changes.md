# GSoC 2025: p5.js Autocomplete Hinter & Refactoring System
This readme elaborates on the core components of the context-aware autocomplete hinter, refactoring utilities, and supporting data structures developed as part of Google Summer of Code 2025. The goal is to enable smart context-aware autocompletion, jump-to-definition, and safe variable renaming.

# Project Overview

## Autocomplete Hinter Context-Aware Functionality
The following files and modules work together to make the p5.js autocomplete hinter context-aware:

### p5CodeAstAnalyzer.js
Purpose: Parses user-written p5.js code using Babel and extracts structural information:

- Maps variable names to p5 class instances
- Tracks declared variables in each function or global scope
- Detects user-defined functions and their parameters
- Collects info about user-defined classes, constructor-assigned properties, and methods

Key Output Maps:

- variableToP5ClassMap: Maps variable names (e.g., col) to their p5.js class type (e.g., p5.Color)
- scopeToDeclaredVarsMap: Maps function names or global scope to variables declared in them
- userDefinedFunctionMetadata: Metadata about custom functions (params, type, etc.)
- userDefinedClassMetadata: Metadata for user-defined classes (methods, constructor properties)

### context-aware-hinter.js
Purpose: Provides code autocompletion hints based on:

- Current cursor context (draw, setup, etc.)
- p5CodeAstAnalyzer output
- p5 class method definitions
- Variable/function scope and visibility
- Scope-specific blacklist/whitelist logic

Features:

- Dot-autocompletion (e.g., col. shows methods of p5.Color)
- Scope-sensitive variable/function suggestions
- Ranks hints by type and scope relevance

### getContext.js
Purpose: Get the context of the cursor, i.e. inside what function is the cursor in

## Context-Aware Renaming Functionality
The following files ensure context-aware renaming when a variable or user-defined function is selected and the F2 button is clicked

### rename-variable.js
Purpose: Safely renames a variable in the user's code editor by:

- Analyzing AST to find all matching identifiers
- Ensuring replacement only occurs within the same lexical scope
- Performing in-place replacement using CodeMirror APIs

### showRenameDialog.jsx
Purpose: Opens either a dialog box to get the new variable name or a temporary box to show that the word selected cannot be renamed

## Jump to Definition
The following file allows user to jump to the definition for variables or parameters when a word is ctrl-clicked. 

### jumptodefinition.js
Purpose: Implements “jump to definition” for variables or parameters in the editor.

How It Works:

- Uses AST + scope map to locate the definition site of a variable
- Supports both VariableDeclarator and FunctionDeclaration/params
- Moves the editor cursor to the source location of the definition

## Supporting Data Files
### p5-instance-methods-and-creators.json
Purpose: Maps p5.js classes to:

- Methods used to instantiate them (createMethods)
- Methods available on those instances (methods)

### p5-scope-function-access-map.json
Purpose: Defines which p5.js functions are allowed or disallowed inside functions like setup, draw, preload, etc.

### p5-reference-functions.json
Purpose: A flat list of all available p5.js functions.

Used to:

- Differentiate between built-in and user-defined functions
- Filter out redefinitions or incorrect hints