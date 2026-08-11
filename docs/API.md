# API Documentation

Base URL: `http://localhost:3000`

## Public Endpoints

### 1. Get Shows
Retrieves a list of all available dog shows.

- **URL**: `/getshows`
- **Method**: `GET`
- **Success Response**:
    - **Code**: 200 OK
    - **Content**:
    ```json
    [
        {
            "id": "show_id_1",
            "description": "Poodle Club Show - 12.12.2023",
            "date": "2023-12-12"
        },
        ...
    ]
    ```

### 2. Visitor Data Submission
Validates dog chip number and Brucella test date.

- **URL**: `/visitordata`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "chip": "900123456789",
        "brucelladate": "12.12.2023" // Optional if OCR works
    }
    ```
- **Success Response**:
    - **Code**: 200 OK
    - **Content**: `{"message": "Visitor data received"}`
- **Error Responses**:
    - **400 Bad Request**: "Manual date is required" (if OCR fails and no manual date provided).
    - **403 Forbidden**: "Could not read date from image" (OCR failure) or "Missing Brucella date".
    - **406 Not Acceptable**: "Date mismatch" (OCR date != Manual date).
    - **409 Conflict**: "Dog already registered".

### 3. Upload Image (OCR)
Uploads an image for OCR processing.

- **URL**: `/upload/image`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**: `image` (File)
- **Success Response**:
    - **Code**: 200 OK
    - **Content**:
    ```json
    {
        "text": "Extracted text...",
        "dates": ["12.12.2023"],
        "chips": ["900123456789"]
    }
    ```

## Manager Endpoints (Protected)

### 4. Create Show
Creates a new dog show.

- **URL**: `/createShow`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "date": "2023-12-25",
        "description": "Christmas Special Show"
    }
    ```
- **Success Response**:
    - **Code**: 201 Created

### 5. Update Show
Updates an existing show's details.

- **URL**: `/updateShow`
- **Method**: `PATCH`
- **Body**:
    ```json
    {
        "id": "show_id_1",
        "date": "2023-12-26",
        "description": "Updated Show Name"
    }
    ```
- **Success Response**:
    - **Code**: 200 OK

### 6. Delete Show
Deletes a show.

- **URL**: `/deleteShow`
- **Method**: `DELETE`
- **Body**:
    ```json
    {
        "id": "show_id_1"
    }
    ```
- **Success Response**:
    - **Code**: 200 OK

## Configuration Endpoints

### 7. Get Firebase Config
Returns the public Firebase configuration for the frontend.

- **URL**: `/config/firebase`
- **Method**: `GET`
- **Success Response**:
    - **Code**: 200 OK
    - **Content**: `{"config": { ...firebaseConfig... }}`
