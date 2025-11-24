import AccountSection from "@/components/account/settings/AccountSection";
import DataPrivacySection from "@/components/account/settings/DataPrivactySection";
import DevicesSection from "@/components/account/settings/DevicesSection";
import AddDeviceModal from "@/components/account/settings/modals/AddDeviceModal";
import ChangeEmailModal from "@/components/account/settings/modals/ChangeEmailModal";
import ChangePasswordModal from "@/components/account/settings/modals/ChangePasswordModal";
import DeleteAccountModal from "@/components/account/settings/modals/DeleteAccountModal";
import RenameDeviceModal from "@/components/account/settings/modals/RenameDeviceModal";
import PreferencesSection from "@/components/account/settings/PrefrencesSection";
import YouSection from "@/components/account/settings/YouSection";
import { Colors } from "@/constants/Colors";
import { AppSettings, BluetoothDevice, CGMDevice } from "@/types/settings";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface SettingsScreenProps {
  settings: AppSettings;
  emailModalVisible: boolean;
  setEmailModalVisible: (visible: boolean) => void;
  passwordModalVisible: boolean;
  setPasswordModalVisible: (visible: boolean) => void;
  deleteAccountModalVisible: boolean;
  setDeleteAccountModalVisible: (visible: boolean) => void;
  addDeviceModalVisible: boolean;
  setAddDeviceModalVisible: (visible: boolean) => void;
  renameDeviceModalVisible: boolean;
  setRenameDeviceModalVisible: (visible: boolean) => void;
  selectedDevice: CGMDevice | null;
  setSelectedDevice: (device: CGMDevice | null) => void;
  isScanning: boolean;
  discoveredDevices: BluetoothDevice[];
  onChangeEmail: (email: string) => void;
  onChangePassword: (current: string, newPass: string) => void;
  onDeleteAccount: () => void;
  onGlucoseUnitChange: (unit: "mg/dL" | "mmol/L") => void;
  onTimeFormatChange: (format: "12h" | "24h") => void;
  onThemeChange: (theme: "light" | "dark" | "system") => void;

  // You Section Props
  onBirthdateChange: (date: string) => void;
  onGenderChange: (gender: "Male" | "Female") => void;
  onRaceChange: (race: string) => void;
  onDiabetesTypeChange: (type: "Type 1" | "Type 2" | "Prediabetes" | "None") => void;
  onBaselineGlucoseChange: (glucose: string) => void;
  onHeightChange: (height: string) => void;
  onWeightChange: (weight: string) => void;
  onActivityLevelChange: (level: "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active") => void;
  onDietaryRestrictionChange: (restrictions: string[]) => void;

  onStartBluetoothScan: () => void;
  onConnectDevice: (device: BluetoothDevice) => void;
  onSetActiveDevice: (deviceId: string) => void;
  onRenameDevice: (deviceId: string, newName: string) => void;
  onRemoveDevice: (deviceId: string) => void;
  onExportData: () => void;
  onImportData: () => void;
}

export default function SettingsScreen(props: SettingsScreenProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              marginLeft: -8,
              marginRight: 8,
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={24} color={theme.tint} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: theme.text,
            }}
          >
            Settings
          </Text>
        </View>

        {/* Account Section */}
        <AccountSection
          email={props.settings.email}
          onChangeEmail={() => props.setEmailModalVisible(true)}
          onChangePassword={() => props.setPasswordModalVisible(true)}
          onDeleteAccount={() => props.setDeleteAccountModalVisible(true)}
        />

        {/* You section */}
        <YouSection
          birthdate={props.settings.you.birthdate}
          onBirthdateChange={props.onBirthdateChange}
          gender={props.settings.you.gender}
          onGenderChange={props.onGenderChange}
          race={props.settings.you.race}
          onRaceChange={props.onRaceChange}
          diabetesType={props.settings.you.diabetesType}
          onDiabetesTypeChange={props.onDiabetesTypeChange}
          baselineGlucose={props.settings.you.baselineGlucose}
          onBaselineGlucoseChange={props.onBaselineGlucoseChange}
          height={props.settings.you.height}
          onHeightChange={props.onHeightChange}
          weight={props.settings.you.weight}
          onWeightChange={props.onWeightChange}
          activityLevel={props.settings.you.activityLevel}
          onActivityLevelChange={props.onActivityLevelChange}
          dietaryRestrictions={props.settings.you.dietaryRestrictions}
          onDietaryRestrictionChange={props.onDietaryRestrictionChange}
        />

        {/* Preferences Section */}
        <PreferencesSection
          glucoseUnit={props.settings.glucoseUnit}
          timeFormat={props.settings.timeFormat}
          theme={props.settings.theme}
          onGlucoseUnitChange={props.onGlucoseUnitChange}
          onTimeFormatChange={props.onTimeFormatChange}
          onThemeChange={props.onThemeChange}
        />

        {/* Devices Section */}
        <DevicesSection
          devices={props.settings.connectedDevices}
          onAddDevice={() => props.setAddDeviceModalVisible(true)}
          onDevicePress={(device) => {
            props.setSelectedDevice(device);
            props.setRenameDeviceModalVisible(true);
          }}
        />

        {/* Data & Privacy Section */}
        <DataPrivacySection
          onExportData={props.onExportData}
          onImportData={props.onImportData}
        />
      </ScrollView>

      {/* Modals */}
      <ChangeEmailModal
        visible={props.emailModalVisible}
        currentEmail={props.settings.email}
        onClose={() => props.setEmailModalVisible(false)}
        onSave={props.onChangeEmail}
      />

      <ChangePasswordModal
        visible={props.passwordModalVisible}
        onClose={() => props.setPasswordModalVisible(false)}
        onSave={props.onChangePassword}
      />

      <DeleteAccountModal
        visible={props.deleteAccountModalVisible}
        onClose={() => props.setDeleteAccountModalVisible(false)}
        onConfirm={props.onDeleteAccount}
      />

      <AddDeviceModal
        visible={props.addDeviceModalVisible}
        onClose={() => props.setAddDeviceModalVisible(false)}
        isScanning={props.isScanning}
        discoveredDevices={props.discoveredDevices}
        onStartScan={props.onStartBluetoothScan}
        onConnect={props.onConnectDevice}
      />

      <RenameDeviceModal
        visible={props.renameDeviceModalVisible}
        device={props.selectedDevice}
        onClose={() => {
          props.setRenameDeviceModalVisible(false);
          props.setSelectedDevice(null);
        }}
        onSave={props.onRenameDevice}
        onSetActive={props.onSetActiveDevice}
        onRemove={props.onRemoveDevice}
      />
    </KeyboardAvoidingView>
  );
}