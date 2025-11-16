import { AppSettings, BluetoothDevice, CGMDevice } from "@/types/settings";
import { useEffect, useState } from "react";
import SettingsScreen from "./SettingsScreen";

export default function SettingsContainer() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    email: "user@example.com",
    glucoseUnit: "mg/dL",
    timeFormat: "12h",
    theme: "system",
    connectedDevices: [],
  });

  // Modals
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [addDeviceModalVisible, setAddDeviceModalVisible] = useState(false);
  const [renameDeviceModalVisible, setRenameDeviceModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<CGMDevice | null>(null);

  // Bluetooth scanning
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from Supabase
      // Mock data
      const mockSettings: AppSettings = {
        email: "user@example.com",
        glucoseUnit: "mg/dL",
        timeFormat: "12h",
        theme: "system",
        connectedDevices: [
          {
            id: "1",
            name: "Dexcom G7",
            type: "Dexcom G7",
            serialNumber: "DX7-12345",
            batteryLevel: 85,
            lastSync: new Date(Date.now() - 300000),
            isConnected: true,
            isActive: true,
          },
          {
            id: "2",
            name: "Libre 3",
            type: "FreeStyle Libre 3",
            serialNumber: "FS3-67890",
            batteryLevel: 60,
            lastSync: new Date(Date.now() - 900000),
            isConnected: false,
            isActive: false,
          },
        ],
      };
      setSettings(mockSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      // TODO: Save to Supabase

      console.log("Settings saved:", newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Account actions
  const handleChangeEmail = async (newEmail: string) => {
    const newSettings = { ...settings, email: newEmail };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setEmailModalVisible(false);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // TODO: Implement password change with Supabase Auth

      console.log("Password changed successfully");
      setPasswordModalVisible(false);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion

      console.log("Account deleted");
      setDeleteAccountModalVisible(false);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // Preferences
  const handleGlucoseUnitChange = (unit: "mg/dL" | "mmol/L") => {
    const newSettings = { ...settings, glucoseUnit: unit };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleTimeFormatChange = (format: "12h" | "24h") => {
    const newSettings = { ...settings, timeFormat: format };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    saveSettings(newSettings);
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
        setDiscoveredDevices(prev => [
          ...prev,
          { id: "bt2", name: "Libre 3 Sensor", rssi: -60 },
        ]);
      }, 2000);

      setTimeout(() => {
        setDiscoveredDevices(prev => [
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
    try {
      // TODO: Implement actual device connection
      const newDevice: CGMDevice = {
        id: Date.now().toString(),
        name: device.name,
        type: device.name,
        serialNumber: `SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        batteryLevel: 100,
        lastSync: new Date(),
        isConnected: true,
        isActive: true,
      };

      const newSettings = {
        ...settings,
        connectedDevices: [...settings.connectedDevices, newDevice],
      };
      
      setSettings(newSettings);
      await saveSettings(newSettings);
      setAddDeviceModalVisible(false);
      setDiscoveredDevices([]);
    } catch (error) {
      console.error("Error connecting device:", error);
    }
  };

  const handleSetActiveDevice = async (deviceId: string) => {
    const newDevices = settings.connectedDevices.map(d => ({
      ...d,
      isActive: d.id === deviceId,
    }));

    const newSettings = { ...settings, connectedDevices: newDevices };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleRenameDevice = async (deviceId: string, newName: string) => {
    const newDevices = settings.connectedDevices.map(d =>
      d.id === deviceId ? { ...d, name: newName } : d
    );

    const newSettings = { ...settings, connectedDevices: newDevices };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setRenameDeviceModalVisible(false);
    setSelectedDevice(null);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    const newDevices = settings.connectedDevices.filter(d => d.id !== deviceId);
    const newSettings = { ...settings, connectedDevices: newDevices };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

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

  if (loading) return null;

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