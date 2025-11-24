import Header from "@/components/Header";
import EmptyMedicationsState from "@/components/medication/EmptyMedicationsState";
import MedicationFormModal from "@/components/medication/MedicationFormModal";
import MedicationListItem from "@/components/medication/MedicationListItem";
import NextMedicationCard from "@/components/medication/NextMedicationCard";
import { Colors } from "@/constants/Colors";
import { Medication, NextMedication } from "@/types/medication";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface MedicationScreenProps {
  medications: Medication[];
  nextMedication: NextMedication | null;
  onAddMedication: (medication: Omit<Medication, "id">) => void;
  onUpdateMedication: (id: string, medication: Partial<Medication>) => void;
  onDeleteMedication: (id: string) => void;
  onToggleAlarm: (medicationId: string, alarmId: string, enabled: boolean) => void;
}

const MEDICATION_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52C4B8"
];

export default function MedicationScreen({
  medications,
  nextMedication,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
}: MedicationScreenProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  const handleAddMedication = (data: {
    name: string;
    dosage: string;
    instructions: string;
    alarms: any[];
    color: string;
  }) => {
    onAddMedication({
      ...data,
      isActive: true,
    });
    setAddModalVisible(false);
  };

  const handleEditMedication = (data: {
    name: string;
    dosage: string;
    instructions: string;
    alarms: any[];
    color: string;
  }) => {
    if (!selectedMedication) return;
    onUpdateMedication(selectedMedication.id, data);
    setEditModalVisible(false);
    setSelectedMedication(null);
  };

  const handleDeleteMedication = () => {
    if (!selectedMedication) return;
    onDeleteMedication(selectedMedication.id);
  };

  const openEditModal = (medication: Medication) => {
    setSelectedMedication(medication);
    setEditModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 14, paddingTop: 60 }}>
      <Header username="{UserName}" icon="Pill" />
      <ScrollView style={{ flex: 1 }}>
        {/* Next Medication Card */}
        {nextMedication && <NextMedicationCard nextMedication={nextMedication} />}

        {/* Medications List */}
        <View style={{ padding: 20, paddingTop: nextMedication ? 0 : 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.text,
              }}
            >
              Your Medications
            </Text>
            <TouchableOpacity
              onPress={() => setAddModalVisible(true)}
              style={{
                backgroundColor: theme.tint,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={24} color={theme.background} />
            </TouchableOpacity>
          </View>

          {medications.length === 0 ? (
            <EmptyMedicationsState />
          ) : (
            medications.map((medication) => (
              <MedicationListItem
                key={medication.id}
                medication={medication}
                onPress={() => openEditModal(medication)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Medication Modal */}
      <MedicationFormModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddMedication}
        availableColors={MEDICATION_COLORS}
      />

      {/* Edit Medication Modal */}
      <MedicationFormModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedMedication(null);
        }}
        onSave={handleEditMedication}
        onDelete={handleDeleteMedication}
        medication={selectedMedication}
        availableColors={MEDICATION_COLORS}
      />
    </View>
  );
}