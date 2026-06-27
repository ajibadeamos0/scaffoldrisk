# app.py — ScaffoldRisk v1.0 Flask Backend

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from fis_engine import compute_risk

app = Flask(__name__, static_folder='static')
CORS(app)


# ── Serve the frontend dashboard ─────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


# ── Risk assessment API endpoint ──────────────────────────────────────────────
@app.route('/assess', methods=['POST'])
def assess():
    try:
        data = request.get_json()

        # Extract and validate inputs
        wind_speed           = float(data['wind_speed'])
        scaffold_height      = float(data['scaffold_height'])
        foundation_stability = float(data['foundation_stability'])
        service_load         = float(data['service_load'])
        assembly_integrity   = float(data['assembly_integrity'])

        # Clamp values to valid ranges
        wind_speed           = max(0, min(60,  wind_speed))
        scaffold_height      = max(0, min(60,  scaffold_height))
        foundation_stability = max(0, min(10,  foundation_stability))
        service_load         = max(0, min(7,   service_load))
        assembly_integrity   = max(0, min(10,  assembly_integrity))

        # Run FIS computation
        result = compute_risk(
            wind_speed           = wind_speed,
            scaffold_height      = scaffold_height,
            foundation_stability = foundation_stability,
            service_load         = service_load,
            assembly_integrity   = assembly_integrity
        )

        return jsonify({
            'success':  True,
            'score':    result['score'],
            'category': result['category'],
            'color':    result['color'],
            'action':   result['action']
        })

    except KeyError as e:
        return jsonify({
            'success': False,
            'error':   f'Missing input parameter: {str(e)}'
        }), 400

    except Exception as e:
        return jsonify({
            'success': False,
            'error':   str(e)
        }), 500


# ── Health check endpoint ─────────────────────────────────────────────────────
@app.route('/health')
def health():
    return jsonify({'status': 'ScaffoldRisk v1.0 is running'})


if __name__ == '__main__':
    print("=" * 50)
    print("  ScaffoldRisk v1.0 — Starting server...")
    print("  Open your browser at: http://localhost:5000")
    print("=" * 50)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
