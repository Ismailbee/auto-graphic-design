#!/bin/bash
# MODNet PyTorch to ONNX Conversion Script
# 
# This script automates the process of:
# 1. Downloading MODNet repository and pretrained models
# 2. Converting PyTorch checkpoint to ONNX
# 3. Optimizing with onnx-simplifier
# 4. Optional quantization to FP16/INT8
#
# Usage:
#   ./tools/convert_modnet_to_onnx.sh [--size 512] [--quantize fp16]

set -e  # Exit on error

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MODELS_DIR="$PROJECT_ROOT/public/models"
TEMP_DIR="$PROJECT_ROOT/temp"

# Default parameters
INPUT_SIZE=512
QUANTIZE=""
SIMPLIFY="--simplify"
DYNAMIC=""

# ============================================================================
# Parse Arguments
# ============================================================================

while [[ $# -gt 0 ]]; do
  case $1 in
    --size)
      INPUT_SIZE="$2"
      shift 2
      ;;
    --quantize)
      QUANTIZE="$2"
      shift 2
      ;;
    --dynamic)
      DYNAMIC="--dynamic"
      shift
      ;;
    --no-simplify)
      SIMPLIFY=""
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--size 512] [--quantize fp16|int8] [--dynamic] [--no-simplify]"
      exit 1
      ;;
  esac
done

# ============================================================================
# Setup
# ============================================================================

echo "========================================================================"
echo "MODNet PyTorch to ONNX Conversion"
echo "========================================================================"
echo "Input size: ${INPUT_SIZE}x${INPUT_SIZE}"
echo "Quantization: ${QUANTIZE:-none}"
echo "Dynamic axes: ${DYNAMIC:-no}"
echo "Simplify: ${SIMPLIFY:-no}"
echo ""

# Create directories
mkdir -p "$MODELS_DIR"
mkdir -p "$TEMP_DIR"

# ============================================================================
# Install Dependencies
# ============================================================================

echo "📦 Checking Python dependencies..."

if ! python3 -c "import torch" 2>/dev/null; then
  echo "⚠️  PyTorch not found. Installing..."
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
fi

if ! python3 -c "import onnx" 2>/dev/null; then
  echo "⚠️  ONNX not found. Installing..."
  pip install onnx onnxruntime
fi

if ! python3 -c "import onnxsim" 2>/dev/null; then
  echo "⚠️  onnx-simplifier not found. Installing..."
  pip install onnx-simplifier
fi

if [[ -n "$QUANTIZE" ]] && ! python3 -c "import onnxruntime.quantization" 2>/dev/null; then
  echo "⚠️  onnxruntime-tools not found. Installing..."
  pip install onnxruntime-tools onnxconverter-common
fi

echo "✅ Dependencies installed"
echo ""

# ============================================================================
# Download MODNet Repository
# ============================================================================

MODNET_DIR="$TEMP_DIR/MODNet"

if [ ! -d "$MODNET_DIR" ]; then
  echo "📥 Cloning MODNet repository..."
  git clone https://github.com/ZHKKKe/MODNet.git "$MODNET_DIR"
  echo "✅ Repository cloned"
else
  echo "✅ MODNet repository already exists"
fi

echo ""

# ============================================================================
# Download Pretrained Model
# ============================================================================

CHECKPOINT_PATH="$TEMP_DIR/modnet_photographic_portrait_matting.ckpt"

if [ ! -f "$CHECKPOINT_PATH" ]; then
  echo "📥 Downloading pretrained MODNet model..."
  
  # Download from official release
  wget -O "$CHECKPOINT_PATH" \
    "https://drive.google.com/uc?export=download&id=1mcr7ALciuAsHCpLnrtG_eop5-EYhbCmz" \
    || curl -L -o "$CHECKPOINT_PATH" \
    "https://drive.google.com/uc?export=download&id=1mcr7ALciuAsHCpLnrtG_eop5-EYhbCmz"
  
  if [ ! -f "$CHECKPOINT_PATH" ]; then
    echo "⚠️  Automatic download failed. Please download manually:"
    echo "   URL: https://github.com/ZHKKKe/MODNet/releases"
    echo "   Save to: $CHECKPOINT_PATH"
    exit 1
  fi
  
  echo "✅ Model downloaded"
else
  echo "✅ Pretrained model already exists"
fi

echo ""

# ============================================================================
# Convert to ONNX
# ============================================================================

OUTPUT_PATH="$MODELS_DIR/modnet_photographic_portrait_matting.onnx"

echo "🔄 Converting to ONNX..."

QUANTIZE_ARG=""
if [[ -n "$QUANTIZE" ]]; then
  QUANTIZE_ARG="--quantize $QUANTIZE"
fi

python3 "$SCRIPT_DIR/convert_modnet_to_onnx.py" \
  --input "$CHECKPOINT_PATH" \
  --output "$OUTPUT_PATH" \
  --size "$INPUT_SIZE" \
  $DYNAMIC \
  $SIMPLIFY \
  $QUANTIZE_ARG \
  --validate

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "========================================================================"
echo "✅ Conversion Complete!"
echo "========================================================================"
echo "Output file: $OUTPUT_PATH"
echo "File size: $(du -h "$OUTPUT_PATH" | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Update CONFIG.MODEL_URL in src/lib/modnet-bg-removal.ts"
echo "2. Test with: npm run test:bg-removal"
echo "3. Benchmark with: npm run benchmark:bg-removal"
echo ""
echo "To use in browser, the model will be loaded from:"
echo "  /models/modnet_photographic_portrait_matting.onnx"
echo ""
echo "For server deployment, copy to:"
echo "  server/models/modnet_photographic_portrait_matting.onnx"
echo "========================================================================"

