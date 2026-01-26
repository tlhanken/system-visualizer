# Agent Workflow: Spec Sheet Driver

This repository follows a strict "Spec First" workflow.

## The Golden Rule
**`specifications.md` is the source of truth for the current state of the application.** containing the visual and functional definitions. It is NOT a todo list or a wishlist.

## Workflow Loop

When asked to make a change:

1.  **Clarify**: Understand the user's intent. Ask questions if needed.
2.  **Update Spec**: Modify `specifications.md` to reflect the *new desired state* of the system.
    *   Do NOT add "implementation plans" or "checklists" to the spec.
    *   Make it declarative (e.g., "The button is blue" not "Change the button to blue").
3.  **Confirm**: Present the updated spec to the user for approval. "Does this spec match what you want?"
    *   *Note: For small low-risk changes, you may proceed with the confident assumption of approval, but the spec must still be updated first.*
4.  **Implement**: Write the code to match the new `specifications.md`.
5.  **Verify**: Test the application to ensure it matches the `specifications.md`.

## Wishlist
If a feature is planned for the future but not being implemented now, add it to `wishlist.md`.
