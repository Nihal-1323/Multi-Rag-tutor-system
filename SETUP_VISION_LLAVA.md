# Setup Vision Model (LLaVA) for Image Understanding

## What is LLaVA?

LLaVA (Large Language and Vision Assistant) is a vision model that can:
- **See and understand images**
- **Answer questions about images**
- **Describe image content, colors, objects**
- **Read text in images**

## Quick Setup

### Step 1: Download LLaVA Model

```cmd
ollama pull llava
```

**Size**: ~4.7GB
**Time**: 5-10 minutes depending on internet speed

### Step 2: Verify Installation

```cmd
ollama list
```

Should show both:
- `llama2:latest` (for text)
- `llava:latest` (for vision)

### Step 3: Test LLaVA

```cmd
ollama run llava
```

Then type: `/bye` to exit

### Step 4: Rebuild Backend

```cmd
docker-compose up -d --build backend
```

Or if running manually:
```cmd
cd backend
pip install Pillow
python main.py
```

### Step 5: Test with Image

1. Go to http://localhost:3000
2. Upload an image (JPG, PNG, etc.)
3. Ask questions like:
   - "What color is the cheetah?"
   - "Describe this image"
   - "What objects do you see?"

## How It Works

### Without LLaVA:
```
Upload cheetah.jpg
→ System: [Image file: cheetah.jpg - Vision model not available]
→ Query: "What color is cheetah?"
→ Answer: "No information about cheetah color in documents"
```

### With LLaVA:
```
Upload cheetah.jpg
→ LLaVA analyzes image
→ Generates description: "A cheetah with golden-yellow fur and black spots..."
→ Stores description as searchable text
→ Query: "What color is cheetah?"
→ Answer: "The cheetah in the image has golden-yellow fur with distinctive black spots..."
```

## Features Added

### 1. Image Upload Processing
- Detects image files (.jpg, .jpeg, .png, .gif, .bmp, .webp)
- Sends to LLaVA for analysis
- Generates comprehensive description
- Extracts colors, objects, and details

### 2. Image-Specific Queries
- When you ask about an image, system uses vision model directly
- Gets accurate, visual answers
- No hallucination - answers based on actual image content

### 3. Multi-Modal Search
- Images are searchable like documents
- Descriptions indexed for text search
- Can find images by content description

## Example Queries

### Color Questions:
- "What color is the cheetah?"
- "What are the main colors in this image?"
- "Is the sky blue or gray?"

### Object Detection:
- "What animals are in this image?"
- "What objects can you see?"
- "Is there a person in the photo?"

### Description:
- "Describe this image"
- "What's happening in this picture?"
- "Tell me about this photo"

### Text Reading:
- "What text is visible in this image?"
- "Read the sign in the photo"
- "What does the label say?"

## System Requirements

### Minimum:
- **RAM**: 8GB (16GB recommended)
- **Disk**: 10GB free space
- **GPU**: Optional (CPU works but slower)

### With GPU (NVIDIA):
- Much faster image processing
- Real-time responses
- Better for multiple images

## Performance

### First Image Query:
- **Time**: 10-20 seconds (model loading)
- **After**: 3-5 seconds per query

### Optimization Tips:

**1. Keep Ollama Running:**
```cmd
ollama serve
```
Leave this running in background.

**2. Pre-load Model:**
```cmd
ollama run llava
/bye
```
This loads the model into memory.

**3. Use GPU:**
If you have NVIDIA GPU, Ollama automatically uses it.

## Troubleshooting

### LLaVA Not Found

**Error**: `Vision model not available`

**Solution**:
```cmd
ollama pull llava
docker-compose restart backend
```

### Slow Image Processing

**Solution 1 - Use smaller model:**
```cmd
ollama pull llava:7b
```

**Solution 2 - Check GPU:**
```cmd
ollama ps
```
Should show GPU usage if available.

### Image Upload Fails

**Check file size**: Max 10MB recommended
**Check format**: JPG, PNG, GIF, BMP, WEBP supported
**Check logs**:
```cmd
docker-compose logs backend
```

## Configuration

### Environment Variables

Add to `backend/.env`:
```env
VISION_MODEL=llava
OLLAMA_URL=http://host.docker.internal:11434
```

### Use Different Model

```env
VISION_MODEL=llava:13b  # Larger, more accurate
VISION_MODEL=llava:7b   # Smaller, faster
```

## Testing

### Test 1: Upload Image
1. Upload `cheetah.jpg`
2. Check response shows "vision_model_used": true
3. See image description in preview

### Test 2: Ask About Image
1. Ask: "What color is the cheetah?"
2. Should get answer from vision model
3. Check source shows "type": "image"

### Test 3: Multiple Images
1. Upload several images
2. Ask questions about each
3. System should identify correct image

## What's Supported

### Image Formats:
✅ JPG/JPEG
✅ PNG
✅ GIF
✅ BMP
✅ WEBP

### Vision Capabilities:
✅ Object detection
✅ Color identification
✅ Scene description
✅ Text reading (OCR)
✅ Spatial relationships
✅ Counting objects
✅ Identifying animals/people
✅ Describing actions

### Not Supported:
❌ Video files
❌ Audio files
❌ 3D models
❌ Very large images (>10MB)

## Architecture

```
┌─────────────────┐
│  Upload Image   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vision Service │
│    (LLaVA)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate       │
│  Description    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Store in       │
│  Document Store │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Searchable     │
│  Like Text Doc  │
└─────────────────┘
```

## Files Created

- ✅ `backend/app/services/vision_service.py` - Vision model integration
- ✅ Updated `backend/main.py` - Image upload and query handling
- ✅ Updated `backend/requirements.txt` - Added Pillow for image processing

## Summary

**To enable image understanding:**

1. **Install LLaVA**: `ollama pull llava`
2. **Rebuild backend**: `docker-compose up -d --build backend`
3. **Upload images**: Use the UI
4. **Ask questions**: Get visual answers!

**Your system will now understand images!** 🖼️✨
