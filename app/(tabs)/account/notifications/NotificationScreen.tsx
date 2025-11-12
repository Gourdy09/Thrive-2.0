import BloodsugarNotification from '@/components/settings/notifications/BloodsugarNotification';
import NotificationToggle from '@/components/settings/notifications/NotificationToggle';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.background
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.background,
            padding: 24,
          }}
        >
          <>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginBottom: 24,
                padding: 8,
                marginLeft: -8,
              }}
            >
              <ArrowLeft size={24} color={theme.tint} />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 24
              }}
            >
              Notifications
            </Text>
          </>

          <View style={{
            flexDirection: 'column',
            gap: 16
          }}>
            <View style={{
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              borderWidth: 2,
              flexDirection: 'column',
              borderRadius: 16,
            }}>
              <NotificationToggle name="Blood Sugar Alerts" toggled={true} />
              <NotificationToggle name="Medication Alerts" toggled={true} />
              <NotificationToggle name="Payment Alerts" toggled={true} />
            </View>

            <View style={{
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              borderWidth: 2,
              flexDirection: 'column',
              borderRadius: 16,
            }}>
              <BloodsugarNotification/>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  )
}