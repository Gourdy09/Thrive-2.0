import ColorPicker from "@/components/medication/ColorPicker";
import RemindersList from "@/components/medication/RemindersList";
import { Colors } from "@/constants/Colors";
import { DayOfWeek, Medication, MedicationAlarm } from "@/types/medication";
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface MedicationFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    dosage: string;
    instructions: string;
    alarms: MedicationAlarm[];
    color: string;
  }) => void;
  onDelete?: () => void;
  medication?: Medication | null;
  availableColors: string[];
}

export default function MedicationFormModal({
  visible,
  onClose,
  onSave,
  onDelete,
  medication,
  availableColors,
}: MedicationFormModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const isEditMode = !!medication;

  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [alarms, setAlarms] = useState<MedicationAlarm[]>([]);
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);

  useEffect(() => {
    if (medication) {
      setMedicationName(medication.name);
      setDosage(medication.dosage);
      setInstructions(medication.instructions);
      setAlarms(medication.alarms);
      setSelectedColor(medication.color);
    }
  }, [medication]);

  const resetForm = () => {
    setMedicationName("");
    setDosage("");
    setInstructions("");
    setAlarms([]);
    setSelectedColor(availableColors[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert("Error", "Please enter a medication name");
      return;
    }

    onSave({
      name: medicationName,
      dosage,
      instructions,
      alarms,
      color: selectedColor,
    });

    resetForm();
  };

  const handleDelete = () => {
    if (onDelete && medication) {
      Alert.alert(
        "Delete Medication",
        `Are you sure you want to delete ${medication.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              onDelete();
              handleClose();
            },
          },
        ]
      );
    }
  };

  const addAlarm = () => {
    const allDays: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const newAlarm: MedicationAlarm = {
      id: Date.now().toString(),
      time: "09:00", // 9:00 AM in 24-hour format
      enabled: true,
      days: allDays, // Default to every day
    };
    setAlarms([...alarms, newAlarm]);
  };

  const updateAlarm = (id: string, updatedAlarm: MedicationAlarm) => {
    setAlarms(alarms.map(alarm => alarm.id === id ? updatedAlarm : alarm));
  };

  const removeAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
          }}
        >
          <ScrollView style={{ padding: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {isEditMode ? "Edit Medication" : "Add Medication"}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <X color={theme.icon}/>
              </TouchableOpacity>
            </View>

            {/* Medication Name */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 8,
                }}
              >
                Medication Name *
              </Text>
              <TextInput
                value={medicationName}
                onChangeText={setMedicationName}
                placeholder="e.g., Metformin"
                placeholderTextColor={theme.icon}
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  borderWidth: 2,
                  borderRadius: 12,
                  padding: 16,
                  color: theme.text,
                  fontSize: 16,
                  borderColor: theme.border,
                }}
              />
            </View>

            {/* Dosage */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 8,
                }}
              >
                Dosage
              </Text>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 500mg"
                placeholderTextColor={theme.icon}
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  borderWidth: 2,
                  borderRadius: 12,
                  padding: 16,
                  color: theme.text,
                  fontSize: 16,
                  borderColor: theme.border,
                }}
              />
            </View>

            {/* Instructions */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 8,
                }}
              >
                Instructions
              </Text>
              <TextInput
                value={instructions}
                onChangeText={setInstructions}
                placeholder="e.g., Take with food"
                placeholderTextColor={theme.icon}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  borderWidth: 2,
                  borderRadius: 12,
                  padding: 16,
                  color: theme.text,
                  fontSize: 16,
                  borderColor: theme.border,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Color Picker */}
            <ColorPicker
              colors={availableColors}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            {/* Reminders */}
            <RemindersList
              alarms={alarms}
              onAddAlarm={addAlarm}
              onUpdateAlarm={updateAlarm}
              onRemoveAlarm={removeAlarm}
            />

            {/* Delete Button (Edit mode only) */}
            {isEditMode && onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  backgroundColor: "#FF6B6B20",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: "#FF6B6B",
                }}
              >
                <Text style={{ color: "#FF6B6B", fontWeight: "700", fontSize: 16 }}>
                  Delete Medication
                </Text>
              </TouchableOpacity>
            )}

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: theme.tint,
                padding: 18,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 48,
              }}
            >
              <Text style={{ color: theme.background, fontWeight: "700", fontSize: 16 }}>
                {isEditMode ? "Save Changes" : "Add Medication"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}