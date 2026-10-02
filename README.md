# 🌊 Ocean Reconstruct

### AI-Based Reconstruction of Subsurface Ocean Temperature

**From Multi-source Ocean Data to 3D Temperature Reconstruction**

Ocean Reconstruct is an AI/ML-based research prototype designed to reconstruct **subsurface ocean temperature profiles from surface observations**.

The system learns the relationship between what satellites observe at the ocean surface and the temperature structure below the surface. It combines multi-source ocean observations with **Argo measurements** to reconstruct daily temperature profiles, estimate anomalies, quantify uncertainty, and validate predictions against independent observations.

> **Surface observations → AI/ML reconstruction → 3D subsurface temperature → Uncertainty → Independent validation**

---

## 🌍 Problem

Satellites provide continuous observations of the ocean surface, but they cannot directly observe the complete temperature structure beneath it.

However, subsurface temperature is important for understanding:

* Ocean circulation
* Ocean heat content
* Climate variability
* Air-sea interactions
* Marine heatwaves
* Marine ecosystems
* Fisheries and ocean monitoring

The goal of Ocean Reconstruct is to bridge this gap by using available surface information to estimate the **vertical temperature structure of the ocean**.

---

## 💡 Our Approach

Ocean Reconstruct learns how surface ocean conditions relate to subsurface temperature profiles.

The system follows a multi-stage pipeline:

```text
Satellite / Surface Ocean Data
              │
              ▼
     Data Preprocessing
              │
              ▼
   Multi-source Harmonization
              │
              ▼
       AI / ML Model
              │
              ▼
  Subsurface Temperature
       Reconstruction
              │
              ▼
 Uncertainty Calibration
              │
              ▼
     Argo Validation
              │
              ▼
     Interactive Portal
```

The core idea is simple:

> **Learn the relationship between the ocean surface and its vertical structure, correct the reconstruction using independent observations, and report the result together with calibrated uncertainty.**

---

## 🎯 Objectives

Ocean Reconstruct is designed to:

1. Reconstruct **daily potential temperature** at **15 standard depths from 0–1000 m**.
2. Produce estimates on a **0.25° spatial grid**.
3. Quantify prediction uncertainty using **calibrated 90% intervals** for every depth.
4. Validate reconstructed profiles against **held-out Argo observations**.
5. Evaluate reconstruction error by depth.
6. Compare performance against a climatology baseline.
7. Benchmark against INCOIS analysed grids when the temperature definition is confirmed.
8. Provide an interactive and reproducible portal for scientific exploration.

---

## 🗺️ Study Scope

| Parameter          | Scope                    |
| ------------------ | ------------------------ |
| Study Region       | North Indian Ocean       |
| Study Period       | 2016–2025                |
| Variable           | Potential Temperature    |
| Reference          | 0 dbar                   |
| Unit               | °C                       |
| Spatial Resolution | 0.25° grid               |
| Vertical Range     | 0–1000 m                 |
| Standard Depths    | 15                       |
| Uncertainty        | Calibrated 90% intervals |
| Validation         | Held-out Argo profiles   |

---

## 🧠 System Architecture

The project uses a **time-based data split** to reduce information leakage between training, calibration, and testing stages.

```text
                    OCEAN RECONSTRUCT
                           │
          ┌────────────────┴────────────────┐
          │                                 │
   Surface Observations              Argo Observations
          │                                 │
          └────────────────┬────────────────┘
                           ▼
                 Data Preprocessing
                           │
                           ▼
                Data Harmonization
                           │
                           ▼
                  Feature Processing
                           │
                           ▼
                     AI / ML Model
                           │
                           ▼
                 Ensemble Inference
                           │
                           ▼
                Uncertainty Calibration
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      Temperature Profiles          Confidence
             │                       Intervals
             └─────────────┬─────────────┘
                           ▼
                    Argo Validation
                           │
                           ▼
                 Interactive Portal
```

