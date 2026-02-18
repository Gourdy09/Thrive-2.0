export interface MedicationRow {
  id: string;
  medication_name: string;
  med_class?: string;
  dosage: string;
}

export class MedDurationModel {
  static mapMedNameToClass(medName: string): string {
    const name = medName.toLowerCase();

    if (name.includes("metformin")) return "biguanide";

    if (name.includes("glipizide") || name.includes("glyburide"))
      return "sulfonylurea";

    if (name.includes("insulin")) {
      if (name.includes("glargine") || name.includes("detemir"))
        return "basal_insulin";
      else return "bolus_insulin";
    }

    if (name.includes("liraglutide") || name.includes("exenatide"))
      return "glp1_daily";
    if (name.includes("dulaglutide") || name.includes("semaglutide"))
      return "glp1_weekly";
    if (
      name.includes("sglt2") ||
      name.includes("empagliflozin") ||
      name.includes("dapagliflozin")
    )
      return "sglt2";

    if (name.includes("pioglitazone") || name.includes("rosiglitazone"))
      return "tzd";

    return "other";
  }

  static assignMedClassToRows(meds: MedicationRow[]): MedicationRow[] {
    return meds.map((med) => {
      med.med_class = MedDurationModel.mapMedNameToClass(
        med.medication_name ?? "",
      );
      return med;
    });
  }
}
