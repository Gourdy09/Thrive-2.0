import { Colors } from "@/constants/Colors";
import PermissionsManager from "@/services/permissionsService";
import * as ImagePicker from "expo-image-picker";
import { Camera, Upload, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface ImagePickerComponentProps {
  currentImage?: string;
  onImageSelected: (uri: string) => void;
}

export default function ImagePickerComponent({
  currentImage,
  onImageSelected,
}: ImagePickerComponentProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [showOptions, setShowOptions] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const pickImageFromLibrary = async () => {
    const hasPermission = await PermissionsManager.requestPermission("photos");
    if (!hasPermission) {
      setShowOptions(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
    setShowOptions(false);
  };

  const takePhoto = async () => {
    const hasPermission = await PermissionsManager.requestPermission("camera");
    if (!hasPermission) {
      setShowOptions(false);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
    setShowOptions(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageSelected(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
      setShowOptions(false);
    }
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: theme.text,
          marginBottom: 8,
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        Recipe Image
      </Text>

      {currentImage && (
        <Image
          source={{ uri: currentImage }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => setShowOptions(true)}
        style={{
          backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
          borderWidth: 2,
          borderColor: theme.tint,
          borderStyle: "dashed",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Upload size={20} color={theme.tint} />
        <Text style={{ color: theme.tint, fontWeight: "600" }}>
          {currentImage ? "Change Image" : "Add Image"}
        </Text>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal visible={showOptions} transparent animationType="slide">
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
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 20,
              }}
            >
              Add Recipe Image
            </Text>

            <TouchableOpacity
              onPress={takePhoto}
              style={{
                backgroundColor:
                  colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <Camera size={24} color={theme.tint} />
              <Text
                style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}
              >
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImageFromLibrary}
              style={{
                backgroundColor:
                  colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <Upload size={24} color={theme.tint} />
              <Text
                style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}
              >
                Choose from Library
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUrlInput(true);
                setShowOptions(false);
              }}
              style={{
                backgroundColor:
                  colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 24 }}>🔗</Text>
              <Text
                style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}
              >
                Enter Image URL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowOptions(false)}
              style={{
                backgroundColor:
                  colorScheme === "dark" ? "#2a2d32" : "#e0e0e0",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.icon, fontSize: 16, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* URL Input Modal */}
      <Modal visible={showUrlInput} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.background,
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 400,
              borderWidth: 2,
              borderColor: theme.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: theme.text }}
              >
                Enter Image URL
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowUrlInput(false);
                  setUrlInput("");
                }}
              >
                <X size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={theme.icon}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={{
                backgroundColor:
                  colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderWidth: 2,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                color: theme.text,
                fontSize: 16,
                marginBottom: 16,
              }}
            />

            <TouchableOpacity
              onPress={handleUrlSubmit}
              disabled={!urlInput.trim()}
              style={{
                backgroundColor: urlInput.trim() ? theme.tint : theme.border,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.background,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Add Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}