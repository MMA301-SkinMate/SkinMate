---
name: ai-scan-testing-guide
description: Testing guide for AI product scanning feature
type: testing-guide
---

## Quick Start

### Prerequisites
1. Backend running with valid `GOOGLE_API_KEY` in `.env`
2. Frontend connected to backend API
3. Device with camera and photo library

### Testing Flow

#### 1. Camera Capture
```
1. Navigate to AddProductScreen
2. Tap camera icon or "Chụp hoặc tải ảnh sản phẩm" panel
3. Grant camera permissions when prompted
4. Take photo of skincare product
5. Wait for "Đang quét ảnh..." to complete
6. Verify fields are auto-populated:
   - Thương hiệu (brand)
   - Tên sản phẩm (product name)
   - Thành phần (ingredients) appear as tags
   - Loại sản phẩm (product type) auto-selects
```

#### 2. Gallery Upload
```
1. Navigate to AddProductScreen
2. Tap "Tải từ thư viện" button
3. Select image from device gallery
4. Wait for AI scanning to complete
5. Verify auto-population (same as above)
```

#### 3. Manual Override
```
1. After scanning, all fields are editable
2. Edit brand name manually
3. Edit product name manually
4. Add/remove ingredients manually
5. Change product type
```

#### 4. Product Saving
```
1. Fill all required fields (tên sản phẩm is required)
2. Adjust remaining % if needed
3. Select routine usage (AM/PM/Both)
4. Add optional note
5. Tap "Lưu sản phẩm"
6. Verify navigation to Collection screen
7. Verify product appears in list
```

### Expected Results

**Successful AI Scan:**
- ✅ Brand name detected and filled
- ✅ Product name detected and filled
- ✅ 2-5 key ingredients listed
- ✅ Product type auto-detected
- ✅ Alert shows "Quét thành công"
- ✅ All fields editable

**Failed Scan or Unknown Product:**
- ⚠️ Some fields may be null/empty
- ⚠️ Alert shows error message
- ⚠️ User can still manually enter data
- ⚠️ Form remains usable

### Edge Cases to Test

1. **Low-quality photo** — AI should handle gracefully
2. **No label visible** — Fields remain empty but form works
3. **Multiple products in frame** — AI extracts main product
4. **Non-skincare product** — AI returns "other" type
5. **Rotated/angled photo** — AI should still work
6. **Very small image** — Verify file size handling

### API Response Examples

**Example 1: Successful scan**
```json
{
  "success": true,
  "data": {
    "productName": "Niacinamide 10% + Zinc 1%",
    "brand": "The Ordinary",
    "ingredients": ["Niacinamide", "Zinc PCA", "Hyaluronic Acid"],
    "productType": "serum"
  }
}
```

**Example 2: Partial data**
```json
{
  "success": true,
  "data": {
    "productName": "Facial Serum",
    "brand": null,
    "ingredients": ["Hyaluronic Acid"],
    "productType": "serum"
  }
}
```

**Example 3: Unknown product**
```json
{
  "success": true,
  "data": {
    "productName": null,
    "brand": null,
    "ingredients": [],
    "productType": "other"
  }
}
```

### Debugging

**Camera permission denied:**
- User must grant in device settings
- Path: Settings → Apps → SkinMate → Permissions → Camera

**Scan service error:**
- Check backend logs for Google API errors
- Verify `GOOGLE_API_KEY` is set correctly
- Check image file size (max 10MB)

**No ingredients detected:**
- Product label not visible in photo
- AI couldn't read ingredients
- User can add manually

**Wrong product type detected:**
- User can manually select correct type
- Tap product type selector and choose from dropdown

### Performance Notes

- Scan typically takes 3-8 seconds
- Network dependent (sends image to Google API)
- Large images may take longer to upload
- First scan may be slower (model warmup)

### Post-Testing Checklist

- [ ] All ingredients properly tagged
- [ ] Product name field validated
- [ ] Saving works with scanned data
- [ ] Manual edits preserved after save
- [ ] Collection list shows new product
- [ ] No console errors
- [ ] No memory leaks after multiple scans
- [ ] Camera/gallery permissions work both ways
