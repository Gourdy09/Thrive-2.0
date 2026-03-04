MED_CLASS_MAP = {
    "metformin": "biguanide",
    "glipizide": "sulfonylurea",
    "glimepiride": "sulfonylurea",
    "lantus": "basal_insulin",
    "levemir": "basal_insulin",
    "tresiba": "basal_insulin",
    "humalog": "bolus_insulin",
    "novolog": "bolus_insulin",
    "ozempic": "glp1_weekly",
    "trulicity": "glp1_weekly",
    "victoza": "glp1_daily",
    "jardiance": "sglt2",
    "farxiga": "sglt2",
}


def process_medications(supabase_client, user_id):
    response = (
        supabase_client
        .table("medications")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    meds = response.data or []
    updated_meds = []

    for med in meds:
        if med.get("med_class") is None:
            name = med["medication_name"].lower()
            matched_class = MED_CLASS_MAP.get(name)

            if matched_class:
                (
                    supabase_client
                    .table("medications")
                    .update({"med_class": matched_class})
                    .eq("id", med["id"])
                    .execute()
                )

                med["med_class"] = matched_class

        updated_meds.append(med)

    insulin_med = [
        m for m in updated_meds
        if m.get("med_class") and "insulin" in m["med_class"]
    ]

    med = [
        m for m in updated_meds
        if not (m.get("med_class") and "insulin" in m["med_class"])
    ]

    return med, insulin_med