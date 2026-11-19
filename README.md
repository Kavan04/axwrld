# Axwrld
## Problem Statement

In an increasingly globalized society, traditional recipes and cultural culinary practices are fading away. Generational gaps, migration, and the convenience of fast food contribute to a disconnect from authentic, home-cooked flavors and the culinary knowledge passed down through generations. Many individuals lack access to the necessary ingredients, time, or guidance to recreate these cherished dishes.

## Our Solution

Axwrld addresses this issue by providing a digital culinary map where users can discover authentic dishes from around the globe, accompanied by their cultural histories. Our platform features an **AI Chef** that customizes recipes to meet individual dietary requirements, empowering users to recreate these traditional dishes effortlessly.

## What Sets Axwrld Apart?

Unlike typical recipe applications, Axwrld prioritizes authenticity and cultural context. Each recipe not only provides insights into its origins but also explores its cultural significance, allowing users to engage with global flavors in a personal and meaningful way. The **AI Chef** enhances this experience by tailoring recipes for health-conscious users while maintaining the integrity of the original dish.

## How We Made It Happen (Technical Overview)

### Global Recipe Map
The **Global Recipe Map** forms the foundation of Axwrld, allowing users to explore recipes by region, culture, and cuisine. Each recipe is geotagged, enabling easy discovery based on geographic locations. Here’s how it works:
- **Geolocation & Tagging**: Recipes are associated with geographic metadata that links them to specific locations worldwide. Users can also contribute by tagging and uploading their own family recipes, creating a community-driven map that evolves over time.
- **Crowdsourced Data**: Users are encouraged to submit recipes, contributing ingredients and cooking instructions. Each submission undergoes a review process to ensure authenticity, maintaining the platform's focus on cultural accuracy.
- **Map Navigation**: The interactive recipe map features a zoomable interface, allowing users to search by region, country, or cuisine type. Filtering options make it simple to find recipes based on dietary needs, ingredient availability, and cooking style.

### AI Chef
The **AI Chef** serves as a smart recipe assistant that personalizes suggestions based on users' dietary preferences, available ingredients, and nutritional needs. Utilizing machine learning and natural language processing, the AI Chef enhances the culinary experience by empowering users to make informed, healthy, and culturally authentic choices. Specifically, the AI Chef is powered by Ollama's Llama3 model, which processes a JSON file containing relevant recipe data to help the AI learn about various cooking styles and methods from different cultures.
- **Natural Language Processing (NLP)**: The AI Chef uses NLP to interpret user inputs, such as dietary restrictions (e.g., vegan, gluten-free), available ingredients, or taste preferences. The NLP engine processes this information to recommend suitable recipes or adapt existing ones.
- **Machine Learning Customization**: Through machine learning algorithms, the AI Chef provides personalized recommendations, leveraging data from previous user interactions and preferences. It learns over time, improving suggestions and enhancing user satisfaction.
- **Nutritional Guidance**: The AI Chef analyzes recipes using a built-in nutritional database, offering insights such as calorie counts and macronutrient information. Users receive dietary suggestions tailored to their goals, like balanced meals or high-protein options.

### Cultural Insights Module
The **Cultural Insights Module** enhances the user experience by providing historical and cultural context for each recipe. This module underscores the importance of culinary heritage and educates users on the cultural significance of traditional dishes.
- **Curated Cultural Content**: Each recipe includes an overview of its cultural background, detailing its origins, historical context, and significance within its originating culture. This information is gathered from both research and user contributions.
- **Storytelling Integration**: Users can access stories, anecdotes, or family histories associated with specific recipes, fostering a deeper understanding and appreciation of the dish. This narrative aspect enhances engagement and connection.
- **Dynamic Content Updates**: The Cultural Insights Module is regularly updated with user-submitted stories and facts, creating a living archive of culinary traditions. Moderation ensures the quality, accuracy, and authenticity of the content.

Together, these components offer an immersive, culturally enriched cooking experience that connects users to the world’s culinary heritage. By integrating AI, interactive maps, and cultural storytelling, Axwrld makes global recipes accessible, relevant, engaging, and profoundly personal.


