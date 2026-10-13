# app.py — ScaffoldRisk v1.0 Flask Backend
import os
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

        # ── Formula-aware directive ───────────────────────────────────────
        action = result['action']

        # Append the most critical formula breach to the directive
        if result['score'] >= 6.0:
            breaches = []

            # Check wind (q = 0.5 * rho * v^2 * Cd)
            v_ms = wind_speed / 3.6
            qz   = 0.5 * 1.225 * (v_ms**2) * 1.3
            if qz > 600:
                breaches.append(
                    f"Wind pressure q_z = {qz:.0f} N/m² — "
                    f"lateral tie reinforcement mandatory (BS EN 1991-1-4)"
                )

            # Check buckling (Pcr = pi^2 * E * I / Le^2)
            import math
            Le  = 0.85 * scaffold_height * 1000  # mm
            if Le > 0:
                Pcr = (math.pi**2 * 210000 * 121900) / (Le**2) / 1000  # kN
                if Pcr < 15:
                    breaches.append(
                        f"Euler buckling load P_cr = {Pcr:.1f} kN — "
                        f"critically low; intermediate bracing required immediately"
                    )

            # Check bearing pressure
            P_est    = (service_load * 2.4 * 2.4) + 5
            q_actual = P_est / 0.0225
            q_all    = 20 + (foundation_stability / 10) * 280
            if q_actual > q_all:
                breaches.append(
                    f"Bearing pressure q_actual = {q_actual:.0f} kN/m² "
                    f"exceeds q_all = {q_all:.0f} kN/m² — "
                    f"install timber sole boards immediately"
                )

            # Check coupler slip
            mu = 0.15 + (assembly_integrity / 10) * 0.30
            Fs = mu * 6.7
            if Fs < 1.5:
                breaches.append(
                    f"Coupler slip resistance F_s = {Fs:.2f} kN — "
                    f"below safe threshold; re-torque all couplers to 50 Nm"
                )

            if breaches:
                action += " | Engineering alerts: " + "; ".join(breaches)

        return jsonify({
            'success':  True,
            'score':    result['score'],
            'category': result['category'],
            'color':    result['color'],
            'action':   action
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
