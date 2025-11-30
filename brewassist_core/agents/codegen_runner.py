from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional

from llama_cpp import Llama  # pip install llama-cpp-python

from . import logger

_MODEL_CACHE: Optional[Llama] = None


def _get_mistral_model() -> Llama:
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE

    model_path = os.getenv("MISTRAL_MODEL_PATH")
    if not model_path:
        raise RuntimeError("MISTRAL_MODEL_PATH is not set.")

    ctx_size = int(os.getenv("MISTRAL_CTX_SIZE", "4096"))
    n_threads = int(os.getenv("MISTRAL_N_THREADS", "6"))

    logger.log("MISTRAL_INIT", f"Loading Mistral model from {model_path}", {
        "ctx": ctx_size,
        "threads": n_threads,
    })

    _MODEL_CACHE = Llama(
        model_path=model_path,
        n_ctx=ctx_size,
        n_threads=n_threads,
        chat_format="chat_template.default",
    )
    return _MODEL_CACHE


def run_mistral_chat(prompt: str, system: str = "You are BrewAssist, a helpful DevOps and recruiting co-pilot.") -> str:
    model = _get_mistral_model()

    logger.log("MISTRAL_CALL", "Running Mistral chat", {"prompt_preview": prompt[:120]})

    messages = [
        {"role": "user", "content": prompt},
    ]

    out = model.create_chat_completion(messages=messages)

    # Common llama-cpp chat response structure
    try:
        choice = out["choices"][0]["message"]["content"]
    except Exception as e:
        logger.log("MISTRAL_ERROR", f"Unexpected response structure: {e}", {"raw": str(out)[:500]})
        return str(out)

    tagged = (
        "# ── Fallback: Mistral (GGUF) ──\n"
        "# chain: gemini → hrm → grok → mistral\n\n" + choice
    )

    logger.log("MISTRAL_OK", "Mistral response produced.", {"length": len(tagged)})
    return tagged


if __name__ == "__main__":
    import json
    
    # The single argument is a JSON string of the array of arguments
    args = json.loads(sys.argv[1])
    prompt = args[0]
    
    result_text = run_mistral_chat(prompt)
    
    # Output as a JSON object
    output = {"content": result_text}
    print(json.dumps(output))
