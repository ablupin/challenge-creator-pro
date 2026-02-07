

## Fix: Compress and Upload Influencer Photos to Prevent Oversized Payloads

### Problem

Influencer photos are read at full camera resolution (often 3-10MB each as base64) and sent directly in the edge function request body. With 5 photos, the payload can reach 10-50MB, exceeding the ~2MB limit and causing all image generation to silently fail.

### Solution (Two-Part)

**Part 1: Compress photos on upload** -- Resize images client-side using an HTML Canvas before storing them. This reduces each photo from 3-10MB down to ~100-200KB while keeping enough quality for AI processing.

**Part 2: Upload to storage before calling the edge function** -- Instead of sending base64 strings in the request body, upload the compressed photos to the `brochure-images` storage bucket and pass only their public URLs to the edge function.

Together, these changes reduce the payload from ~10-50MB to under 1KB of URL strings.

---

### What Changes

**New file: `src/lib/image-compression.ts`**

A utility that takes a base64 data URL and returns a compressed version:

- Loads the image into an HTML Canvas
- Scales it down to a maximum of 1024px on the longest side (sufficient for AI reference)
- Exports as JPEG at 0.7 quality
- Returns the compressed base64 data URL
- Typical output size: 80-200KB per photo (down from 3-10MB)

**Updated file: `src/components/FoodChallengeForm.tsx`**

- After reading each file with FileReader, pass the result through the compression utility before adding it to `photosPreviews`
- The preview thumbnails and downstream data both use the compressed version
- Same change applied to the fitness form

**Updated file: `src/components/FitnessChallengeForm.tsx`**

- Same compression logic as FoodChallengeForm

**Updated file: `src/hooks/useBrochureImages.ts`**

- Before calling the edge function, upload each compressed influencer photo to `brochure-images/{sessionId}/influencer-{index}.jpg` using the Supabase storage client
- Collect the resulting public URLs
- Pass only the URLs (not base64) in the edge function request body
- If any upload fails, skip that photo gracefully

**Updated file: `supabase/functions/generate-brochure-images/index.ts`**

- Add a defensive check: if an influencer photo is already a URL (starts with `http`), pass it directly to the AI API without trying to process it as base64

---

### Technical Details

#### Image compression utility

```text
compressImage(dataUrl: string, maxSize: number = 1024, quality: number = 0.7): Promise<string>
  1. Create an Image element, set src to dataUrl
  2. Wait for load
  3. Calculate new dimensions (scale longest side to maxSize, maintain aspect ratio)
  4. Create a Canvas at the new dimensions
  5. Draw the image onto the canvas
  6. Export with canvas.toDataURL('image/jpeg', quality)
  7. Return the compressed data URL
```

#### Storage upload flow in useBrochureImages

```text
async function uploadInfluencerPhotos(photos: string[], sessionId: string): Promise<string[]>
  For each photo:
    1. Convert base64 data URL to Uint8Array (strip the data: prefix, atob, charCodeAt)
    2. Upload to supabase.storage.from('brochure-images').upload(
         `${sessionId}/influencer-${index}.jpg`, bytes, { contentType: 'image/jpeg', upsert: true }
       )
    3. Get public URL with getPublicUrl()
    4. On error, log warning and skip (return empty string)
  Return array of valid URLs (filter out empty strings)
```

#### Edge function defensive check

```text
In generateImage():
  If sourceImage starts with 'http', use it directly as image_url
  If sourceImage starts with 'data:', use it as image_url (already works)
  This ensures URLs from storage work just as well as base64
```

#### Size reduction summary

| Stage | Before | After |
|-------|--------|-------|
| Raw photo from camera | 3-10MB base64 | -- |
| After compression | -- | 80-200KB base64 |
| In edge function payload | 5 photos x 5MB = ~25MB | 5 URL strings = ~500 bytes |
| Total payload | 25-50MB (fails) | ~2KB (succeeds) |

---

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/lib/image-compression.ts` | New -- canvas-based image compression utility |
| `src/components/FoodChallengeForm.tsx` | Compress photos on upload before storing as previews |
| `src/components/FitnessChallengeForm.tsx` | Same compression logic |
| `src/hooks/useBrochureImages.ts` | Upload compressed photos to storage, pass URLs to edge function |
| `supabase/functions/generate-brochure-images/index.ts` | Handle URL inputs alongside base64 in image generation |

No database changes needed. The `brochure-images` storage bucket already exists and is used by the edge function.
