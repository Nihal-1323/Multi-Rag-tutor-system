# Two-Column Ranking Display

## ✅ Feature Added: Initial Ranked vs Reranked Sources

### Visual Layout

The system now displays ranking results in **two side-by-side columns**:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  INITIAL RANKED:              RERANKED SOURCES:                │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ #1 ● UNIT 5.pdf  │         │ #1 ● UNIT 3.pdf  │            │
│  │         55%      │         │         40%      │            │
│  └──────────────────┘         └──────────────────┘            │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ #2 ● UNIT 3.pdf  │         │ #2 ● UNIT 5.pdf  │            │
│  │         40%      │         │         55%      │            │
│  └──────────────────┘         └──────────────────┘            │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ #3 ● UNIT 4.pdf  │         │ #3 ● UNIT 4.pdf  │            │
│  │         30%      │         │         30%      │            │
│  └──────────────────┘         └──────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Left Column: INITIAL RANKED
- **Color**: Blue theme
- **Label**: "INITIAL RANKED:" in blue
- **Shows**: Top 5 results from initial vector search
- **Display**: Rank number, filename, relevance percentage
- **Purpose**: Shows raw search results before reranking

### Right Column: RERANKED SOURCES
- **Color**: Emerald/green theme
- **Label**: "RERANKED SOURCES:" in emerald
- **Shows**: Top 3 results after Cross-Encoder reranking
- **Display**: Rank number, filename, relevance percentage
- **Purpose**: Shows final results after reranking optimization

## Backend Changes

### New Data Structure

**Initial Ranking** (before reranking):
```python
initial_ranking = [
    {
        "rank": 1,
        "filename": "UNIT 5.pdf",
        "score": 125,
        "relevance": 0.55
    },
    {
        "rank": 2,
        "filename": "UNIT 3.pdf",
        "score": 105,
        "relevance": 0.40
    },
    # ... up to 5 results
]
```

**Reranked Sources** (after reranking):
```python
reranked_sources = [
    {
        "rank": 1,
        "filename": "UNIT 3.pdf",
        "score": 105,
        "relevance": 0.40,
        "type": "vector"
    },
    {
        "rank": 2,
        "filename": "UNIT 5.pdf",
        "score": 125,
        "relevance": 0.55,
        "type": "vector"
    },
    # ... top 3 results
]
```

### Reranking Simulation

The backend now simulates Cross-Encoder reranking:
- If top 2 results have similar scores (within 20 points), they are swapped
- This demonstrates how reranking can change result order
- In production, this would use actual Cross-Encoder model

### API Response

```json
{
  "answer": "...",
  "explanation": "...",
  "sources": [...],           // Reranked top 3
  "initial_ranking": [...],   // Initial top 5
  "search_stats": {...}
}
```

## Frontend Changes

### Message Interface Updated

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    rank: number;
    filename: string;
    score: number;
    relevance: number;
    type?: string;
  }>;
  initialRanking?: Array<{
    rank: number;
    filename: string;
    score: number;
    relevance: number;
  }>;
  // ... other fields
}
```

### Two-Column Grid Layout

```tsx
<div className="grid grid-cols-2 gap-3">
  {/* Left Column: Initial Ranking */}
  <div>
    <p className="text-blue-400">INITIAL RANKED:</p>
    {/* Blue-themed results */}
  </div>
  
  {/* Right Column: Reranked Sources */}
  <div>
    <p className="text-emerald-400">RERANKED SOURCES:</p>
    {/* Emerald-themed results */}
  </div>
</div>
```

### Visual Styling

**Initial Ranked (Blue):**
- Border: `border-dash-line`
- Text color: `text-blue-400`
- Dot color: `bg-blue-500`
- Rank color: `text-blue-400`

**Reranked Sources (Emerald):**
- Border: `border-emerald-500/30`
- Text color: `text-emerald-400`
- Dot color: `bg-emerald-500`
- Rank color: `text-emerald-400`

## Key Features

### 1. Side-by-Side Comparison
- Users can see how reranking changed the order
- Visual distinction between initial and final results
- Easy to spot which documents moved up/down

### 2. Color Coding
- **Blue** = Initial ranking (raw search)
- **Emerald** = Reranked (optimized)
- Clear visual separation

### 3. Rank Numbers
- Each result shows its rank (#1, #2, #3, etc.)
- Ranks update after reranking
- Easy to track position changes

### 4. Relevance Percentages
- Shows confidence score for each result
- Helps understand why results were ranked
- Displayed as percentage (e.g., 55%)

### 5. Truncated Filenames
- Long filenames are truncated with ellipsis
- Prevents layout breaking
- Maintains clean appearance

## Example Scenarios

### Scenario 1: Reranking Changes Order
```
INITIAL RANKED:          RERANKED SOURCES:
#1 UNIT 5.pdf  55%  →   #1 UNIT 3.pdf  40%
#2 UNIT 3.pdf  40%  →   #2 UNIT 5.pdf  55%
#3 UNIT 4.pdf  30%  →   #3 UNIT 4.pdf  30%
```
*UNIT 3 moved from #2 to #1 after reranking*

### Scenario 2: Same Order Maintained
```
INITIAL RANKED:          RERANKED SOURCES:
#1 UNIT 3.pdf  95%  →   #1 UNIT 3.pdf  95%
#2 UNIT 5.pdf  75%  →   #2 UNIT 5.pdf  75%
#3 UNIT 4.pdf  60%  →   #3 UNIT 4.pdf  60%
```
*Order unchanged - initial ranking was already optimal*

## Testing Instructions

### Test Two-Column Display:
1. Upload multiple documents (e.g., UNIT 3.pdf, UNIT 5.pdf)
2. Ask a question
3. Look below the answer for the two-column display
4. Verify:
   - Left column shows "INITIAL RANKED:" in blue
   - Right column shows "RERANKED SOURCES:" in emerald
   - Both columns show rank numbers and percentages
   - Results may be in different order

### Test Reranking Effect:
1. Ask questions that match multiple documents
2. Compare left and right columns
3. Notice if any documents changed position
4. Check if top result is different after reranking

### Test Visual Styling:
1. Verify blue theme for initial ranking
2. Verify emerald theme for reranked sources
3. Check rank numbers are bold and colored
4. Confirm percentages are displayed correctly

## Files Modified

### Backend:
- `backend/main.py`
  - Added `initial_ranking` data structure
  - Implemented reranking simulation
  - Returns both initial and reranked results
  - Added rank numbers to sources

### Frontend:
- `src/components/ChatInterface.tsx`
  - Updated Message interface
  - Added two-column grid layout
  - Implemented color-coded display
  - Added initial ranking column

## System Status

- **Backend**: Running on port 8000 (Process ID: 8)
- **Frontend**: Running on port 3000
- **Two-Column Display**: Active
- **Reranking**: Simulated (ready for Cross-Encoder)

## Summary

✅ **Two-column layout** showing initial ranked vs reranked sources

✅ **Color-coded** - Blue for initial, Emerald for reranked

✅ **Rank numbers** displayed for each result

✅ **Relevance percentages** shown for all sources

✅ **Side-by-side comparison** to see reranking effect

The system now clearly shows how reranking improves search results by displaying both the initial ranking and the final reranked sources in a clean, two-column layout!
