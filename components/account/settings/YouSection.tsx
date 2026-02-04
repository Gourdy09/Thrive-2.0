import { Colors } from "@/constants/Colors";
import { ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import OptionButton from "./OptionButton";

interface YouSectionProps {
  name: string;
  onNameChange: (name: string) => void;
  age: string;
  onAgeChange: (age: string) => void;
  birthdate: string;
  onBirthdateChange: (date: string) => void;
  gender: "Male" | "Female";
  onGenderChange: (gender: "Male" | "Female") => void;
  race: string;
  onRaceChange: (race: string) => void;
  baselineGlucose: string;
  onBaselineGlucoseChange: (glucose: string) => void;
  weight: string;
  onWeightChange: (weight: string) => void;
  height: string;
  onHeightChange: (height: string) => void;
  activityLevel: "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active";
  onActivityLevelChange: (
    level: "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active",
  ) => void;
  diabetesType: "Type 1" | "Type 2" | "Prediabetes" | "None";
  onDiabetesTypeChange: (
    type: "Type 1" | "Type 2" | "Prediabetes" | "None",
  ) => void;
  dietaryRestrictions: string[];
  onDietaryRestrictionChange: (restrictions: string[]) => void;
  insulin: boolean;
  onInsulinChange: (insulin: boolean) => void;
  insulinType:
    | "Rapid-Acting"
    | "Short-Acting (Regular)"
    | "Intermediate-Acting"
    | "Long-Acting"
    | null;
  onInsulinTypeChange: (
    type:
      | "Rapid-Acting"
      | "Short-Acting (Regular)"
      | "Intermediate-Acting"
      | "Long-Acting",
  ) => void;
}

const ETHNICITIES = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Two or More Races",
  "Prefer not to say",
];

const COMMON_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Lactose intolerant",
  "Nut allergy",
  "Shellfish allergy",
  "Egg allergy",
  "Soy allergy",
  "Kosher",
  "Halal",
  "Low-carb",
  "Keto",
  "Paleo",
];

