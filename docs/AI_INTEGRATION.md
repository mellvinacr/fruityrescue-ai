# AI Integration Details

## Self-Hosted Image Classification Model
- **Model**: `dima806/fresh_rotten_fruits_image_classification`
- **Location**: Runs entirely on EC2 within the AI Service VPC. There is no external API dependency for image classification.
- **Evaluation**: This qualifies as a "self-hosted AI" architecture. The PyTorch and HuggingFace pipelines process images locally.

## Text Recommendation System
- **Model**: Gemini 1.5 Flash API
- **Trigger**: Only invoked when the self-hosted image classification model detects a fruit as ROTTEN.
- **Output**: Returns a recommendation mapped to `livestock` or `compost`, along with a justification reason in Indonesian.

## Detection Flow
1. User uploads a photo via the Next.js frontend.
2. The FastAPI Backend uploads the photo to GCP Cloud Storage.
3. The Backend forwards the photo URL and metadata to the AI Service.
4. The AI Service downloads the image and processes it through the self-hosted HuggingFace model.
5. If classified as ROTTEN:
   - The AI Service constructs a prompt and calls the Gemini 1.5 Flash API.
   - The Gemini API returns a JSON response recommending `livestock` or `compost` with reasoning.
6. The AI Service returns the combined result back to the Backend.
7. The Backend updates the database and frontend displays the result.
