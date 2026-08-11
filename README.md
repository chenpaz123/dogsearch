# RexiChip - Dog Show Management System

RexiChip is a comprehensive web application designed to streamline the management of dog shows. It handles everything from creating shows and registering dogs to verifying health documents (Brucella tests) using OCR technology.

## 🚀 Features

### 👨‍💼 Manager Interface

- **Dashboard**: View, create, update, and delete dog shows.
- **Authentication**: Secure login for managers using Firebase Auth.
- **Show Management**: Organize shows by date and description.

### 🐶 Visitor Interface (Public)

- **Registration**: Dog owners can register their dogs for available shows.
- **Document Upload**: Upload Brucella test results (images).
- **OCR Verification**: The system automatically reads the uploaded image to extract:
  - **Chip Number**: Verified against the dog's input.
  - **Test Date**: Checked for validity (must be recent).
  - **Result**: Must be "Negative".
- **Real-time Feedback**: Immediate validation of uploaded documents.

### 🩺 Vet Interface

- **Login**: Veterinarians log in using their license number (verified against government API).
- **Dog Inspection**: View details of registered dogs and their health status.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Frontend**: Vanilla JavaScript (ES Modules), Bootstrap 5
- **Image Processing**: `tesseract.js` (OCR) with LSTM engine, `multer` (File Uploads)
- **External APIs**: MOAG (Ministry of Agriculture) for dog details.

## ⚙️ Prerequisites

- **Node.js** (v14 or higher)
- **Firebase Account**: You need a Firebase project with Firestore and Authentication enabled.

## 📥 Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd "node js"
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory (`node js/`) and add your Firebase credentials:

    ```env
    PORT=3000
    ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

    # Firebase Configuration
    FIREBASE_API_KEY=your_api_key
    FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    FIREBASE_APP_ID=your_app_id
    ```

## ▶️ Running the Project

1.  **Start the server**:

    ```bash
    npm run dev
    ```

    The server will start on `http://localhost:3000`.

2.  **Access the Application**:
    - **Home**: `http://localhost:3000/pages/index.html`
    - **Visitor Upload**: `http://localhost:3000/pages/visitor-upload.html`
    - **Manager Login**: `http://localhost:3000/pages/manager-login.html`
    - **Vet Login**: `http://localhost:3000/pages/vet-interface.html`

## 📱 Raspberry Pi Bluetooth Scanner

RexiChip includes a dedicated Raspberry Pi application for automated chip number scanning:

- **Bluetooth RFID Scanner**: Reads chip numbers from SPP-180 or compatible scanners
- **WiFi Setup Interface**: Easy configuration via web browser
- **Real-time Sync**: Automatically sends chip numbers to Firebase
- **Hotspot Mode**: Creates a WiFi access point for initial setup

See the **[`raspberry-pi/` folder](./raspberry-pi/README.md)** for complete setup instructions.

## 📂 Project Structure

```
├── public/                    # Frontend files
│   ├── pages/                # HTML pages
│   │   ├── visitor-upload.html
│   │   ├── manager-dashboard.html
│   │   ├── manager-login.html
│   │   ├── vet-login.html
│   │   └── dog-details.html
│   └── scripts/              # JavaScript modules
│       ├── visitor-upload.js
│       ├── manager-dashboard.js
│       ├── dog-details.js
│       ├── get-shows.js
│       └── firebase-config-loader.js
├── src/                      # Backend source code
│   ├── controllers/          # Request handlers
│   ├── routers/             # Route definitions
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions (OCR, logging, etc.)
│   ├── constants/           # Constants and enums
│   ├── firebase/            # Firebase configuration
│   └── app.js               # Express app entry point
├── tests/                    # Jest test files
├── docs/                     # Documentation
│   ├── API.md               # API endpoints reference
│   ├── ARCHITECTURE.md      # System architecture
│   ├── TROUBLESHOOTING.md   # Common issues
│   └── DEPLOYMENT.md        # Production deployment guide
├── raspberry-pi/            # Raspberry Pi scanner application
│   ├── scanner.py          # Main scanner application
│   ├── config.py           # Configuration module
│   ├── templates/          # Web interface templates
│   └── README.md           # Setup instructions
├── data/                    # Tesseract language data
│   ├── eng.traineddata
│   ├── heb.traineddata
│   └── osd.traineddata
└── package.json

```

## 📚 Documentation

- **[API Reference](./docs/API.md)** - Detailed API endpoint documentation
- **[Architecture Overview](./docs/ARCHITECTURE.md)** - System design and data flow
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Raspberry Pi Setup](./raspberry-pi/README.md)** - Bluetooth scanner configuration

## 🧪 Testing

RexiChip includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- visitor.controller.test.js
```

**Test Coverage**: 71/71 tests passing (100% ✅)

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **Helmet.js**: Security headers
- **CORS Protection**: Configured allowed origins
- **Firebase Auth**: Secure manager authentication
- **Input Validation**: Joi schema validation
- **Error Handling**: Sanitized error messages in production

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch: `git checkout -b feature/amazing-feature`
3.  Commit your changes: `git commit -m 'Add amazing feature'`
4.  Push to the branch: `git push origin feature/amazing-feature`
5.  Open a Pull Request

## 📄 License

This project is part of the RexiChip Dog Show Management System.

## 🆘 Support

For issues, questions, or contributions:

- Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- Review the [API Documentation](./docs/API.md)
- Open an issue on the repository

## 🔌 Key API Endpoints

- `GET /getshows`: List all available shows (Public).
- `POST /visitordata`: Validate dog chip and Brucella test (Public).
- `POST /upload/image`: Upload an image for OCR processing.
- `POST /createShow`: Create a new show (Manager only).
- `PATCH /updateShow`: Update an existing show (Manager only).
- `DELETE /deleteShow`: Delete a show (Manager only).

See `docs/API.md` for full API documentation.

## 🛡️ Security

- **Helmet**: Sets secure HTTP headers.
- **Rate Limiting**: Prevents abuse of API endpoints.
- **Input Validation**: Joi is used to validate request data.
- **CORS**: Restricted to allowed origins.
