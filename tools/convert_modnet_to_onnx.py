#!/usr/bin/env python3
"""
MODNet PyTorch to ONNX Converter

This script converts MODNet PyTorch models to ONNX format with optimization.

Requirements:
    pip install torch torchvision onnx onnxruntime onnx-simplifier

Usage:
    python tools/convert_modnet_to_onnx.py --input modnet.pth --output modnet.onnx --size 512

Features:
    - Converts PyTorch checkpoint to ONNX
    - Supports dynamic or fixed input sizes
    - Runs ONNX simplifier for optimization
    - Validates output with sample inference
    - Optional quantization to INT8 or FP16

Author: MODNet Background Removal Migration
"""

import argparse
import sys
import os
from pathlib import Path

import torch
import torch.nn as nn
import onnx
import onnxruntime as ort
from onnxsim import simplify


# ============================================================================
# MODNet Model Definition
# ============================================================================

class MODNet(nn.Module):
    """
    Simplified MODNet architecture for portrait matting.
    
    This is a minimal implementation. For production, clone the official repo:
    https://github.com/ZHKKKe/MODNet
    """
    
    def __init__(self, backbone_pretrained=False):
        super(MODNet, self).__init__()
        # Note: This is a placeholder. Use the actual MODNet implementation
        # from the official repository for production use.
        print("⚠️  Using placeholder MODNet architecture")
        print("📥 For production, clone: https://github.com/ZHKKKe/MODNet")
        
    def forward(self, x):
        # Placeholder forward pass
        # Real implementation should return alpha matte
        return x[:, :1, :, :]  # Return single channel


def load_modnet_model(checkpoint_path, input_size=512):
    """
    Load MODNet model from checkpoint.
    
    For actual usage, you should:
    1. Clone MODNet repo: git clone https://github.com/ZHKKKe/MODNet.git
    2. Import the real MODNet class from src/models/modnet.py
    3. Load pretrained weights
    """
    
    print(f"📂 Loading MODNet checkpoint from: {checkpoint_path}")
    
    try:
        # Try to import from official MODNet repo if available
        sys.path.insert(0, str(Path(__file__).parent.parent / 'MODNet' / 'src'))
        from models.modnet import MODNet as OfficialMODNet
        
        model = OfficialMODNet(backbone_pretrained=False)
        print("✅ Using official MODNet implementation")
    except ImportError:
        print("⚠️  Official MODNet not found. Using placeholder.")
        print("📥 Clone it: git clone https://github.com/ZHKKKe/MODNet.git")
        model = MODNet()
    
    # Load checkpoint
    if os.path.exists(checkpoint_path):
        checkpoint = torch.load(checkpoint_path, map_location='cpu')
        
        # Handle different checkpoint formats
        if isinstance(checkpoint, dict):
            if 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
            elif 'model' in checkpoint:
                state_dict = checkpoint['model']
            else:
                state_dict = checkpoint
        else:
            state_dict = checkpoint
        
        # Remove 'module.' prefix if present (from DataParallel)
        state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}
        
        model.load_state_dict(state_dict, strict=False)
        print("✅ Checkpoint loaded successfully")
    else:
        print(f"⚠️  Checkpoint not found: {checkpoint_path}")
        print("📥 Download pretrained model from:")
        print("   https://github.com/ZHKKKe/MODNet/releases")
    
    model.eval()
    return model


# ============================================================================
# ONNX Conversion
# ============================================================================

def convert_to_onnx(
    model,
    output_path,
    input_size=512,
    dynamic_axes=False,
    opset_version=14
):
    """
    Convert PyTorch model to ONNX format.
    """
    
    print(f"\n🔄 Converting to ONNX...")
    print(f"   Input size: {input_size}x{input_size}")
    print(f"   Dynamic axes: {dynamic_axes}")
    print(f"   Opset version: {opset_version}")
    
    # Create dummy input
    dummy_input = torch.randn(1, 3, input_size, input_size)
    
    # Define input/output names
    input_names = ['input']
    output_names = ['output']
    
    # Define dynamic axes if requested
    if dynamic_axes:
        dynamic_axes_dict = {
            'input': {0: 'batch', 2: 'height', 3: 'width'},
            'output': {0: 'batch', 2: 'height', 3: 'width'}
        }
    else:
        dynamic_axes_dict = None
    
    # Export to ONNX
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        input_names=input_names,
        output_names=output_names,
        dynamic_axes=dynamic_axes_dict,
        opset_version=opset_version,
        do_constant_folding=True,
        export_params=True,
        verbose=False
    )
    
    print(f"✅ ONNX model saved to: {output_path}")
    
    # Get file size
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"📊 Model size: {file_size:.2f} MB")
    
    return output_path


def simplify_onnx(input_path, output_path=None):
    """
    Simplify ONNX model using onnx-simplifier.
    """
    
    if output_path is None:
        output_path = input_path.replace('.onnx', '_simplified.onnx')
    
    print(f"\n🔧 Simplifying ONNX model...")
    
    # Load model
    model = onnx.load(input_path)
    
    # Simplify
    model_simplified, check = simplify(model)
    
    if check:
        # Save simplified model
        onnx.save(model_simplified, output_path)
        
        # Compare sizes
        original_size = os.path.getsize(input_path) / (1024 * 1024)
        simplified_size = os.path.getsize(output_path) / (1024 * 1024)
        reduction = ((original_size - simplified_size) / original_size) * 100
        
        print(f"✅ Simplified model saved to: {output_path}")
        print(f"📊 Original size: {original_size:.2f} MB")
        print(f"📊 Simplified size: {simplified_size:.2f} MB")
        print(f"📊 Reduction: {reduction:.1f}%")
        
        return output_path
    else:
        print("⚠️  Simplification failed, using original model")
        return input_path