### Tech Stack

1. **Backend** (repository root): Node.js, Express, Mongoose
2. **Database**: MongoDB. `nutrients.json` and `recipe.json` are static data for the AI Chef.
3. **Frontend** (`src/`): React, React-Leaflet and Leaflet, built with Vite
4. **AI Chef** (phase 2): Python, Flask and Ollama (`main.py`)

## Running the recipe map (phase 1)

The recipe map is three processes: MongoDB, the API server (`index.js`), and the Vite frontend. You need Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
```

### 1. MongoDB

The server reads its connection string only from the `MONGODB_URL` environment variable. It refuses to start without it, and no connection string is stored in the repository. Use one of these:

- **Local development database.** `npm run db:dev` starts a MongoDB server on port 27017 using the `mongod` binary that `mongodb-memory-server` downloads. Data is kept in `.mongo-data/`, so recipes survive restarts. Leave it running and use:
  ```bash
  export MONGODB_URL="mongodb://127.0.0.1:27017/axwrld"
  ```
- **Your own MongoDB** (a local install, Docker, or MongoDB Atlas):
  ```bash
  export MONGODB_URL="mongodb+srv://<user>:<password>@<cluster>/axwrld"
  ```

### 2. API server

In a terminal where `MONGODB_URL` is set:

```bash
npm run server
```

The API listens on **http://localhost:5050**. Port 5000 is avoided because macOS uses it for AirPlay Receiver. Optional settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5050` | Port the API listens on |
| `CORS_ORIGIN` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated browser origins allowed to call the API |

Endpoints:

- `GET /recipes` lists saved recipes (newest first) for the map. It returns at most the newest 1000 recipes; there is no pagination yet, and the page says so when the cap is reached.
- `POST /recipes` saves a recipe and returns `201` with it, or `400` with `{ "error": "Invalid fields: …", "fields": { "<field>": "<message>" } }`. Example body:
  ```json
  {
    "name": "Jollof rice",
    "country": "Nigeria",
    "prepTimeMinutes": 75,
    "ingredients": ["rice", "tomato", "scotch bonnet"],
    "steps": "Blend the peppers, fry the base, then simmer the rice in it.",
    "location": { "lat": 6.5244, "lng": 3.3792 }
  }
  ```
  `ingredients` must be a list of individual tags. The server trims each tag, drops empty ones, and removes case-insensitive duplicates (the first spelling is kept). These tags are the training input for the phase-2 AI Chef.

### 3. Frontend

```bash
npm run dev
```

Open **http://localhost:3000**. The frontend calls the API at `http://localhost:5050` by default. If the API runs elsewhere, set `VITE_API_URL` (for example `VITE_API_URL=http://localhost:6060 npm run dev`) and add the frontend's origin to `CORS_ORIGIN`.

On the page:

- Each saved recipe is a marker. Select it (click, or Tab to it and press Enter) to see its name, country, preparation time and ingredients. Its steps are in a collapsed **Steps** section; open it to read them.
- To add a recipe, click the map where the dish comes from. With a keyboard, focus the map, pan with the arrow keys, then choose **Add recipe** to use the centre of the map. While the form is open, **Add recipe** only returns focus to the form; to move the pin, drag it, click the map, or choose **Use map centre**. Add ingredients one at a time with Enter or a comma. The new recipe appears on the map as soon as it is saved.

### Tests and build

```bash
npm test        # API tests (against an in-memory MongoDB) and frontend tests
npm run build   # production build of the frontend into build/
```

## AI Chef (phase 2)

```bash
# Pull the Llama3 model
Ollama pull llama3

# List available models
Ollama list

# Serve the model
Ollama serve

# Run the Llama3 model
Ollama run llama3

# Activate the virtual environment
source venv/bin/activate  # Adjust based on your OS and setup

# Run the main Python application
python3 main.py
```

Test the api calls in postman using POST requests from Scratch.txt
