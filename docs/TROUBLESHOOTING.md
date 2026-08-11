# Troubleshooting Guide

## 1. OCR Issues

### "Could not read date from image" (403 Forbidden)
**Cause**: The OCR engine failed to extract a valid date from the uploaded image.
**Solution**:
*   Ensure the image is clear and the date is legible.
*   The system supports formats like `DD.MM.YYYY`, `DD/MM/YYYY`, `DD.MM.YY`.
*   **Strict Mode**: The system requires the OCR date to match the manually entered date. If OCR fails completely, ensure you are providing the correct manual date.

### "Date mismatch" (406 Not Acceptable)
**Cause**: The date extracted by OCR does not match the date you entered manually.
**Solution**:
*   Double-check the date on the document.
*   Ensure you typed the date correctly in the form.
*   If the document is handwritten or blurry, the OCR might be misreading it. Try a clearer photo.

## 2. Registration Issues

### "Dog already registered" (409 Conflict)
**Cause**: A dog with this chip number has already been registered for this specific show.
**Solution**:
*   No action needed. The dog is already in the system.
*   Check the Manager Dashboard to verify the entry.

### "Missing Brucella date" (403 Forbidden)
**Cause**: The system could not find a date in the image AND no manual date was provided (or the fallback failed).
**Solution**:
*   Always provide the manual date in the form as a backup.

## 3. Technical / Configuration Issues

### "SyntaxError: Unexpected identifier 'assert'"
**Cause**: Older browsers or Node.js versions do not support the `import ... assert` syntax for JSON.
**Solution**:
*   We have fixed this in the code by using a custom `loadFirebaseConfig` helper.
*   Ensure you are using the latest version of the code.
*   Clear your browser cache (`Ctrl + Shift + R`).

### 404 Not Found for `favicon.ico`
**Cause**: The browser requests a favicon by default, but one was not provided.
**Solution**:
*   We added `<link rel="icon" href="data:,">` to the HTML files to suppress this.
*   It is a harmless error.

### "Firebase: Error (auth/invalid-api-key)"
**Cause**: The `.env` file is missing or incorrect.
**Solution**:
*   Verify that `.env` exists in the root directory.
*   Check that `FIREBASE_API_KEY` and other variables are set correctly.
*   Restart the server after changing `.env`.
