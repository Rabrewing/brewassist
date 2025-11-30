# BrewExec Fallback Pivot: Mistral Over Nemo

## ❌ Why We Moved Away from Nemo/NIMs

- Required GPU-bound Triton/ONNX stack
- Blocked contributor onboarding
- Lacked GGUF or chat-template support
- Broke prefill compatibility with Gemini CLI

## ✅ Why Mistral Works

- GGUF-ready, quantized, CPU-safe
- Supports `mistral-instruct` chat format
- Compatible with `llama-cpp-python`
- Narration-friendly outputs for replayability

## 🧪 Implementation Plan

1. Remove Nemo/NIMs from all fallback scripts
2. Download `mistral-7b-instruct-v0.2.Q3_K_M.gguf`
3. Update `codegen_runner.py` with fallback logic
4. Replace `nemo_prefill.yaml` with `mistral_prefill.yaml`
5. Update Gemini CLI to use `brewagent_mistral.sh`

## 🌍 Model Landscape

| Model    | Role               |
| -------- | ------------------ |
| Mistral  | Primary fallback   |
| Gemini   | Conversational CLI |
| Grok     | HRM simulation     |
| LLaMA    | Legacy fallback    |
| OpenCode | Code-heavy HRM     |

## 🔁 Gemini CLI Instructions

- Check for GGUF model at `/home/brewexec/models/`
- Use `chat_format=mistral-instruct`
- Log fallback tags for replayability
- Respect `brewlog` and `brewreplay.sh` hooks
