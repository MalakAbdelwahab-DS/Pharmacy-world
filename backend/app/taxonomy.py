"""Public categories and conditions, as designed in Figma.

Each one lists the therapeutic classes (exactly as written in the data) that belong to it.
This is a first mapping; Dr. Sakher's pharmacist should review it. Classes not listed here
(for example cancer medicines or immunosuppressants) stay searchable but are not browsable yet.
"""

CATEGORIES = [
    {"slug": "painkillers", "name_en": "Painkillers", "name_ar": "مسكنات الألم",
     "text_en": "Medicines that relieve pain or bring down a fever.", "text_ar": "أدوية تخفف الألم أو تخفض الحرارة.",
     "classes": ["Analgesic", "Analgesics and antipyretics", "non-opioid analgesic", "Anti-inflammatory + Anti-rheumatic agents",
                 "Anti-migraine", "Topical analgesics", "Muscle relaxant", "Antigout", "Local anesthetics"]},
    {"slug": "antacids-stomach", "name_en": "Antacids & stomach", "name_ar": "مضادات الحموضة والمعدة",
     "text_en": "Medicines for heartburn, indigestion and the gut.", "text_ar": "أدوية للحموضة وعسر الهضم والأمعاء.",
     "classes": ["Antacid", "Laxatives"]},
    {"slug": "heart-blood-pressure", "name_en": "Heart & blood pressure", "name_ar": "القلب وضغط الدم",
     "text_en": "Medicines for blood pressure, cholesterol and heart rhythm.", "text_ar": "أدوية لضغط الدم والكوليسترول ونظم القلب.",
     "classes": ["Antihypertensive", "Diuretic", "Anti-arrhythmic agent", "Antiplatelet", "Lipid-modifying agents", "Antivaricose agents"]},
    {"slug": "eye-ear", "name_en": "Eye & ear", "name_ar": "العين والأذن",
     "text_en": "Eye drops and medicines for the eye and ear.", "text_ar": "قطرات وأدوية للعين والأذن.",
     "classes": ["Antiglaucoma", "Ophthalmic NSAIDs", "Carbonic Anhydrase Inhibitor"]},
    {"slug": "antibiotics", "name_en": "Antibiotics", "name_ar": "المضادات الحيوية",
     "text_en": "Medicines that treat infections.", "text_ar": "أدوية تعالج الالتهابات.",
     "classes": ["Antibacterial", "Antiinfectives", "Antiviral", "Antimalarials"]},
    {"slug": "cough-cold", "name_en": "Cough & cold", "name_ar": "السعال والزكام",
     "text_en": "Medicines for cough, blocked nose and breathing.", "text_ar": "أدوية للسعال واحتقان الأنف والتنفس.",
     "classes": ["Mucolytics", "Decongestant corticosteroid", "Anti-asthmatic agents"]},
    {"slug": "diabetes", "name_en": "Diabetes", "name_ar": "السكري",
     "text_en": "Medicines that lower blood sugar.", "text_ar": "أدوية تخفض سكر الدم.",
     "classes": ["Antidiabetic"]},
    {"slug": "mental-health-sleep", "name_en": "Mental health & sleep", "name_ar": "الصحة النفسية والنوم",
     "text_en": "Medicines for mood, anxiety, focus, sleep and seizures.", "text_ar": "أدوية للمزاج والقلق والتركيز والنوم والصرع.",
     "classes": ["Antidepressants", "Antipsychotic", "Atypical antipsychotics", "Anxiolytic", "ADHD Agents", "Antiepileptics", "Anti-dementia"]},
    {"slug": "antihistamines", "name_en": "Antihistamines", "name_ar": "مضادات الهيستامين",
     "text_en": "Medicines for allergies, hay fever and itching.", "text_ar": "أدوية للحساسية وحمى القش والحكة.",
     "classes": ["Anti-histamine", "Antiallergic agents"]},
    {"slug": "vitamins-supplements", "name_en": "Vitamins & supplements", "name_ar": "الفيتامينات والمكملات",
     "text_en": "Vitamins, minerals and supplements.", "text_ar": "فيتامينات ومعادن ومكملات غذائية.",
     "classes": ["Antianemic agents"]},
    {"slug": "skin", "name_en": "Skin treatments", "name_ar": "علاجات البشرة",
     "text_en": "Creams and medicines for acne, eczema and other skin problems.", "text_ar": "كريمات وأدوية لحب الشباب والإكزيما ومشاكل البشرة الأخرى.",
     "classes": ["Anti-acne", "Topical corticosteroids"]},
    {"slug": "hormones-contraception", "name_en": "Hormones & contraception", "name_ar": "الهرمونات ومنع الحمل",
     "text_en": "Hormone medicines and contraception.", "text_ar": "أدوية الهرمونات ومنع الحمل.",
     "classes": ["Androgen", "Antiandrogen", "Progestogens"]},
]

