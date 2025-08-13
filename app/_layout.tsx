// app/_layout.tsx
import './globals.css'
import { StatusBar } from "react-native";
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      // User is signed in but in auth group, redirect to main app
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inAuthGroup) {
      // User is not signed in but not in auth group, redirect to sign-in
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments]);

  return (
    <>
      <StatusBar hidden={false} />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="movies/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  )
}