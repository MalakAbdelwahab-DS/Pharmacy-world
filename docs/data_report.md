# Sample data report

Rows: 265 · Medicines (trade names): 109

## Empty values per column

| Column | Empty | Of |
|---|---|---|
| Trade Name (AR) | 265 | 265 |
| Manufacturer | 2 | 265 |
| Country of Origin | 2 | 265 |
| Price | 25 | 265 |
| Currency | 25 | 265 |
| Rx / OTC | 1 | 265 |
| ATC Code | 6 | 265 |
| Therapeutic Class | 5 | 265 |
| Registration No. | 265 | 265 |
| Notes | 265 | 265 |

## Strengths stored as numbers

Excel converted these to numbers, probably from percentages (0.1% → 0.001). Set the Strength column to Text and re-enter them.

- Acetocaustin · Solution: `0.5`
- Acretin · Cream: `0.00025`
- Acretin · Cream: `0.0005`
- Acular L.S · Eye drops: `0.004`
- Acuvail · Eye drops: `0.0045`
- Adrenaline · Injection: `0.001`
- Advantan · Cream: `0.001`
- Advantan · Ointment: `0.001`
- Aethoxysklerol · Injection: `0.005`
- Aethoxysklerol · Injection: `0.01`
- Aethoxysklerol · Injection: `0.03`
- Aldara · Cream: `0.05`
- Alfacort · Cream: `0.01`
- Alfacort · cream: `0.01`
- Alfacort · Ointment: `0.01`
- Alfacort · Ointment: `0.01`
- Alivio · Nasal spray: `0.0005`
- Allezine  · Solution: `0.001`
- Allezine  · Solution: `0.001`
- Alphagan · Eye drops: `0.002`
- Alphagan P · Eye drops: `0.0015`
- Amrox · Syrup: `0.003`
- Amrox · Syrup: `0.003`

## Inconsistent spellings (fixed automatically on import)

- Dosage Form: Cream, Other, Syrup, Tablet, cream, other, syrup, tablet
- Route: Oral, oral
- Currency: `JD` is stored as `JOD`

## Rows without a price (25)

- Abilify 15 mg Tablet, 30 tablet
- Acetocaustin 0.5 Solution, 2 ml
- Aclasta 5 mg / 100 ml Injection, 100 ml
- Actemra 80 mg / 4 ml Injection, 1 vial
- Actonel 35 mg Tablet, 4 tablet
- Acurmil 50 mg / 5 ml Injection, 5 Ampoules
- Adacel 0.5 ml / dose Injection, 1 vial
- Adenocor 6 mg / 2 ml Injection, 6 vials
- Adrenaline 0.001 Injection, 10 amp * 1 ml
- Adrenaline 1 mg / 1 ml Injection, 50 amp * 1 ml
- Advagraf 1 mg Capsule, 100 capsule
- Advagraf 3 mg Capsule, 100 capsule
- Advagraf 5 mg Capsule, 100 capsule
- Aethoxysklerol 0.005 Injection, 5 amp * 2 ml
- Aethoxysklerol 0.01 Injection, 5 amp * 2 ml
- Aethoxysklerol 0.03 Injection, 5 amp * 2 ml
- Afinitor 5 mg Tablet, 30 tablet
- Afinitor 10 mg Tablet, 30 tablet
- Aimovig 70 mg / ml Injection, 1 PFP
- Aimovig 140 mg / ml Injection, 1 PFP
- Alimta 500 mg Injection, 1 vial
- Almiral 25 mg Tablet, 30 tablet
- Alpeen 4000 IU / ml Injection, 5 vial
- Amgevita 20 mg / 0.4 ml Injection, 1 PFS
- Amgevita 40 mg / 0.8 ml Injection, 2 PFS

## Ingredient names written in different ways

- Metformin HCL / Metformin Hcl
- Ceftizoxime Sodium / ceftizoxime Sodium

## Fields the website needs that are not in the data yet

| Field | Used for |
|---|---|
| Arabic ingredient names | Ingredient pages and Arabic search |
| Clinical sections (uses, dosage, side effects, warnings) | Medicine page tabs and the AI assistant |
| Reference and date for each clinical section | Shown under every clinical section |
| Structured usual adult dose (OTC only) | Dosing timeline |
| Status (active / discontinued) | Discontinued medicine page |
| Priority (paid placement) | Sponsored order in search and categories |
| Price includes VAT (yes / no) | Public price label |
| Pack photo | Medicine cards and pages |
| Public category (grouping of therapeutic classes) | Browse by category |
