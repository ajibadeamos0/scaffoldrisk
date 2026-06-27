import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import warnings
warnings.filterwarnings("ignore")

def build_fis():
    """Build and return the ScaffoldRisk v1.0 Fuzzy Inference System."""

    # ── UNIVERSES ────────────────────────────────────────────────────────────
    wind   = ctrl.Antecedent(np.arange(0, 61, 1),    "wind_speed")
    height = ctrl.Antecedent(np.arange(0, 61, 1),    "scaffold_height")
    found  = ctrl.Antecedent(np.arange(0, 10.1, 0.1),"foundation_stability")
    load   = ctrl.Antecedent(np.arange(0, 7.1, 0.1), "service_load")
    assemb = ctrl.Antecedent(np.arange(0, 10.1, 0.1),"assembly_integrity")
    risk   = ctrl.Consequent(np.arange(0, 10.1, 0.1),"risk_index")

    # ── MEMBERSHIP FUNCTIONS ─────────────────────────────────────────────────

    # Wind Speed (km/h)
    wind["VL"] = fuzz.trapmf(wind.universe, [0,  0,  10, 20])
    wind["L"]  = fuzz.trimf(wind.universe,  [10, 20, 30])
    wind["M"]  = fuzz.trimf(wind.universe,  [20, 30, 40])
    wind["H"]  = fuzz.trimf(wind.universe,  [30, 48, 58])
    wind["VH"] = fuzz.trapmf(wind.universe, [50, 58, 60, 60])

    # Scaffold Height (m)
    height["VL"] = fuzz.trapmf(height.universe, [0,  0,  6,  12])
    height["L"]  = fuzz.trimf(height.universe,  [6,  15, 24])
    height["M"]  = fuzz.trimf(height.universe,  [15, 30, 42])
    height["H"]  = fuzz.trimf(height.universe,  [30, 45, 55])
    height["VH"] = fuzz.trapmf(height.universe, [45, 55, 60, 60])

    # Foundation Stability (0-10)
    found["P"]  = fuzz.trapmf(found.universe, [0, 0, 2, 4])
    found["F"]  = fuzz.trimf(found.universe,  [2, 4, 6])
    found["G"]  = fuzz.trimf(found.universe,  [4, 6, 8])
    found["VG"] = fuzz.trimf(found.universe,  [6, 8, 9])
    found["E"]  = fuzz.trapmf(found.universe, [8, 9, 10, 10])

    # Service Load (kN/m2)
    load["VL"] = fuzz.trapmf(load.universe, [0,    0,    0.75, 1.5])
    load["L"]  = fuzz.trimf(load.universe,  [0.75, 1.5,  2.5])
    load["M"]  = fuzz.trimf(load.universe,  [1.5,  3.0,  4.5])
    load["H"]  = fuzz.trimf(load.universe,  [3.5,  5.0,  6.0])
    load["VH"] = fuzz.trapmf(load.universe, [5.0,  6.0,  7.0, 7.0])

    # Assembly Integrity (0-10)
    assemb["P"]  = fuzz.trapmf(assemb.universe, [0, 0, 2, 3])
    assemb["F"]  = fuzz.trimf(assemb.universe,  [2, 4, 6])
    assemb["G"]  = fuzz.trimf(assemb.universe,  [4, 6, 8])
    assemb["VG"] = fuzz.trimf(assemb.universe,  [6, 8, 9])
    assemb["E"]  = fuzz.trapmf(assemb.universe, [8, 9, 10, 10])

    # Risk Index Output
    risk["VL"] = fuzz.trapmf(risk.universe, [0,   0,   1,   2])
    risk["L"]  = fuzz.trimf(risk.universe,  [1,   2.5, 4.5])
    risk["M"]  = fuzz.trimf(risk.universe,  [3,   5,   7])
    risk["H"]  = fuzz.trimf(risk.universe,  [5,   6.5, 8])
    risk["VH"] = fuzz.trapmf(risk.universe, [6.5, 8,   10,  10])

    # ── RULES ────────────────────────────────────────────────────────────────

    # Critical (Very High output)
    r1  = ctrl.Rule(wind["VH"],                                              risk["VH"])
    r2  = ctrl.Rule(height["VH"] & assemb["P"],                              risk["VH"])
    r3  = ctrl.Rule(wind["VH"]   & height["VH"],                             risk["VH"])
    r4  = ctrl.Rule(load["VH"]   & found["P"],                               risk["VH"])
    r5  = ctrl.Rule(assemb["P"]  & height["H"]  & wind["H"],                 risk["VH"])
    r6  = ctrl.Rule(found["P"]   & height["VH"] & wind["H"],                 risk["VH"])
    r7  = ctrl.Rule(wind["H"]    & assemb["P"]  & load["H"],                 risk["VH"])
    r8  = ctrl.Rule(height["VH"] & load["VH"]   & found["P"],                risk["VH"])
    r9  = ctrl.Rule(wind["VH"]   & found["P"],                               risk["VH"])
    r10 = ctrl.Rule(wind["VH"]   & assemb["P"],                              risk["VH"])
    r11 = ctrl.Rule(wind["VH"]   & load["VH"],                               risk["VH"])
    r12 = ctrl.Rule(height["VH"] & found["P"]   & load["VH"],                risk["VH"])
    r13 = ctrl.Rule(wind["VH"]   & height["VH"] & found["P"] & assemb["P"],  risk["VH"])
    r14 = ctrl.Rule(wind["VH"]   & height["VH"] & load["VH"],                risk["VH"])
    r15 = ctrl.Rule(found["P"]   & load["VH"]   & assemb["P"],               risk["VH"])
    r16 = ctrl.Rule(height["VH"] & assemb["P"]  & load["VH"],                risk["VH"])

    # High output
    r17 = ctrl.Rule(wind["H"]    & height["H"],                              risk["H"])
    r18 = ctrl.Rule(assemb["P"]  & load["H"],                                risk["H"])
    r19 = ctrl.Rule(found["P"]   & assemb["F"],                              risk["H"])
    r20 = ctrl.Rule(height["H"]  & load["H"]    & found["F"],                risk["H"])
    r21 = ctrl.Rule(wind["H"]    & assemb["F"]  & height["H"],               risk["H"])
    r22 = ctrl.Rule(load["H"]    & assemb["F"]  & wind["M"],                 risk["H"])
    r23 = ctrl.Rule(found["P"]   & wind["H"],                                risk["H"])
    r24 = ctrl.Rule(assemb["F"]  & height["VH"] & load["M"],                 risk["H"])
    r25 = ctrl.Rule(wind["M"]    & height["H"]  & assemb["P"],               risk["H"])
    r26 = ctrl.Rule(load["VH"]   & assemb["F"],                              risk["H"])
    r27 = ctrl.Rule(height["VH"] & wind["M"]    & found["F"],                risk["H"])
    r28 = ctrl.Rule(found["P"]   & load["M"]    & height["H"],               risk["H"])
    r29 = ctrl.Rule(height["VH"] & assemb["G"],                              risk["H"])
    r30 = ctrl.Rule(wind["H"]    & height["L"]  & assemb["G"],               risk["H"])
    r31 = ctrl.Rule(wind["M"]    & height["M"]  & load["M"] & assemb["F"],   risk["H"])
    r32 = ctrl.Rule(height["H"]  & load["H"]    & found["F"],                risk["H"])
    r33 = ctrl.Rule(wind["H"]    & (height["L"] | height["M"]),              risk["H"])

    # Moderate output
    r34 = ctrl.Rule(wind["M"]    & height["M"]  & assemb["G"],               risk["M"])
    r35 = ctrl.Rule(load["M"]    & found["F"],                               risk["M"])
    r36 = ctrl.Rule(height["H"]  & assemb["G"]  & wind["L"],                 risk["M"])
    r37 = ctrl.Rule(found["F"]   & load["M"]    & assemb["G"],               risk["M"])
    r38 = ctrl.Rule(assemb["F"]  & wind["L"]    & height["M"],               risk["M"])
    r39 = ctrl.Rule(load["H"]    & found["G"]   & assemb["G"],               risk["M"])
    r40 = ctrl.Rule(wind["M"]    & found["F"]   & height["M"],               risk["M"])
    r41 = ctrl.Rule(assemb["F"]  & load["M"]    & height["H"],               risk["M"])
    r42 = ctrl.Rule(height["M"]  & wind["M"]    & load["L"],                 risk["M"])
    r43 = ctrl.Rule(found["F"]   & wind["H"]    & load["L"],                 risk["M"])
    r44 = ctrl.Rule(assemb["F"]  & found["G"]   & wind["M"],                 risk["M"])
    r45 = ctrl.Rule(assemb["P"]  & height["L"],                              risk["M"])

    # Low output
    r46 = ctrl.Rule(wind["L"]    & height["L"]  & assemb["G"],               risk["L"])
    r47 = ctrl.Rule(load["L"]    & found["G"]   & wind["L"],                 risk["L"])
    r48 = ctrl.Rule(assemb["G"]  & height["L"]  & load["L"],                 risk["L"])
    r49 = ctrl.Rule(wind["L"]    & found["G"]   & assemb["G"],               risk["L"])
    r50 = ctrl.Rule(height["M"]  & assemb["VG"] & load["L"],                 risk["L"])
    r51 = ctrl.Rule(wind["VL"]   & height["M"]  & load["M"],                 risk["L"])
    r52 = ctrl.Rule(found["G"]   & assemb["VG"] & wind["L"],                 risk["L"])
    r53 = ctrl.Rule(load["L"]    & height["L"]  & wind["VL"],                risk["L"])
    r54 = ctrl.Rule(assemb["G"]  & found["VG"]  & load["M"],                 risk["L"])
    r55 = ctrl.Rule(wind["VL"]   & assemb["VG"] & height["L"],               risk["L"])

    # Very Low output
    r56 = ctrl.Rule(wind["VL"]   & height["VL"] & found["E"] &
                    load["VL"]   & assemb["E"],                              risk["VL"])
    r57 = ctrl.Rule(wind["VL"]   & assemb["VG"] & load["VL"] &
                    height["VL"],                                            risk["VL"])
    r58 = ctrl.Rule(height["VL"] & load["VL"]   & wind["VL"],               risk["VL"])
    r59 = ctrl.Rule(found["E"]   & assemb["E"]  & wind["VL"],               risk["VL"])
    r60 = ctrl.Rule(wind["VL"]   & height["L"]  & load["VL"] &
                    assemb["VG"],                                            risk["VL"])
    r61 = ctrl.Rule(found["E"]   & height["VL"] & wind["L"],                risk["VL"])
    r62 = ctrl.Rule(assemb["E"]  & wind["VL"]   & load["L"],                risk["VL"])
    r63 = ctrl.Rule(found["VG"]  & assemb["VG"] & height["VL"] &
                    wind["VL"],                                              risk["VL"])

    # ── BUILD CONTROL SYSTEM ─────────────────────────────────────────────────
    all_rules = [r1,  r2,  r3,  r4,  r5,  r6,  r7,  r8,  r9,  r10,
                 r11, r12, r13, r14, r15, r16, r17, r18, r19, r20,
                 r21, r22, r23, r24, r25, r26, r27, r28, r29, r30,
                 r31, r32, r33, r34, r35, r36, r37, r38, r39, r40,
                 r41, r42, r43, r44, r45, r46, r47, r48, r49, r50,
                 r51, r52, r53, r54, r55, r56, r57, r58, r59, r60,
                 r61, r62, r63]

    scaffold_ctrl = ctrl.ControlSystem(all_rules)
    scaffold_sim  = ctrl.ControlSystemSimulation(scaffold_ctrl)

    return scaffold_sim


