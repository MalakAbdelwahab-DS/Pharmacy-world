"""Conditions for "Browse by condition".

Each condition lists the therapeutic classes (from the data) that treat it. This is a first
draft to make the page work; Dr. Sakher's pharmacist should review and complete it.
"""

CONDITIONS = [
    {"slug": "pain", "name_en": "Pain", "name_ar": "الألم", "classes": ["Analges", "Anti-inflammatory", "Anti-migraine", "Pain"]},
    {"slug": "fever", "name_en": "Fever", "name_ar": "الحرارة", "classes": ["antipyretic", "fever"]},
    {"slug": "cough", "name_en": "Cough and mucus", "name_ar": "السعال والبلغم", "classes": ["Mucolytic"]},
    {"slug": "allergies", "name_en": "Allergies", "name_ar": "الحساسية", "classes": ["Anti-histamine", "Antiallergic"]},
    {"slug": "asthma", "name_en": "Asthma", "name_ar": "الربو", "classes": ["Anti-asthmatic"]},
    {"slug": "infections", "name_en": "Infections", "name_ar": "الالتهابات", "classes": ["Antibacterial", "Antiinfective", "Antiviral"]},
    {"slug": "stomach", "name_en": "Heartburn and indigestion", "name_ar": "الحموضة وعسر الهضم", "classes": ["Antacid"]},
    {"slug": "high-blood-pressure", "name_en": "High blood pressure", "name_ar": "ارتفاع ضغط الدم", "classes": ["Antihypertensive", "Diuretic"]},
    {"slug": "diabetes", "name_en": "Diabetes", "name_ar": "السكري", "classes": ["Antidiabetic"]},
    {"slug": "cholesterol", "name_en": "High cholesterol", "name_ar": "ارتفاع الكوليسترول", "classes": ["Lipid-modifying"]},
    {"slug": "mental-health", "name_en": "Mood and mental health", "name_ar": "المزاج والصحة النفسية", "classes": ["Antidepressant", "antipsychotic", "Anxiolytic", "ADHD"]},
    {"slug": "skin", "name_en": "Skin conditions", "name_ar": "الأمراض الجلدية", "classes": ["Anti-acne", "Topical corticosteroid"]},
]

BY_SLUG = {c["slug"]: c for c in CONDITIONS}
