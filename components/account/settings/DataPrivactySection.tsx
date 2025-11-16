import { Colors } from "@/constants/Colors";
import { ChevronRight, Download, ExternalLink, Lock, Upload } from "lucide-react-native";
import React from "react";
import { Linking, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface DataPrivacySectionProps {
  onExportData: () => void;
  onImportData: () => void;
}

export default function DataPrivacySection({
  onExportData,
  onImportData,
}: DataPrivacySectionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const handlePermissions = () => {
    // TODO: Navigate to permissions screen or open system settings
    console.log("Opening permissions...");
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://example.com/privacy");
  };

  return (
    <>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: theme.icon,
          marginBottom: 14,
          letterSpacing: -0.2,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        Data & Privacy
      </Text>

      <View style={{ marginBottom: 24 }}>
        <DataPrivacyItem
          icon={Download}
          label="Export Data"
          onPress={onExportData}
        />
        <DataPrivacyItem
          icon={Upload}
          label="Import Data"
          onPress={onImportData}
        />
        <DataPrivacyItem
          icon={Lock}
          label="Permissions"
          onPress={handlePermissions}
        />
        <DataPrivacyItem
          icon={ExternalLink}
          label="Privacy Policy"
          onPress={handlePrivacyPolicy}
          isExternal
        />
      </View>
    </>
  );
}

function DataPrivacyItem({
  icon: Icon,
  label,
  onPress,
  isExternal = false,
}: {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  isExternal?: boolean;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: colorScheme === "dark" ? "#2A2D2F" : "#E2E4E7",
      }}
    >
      <Icon color={theme.icon} size={20} />
      <Text
        style={{
          marginLeft: 16,
          fontSize: 16,
          color: theme.text,
          flex: 1,
        }}
      >
        {label}
      </Text>
      {isExternal ? (
        <ExternalLink color={theme.icon} size={18} />
      ) : (
        <ChevronRight color={theme.icon} size={20} />
      )}
    </TouchableOpacity>
  );
}