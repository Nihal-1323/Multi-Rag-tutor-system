# Test Data Setup

This directory contains controlled test data for validating all assignment requirements.

## Test Dataset Structure

### 📄 Text (PDF): `neural_networks.pdf`
**Topic**: Neural Networks  
**Content**:
- Definition of Neural Networks
- Gradient Descent explanation
- Backpropagation algorithm

### 🖼️ Image: `neural_network_diagram.png`
**Content**: Diagram showing neural network layers (input → hidden → output)

### 🔊 Audio: `gradient_descent_lecture.mp3`
**Content**: 1-2 minute lecture explaining gradient descent

## Cross-Modal Validation
All three files reference the same concepts:
- Neural Networks
- Gradient Descent
- Backpropagation

This enables testing:
- Multi-modal ingestion
- Cross-modal retrieval
- Hybrid search effectiveness

## Creating Test Data

### Text Content (neural_networks.txt)
```
Neural Networks: A Comprehensive Guide

What are Neural Networks?
Neural networks are computational models inspired by biological neural networks. 
They consist of interconnected nodes (neurons) organized in layers.

Gradient Descent
Gradient descent is an optimization algorithm used to minimize the loss function.
It iteratively adjusts weights by moving in the direction of steepest descent.
The learning rate controls the step size in each iteration.

Backpropagation
Backpropagation is the algorithm used to calculate gradients efficiently.
It propagates errors backward through the network layers.
This enables the network to learn from its mistakes.

Applications
Neural networks are used in image recognition, natural language processing,
and many other machine learning tasks.
```

### Image Description
Create or download a simple neural network architecture diagram showing:
- Input layer (3 nodes)
- Hidden layer (4 nodes)
- Output layer (2 nodes)
- Connections between layers

### Audio Script
Record or use TTS for:
```
"In this lecture, we'll discuss gradient descent, a fundamental optimization 
algorithm in neural networks. Gradient descent works by calculating the gradient 
of the loss function and moving in the opposite direction to minimize error. 
The learning rate determines how big each step is. This process repeats until 
we reach a minimum."
```
