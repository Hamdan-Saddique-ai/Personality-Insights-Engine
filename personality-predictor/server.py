from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Load questions
with open('questions.json', 'r') as f:
    questions_data = json.load(f)

@app.route('/api/questions', methods=['GET'])
def get_questions():
    return jsonify(questions_data)

@app.route('/api/analyze', methods=['POST'])
def analyze_personality():
    data = request.json
    answers = data.get('answers', [])
    
    trait_scores = {}
    for i, answer_index in enumerate(answers):
        if answer_index is not None and i < len(questions_data['questions']):
            trait = questions_data['questions'][i]['options'][answer_index]['trait']
            trait_scores[trait] = trait_scores.get(trait, 0) + 1
    
    sorted_traits = sorted(trait_scores.items(), key=lambda x: x[1], reverse=True)[:5]
    
    primary_trait = sorted_traits[0][0] if sorted_traits else 'balanced'
    description = questions_data['personality_types'].get(primary_trait, 
        "Your personality is a unique blend of traits.")
    
    return jsonify({
        'primary_trait': primary_trait,
        'traits': dict(sorted_traits),
        'description': description
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)