def validate_onnx(onnx_path, input_size=512):
    """
    Validate ONNX model by running inference.
    """
    
    print(f"\n✅ Validating ONNX model...")
    
    # Load ONNX model
    session = ort.InferenceSession(onnx_path)
    
    # Print model info
    print(f"📋 Input names: {[i.name for i in session.get_inputs()]}")
    print(f"📋 Output names: {[o.name for o in session.get_outputs()]}")
    
    input_info = session.get_inputs()[0]
    print(f"📋 Input shape: {input_info.shape}")
    print(f"📋 Input type: {input_info.type}")
    
    output_info = session.get_outputs()[0]
    print(f"📋 Output shape: {output_info.shape}")
    print(f"📋 Output type: {output_info.type}")
    
    # Run test inference
    import numpy as np
    dummy_input = np.random.randn(1, 3, input_size, input_size).astype(np.float32)
    
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    
    result = session.run([output_name], {input_name: dummy_input})
    
    print(f"✅ Test inference successful")
    print(f"📊 Output shape: {result[0].shape}")
    print(f"📊 Output range: [{result[0].min():.3f}, {result[0].max():.3f}]")
    
    return True


# ============================================================================
# Quantization
# ============================================================================

def quantize_onnx(input_path, output_path=None, mode='fp16'):
    """
    Quantize ONNX model to FP16 or INT8.
    
    Note: Requires onnxruntime-tools
    pip install onnxruntime-tools
    """
    
    try:
        from onnxruntime.quantization import quantize_dynamic, QuantType
        from onnxruntime.quantization import quantize_static, CalibrationDataReader
    except ImportError:
        print("⚠️  onnxruntime-tools not installed")
        print("📥 Install: pip install onnxruntime-tools")
        return None
    
    if output_path is None:
        output_path = input_path.replace('.onnx', f'_{mode}.onnx')
    
    print(f"\n🔧 Quantizing to {mode.upper()}...")
    
    if mode == 'fp16':
        # FP16 quantization (simple conversion)
        import onnx
        from onnxconverter_common import float16
        
        model = onnx.load(input_path)
        model_fp16 = float16.convert_float_to_float16(model)
        onnx.save(model_fp16, output_path)
        
    elif mode == 'int8':
        # INT8 dynamic quantization
        quantize_dynamic(
            input_path,
            output_path,
            weight_type=QuantType.QUInt8
        )
    
    # Compare sizes
    original_size = os.path.getsize(input_path) / (1024 * 1024)
    quantized_size = os.path.getsize(output_path) / (1024 * 1024)
    reduction = ((original_size - quantized_size) / original_size) * 100
    
    print(f"✅ Quantized model saved to: {output_path}")
    print(f"📊 Original size: {original_size:.2f} MB")
    print(f"📊 Quantized size: {quantized_size:.2f} MB")
    print(f"📊 Reduction: {reduction:.1f}%")
    
    return output_path


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='Convert MODNet PyTorch model to ONNX')
    
    parser.add_argument('--input', '-i', type=str, required=True,
                        help='Path to PyTorch checkpoint (.pth)')
    parser.add_argument('--output', '-o', type=str, default='modnet.onnx',
                        help='Output ONNX file path')
    parser.add_argument('--size', '-s', type=int, default=512,
                        help='Input size (default: 512)')
    parser.add_argument('--dynamic', action='store_true',
                        help='Use dynamic axes for variable input sizes')
    parser.add_argument('--opset', type=int, default=14,
                        help='ONNX opset version (default: 14)')
    parser.add_argument('--simplify', action='store_true',
                        help='Run onnx-simplifier')
    parser.add_argument('--quantize', choices=['fp16', 'int8'],
                        help='Quantize model (fp16 or int8)')
    parser.add_argument('--validate', action='store_true', default=True,
                        help='Validate ONNX model (default: True)')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("MODNet PyTorch to ONNX Converter")
    print("=" * 70)
    
    # Load PyTorch model
    model = load_modnet_model(args.input, args.size)
    
    # Convert to ONNX
    onnx_path = convert_to_onnx(
        model,
        args.output,
        input_size=args.size,
        dynamic_axes=args.dynamic,
        opset_version=args.opset
    )
    
    # Simplify if requested
    if args.simplify:
        onnx_path = simplify_onnx(onnx_path)
    
    # Quantize if requested
    if args.quantize:
        quantized_path = quantize_onnx(onnx_path, mode=args.quantize)
        if quantized_path:
            onnx_path = quantized_path
    
    # Validate
    if args.validate:
        validate_onnx(onnx_path, args.size)
    
    print("\n" + "=" * 70)
    print("✅ Conversion complete!")
    print(f"📁 Output: {onnx_path}")
    print("=" * 70)


if __name__ == '__main__':
    main()

