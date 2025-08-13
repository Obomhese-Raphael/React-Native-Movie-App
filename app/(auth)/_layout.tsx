// (auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function AuthRoutesLayout() {
    // Remove all the redirect logic - let the root layout handle it
    return (
        <Stack>
            <Stack.Screen
                name="sign-in"
                options={{
                    headerShown: false,
                    title: ''
                }}
            />
            <Stack.Screen
                name="sign-up"
                options={{
                    headerShown: false,
                    title: ''
                }}
            />
        </Stack>
    )
}