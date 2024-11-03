import React, { useState } from 'react';

function RecipeForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        time: '',
        ingredients: '',
        recipe: ''
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="recipe-form">
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Recipe Name" onChange={handleChange} value={formData.name} required />
                <input type="text" name="country" placeholder="Country" onChange={handleChange} value={formData.country} required />
                <input type="text" name="time" placeholder="Preparation Time" onChange={handleChange} value={formData.time} required />
                <textarea name="ingredients" placeholder="Ingredients" onChange={handleChange} value={formData.ingredients} required></textarea>
                <textarea name="recipe" placeholder="Recipe" onChange={handleChange} value={formData.recipe} required></textarea>
                <button type="submit">Submit</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    );
}

export default RecipeForm;