def classify_risk(score):
    """Return risk category and site action from Risk Index score."""
    if score <= 2.0:
        return {
            "category": "Very Low",
            "color":    "green",
            "action":   "Scaffold is within safe operational parameters. Proceed with routine inspection schedule."
        }
    elif score <= 4.0:
        return {
            "category": "Low",
            "color":    "green",
            "action":   "Low risk detected. Monitor conditions closely. Increase inspection frequency to every 4 hours."
        }
    elif score <= 6.0:
        return {
            "category": "Moderate",
            "color":    "amber",
            "action":   "Moderate risk. Implement corrective measures. Address the highest-scoring input variable immediately."
        }
    elif score <= 8.0:
        return {
            "category": "High",
            "color":    "orange",
            "action":   "High risk. Suspend non-essential operations. Reinforce bracing and reassess foundation conditions."
        }
    else:
        return {
            "category": "Very High",
            "color":    "red",
            "action":   "CRITICAL — Evacuate scaffold immediately. Do not resume operations until a qualified structural engineer has conducted a full inspection and issued written clearance."
        }


def compute_risk(wind_speed, scaffold_height, foundation_stability,
                 service_load, assembly_integrity):
    """
    Compute Risk Index for given site parameters.
    Returns dict with score, category, color, and action.
    """
    sim = build_fis()
    sim.input["wind_speed"]           = wind_speed
    sim.input["scaffold_height"]      = scaffold_height
    sim.input["foundation_stability"] = foundation_stability
    sim.input["service_load"]         = service_load
    sim.input["assembly_integrity"]   = assembly_integrity
    sim.compute()
    score = round(sim.output["risk_index"], 2)
    result = classify_risk(score)
    result["score"] = score
    return result


if __name__ == "__main__":
    # Quick self-test
    test = compute_risk(
        wind_speed=58,
        scaffold_height=25,
        foundation_stability=6.0,
        service_load=3.0,
        assembly_integrity=6.0
    )
    print(f"Self-test result: {test}")
