--- 
description: Default architecture options generator for focused, minimal, and precise implementation choices 
---

# Prime Approach

Execute the `Approach` and `Implement` sections.
Your goal is to present three simplest viable architectures for $ARGUMENTS, showing data-in/data-out and only the functionality we need right now.

# Approach

- Make a brief overview of the problem from $ARGUMENTS. Keep scope minimal.

- Note that we are in the precustomer phase. Focus only on functionality needed immediately; cut everything else.

- Exclude legacy fallback unless explicitly required.

- Propose exactly three approaches. For each approach, provide:


Approach A — <Name>

Concept: 1–2 sentences describing the idea and why it’s simple.

Data Flow:

Input: what data is received and from where

Processing: key transformations/state updates

Output: what is returned, rendered, or stored

visual-flow:
Source → Processing → Components/Endpoints → UI/Storage


Directory & File Structure

visual-representation/
├── add/
├── update/
├── keep/
└── remove/


Identify files that need to be changed with keywords: remove, add, keep, update

Minimal Interfaces (Contracts)

List the smallest set of functions/endpoints with brief signature-style notes

Dependencies

External: third-party libs and why needed

Internal: cross-file relationships/imports

Pros / Cons: 2–3 bullets each

Risks & Mitigations: 1–3 bullets

(Repeat the exact same sub-sections for Approach B and Approach C.)

# Implement

- Recommend one approach in 2–4 sentences based on constraints (speed, clarity, least moving parts).

- List function names for the chosen approach only.

[List function names here]

- For each function, provide 1–3 sentences describing what it does.

- Specify where the function lives (file, module, or class).

- Ensure each function is mapped to only the files required for the task.