CONDITIONS = [
    {"slug": "headache", "name_en": "Headache", "name_ar": "الصداع", "desc_en": "Tension headaches and migraines", "desc_ar": "صداع التوتر والشقيقة",
     "classes": ["Analgesic", "Analgesics and antipyretics", "non-opioid analgesic", "Anti-migraine"]},
    {"slug": "fever", "name_en": "Fever", "name_ar": "الحرارة", "desc_en": "High temperature, chills, sweating", "desc_ar": "ارتفاع الحرارة والقشعريرة والتعرق",
     "classes": ["Analgesics and antipyretics", "non-opioid analgesic"]},
    {"slug": "allergies", "name_en": "Allergies", "name_ar": "الحساسية", "desc_en": "Hay fever, itchy eyes, hives", "desc_ar": "حمى القش وحكة العين والشرى",
     "classes": ["Anti-histamine", "Antiallergic agents"]},
    {"slug": "heartburn-reflux", "name_en": "Heartburn & reflux", "name_ar": "الحموضة والارتجاع", "desc_en": "Burning chest, acid taste, indigestion", "desc_ar": "حرقة في الصدر وطعم حامض وعسر هضم",
     "classes": ["Antacid"]},
    {"slug": "cold-flu", "name_en": "Cold & flu", "name_ar": "الزكام والإنفلونزا", "desc_en": "Blocked nose, sore throat, body aches", "desc_ar": "انسداد الأنف والتهاب الحلق وآلام الجسم",
     "classes": ["Decongestant corticosteroid", "Analgesics and antipyretics"]},
    {"slug": "cough", "name_en": "Cough", "name_ar": "السعال", "desc_en": "Dry cough, chesty cough, tickly throat", "desc_ar": "سعال جاف وسعال مع بلغم وتهيج الحلق",
     "classes": ["Mucolytics"]},
    {"slug": "high-blood-pressure", "name_en": "High blood pressure", "name_ar": "ارتفاع ضغط الدم", "desc_en": "Hypertension, raised readings, heart health", "desc_ar": "ارتفاع الضغط وصحة القلب",
     "classes": ["Antihypertensive", "Diuretic"]},
    {"slug": "diabetes", "name_en": "Diabetes", "name_ar": "السكري", "desc_en": "Type 1, type 2, high blood sugar", "desc_ar": "النوع الأول والثاني وارتفاع سكر الدم",
     "classes": ["Antidiabetic"]},
    {"slug": "acne", "name_en": "Acne", "name_ar": "حب الشباب", "desc_en": "Spots, blackheads, breakouts", "desc_ar": "حبوب ورؤوس سوداء وبثور",
     "classes": ["Anti-acne"]},
    {"slug": "eczema-dry-skin", "name_en": "Eczema & dry skin", "name_ar": "الإكزيما وجفاف الجلد", "desc_en": "Itchy skin, dry patches, redness", "desc_ar": "حكة وبقع جافة واحمرار",
     "classes": ["Topical corticosteroids"]},
    {"slug": "period-pain", "name_en": "Period pain", "name_ar": "آلام الدورة الشهرية", "desc_en": "Cramps, lower back pain, discomfort", "desc_ar": "تقلصات وألم أسفل الظهر وانزعاج",
     "classes": ["Analgesic", "Anti-inflammatory + Anti-rheumatic agents"]},
    {"slug": "muscle-joint-pain", "name_en": "Muscle & joint pain", "name_ar": "آلام العضلات والمفاصل", "desc_en": "Strains, back pain, arthritis", "desc_ar": "الشد العضلي وآلام الظهر والتهاب المفاصل",
     "classes": ["Anti-inflammatory + Anti-rheumatic agents", "Muscle relaxant", "Topical analgesics", "Antigout"]},
]

CATEGORY_BY_SLUG = {c["slug"]: c for c in CATEGORIES}
CONDITION_BY_SLUG = {c["slug"]: c for c in CONDITIONS}


def classes_lower(item):
    return [c.lower() for c in item["classes"]]


def matches(item, therapeutic_class):
    return bool(therapeutic_class) and therapeutic_class.lower() in classes_lower(item)


def public(item, extra=None):
    """The fields the website needs (without the class mapping)."""
    out = {k: v for k, v in item.items() if k != "classes"}
    return {**out, **(extra or {})}
