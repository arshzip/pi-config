# Global instructions

## Debugging

- When you hit a wall with errors (build failures, tooling bugs, obscure failures), use web search to research the error before guessing or switching approaches.

## Long-running commands

- Don't block on long timeouts. Instead, launch the command in the background with `nohup ... &`, then poll periodically and read output reasonably.

## Big decisions

- Before making huge decisions that override the user's stated preference (e.g. switching languages or rewriting an approach from scratch), ask via ask_user_question first — unless the user has said otherwise.
