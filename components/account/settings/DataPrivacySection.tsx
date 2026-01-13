import { Colors } from "@/constants/Colors";
import { exportUserData } from "@/utils/exportUserData";
import { ChevronRight, Download, ExternalLink, Lock } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Linking, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function DataPrivacySection() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Export with default 1MB storage limit (change num insde parenthesis for more space ex. 2 = 2MB)
      await exportUserData();
    } finally {
      setIsExporting(false);
    }
  };

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
          onPress={handleExportData}
          isLoading={isExporting}
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
  isLoading = false,
}: {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  isExternal?: boolean;
  isLoading?: boolean;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: colorScheme === "dark" ? "#2A2D2F" : "#E2E4E7",
        opacity: isLoading ? 0.6 : 1,
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
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.icon} />
      ) : isExternal ? (
        <ExternalLink color={theme.icon} size={18} />
      ) : (
        <ChevronRight color={theme.icon} size={20} />
      )}
    </TouchableOpacity>
  );
}