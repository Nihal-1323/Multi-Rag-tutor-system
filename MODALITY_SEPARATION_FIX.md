# Modality Separation Fix - Text vs Image Queries

## Problem Fixed

**Query:** "what is there in unit 4"
- **Expected:** Content from UNIT 4.pdf (text document)
- **Got:** "Basketball" (from ball.jpg image)
- **Root Cause:** Query classification too aggressive, treating document queries as visual

## Solution: Proper Modality Separation

### 1. More Precise Visual Query Detection

**Before:**
```python
visual_keywords = ['what is in', "what's in", 'what is there', ...]
# "what is there in unit 4" → VISION (WRONG!)
```

**After:**
```python
visual_keywords = ['in the image', 'in the picture', 'in the photo',
                   'describe the image', 'explain the picture', ...]
# Requires explicit visual context
```

### 2. Document Query Detection

**Added:**
```python
doc_indicators = ['unit', 'document', 'pdf', 'file', 'chapter', 'section', 'page']
is_doc_query = any(indicator in query_lower for indicator in doc_indicators)

# Override: If query mentions document, it's TEXT
if is_doc_query:
    query_type = "TEXT"
```

### 3. Image Penalty for Document Queries

**Added:**
```python
# If asking about a document and this IS an image, penalize heavily
if is_doc_query and is_image:
    score -= 200  # Don't return images for document queries
```

## Query Classification Rules

### TEXT Queries (use PDFs):
- "what is there in unit 4" ✅
- "explain unit 5" ✅
- "what is in the document" ✅
- "summarize chapter 3" ✅
- "what does the pdf say" ✅

### VISION Queries (use images):
- "what is in the image" ✅
- "describe the picture" ✅
- "what color is in the photo" ✅
- "explain the image" ✅
- "what is in the diagram" ✅

### Ambiguous → TEXT (default):
- "what is there" → TEXT (no visual context)
- "explain this" → TEXT (no visual context)
- "what does it show" → TEXT (no visual context)

## Scoring Logic

### Document Queries:
```python
if is_doc_query:
    is_visual_query = False  # Force TEXT mode
    if is_image:
        score -= 200  # Heavy penalty for images
```

### Visual Queries:
```python
if is_visual_query and not is_doc_query:
    if is_image:
        score += 300  # Boost images
    else:
        score -= 150  # Penalize text
```

## Results

### Query: "what is there in unit 4"

**Before:**
```
QUERY TYPE: VISION (WRONG!)
#1 ball.jpg - 61%
#2 UNIT 5.pdf - 99%
Answer: "Basketball"
```

**After:**
```
QUERY TYPE: TEXT (CORRECT!)
#1 UNIT 4.pdf - 99%
#2 UNIT 5.pdf - 85%
#3 UNIT 3.pdf - 70%
#4 ball.jpg - (excluded, score < 0)
Answer: [Content from UNIT 4.pdf]
```

### Query: "what is in the image"

**Before & After (unchanged):**
```
QUERY TYPE: VISION
#1 ball.jpg - 60%
Answer: "The image shows a basketball..."
```

## Files Modified
- `backend/main.py` - Query endpoint (document override)
- `backend/main.py` - `simple_search()` (document detection, image penalty)

## Docker Status
✅ Containers rebuilt with modality separation
✅ Running on http://localhost:3000

## Test Cases

| Query | Expected Type | Expected Source |
|-------|--------------|-----------------|
| "what is there in unit 4" | TEXT | UNIT 4.pdf |
| "explain unit 5" | TEXT | UNIT 5.pdf |
| "what is in the image" | VISION | ball.jpg |
| "describe the picture" | VISION | ball.jpg |
| "what color is the ball" | VISION | ball.jpg |
| "summarize the document" | TEXT | PDFs |

**PROPER MODALITY SEPARATION:** Text queries use text documents, visual queries use images. No more mixing!
