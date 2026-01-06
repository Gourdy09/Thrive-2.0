import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { AppSettings, BluetoothDevice, CGMDevice } from "@/types/settings";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import SettingsScreen from "./SettingsScreen";

export default function SettingsContainer() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    email: "user@example.com",
    glucoseUnit: "mg/dL",
    timeFormat: "12h",
    theme: "system",
    connectedDevices: [],
    you: {
      name: "bob",
      age: "27",
      birthdate: "",
      gender: "Male",
      race: "",
      diabetesType: "None",
      baselineGlucose: "",
      height: "",
      weight: "",
      activityLevel: "Moderate",
      dietaryRestrictions: [],
    },
  });

  // Modals
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);
  const [addDeviceModalVisible, setAddDeviceModalVisible] = useState(false);
  const [renameDeviceModalVisible, setRenameDeviceModalVisible] =
    useState(false);
  const [selectedDevice, setSelectedDevice] = useState<CGMDevice | null>(null);

  // Bluetooth scanning
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>(
    []
  );

  useEffect(() => {
    fetchSettings();
    /* if we want to simulate the disconnection :) 
        setTimeout(() => {
          onDeviceDisconnected("bt1"); // Simulate device disconnect
        }, 5000);
        */
  }, [user]);

  const fetchSettings = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch user_info
      const { data: userInfoData, error: userInfoError } = await supabase
        .from("user_info")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (userInfoError && userInfoError.code != "PGRST116") {
        throw userInfoError;
      }

      // Fetch dietary restrictions from separate table
      const { data: dietaryData, error: dietaryError } = await supabase
        .from("dietaryRestrictions")
        .select("restrictions")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dietaryError && dietaryError.code != "PGRST116") throw dietaryError;

      // Fetch connected devices
      const { data: devicesData, error: devicesError } = await supabase
        .from("connected_devices")
        .select("*")
        .eq("user_id", user.id);

      if (devicesError) throw devicesError;

      // Ensure lastSync is a Date or null
      const devices: CGMDevice[] = (devicesData ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        serialNumber: d.serialnumber,
        batteryLevel: d.batteryLevel ?? 0,
        lastSync: d.lastsync ? new Date(d.lastsync) : new Date(0),
        isConnected: d.isconnected ?? false,
        isActive: d.isactive ?? false,
      }));

      setSettings((prev) => ({
        ...prev,
        email: user.email || prev.email,
        glucoseUnit: userInfoData?.glucoseUnit ?? prev.glucoseUnit,
        timeFormat: userInfoData?.timeFormat ?? prev.timeFormat,
        theme: userInfoData?.theme ?? prev.theme,
        you: {
          name: userInfoData?.name ?? prev.you.name,
          age: userInfoData?.age ?? prev.you.age,
          birthdate: userInfoData?.birthdate ?? prev.you.birthdate,
          gender: userInfoData?.gender ?? prev.you.gender,
          race: userInfoData?.race ?? prev.you.race,
          diabetesType: userInfoData?.diabetesType ?? prev.you.diabetesType,
          baselineGlucose:
            userInfoData?.baselineGlucose ?? prev.you.baselineGlucose,
          height: userInfoData?.height ?? prev.you.height,
          weight: userInfoData?.weight ?? prev.you.weight,
          activityLevel: userInfoData?.activityLevel ?? prev.you.activityLevel,
          // dietaryData is an array from the restrictions column, or empty array
          dietaryRestrictions:
            dietaryData?.restrictions ?? prev.you.dietaryRestrictions,
        },
        connectedDevices: devices,
      }));
    } catch (error) {
      console.error("Error fetching settings:", error);
      Alert.alert("error", "failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    if (!user?.id) return;
    try {
      // Save user_info
      const { error: userInfoError } = await supabase.from("user_info").upsert(
        {
          id: user.id,
          glucoseunit: newSettings.glucoseUnit,
          timeformat: newSettings.timeFormat,
          theme: newSettings.theme,
          name: newSettings.you.name,
          age: newSettings.you.age ? parseInt(newSettings.you.age) : null, // have to parseint bc its saved as text in You
          bday: newSettings.you.birthdate
            ? parseInt(newSettings.you.birthdate)
            : null,
          gender: newSettings.you.gender,
          race: newSettings.you.race,
          diabetes: newSettings.you.diabetesType,
          baselinebloodglucose: newSettings.you.baselineGlucose
            ? parseInt(newSettings.you.baselineGlucose)
            : null,
          height: newSettings.you.height
            ? parseInt(newSettings.you.height)
            : null,
          weight: newSettings.you.weight
            ? parseInt(newSettings.you.weight)
            : null,
          activitylevel: newSettings.you.activityLevel
            ? parseInt(newSettings.you.activityLevel)
            : null,
        },
        { onConflict: "id" }
      );
      if (userInfoError) throw userInfoError;

      // Save dietary restrictions to separate table
      const { error: dietaryError } = await supabase
        .from("dietaryRestrictions")
        .upsert(
          {
            user_id: user.id,
            restrictions: newSettings.you.dietaryRestrictions,
          },
          { onConflict: "user_id" }
        );
      if (dietaryError) throw dietaryError;

      console.log("Settings saved:", newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("error", "failed to save settings");
      throw error;
    }
  };

  // Account actions
  const handleChangeEmail = async (newEmail: string) => {
    const newSettings = { ...settings, email: newEmail };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setEmailModalVisible(false);
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      console.log("Password changed successfully");
      setPasswordModalVisible(false);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      console.log("Account deleted");
      setDeleteAccountModalVisible(false);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // Preferences
  const handleGlucoseUnitChange = async (unit: "mg/dL" | "mmol/L") => {
    const newSettings = { ...settings, glucoseUnit: unit };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleTimeFormatChange = async (format: "12h" | "24h") => {
    const newSettings = { ...settings, timeFormat: format };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // You Section Handlers
  const handleNameChange = async (name: string) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, name },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleAgeChange = async (age: string) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, age },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };
  const handleBirthdateChange = async (birthdate: string) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, birthdate },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleGenderChange = async (gender: "Male" | "Female") => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, gender },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleRaceChange = async (race: string) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, race },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleDiabetesTypeChange = async (
    diabetesType: "Type 1" | "Type 2" | "Prediabetes" | "None"
  ) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, diabetesType },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleBaselineGlucoseChange = async (baselineGlucose: string) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, baselineGlucose },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleHeightChange = async (height: string) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, height },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleWeightChange = async (weight: string) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, weight },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleActivityLevelChange = async (
    activityLevel: "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active"
  ) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, activityLevel },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleDietaryRestrictionChange = async (
    dietaryRestrictions: string[]
  ) => {
    const newSettings = {
      ...settings,
      you: { ...settings.you, dietaryRestrictions },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // Device management
  const startBluetoothScan = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);

    try {
      // TODO: Implement actual Bluetooth scanning
      // This would use react-native-ble-plx or similar library

      // Mock scanning - simulate finding devices over time
      setTimeout(() => {
        setDiscoveredDevices([
          { id: "bt1", name: "Dexcom G7 Sensor", rssi: -45 },
        ]);
      }, 1000);

      setTimeout(() => {
        setDiscoveredDevices((prev) => [
          ...prev,
          { id: "bt2", name: "Libre 3 Sensor", rssi: -60 },
        ]);
      }, 2000);

      setTimeout(() => {
        setDiscoveredDevices((prev) => [
          ...prev,
          { id: "bt3", name: "Guardian Connect", rssi: -75 },
        ]);
        setIsScanning(false);
      }, 3000);
    } catch (error) {
      console.error("Error scanning for devices:", error);
      setIsScanning(false);
    }
  };

  const handleConnectDevice = async (device: BluetoothDevice) => {
    if (!user?.id) return;
    try {
      // Check if device already exists for user by serialNumber
      const existingDevice = settings.connectedDevices.find(
        (d) => d.serialNumber === device.name // or some unique identifier if available
      );

      let newDevice: CGMDevice;
      if (existingDevice) {
        // Update existing device as connected
        newDevice = {
          ...existingDevice,
          isConnected: true,
          isActive: true,
          lastSync: new Date(),
        };
        await supabase
          .from("connected_devices")
          .update({
            isconnected: true,
            isactive: true,
            lastsync: newDevice.lastSync,
          })
          .eq("id", existingDevice.id);
      } else {
        // Insert new device
        newDevice = {
          id: Date.now().toString(),
          name: device.name,
          type: device.name,
          serialNumber: `SN-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`,
          batteryLevel: 100,
          lastSync: new Date(),
          isConnected: true,
          isActive: true,
        };
        const { error } = await supabase.from("connected_devices").upsert(
          {
            user_id: user.id,
            name: newDevice.name,
            type: newDevice.type,
            serialnumber: newDevice.serialNumber,
            batteryLevel: newDevice.batteryLevel,
            lastsync: newDevice.lastSync,
            isconnected: true,
            isactive: true,
          },
          {
            onConflict: "unique_user_device", // <-- must be string, not array
          }
        );

        if (error) console.error(error);
      }

      // Update settings state
      const newDevices = [
        ...settings.connectedDevices.filter((d) => d.id !== newDevice.id),
        newDevice,
      ];
      setSettings({ ...settings, connectedDevices: newDevices });
      setAddDeviceModalVisible(false);
      setDiscoveredDevices([]);
    } catch (error) {
      console.error("Error connecting device:", error);
      Alert.alert("error", "failed to connect device");
    }
  };

  const handleSetActiveDevice = async (deviceId: string) => {
    if (!user?.id) return;
    try {
      await supabase
        .from("connected_devices")
        .update({ isactive: false })
        .eq("user_id", user.id);
      await supabase
        .from("connected_devices")
        .update({ isactive: true })
        .eq("id", deviceId);
      const newDevices = settings.connectedDevices.map((d) => ({
        ...d,
        isActive: d.id === deviceId,
      }));
      setSettings({ ...settings, connectedDevices: newDevices });
    } catch (error) {
      console.error("error setting active device", error);
      Alert.alert("error", "failed to set active device");
    }
  };

  const handleRenameDevice = async (deviceId: string, newName: string) => {
    if (!user?.id) return;
    try {
      const newDevices = settings.connectedDevices.map((d) =>
        d.id === deviceId ? { ...d, name: newName } : d
      );

      await supabase
        .from("connected_devices")
        .update({ name: newName })
        .eq("id", deviceId);

      const newSettings = { ...settings, connectedDevices: newDevices };
      setSettings(newSettings);
      setRenameDeviceModalVisible(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error("Error renaming device", error);
      Alert.alert("error", "Failed to rename device");
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("connected_devices")
        .delete()
        .or(`id.eq.${deviceId}`)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error removing device:", error);
        Alert.alert("Error", "Failed to remove device");
        return;
      }

      const newDevices = settings.connectedDevices.filter(
        (d) => d.id !== deviceId
      );
      setSettings({ ...settings, connectedDevices: newDevices });

      setRenameDeviceModalVisible(false);
      setSelectedDevice(null);

      console.log("Device removed successfully");
    } catch (err) {
      console.error("Unexpected error removing device:", err);
      Alert.alert("Error", "Failed to remove device");
    }
  };

  const handleMarkConnected = async (deviceId: string) => {
    await supabase
      .from("connected_devices")
      .update({ isconnected: true })
      .eq("id", deviceId);

    const newDevices = settings.connectedDevices.map((d) =>
      d.id === deviceId ? { ...d, isConnected: true } : d
    );
    setSettings({ ...settings, connectedDevices: newDevices });
  };

  const handleMarkDisconnected = async (deviceId: string) => {
    await supabase
      .from("connected_devices")
      .update({ isconnected: false })
      .eq("id", deviceId);

    const newDevices = settings.connectedDevices.map((d) =>
      d.id === deviceId ? { ...d, isConnected: false } : d
    );
    setSettings({ ...settings, connectedDevices: newDevices });
  };

  //use it later once we start up the bluetooth with subscription
  const onDeviceDisconnected = (deviceId: string) => {
    handleMarkDisconnected(deviceId);
    Alert.alert("Device disconnected", "Your sensor is no longer connected.");
  };

  //call whenever we collect blood levels
  const handleUpdateLastSync = async (deviceId: string) => {
    const now = new Date().toISOString();

    await supabase
      .from("connected_devices")
      .update({ lastsync: now })
      .eq("id", deviceId);

    const newDevices = settings.connectedDevices.map((d) =>
      d.id === deviceId ? { ...d, lastSync: new Date(now) } : d
    );
    setSettings({ ...settings, connectedDevices: newDevices });
  };

  //

  // Data & Privacy
  const handleExportData = async () => {
    try {
      // TODO: Implement data export
      console.log("Exporting data...");
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const handleImportData = async () => {
    try {
      // TODO: Implement data import
      console.log("Importing data...");
    } catch (error) {
      console.error("Error importing data:", error);
    }
  };

  return (
    <SettingsScreen
      settings={settings}
      emailModalVisible={emailModalVisible}
      setEmailModalVisible={setEmailModalVisible}
      passwordModalVisible={passwordModalVisible}
      setPasswordModalVisible={setPasswordModalVisible}
      deleteAccountModalVisible={deleteAccountModalVisible}
      setDeleteAccountModalVisible={setDeleteAccountModalVisible}
      addDeviceModalVisible={addDeviceModalVisible}
      setAddDeviceModalVisible={setAddDeviceModalVisible}
      renameDeviceModalVisible={renameDeviceModalVisible}
      setRenameDeviceModalVisible={setRenameDeviceModalVisible}
      selectedDevice={selectedDevice}
      setSelectedDevice={setSelectedDevice}
      isScanning={isScanning}
      discoveredDevices={discoveredDevices}
      onChangeEmail={handleChangeEmail}
      onChangePassword={handleChangePassword}
      onDeleteAccount={handleDeleteAccount}
      onGlucoseUnitChange={handleGlucoseUnitChange}
      onTimeFormatChange={handleTimeFormatChange}
      onThemeChange={handleThemeChange}
      onNameChange={handleNameChange}
      onAgeChange={handleAgeChange}
      onBirthdateChange={handleBirthdateChange}
      onGenderChange={handleGenderChange}
      onRaceChange={handleRaceChange}
      onDiabetesTypeChange={handleDiabetesTypeChange}
      onBaselineGlucoseChange={handleBaselineGlucoseChange}
      onHeightChange={handleHeightChange}
      onWeightChange={handleWeightChange}
      onActivityLevelChange={handleActivityLevelChange}
      onDietaryRestrictionChange={handleDietaryRestrictionChange}
      onStartBluetoothScan={startBluetoothScan}
      onConnectDevice={handleConnectDevice}
      onSetActiveDevice={handleSetActiveDevice}
      onRenameDevice={handleRenameDevice}
      onRemoveDevice={handleRemoveDevice}
      onExportData={handleExportData}
      onImportData={handleImportData}
    />
  );
}
