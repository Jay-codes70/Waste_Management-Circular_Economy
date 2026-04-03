from flask import Flask, render_template, request, jsonify
import os
import cv2
import numpy as np
from ultralytics import YOLO
import uuid

app = Flask(__name__)

# Global model
model = None

# Class names from data.yaml
CLASSES = ['Bag', 'Bottle', 'Cup']

# Sustainability tips
TIPS = {
    'Bag': "Reusable bags reduce plastic waste! Opt for cloth alternatives.",
    'Bottle': "Recycle PET bottles! They save 80% energy vs new production.",
    'Cup': "Use reusable cups! Single-use = 500+ years in landfill."
}

def load_yolo_model():
    
    global model
    model_path = 'models/waste_yolo/weights/best.pt'
    if os.path.exists(model_path):
        try:
            model = YOLO(model_path)
            print("✅ YOLO model loaded successfully.")
        except Exception as e:
            print(f"❌ Model load failed: {e}")
            model = None
    else:
        print("Warning: YOLO model not found. Train first with `python src/train_yolo.py`")

@app.route('/')
def index():
    model_status = "YOLO ready! Upload for waste detection (Bag/Bottle/Cup)." if model is not None else "Train YOLO model first: `python src/train_yolo.py`"
    return render_template('index.html', model_status=model_status)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save original
    filename = str(uuid.uuid4())[:8] + '_' + file.filename
    img_path = os.path.join('static/uploads', filename)
    os.makedirs(os.path.dirname(img_path), exist_ok=True)
    file.save(img_path)
    
    if model is None:
        return jsonify({'error': 'YOLO model not loaded. Train first.'}), 500

    # YOLO predict
    results = model(img_path, verbose=False, conf=0.25, save=False)
    result = results[0]
    
    if result.boxes is None:
        return jsonify({'detections': [], 'summary': {}, 'total_detections': 0, 'tip': 'No waste detected. Clean scene! 🌟'})
    
    # Extract detections/stats first (for JSON)
    detections = []
    class_stats = {cls: {'count': 0, 'total_conf': 0.0} for cls in CLASSES}
    
    for box in result.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
        conf = float(box.conf[0])
        cls_id = int(box.cls[0])
        cls_name = CLASSES[cls_id]
        
        detections.append({
            'class': cls_name,
            'confidence': f'{conf:.2%}',
            'bbox': [x1, y1, x2, y2]
        })
        
        class_stats[cls_name]['count'] += 1
        class_stats[cls_name]['total_conf'] += conf
    
    # Use YOLO built-in plot for non-overlapping labels/bboxes
    annotated_img = result.plot(line_width=2, font_size=0.8, labels=True)
    
    # Stats summary
    summary = {}
    for cls, stats in class_stats.items():
        if stats['count'] > 0:
            avg_conf = stats['total_conf'] / stats['count']
            summary[cls] = {
                'count': stats['count'],
                'avg_conf': f'{avg_conf:.2%}'
            }
    
    # Save annotated
    annotated_filename = 'annotated_' + filename
    annotated_path = os.path.join('static/uploads', annotated_filename)
    cv2.imwrite(annotated_path, annotated_img)
    
    tip = "Detected items ready for sorting! Check summary for recycling instructions. ♻️"
    
    return jsonify({
        'detections': detections,
        'summary': summary,
        'annotated_url': f'/static/uploads/{annotated_filename}',
        'tip': tip,
        'total_detections': len(detections)
    })

if __name__ == '__main__':
    load_yolo_model()
    app.run(debug=True)