### Time-Based Data Strategy

The documented pipeline separates the data chronologically:

```text
2016 ─────────────── 2021
        Training / Fit
             │
             ▼
           2022
    Selection + Calibration
             │
             ▼
2023 ───────────────────── 2025
          Frozen Test
       Never used for tuning
```

This prevents information from later periods from being used during model development.

---

## 📊 Validation

The system evaluates reconstructed temperatures against independent Argo observations.

The documented validation includes:

* Error analysis by depth
* RMSE evaluation
* Comparison with climatology
* Held-out Argo validation
* Evaluation of uncertainty intervals

### Current documented validation snapshot

| Metric               |  Result |
| -------------------- | ------: |
| Matched Argo samples |     126 |
| Floats               |      13 |
| Profiles             |      33 |
| RMSE — Top 30 m      | 0.22 °C |
| RMSE — Below 300 m   | 0.36 °C |

The project documentation also reports depth-wise RMSE values across the evaluated standard depths.

> These values represent the current documented validation snapshot and should be updated whenever the model or evaluation dataset changes.

---

## 🌡️ What the User Can Explore

The interactive research portal is designed to provide:

### Daily Temperature

Explore reconstructed temperature profiles from the surface down to 1000 m.

### Temperature Anomaly

Compare current reconstructed temperatures against seasonal climatology.

### Uncertainty

View calibrated **90% uncertainty intervals** at each depth.

### Argo Comparison

Compare reconstructed profiles with independent Argo observations.

### Depth-wise Error

Inspect reconstruction performance across different depths.

### Data Export

Export reconstructed results for further scientific analysis.

---

## 🖥️ Interactive Research Portal

Ocean Reconstruct includes an interactive portal for exploring the reconstructed ocean state.

The portal is designed around a scientist-friendly workflow:

```text
Select Region
     ↓
Select Date
     ↓
View Surface Conditions
     ↓
Explore Temperature Profile
     ↓
Inspect Depth-wise Uncertainty
     ↓
Compare with Argo
     ↓
Export Results
```

---

## 🔬 Research Pipeline

The overall workflow can be summarized as:

```text
MULTI-SOURCE DATA
       │
       ▼
Preprocessing & Harmonization
       │
       ▼
Feature / Ocean-State Representation
       │
       ▼
AI / ML Reconstruction
       │
       ▼
Ensemble Inference
       │
       ▼
Uncertainty Calibration
       │
       ▼
3D Temperature Profiles
       │
       ├──────────────► Argo Validation
       │
       ├──────────────► Climatology Benchmark
       │
       └──────────────► INCOIS Benchmark
                              │
                              ▼
                    Interactive Research Portal
```

---

## 🧩 Key Features

* 🌊 **Subsurface temperature reconstruction**
* 🛰️ **Surface satellite/ocean observations**
* 🤖 **AI/ML-based inference**
* 📡 **Multi-source ocean data processing**
* 📈 **Depth-wise performance evaluation**
* 🎯 **15 standard depths**
* 🌡️ **0–1000 m temperature profiles**
* 📐 **0.25° spatial grid**
* 📊 **90% calibrated uncertainty intervals**
* 🧭 **Argo-based independent validation**
* 📅 **Daily reconstruction**
* 🔎 **Temperature anomaly analysis**
* 🖥️ **Interactive research portal**
* 📤 **Result export**

---

## 🛠️ Technology Stack

The project is organized around the following technical areas:

| Layer              | Technology / Component                      |
| ------------------ | ------------------------------------------- |
| Programming        | Python                                      |
| Machine Learning   | AI / ML models                              |
| Ocean Data         | Multi-source satellite & ocean observations |
| In-situ Validation | Argo                                        |
| Data Processing    | Scientific / geospatial preprocessing       |
| Model Evaluation   | RMSE and depth-wise analysis                |
| Uncertainty        | Ensemble inference + calibration            |
| Visualization      | Interactive research portal                 |
| Version Control    | Git + GitHub                                |

