import {
  AlarmClockPlus,
  EggFried,
  Hamburger,
  Moon,
  Sandwich,
  ThumbsUp,
} from "lucide-react-native";
import React from "react";

export default function IconLoader(
  tag: string
): React.ComponentType<any> | null {
  if (tag === "Breakfast") {
    return EggFried;
  }
  if (tag === "Lunch") {
    return Hamburger;
  }
  if (tag === "Dinner") {
    return Sandwich;
  }
  if (tag == "Takes a while") {
    return AlarmClockPlus;
  }
  if (tag == "Overnight") {
    return Moon;
  }
  if (tag == "Highly Rated") {
    return ThumbsUp;
  }
  return null;
}
