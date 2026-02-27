<h1 align="center">👥 Crowd Density Estimation & Temporal Behavior Analysis</h1>

<p align="center">
  <img src="https://github.com/Gagansoni485/Managing-crowd/blob/main/Screenshot%202026-02-27%20111926.png?raw=true" width="800" alt="Project Interface"/>
</p>

<h3 align="center">
Computer Vision • Crowd Monitoring • Spatio-Temporal Modeling
</h3>

<p align="center">
  <b>Understanding crowd behavior beyond frame-by-frame detection.</b>
</p>

---

<h2 align="center">🚀 Overview</h2>

This project explores **crowd density estimation** using computer vision and highlights the challenges of interpreting **noisy visual data** in real-world environments.

The system detects people in video streams and generates both:

- **Spatial representations** (heatmaps)
- **Temporal representations** (time-series crowd activity)

The primary focus is not only detection accuracy, but understanding:

> **How crowd behavior evolves over time.**

---

<h2 align="center">🎯 Motivation</h2>

Crowd monitoring systems are widely used in environments such as:

- 🛕 Temples  
- 🎉 Festivals  
- 🚉 Public gatherings  
- 🏟 Large-scale events  

While modern object detection models can estimate crowd counts per frame, real-world conditions introduce noise due to:

- Occlusion in dense crowds  
- Lighting variations  
- Irregular human motion  
- Camera movement

- <p align="center">
  <img src="images/detection_output.png" width="400" alt="Crowd Detection Output"/>
  <img src="images/heatmap_output.png" width="400" alt="Crowd Density Heatmap"/>
</p>

As a result, frame-by-frame estimates fluctuate heavily, making it difficult to decide:

> Are we observing real congestion buildup, or just random variation?

This project was inspired by a crowd management challenge encountered during a **national-level hackathon** and real observations from dense gatherings.

---

<h2 align="center">🛠 What This Project Does</h2>

The system uses **Python, OpenCV, and YOLO** to perform:

- 👤 People detection in video frames  
- 🔢 Crowd count estimation per frame  
- 🌍 Spatial heatmap generation for density distribution  
- 📈 Time-series extraction of crowd activity across sequences  

---

<h2 align="center">🔍 Key Observations</h2>

Although the detection pipeline performs well technically, several real-world limitations were observed:

- Sudden drops in detected counts due to occlusion  
- Artificial spikes caused by lighting changes or camera motion  
- High temporal variability even when crowd structure appears stable  

These effects make it difficult to interpret system-level behavior using single-frame predictions alone.

---

<h2 align="center">💡 Core Insight</h2>

Frame-level detections are inherently noisy.

Meaningful crowd behavior emerges only when activity is analyzed across both:

- **Time**
- **Space**

This project demonstrates the need for:

✅ Spatio-temporal aggregation  
✅ System-level modeling  
❌ Not relying solely on instantaneous measurements  

---

<h2 align="center">🔬 Research Direction</h2>

The next step is to model crowd activity as a **dynamic system with memory**, where:

> Current observations depend on recent past behavior.

The goal is to distinguish:

- Persistent congestion buildup  
- Transient detection noise  

This aligns with mechanistic and systems-based approaches for interpreting noisy real-world data.

---

<h2 align="center">⚙ Technologies Used</h2>

- 🐍 Python  
- 🎥 OpenCV  
- 🧠 YOLO  
- 📊 NumPy  
- 📉 Matplotlib  

---

<h2 align="center">🌍 Why This Matters</h2>

Crowd safety depends not just on detecting people, but on understanding:

- How congestion builds  
- How movement stabilizes  
- When risk patterns become persistent  

This project is a step toward **data-driven public safety systems** for large-scale gatherings.

---

<h2 align="center">⭐ Project Status</h2>

✅ Detection + Density Pipeline Complete  
✅ Heatmaps + Temporal Analysis Implemented  
🔄 Future Work: Dynamic modeling + predictive crowd risk estimation  

---

<p align="center">
If you find this project meaningful, consider giving it a ⭐
</p>
