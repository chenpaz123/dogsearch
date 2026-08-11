# System Architecture

## Overview
RexiChip is a 3-tier web application:
1.  **Frontend**: Static HTML/JS served by Express, communicating via REST API.
2.  **Backend**: Node.js/Express server handling business logic, OCR, and database interactions.
3.  **Database**: Firebase Realtime Database (for Chip/Show data) and Firestore (implied for Auth/other data).

## Components

### Frontend (`public/`)
*   **Pages**:
    *   `visitor-upload.html`: Main entry point for users to upload documents.
    *   `manager-dashboard.html`: Admin interface for managing shows.
    *   `vet-interface.html`: Interface for veterinarians.
*   **Scripts**:
    *   `visitor-upload.js`: Handles form submission and file upload.
    *   `manager-dashboard.js`: Fetches and displays show data.
    *   `dog-details.js`: Displays dog info after scanning.
*   **Styles**: Bootstrap 5 + Custom CSS.

### Backend (`src/`)
*   **Server (`server.js`)**: Entry point. Configures Middleware (CORS, Helmet, BodyParser) and Routes.
*   **Routers**:
    *   `visitor.router.js`: Public endpoints (`/visitordata`, `/upload/image`).
    *   `manager.router.js`: Protected endpoints (`/createShow`, `/updateShow`).
    *   `shows.router.js`: General show data (`/getshows`).
*   **Controllers**:
    *   `visitor.controller.js`: Orchestrates OCR verification and data validation.
    *   `ocr.controller.js`: Handles image processing via Tesseract.js.
*   **Utils**:
    *   `ocr.util.js`: Wraps Tesseract.js, handles image preprocessing and text extraction.

## Data Flow: Visitor Registration

1.  **User** selects a show and uploads a Brucella test image on `visitor-upload.html`.
2.  **Frontend** sends the image to `POST /upload/image`.
3.  **Backend (OCR)**:
    *   Receives image via `multer`.
    *   Passes image to `ocr.util.js`.
    *   Tesseract.js (LSTM engine) extracts text.
    *   Regex extracts dates (e.g., `12.12.2023`).
    *   Returns extracted data to Frontend.
4.  **Frontend** auto-fills the date (or asks user to correct it).
5.  **User** submits final data (Chip + Date) to `POST /visitordata`.
6.  **Backend (Visitor Controller)**:
    *   Validates inputs.
    *   **Strict Verification**: Checks if `ocrDate == manualDate`.
    *   Checks for duplicates in Firebase.
    *   Saves registration if valid.
7.  **Response**: Success or Error message displayed to User.
