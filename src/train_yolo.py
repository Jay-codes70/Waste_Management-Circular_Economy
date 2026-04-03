#!/usr/bin/env python
from ultralytics import YOLO
import torch
import os
import shutil

def train_waste_model():
    # Load pretrained YOLOv8 nano model
    model = YOLO('yolov8n.pt')
    
    # Train on dataset
    results = model.train(
        data='data/raw/data.yaml',
        epochs=10,
        imgsz=416,
        batch=8,
        fraction=0.2,
        cache=True,
        save_period=5,
        name='waste_yolo_optimized',
        project='runs/detect',
        save=True,
        plots=True,
        device=0 if torch.cuda.is_available() else 'cpu',
        workers=4,
        amp=(not torch.cuda.is_available())  # AMP for CPU
    )
    
    # Auto-copy best model to app.py expected path
    target_dir = 'models/waste_yolo/weights'
    target_path = f'{target_dir}/best.pt'
    os.makedirs(target_dir, exist_ok=True)
    
    source_path = f"{results.save_dir}/weights/best.pt"
    if os.path.exists(source_path):
        shutil.copy2(source_path, target_path)
        print(f"✅ Model copied to {target_path}")
    else:
        print("❌ Source best.pt not found!")
    
    print("Training & copy complete! Run `python app.py`")
    return results

if __name__ == '__main__':
    os.makedirs('models', exist_ok=True)
    os.makedirs('src', exist_ok=True)
    train_waste_model()