> The exact model and implementation components may evolve as the research pipeline is developed.

---

## 📁 Project Structure

A recommended repository structure is:

```text
ocean-temperature-reconstruction/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── README.md
│
├── notebooks/
│   ├── data_exploration.ipynb
│   ├── preprocessing.ipynb
│   ├── training.ipynb
│   └── evaluation.ipynb
│
├── src/
│   ├── data/
│   ├── preprocessing/
│   ├── models/
│   ├── inference/
│   ├── calibration/
│   └── evaluation/
│
├── portal/
│   └── ...
│
├── results/
│   ├── figures/
│   ├── metrics/
│   └── profiles/
│
├── docs/
│
├── requirements.txt
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ruchitra2007/ocean-temperature-reconstruction.git
cd ocean-temperature-reconstruction
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the project

Follow the instructions inside the relevant project modules or portal directory.

> Dataset download and preprocessing instructions should be added here once the final data pipeline is fixed.

---

## 📈 Evaluation Metrics

The project focuses primarily on **temperature reconstruction accuracy across depth**.

### Root Mean Squared Error

RMSE measures the difference between reconstructed and observed temperature:

```text
RMSE = sqrt(mean((T_predicted - T_observed)²))
```

The evaluation is performed not only as an overall metric, but also across different depth levels.

This helps identify where reconstruction quality changes throughout the water column.

---

## 🔐 Preventing Data Leakage

A key design decision is the use of a **time-based split**.

```text
2016–2021 → Model development
2022      → Selection + calibration
2023–2025 → Frozen test
```

The frozen test period is not used for model tuning.

This makes the evaluation more representative of how the system would perform when applied to future observations.

---

## 🌊 Why This Matters

Understanding subsurface ocean temperature is difficult because direct measurements are sparse compared with continuous surface observations.

Ocean Reconstruct explores whether AI/ML can help bridge this observational gap by learning relationships between:

```text
Surface Ocean State
        +
Satellite Observations
        +
Ocean Observations
        ↓
AI / ML
        ↓
Subsurface Temperature
        +
Uncertainty
```

The resulting profiles can support further analysis of ocean variability and subsurface thermal structure.

---

## 🔭 Future Development

Potential future extensions include:

* Improving reconstruction accuracy at greater depths
* Expanding the number of available observations
* Improving uncertainty calibration
* Adding more ocean variables
* Increasing temporal and spatial coverage
* Supporting additional ocean regions
* Improving interactive scientific visualization
* Adding more comprehensive benchmarking
* Developing reproducible large-scale inference pipelines

---

## 📚 Project Documentation

The complete system architecture and technical approach are documented separately.

**Project:** TriFlux
**Solution:** Ocean Reconstruct
**Institution:** VNR Vignana Jyothi Institute of Engineering & Technology

---

## 👥 Team

### TriFlux

**Team Leader**

Ruchitra Jangala

**Team Members**

* Jakka Swetha
* Venkata Naga Rohit Pogula

**Institution**

VNR Vignana Jyothi Institute of Engineering & Technology

---

## 🔗 Project Links

### GitHub

https://github.com/ruchitra2007/ocean-temperature-reconstruction

### System Architecture & Technical Documentation

https://docs.google.com/document/d/1vHBjm45S0VOaCvV96eP1-y1c9Am8nvMQ/edit

### Metrics & Results

https://docs.google.com/spreadsheets/d/1wd30gBr3YsYVxFGceNN_yrmLciqrn-fc/edit

---

## 📌 Project Status

**Research Prototype / Hackathon Implementation**

The repository is under active development. Model implementations, datasets, evaluation pipelines, and portal components may continue to evolve as the project progresses.

---



<p align="center">

### 🌊 Ocean Reconstruct

**From Surface Observations to Subsurface Ocean Intelligence**

</p>
