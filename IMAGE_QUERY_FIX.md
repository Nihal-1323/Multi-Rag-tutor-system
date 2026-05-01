# Image Query Fix - "What is in the image?"

## Problem
When asking "what is in the image?", the system was:
1. Retrieving the image file in initial ranking (#4 with 10% relevance)
2. **Losing the image in reranked results** - only showing 3 PDF files
3. Not using the vision service to answer the question directly

## Root Causes

### 1. Image Not Included in Reranked Sources
**File:** `backend/main.py` line 688
```python
# Only took top 3 results
for i, r in enumerate(reranked_results[:3])
```
The image was ranked #4, so it got cut off.

### 2. No Image Query Detection
The query endpoint didn't detect when users asked about images.

### 3. No Vision Service Integration
Even though `vision_service.answer_about_image()` exists, it wasn't being called.

### 4. Image Bytes Not Passed to Search Results
Search results didn't include the raw image bytes needed for vision analysis.

## Fixes Applied

### Fix 1: Detect Image Queries
Added image keyword detection in `/query` endpoint:
```python
image_keywords = ["image", "picture", "photo", "visual", "what is in", "what's in", "show me", "look like"]
is_image_query = any(keyword in query.lower() for keyword in image_keywords)
```

### Fix 2: Boost Image Scores
When query is about images, multiply image scores by 3x:
```python
if is_image_query:
    for result in search_results:
        if result.get("is_image"):
            result["score"] *= 3.0
```

### Fix 3: Use Vision Service
Call vision service for image queries:
```python
if is_image_query and VISION_AVAILABLE and vision_service:
    for result in reranked_results:
        if result.get("is_image") and result.get("image_bytes"):
            vision_answer = vision_service.answer_about_image(result["image_bytes"], query)
```

### Fix 4: Include More Sources for Image Queries
```python
num_sources = 4 if is_image_query else 3
reranked_sources = [...for i, r in enumerate(reranked_results[:num_sources])]
```

### Fix 5: Pass Image Bytes in Search Results
Updated `simple_search()` to include raw image data:
```python
results.append({
    ...
    "image_bytes": doc_data.get("raw_content") if is_image else None
})
```

### Fix 6: Enhanced Visual Keywords in Search
Added more visual query keywords:
```python
visual_keywords = [..., 'what is in', "what's in", 'in the image', 'in the picture', 'in the photo']
```

## Expected Behavior Now

1. **Query:** "what is in the image?"
2. **Detection:** System recognizes this as an image query
3. **Boosting:** Image files get 3x score boost
4. **Ranking:** Image appears in top results
5. **Vision Service:** Analyzes the actual image content
6. **Answer:** Direct answer about what's in the image
7. **Sources:** Image file included in reranked sources

## Testing

1. Upload an image file (e.g., strawberry.jpg)
2. Ask: "what is in the image?"
3. Expected: Vision service describes the image content
4. Check: Image appears in "RERANKED SOURCES" section

## Files Modified
- `backend/main.py` - Query endpoint and search function
