# AyurGPT
AyurGPT, a specialized Retrieval-Augmented Generation (RAG) system designed to provide accurate and contextually relevant information on Ayurvedic medicine and practices.

## Key Components

- **Vector Database**: Milvus for efficient similarity search
- **Embedding Model**: Sentence transformers for creating text embeddings
- **Django Backend**: Handles API requests and business logic
- **Frontend**: Interactive user interface

## Setup and Installation

### Prerequisites
- Python 3.12+
- Docker (for Milvus)

### Installation
1. Clone the repository
   ```
   git clone https://github.com/srivatsa0129/AyurGPT
   cd Ayur-FinalYearProject
   ```

2. Create and activate a virtual environment
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Set up the database
   ```
   cd AyurGPT
   python manage.py migrate
   ```

5. Start the server
   ```
   python manage.py runserver
   ```

- Srivatsa G
