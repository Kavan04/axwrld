# Axwrld Wiki

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

Together, these components offer an immersive, culturally enriched cooking experience that connects users to the world’s culinary heritage. By integrating AI, interactive maps, and cultural storytelling, Axwrld makes global recipes accessible, relevant, and profoundly personal.
