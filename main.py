from flask import Flask, request, jsonify
from langchain_community.llms import Ollama
import json
import random

app = Flask(__name__)

cached_llm = Ollama(model="llama3")

with open('nutrients.json') as f:
    food_data = json.load(f)

with open('recipe.json') as f:
    recipe_data = json.load(f)

food_items_breakfast = food_data.get("food_items_breakfast", {})
food_items_lunch = food_data.get("food_items_lunch", {})
food_items_dinner = food_data.get("food_items_dinner", {})

def calculate_bmr(weight, height, age, gender):
    if gender == "Male":
        return 9.99 * float(weight) + 6.25 * float(height) - 4.92 * int(age) + 5
    else:
        return 9.99 * float(weight) + 6.25 * float(height) - 4.92 * int(age) - 161

def select_meals(food_database, target_calories=2000, meal_type=None):
    """
    Select meals from the food database to meet target calories
    
    Args:
        food_database (dict): Database of food items with nutritional info
        target_calories (int): Target calories for the meal
        meal_type (str): Type of meal (breakfast/lunch/dinner) for future filtering
    """
    if not food_database:
        return [], 0  # Return empty if no items available
    
    selected_items = []
    total_calories = 0
    attempts = 0
    max_attempts = 100  # Prevent infinite loops
    
    while total_calories < target_calories and attempts < max_attempts:
        # Select random food item
        food_item = random.choice(list(food_database.keys()))
        food_calories = food_database[food_item]["calories"]
        
        # Check if adding this item would exceed target calories
        if total_calories + food_calories <= target_calories:
            selected_items.append(food_item)
            total_calories += food_calories
        
        attempts += 1
    
    return selected_items, total_calories

def generate_meal_plan(food_database, bmr):
    """
    Generate a full day's meal plan based on BMR
    
    Args:
        food_database (dict): Database of food items with nutritional info
        bmr (float): Base Metabolic Rate
    """
    # Calculate target calories for each meal
    calories_breakfast = round(bmr * 0.5)
    calories_lunch = round(bmr * (1/3))
    calories_dinner = round(bmr * (1/6))
    
    # Generate meals
    breakfast_items, breakfast_calories = select_meals(food_database, calories_breakfast, "breakfast")
    lunch_items, lunch_calories = select_meals(food_database, calories_lunch, "lunch")
    dinner_items, dinner_calories = select_meals(food_database, calories_dinner, "dinner")
    
    # Calculate nutritional totals for each meal
    def calculate_meal_nutrition(items, database):
        totals = {
            "calories": 0,
            "protein": 0,
            "fat": 0,
            "carbohydrates": 0,
            "fiber": 0,
            "sugar": 0
        }
        for item in items:
            for nutrient in totals:
                totals[nutrient] += database[item][nutrient]
        return totals
    
    result = {
        "breakfast": {
            "items": breakfast_items,
            "nutrition": calculate_meal_nutrition(breakfast_items, food_database),
            "calories": breakfast_calories
        },
        "lunch": {
            "items": lunch_items,
            "nutrition": calculate_meal_nutrition(lunch_items, food_database),
            "calories": lunch_calories
        },
        "dinner": {
            "items": dinner_items,
            "nutrition": calculate_meal_nutrition(dinner_items, food_database),
            "calories": dinner_calories
        }
    }
    
    # Calculate daily totals
    daily_totals = {
        "calories": 0,
        "protein": 0,
        "fat": 0,
        "carbohydrates": 0,
        "fiber": 0,
        "sugar": 0
    }
    
    for meal in result.values():
        for nutrient in daily_totals:
            daily_totals[nutrient] += meal["nutrition"][nutrient]
    
    result["daily_totals"] = daily_totals
    
    return result

@app.route("/ai", methods=["POST"])
def aiPost():
    print("Post /ai called")
    json_content = request.json
    query = json_content.get("query")

    print(f"query: {query}")

    response = cached_llm.invoke(query)

    print("==========Response===========")
    print(response)

    response_answer = {"answer": response}
    return response_answer

@app.route("/meal_plan", methods=["POST"])
def meal_plan():
    data = request.json
    age = data.get("age")
    weight = data.get("weight")
    height = data.get("height")
    gender = data.get("gender")
    countries = data.get("countries",{})

    if not all([age, weight, height, gender]):
        return jsonify({"error": "Missing parameters"}), 400

    if(not countries):
        countries = "any"

    
    bmr = calculate_bmr(weight, height, age, gender)
    meal_plan = generate_meal_plan(food_data, bmr)
    raw_query = f"""Give me a JSON ONLY (Dont say Here is Json) containing 3 recipes for different meals of the day namely breakfast, lunch and dinner using the following ingredients. The dishes must belong to the country {countries} and include associated nutritional information. give me a longer recipe desciption with steps involved. ONLY GIVE ME THE JSON which contains the object {{'calories':..., 'nutrition':dict(), 'ingredients':list, 'recipe':...}} for each meal. DO NOT INCLUDE AN INTRODUCTION/CONCLUSION IN THE RESPONSE, ie anything before and after the curly braces {meal_plan}"""
    response = cached_llm.invoke(raw_query)

    result = {
        "bmr": round(bmr, 2),
        "meal_plan": response
    }
    return jsonify(result)
    


@app.route("/")
def test():
    return "Hello World"

def start_app():
    app.run(host="0.0.0.0", port=8080, debug=True)

if __name__ == "__main__":
    start_app()
