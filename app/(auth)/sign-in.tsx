import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter, Stack } from 'expo-router'
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Image
} from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
// Import your app logo/icon if you have one
// import { icons } from '@/assets/constants/icons'

export default function SignInPage() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [errors, setErrors] = React.useState<{
        email?: string;
        password?: string;
    }>({})
    const [showPassword, setShowPassword] = React.useState(false)

    // Clear errors when user starts typing
    const clearError = (field: 'email' | 'password') => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    // Validate form
    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {}

        if (!emailAddress.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(emailAddress)) {
            newErrors.email = 'Please enter a valid email'
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle the submission of the sign-in form
    const onSignInPress = async () => {
        if (!isLoaded || isLoading) return

        // Clear previous errors
        setErrors({})

        // Validate form
        if (!validateForm()) return

        setIsLoading(true)

        try {
            // Start the sign-in process using the email and password provided
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            // If sign-in process is complete, set the created session as active
            // Let the root layout handle the redirect
            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                // Remove manual redirect - let the root layout handle it
            } else {
                // If the status isn't complete, check why. User might need to
                // complete further steps.
                console.error('Sign-in incomplete:', JSON.stringify(signInAttempt, null, 2))
                Alert.alert('Authentication Required', 'Please complete the additional verification steps.')
            }
        } catch (err: any) {
            console.error('Sign-in error:', JSON.stringify(err, null, 2))

            // Handle specific Clerk errors
            if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                const error = err.errors[0]
                if (error.code === 'form_identifier_not_found') {
                    setErrors({ email: 'No account found with this email' })
                } else if (error.code === 'form_password_incorrect') {
                    setErrors({ password: 'Incorrect password' })
                } else {
                    Alert.alert('Sign In Failed', error.longMessage || error.message || 'Please try again')
                }
            } else {
                Alert.alert('Error', 'Something went wrong. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />
            <KeyboardAvoidingView
                className="flex-1 bg-primary"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 justify-center px-6 py-12">
                        {/* Header Section */}
                        <View className="items-center mb-8">
                            {/* Add your app logo here */}
                            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4">
                                <Text className="text-white text-2xl font-bold">MF</Text>
                                {/* Replace with your actual logo */}
                                {/* <Image source={icons.logo} className="w-12 h-12" tintColor="#fff" /> */}
                            </View>
                            <Text className="text-white text-3xl font-bold mb-2">Welcome Back</Text>
                            <Text className="text-gray-400 text-base text-center">
                                Sign in to continue your movie experience
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View className="space-y-4">
                            {/* Email Input */}
                            <View>
                                <Text className="text-white text-sm font-medium mb-2">Email Address</Text>
                                <TextInput
                                    className={`bg-gray-800 border rounded-xl px-4 py-4 text-white text-base ${errors.email ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    value={emailAddress}
                                    onChangeText={(text) => {
                                        setEmailAddress(text)
                                        clearError('email')
                                    }}
                                    editable={!isLoading}
                                />
                                {errors.email ? (
                                    <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
                                ) : null}
                            </View>

                            {/* Password Input */}
                            <View>
                                <Text className="text-white text-sm font-medium mb-2 mt-5">Password</Text>
                                <View className="relative">
                                    <TextInput
                                        className={`bg-gray-800 border rounded-xl px-4 py-4 text-white text-base pr-12 ${errors.password ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
                                        autoComplete="password"
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text)
                                            clearError('password')
                                        }}
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        className="absolute right-4 top-4"
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text className="text-gray-400 text-sm px-5">
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.password ? (
                                    <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
                                ) : null}
                            </View>

                            {/* Forgot Password Link */}
                            <View className="items-end py-5 w-full">
                                <TouchableOpacity onPress={() => {
                                    // Add forgot password functionality
                                    Alert.alert('Forgot Password', 'Forgot password feature coming soon!')
                                }}>
                                    <Text className="text-blue-400 text-sm">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Sign In Button */}
                            <TouchableOpacity
                                className={`rounded-xl py-4 px-6 ${isLoading ? 'bg-blue-700' : 'bg-blue-600'
                                    }`}
                                onPress={onSignInPress}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <View className="flex-row items-center justify-center">
                                        <ActivityIndicator size="small" color="#fff" className="mr-2" />
                                        <Text className="text-white text-center text-lg font-semibold">
                                            Signing In...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-white text-center text-lg font-semibold">
                                        Sign In
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-gray-700" />
                            <Text className="text-gray-500 px-4 text-sm">or</Text>
                            <View className="flex-1 h-px bg-gray-700" />
                        </View>

                        {/* Social Sign In Options */}
                        <View className="space-y-3">
                            {/* Google Sign In Button (if you want to add it) */}
                            <TouchableOpacity
                                className="bg-white rounded-xl py-4 px-6 border border-gray-300"
                                onPress={() => {
                                    // Add Google sign in functionality
                                    Alert.alert('Google Sign In', 'Google sign-in coming soon!')
                                }}
                            >
                                <Text className="text-gray-800 text-center text-base font-medium">
                                    Continue with Google
                                </Text>
                            </TouchableOpacity>

                            {/* Apple Sign In Button (if you want to add it) */}
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    className="bg-black rounded-xl py-4 px-6 border border-gray-600"
                                    onPress={() => {
                                        // Add Apple sign in functionality
                                        Alert.alert('Apple Sign In', 'Apple sign-in coming soon!')
                                    }}
                                >
                                    <Text className="text-white text-center text-base font-medium">
                                        Continue with Apple
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Sign Up Link */}
                        <View className="flex-row justify-center items-center mt-8">
                            <Text className="text-gray-400 text-base">Don&apos;t have an account? </Text>
                            <Link href="/sign-up" asChild>
                                <TouchableOpacity>
                                    <Text className="text-blue-400 text-base font-medium">Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
}