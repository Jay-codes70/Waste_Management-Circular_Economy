# 🗑️ Waste Management & Circular Economy - YOLO Waste Detector

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![Ultralytics YOLOv8](https://img.shields.io/badge/Ultralytics-YOLOv8-orange.svg)](https://github.com/ultralytics/ultralytics)
[![Flask](https://img.shields.io/badge/Flask-2.x-green.svg)](https://flask.palletsprojects.org/)

## 🚀 Quick Start

```bash
# Clone & install
git clone <your-repo>
cd Waste_Management&Circular_Economy
pip install -r requirements.txt

# 1. Train YOLO model (first time only)
python src/train_yolo.py

# 2. Run web app
python app.py
```

Visit `http://127.0.0.1:5000` to upload waste images for detection! 🔍

## ✨ Features
- **Real-time Waste Detection**: Identifies **Bag**, **Bottle**, **Cup** using YOLOv8 nano
- **Web Interface**: Drag-drop upload with annotated results & confidence scores
- **Sustainability Tips**: Recycling advice for detected items ♻️
- **Production Ready**: GPU/CPU support, AMP optimization, auto model copy

## 📁 Project Structure
```
Waste_Management&Circular_Economy/
├── app.py                 # Flask web app + YOLO inference
├── src/train_yolo.py      # YOLOv8 training script
├── requirements.txt       # Dependencies
├── data/
│   └── raw/               # Roboflow dataset (data.yaml)
├── models/waste_yolo/     # Trained weights (auto-copied)
├── static/
│   ├── uploads/           # Temp annotated images
│   ├── css/style.css
│   └── js/script.js
├── templates/index.html   # Upload UI
└── runs/                  # Training logs/plots
```

## 🎯 Usage

1. **Upload Image** via web interface (`/`)
2. **Detection** at `/predict` → JSON response:
   ```json
   {
     \"detections\": [
       {\"class\": \"Bottle\", \"confidence\": \"92.5%\", \"bbox\": [x1,y1,x2,y2]}
     ],
     \"summary\": {\"Bottle\": {\"count\": 2, \"avg_conf\": \"89%\"}},
     \"annotated_url\": \"/static/uploads/annotated_img.jpg\",
     \"tip\": \"Recycle PET bottles!\"
   }
   ```
3. Download annotated image with bounding boxes ✅

## 📊 Dataset
- **Source**: [Roboflow Plastic-Multiclass v4](https://universe.roboflow.com/engineer-bi8td/plastic-multiclass/dataset/4)
- **Classes**: `['Bag', 'Bottle', 'Cup']` (8979 images, 640x640)
- **Augmentations**: Flip, rotate, crop, shear
- Config: `data/raw/data.yaml`

## 🛠️ Tech Stack
| Component | Tech |
|-----------|------|
| CV Model | YOLOv8 nano (Ultralytics) |
| Web | Flask |
| Processing | OpenCV, Pillow, NumPy |
| DL | PyTorch |

## 📈 Training Config
```yaml
epochs: 10, imgsz: 416, batch: 8
project: runs/detect/waste_yolo_optimized
conf_threshold: 0.25
```

Model auto-saves to `models/waste_yolo/weights/best.pt`

## 📱 Screenshots
<!-- Add your screenshots here -->
1. **Upload Page**:

   <img width="1328" height="572" alt="Screenshot 2026-04-03 144044" src="https://github.com/user-attachments/assets/c5551403-c35e-4705-a498-252bc43e05b7" />


3. **Detection Result**: 
<img width="969" height="619" alt="Screenshot 2026-04-03 144139" src="https://github.com/user-attachments/assets/2b6507eb-a5a7-4379-8fbf-0e02c460696c" />
<img width="1081" height="556" alt="Screenshot 2026-04-03 144258" src="https://github.com/user-attachments/assets/a548fd4f-36d9-4f45-9ee6-273164eeb3fa" />
<img width="877" height="556" alt="Screenshot 2026-04-03 144209" src="https://github.com/user-attachments/assets/d72d22e5-5deb-46be-a973-40b71e6bc39d" />



## 📄 License
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (dataset) | MIT (code)

---

⭐ **Star if useful for waste sorting automation!** ♻️
