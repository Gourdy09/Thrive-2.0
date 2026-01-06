// app/(tabs)/food/cameraScreen.tsx
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from "expo-router";
import { ArrowLeft, FlipHorizontal, Sparkles } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CameraScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header username={username} icon="Hamburger" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header username={username} icon="Hamburger" />
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: theme.text }]}>
            Camera permission is required to scan food
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.tint }]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { color: theme.background }]}>
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: theme.tint }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setAnalyzing(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        // Here you would send the photo to your backend
        // For now, we'll simulate the analysis
        console.log("Photo captured:", {
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
          hasBase64: !!photo.base64
        });

        // Simulate API call
        setTimeout(() => {
          setAnalyzing(false);
          Alert.alert(
            "Food Identified! 🎉",
            "Grilled Chicken Breast\n\nProtein: 31g\nCarbs: 0g\nFat: 3.6g\nCalories: 165",
            [
              {
                text: "Add to Log",
                onPress: () => {
                  // TODO: Add to food log
                  router.back();
                },
              },
              {
                text: "Retake",
                style: "cancel",
              },
            ]
          );
        }, 2000);

        // TODO: Send to your backend API
        // const response = await fetch('YOUR_API_ENDPOINT', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     image: photo.base64,
        //     userId: user?.id
        //   })
        // });

      } catch (error) {
        console.error("Error taking picture:", error);
        setAnalyzing(false);
        Alert.alert("Error", "Failed to capture photo. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Your Food</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleCameraFacing}
          >
            <FlipHorizontal size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Guide Frame */}
        <View style={styles.guideContainer}>
          <View style={[styles.guideBorder, { borderColor: theme.tint }]}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <View style={styles.guideTextContainer}>
            <Sparkles size={20} color={theme.tint} />
            <Text style={styles.guideText}>
              Center your food in the frame
            </Text>
          </View>
        </View>

        {/* Footer with Capture Button */}
        <View style={styles.footer}>
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[styles.captureButton, { borderColor: theme.tint }]}
              onPress={takePicture}
              disabled={analyzing}
            >
              <View style={[styles.captureButtonInner, { backgroundColor: theme.tint }]} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Analyzing Overlay */}
      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <View style={[styles.analyzingCard, { backgroundColor: theme.cardBackground }]}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.analyzingText, { color: theme.text }]}>
              Analyzing food...
            </Text>
            <Text style={[styles.analyzingSubtext, { color: theme.icon }]}>
              This may take a few seconds
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
  },
  permissionButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  guideContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  guideBorder: {
    width: width - 80,
    height: width - 80,
    borderWidth: 3,
    borderRadius: 24,
    marginBottom: 24,
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    top: -3,
    left: -3,
    width: 40,
    height: 40,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderColor: "#FFF",
    borderTopLeftRadius: 24,
  },
  cornerTopRight: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 40,
    height: 40,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: "#FFF",
    borderTopRightRadius: 24,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: -3,
    left: -3,
    width: 40,
    height: 40,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderColor: "#FFF",
    borderBottomLeftRadius: 24,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 40,
    height: 40,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: "#FFF",
    borderBottomRightRadius: 24,
  },
  guideTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  guideText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  captureContainer: {
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  analyzingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
    minWidth: 280,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },
  analyzingSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});