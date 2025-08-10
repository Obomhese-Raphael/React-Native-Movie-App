import { Stack } from "expo-router";
import './globals.css'
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={false} /> {/* Show the status bar i.e the Time and battery percent */}
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="movies/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  )
}
