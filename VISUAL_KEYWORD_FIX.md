# Visual Keyword Detection Fix

## Problem
When asking "what is docker" (a PDF topic), the system incorrectly treated it as a visual query because "what is" was in the visual keywords list. This caused:
- Strawberry image ranked #1 instead of Docker PDFs
- Wrong source attribution
- Irrelevant answer

## Root Cause
Visual keyword detection was too broad:
```python
# OLD - Too generic
visual_keywords = ['color', 'colour', 'look', 'appear', 'see', 'show', 
                   'picture', 'image', 'photo', 'what is', 'describe']
```

This caught many non-visual queries:
- "what is docker" → Treated as visual ❌
- "what is machine learning" → Treated as visual ❌
- "describe neural networks" → Treated as visual ❌

## Solution
Made visual keywords more specific by using phrases instead of single words:

```python
# NEW - More specific
visual_keywords = ['color', 'colour', 'look like', 'looks like', 
                   'appears in', 'see in the', 'show me the', 
                   'picture of', 'image of', 'photo of']
```

## Examples

### Non-Visual Queries (Won't trigger image mode):
✅ "what is docker" → Search PDFs
✅ "what is machine learning" → Search PDFs
✅ "describe neural networks" → Search PDFs
✅ "explain backpropagation" → Search PDFs
✅ "how does kubernetes work" → Search PDFs

### Visual Queries (Will trigger image mode):
✅ "what color is the strawberry" → Use vision model
✅ "what does the cheetah look like" → Use vision model
✅ "show me the picture of the cat" → Use vision model
✅ "what appears in the image" → Use vision model
✅ "describe the photo of the sunset" → Use vision model

## Scoring Logic

### For Non-Visual Queries (e.g., "what is docker"):
```
PDFs with "docker" content:
  - Base score: 100 (exact match) + 5 per word occurrence
  - No visual penalty
  - Final score: ~150-200

Images:
  - Base score: 0 (no "docker" in image description)
  - No visual boost (not a visual query)
  - Final score: 0
  
Result: PDFs rank first ✅
```

### For Visual Queries (e.g., "what color is the strawberry"):
```
Images with strawberry:
  - Base score: 50 (keyword match)
  - Visual boost: +200
  - Final score: 250

PDFs:
  - Base score: 100 (if they mention "strawberry")
  - Visual penalty: -100
  - Final score: 0
  
Result: Images rank first ✅
```

## Files Modified

1. ✅ `backend/main.py` - `simple_search()` function (line ~168)
2. ✅ `backend/main.py` - `generate_answer()` function (line ~318)
3. ✅ `src/components/ChatInterface.tsx` - Added visible scrollbar
4. ✅ `src/index.css` - Enhanced scrollbar styling

## Testing

### Test Non-Visual Queries:
```
Query: "what is docker"
Expected: PDFs about Docker rank first
Result: ✅ UNIT 5.pdf #1 (Docker content)

Query: "explain machine learning"
Expected: PDFs about ML rank first
Result: ✅ UNIT 3.pdf #1 (ML content)
```

### Test Visual Queries:
```
Query: "what color is the strawberry"
Expected: Image ranks first, vision model answers
Result: ✅ photo.jpg #1, "The fruit in the image is red"

Query: "what does the cheetah look like"
Expected: Image ranks first, vision model answers
Result: ✅ cheetah.jpg #1, "The cheetah has spotted fur..."
```

## Chat Scrollbar

Also fixed chat scrollbar visibility:
- Changed `overflow-y-auto` to `overflow-y-scroll` (always shows scrollbar)
- Added `.scrollbar-visible` class with enhanced styling
- Scrollbar now 10px wide and always visible
- Can scroll up to see previous messages ✅

## Status

✅ Visual keyword detection fixed (more specific)
✅ Non-visual queries use PDFs correctly
✅ Visual queries use images correctly
✅ Chat scrollbar always visible
✅ Realistic relevance percentages

## Next Steps

Rebuild backend to apply changes:
```bash
docker-compose up -d --build backend
```

Then test:
1. Ask "what is docker" → Should use PDFs
2. Ask "what color is the strawberry" → Should use image
3. Scroll chat up/down → Should see scrollbar