function AnimatedDropdown({
  label,
  value,
  options,
  onSelect,
  colorScheme,
  theme,
}: {
  label: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
  colorScheme: string;
  theme: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  // Calculate the actual content height
  const itemHeight = 48;
  const borderHeight = Math.max(0, options.length - 1); // 1px border between each item
  const containerBorder = 4; // 2px top + 2px bottom
  const extraPadding = 20; // Extra padding for safety
  const totalContentHeight =
    options.length * itemHeight + borderHeight + containerBorder + extraPadding;

  const maxScrollHeight = 300;
  const shouldScroll = totalContentHeight > maxScrollHeight;

  // For short lists, use exact calculated height. For long lists, cap at 300px
  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, shouldScroll ? maxScrollHeight : totalContentHeight],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 12,
        }}
      >
        {label}
      </Text>
      <TouchableOpacity
        onPress={toggleDropdown}
        style={{
          backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
          borderWidth: 2,
          borderRadius: 12,
          padding: 16,
          borderColor: isOpen ? theme.tint : theme.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={20} color={theme.icon} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={{
          maxHeight,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            marginTop: 8,
            borderRadius: 12,
            backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
            borderWidth: 2,
            borderColor: theme.border,
            overflow: "hidden",
          }}
        >
          <ScrollView
            style={{
              maxHeight: shouldScroll ? 240 : undefined,
            }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={shouldScroll}
            scrollEnabled={shouldScroll}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  onSelect(option);
                  toggleDropdown();
                }}
                style={{
                  padding: 16,
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border,
                  backgroundColor:
                    value === option
                      ? colorScheme === "dark"
                        ? "#252830"
                        : "#e8f0ff"
                      : "transparent",
                }}
              >
                <Text
                  style={{
                    color: value === option ? theme.tint : theme.text,
                    fontWeight: value === option ? "600" : "400",
                  }}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

export default function YouSection({
  name,
  onNameChange,
  age,
  onAgeChange,
  birthdate,
  onBirthdateChange,
  gender,
  onGenderChange,
  race,
  onRaceChange,
  baselineGlucose,
  onBaselineGlucoseChange,
  weight,
  onWeightChange,
  height,
  onHeightChange,
  activityLevel,
  onActivityLevelChange,
  diabetesType,
  onDiabetesTypeChange,
  dietaryRestrictions,
  onDietaryRestrictionChange,
  insulin,
  onInsulinChange,
  insulinType,
  onInsulinTypeChange,
}: YouSectionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [newRestriction, setNewRestriction] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4)
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    return (
      cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4) + "/" + cleaned.slice(4)
    );
  };

  const addRestriction = (restriction: string) => {
    if (restriction && !dietaryRestrictions.includes(restriction)) {
      onDietaryRestrictionChange([...dietaryRestrictions, restriction]);
    }
  };

  const removeRestriction = (restriction: string) => {
    onDietaryRestrictionChange(
      dietaryRestrictions.filter((r) => r !== restriction),
    );
  };

  const addCustomRestriction = () => {
    if (newRestriction.trim()) {
      addRestriction(newRestriction.trim());
      setNewRestriction("");
      setShowCustomInput(false);
    }
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
        You
      </Text>

      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          borderWidth: 2,
          borderRadius: 16,
          marginBottom: 24,
          padding: 16,
        }}
      >
        {/* Name */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={(text) => onNameChange(text)}
            placeholder="Tom Bajos"
            placeholderTextColor={theme.icon}
            autoCapitalize="words"
            autoCorrect={false}
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

        {/* Age */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Age
          </Text>
          <TextInput
            value={age}
            onChangeText={(text) => onAgeChange(text)}
            placeholder="26"
            placeholderTextColor={theme.icon}
            keyboardType="number-pad"
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
        {/* Birthdate */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Birthdate
          </Text>
          <TextInput
            value={birthdate}
            onChangeText={(text) => onBirthdateChange(formatDate(text))}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={theme.icon}
            keyboardType="number-pad"
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

        {/* Gender */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Gender
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <OptionButton
              label="Male"
              selected={gender === "Male"}
              onPress={() => onGenderChange("Male")}
            />
            <OptionButton
              label="Female"
              selected={gender === "Female"}
              onPress={() => onGenderChange("Female")}
            />
          </View>
        </View>

        {/* Race/Ethnicity */}
        <AnimatedDropdown
          label="Race/Ethnicity"
          value={race}
          options={ETHNICITIES}
          onSelect={onRaceChange}
          colorScheme={colorScheme}
          theme={theme}
        />

        {/* Diabetes Type */}
        <AnimatedDropdown
          label="Diabetes Type"
          value={diabetesType}
          options={["Type 1", "Type 2", "Prediabetes", "None"]}
          onSelect={(val) => onDiabetesTypeChange(val as any)}
          colorScheme={colorScheme}
          theme={theme}
        />
        {/* Insulin */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Do you take insulin?
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <OptionButton
              label="Yes"
              selected={insulin === true}
              onPress={() => onInsulinChange(true)}
            />
            <OptionButton
              label="No"
              selected={insulin === false}
              onPress={() => onInsulinChange(false)}
            />
            {insulin && (
              <AnimatedDropdown
                label="Insulin Type"
                value={insulinType}
                options={[
                  "Rapid-Acting",
                  "Short-Acting (Regular)",
                  "Intermediate-Acting",
                  "Long-Acting",
                ]}
                onSelect={(val) =>
                  onInsulinTypeChange(
                    val as
                      | "Rapid-Acting"
                      | "Short-Acting (Regular)"
                      | "Intermediate-Acting"
                      | "Long-Acting",
                  )
                }
                colorScheme={colorScheme}
                theme={theme}
              />
            )}
          </View>
        </View>
        {/* Baseline Blood Glucose */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Baseline Blood Glucose (mg/dL)
          </Text>
          <TextInput
            value={baselineGlucose}
            onChangeText={(text) =>
              onBaselineGlucoseChange(text.replace(/[^0-9]/g, ""))
            }
            placeholder="100"
            placeholderTextColor={theme.icon}
            keyboardType="numeric"
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

        {/* Height */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Height (inches)
          </Text>
          <TextInput
            value={height}
            onChangeText={(text) => onHeightChange(text.replace(/[^0-9]/g, ""))}
            placeholder="68"
            placeholderTextColor={theme.icon}
            keyboardType="numeric"
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

        {/* Weight */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Weight (lbs)
          </Text>
          <TextInput
            value={weight}
            onChangeText={(text) => onWeightChange(text.replace(/[^0-9]/g, ""))}
            placeholder="150"
            placeholderTextColor={theme.icon}
            keyboardType="numeric"
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

        {/* Activity Level */}
        <AnimatedDropdown
          label="Activity Level"
          value={activityLevel}
          options={["Sedentary", "Light", "Moderate", "Active", "Very Active"]}
          onSelect={(val) => onActivityLevelChange(val as any)}
          colorScheme={colorScheme}
          theme={theme}
        />

        {/* Dietary Restrictions */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Dietary Restrictions
          </Text>

          {/* Common Restrictions as Chips */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {COMMON_RESTRICTIONS.map((restriction) => {
              const isSelected = dietaryRestrictions.includes(restriction);
              return (
                <TouchableOpacity
                  key={restriction}
                  onPress={() =>
                    isSelected
                      ? removeRestriction(restriction)
                      : addRestriction(restriction)
                  }
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: isSelected ? theme.tint : theme.border,
                    backgroundColor: isSelected
                      ? colorScheme === "dark"
                        ? "#252830"
                        : "#e8f0ff"
                      : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? theme.tint : theme.text,
                      fontSize: 13,
                      fontWeight: isSelected ? "600" : "400",
                    }}
                  >
                    {restriction}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Restriction Input */}
          {!showCustomInput ? (
            <TouchableOpacity
              onPress={() => setShowCustomInput(true)}
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: theme.border,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: theme.icon, fontSize: 14 }}>
                + Add Custom Restriction
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <TextInput
                value={newRestriction}
                onChangeText={setNewRestriction}
                placeholder="Enter custom restriction"
                placeholderTextColor={theme.icon}
                onSubmitEditing={addCustomRestriction}
                style={{
                  flex: 1,
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  borderWidth: 2,
                  borderRadius: 12,
                  padding: 12,
                  color: theme.text,
                  fontSize: 14,
                  borderColor: theme.border,
                }}
              />
              <TouchableOpacity
                onPress={addCustomRestriction}
                style={{
                  backgroundColor: theme.tint,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: theme.background, fontWeight: "700" }}>
                  Add
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCustomInput(false);
                  setNewRestriction("");
                }}
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
              >
                <X size={16} color={theme.icon} />
              </TouchableOpacity>
            </View>
          )}

          {/* Selected Restrictions List */}
          {dietaryRestrictions.length > 0 && (
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderRadius: 12,
                padding: 12,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  color: theme.icon,
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Your Restrictions:
              </Text>
              {dietaryRestrictions.map((restriction) => (
                <View
                  key={restriction}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 14 }}>
                    • {restriction}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeRestriction(restriction)}
                    style={{
                      padding: 4,
                    }}
                  >
                    <X size={16} color={theme.icon} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </>
  );
}
