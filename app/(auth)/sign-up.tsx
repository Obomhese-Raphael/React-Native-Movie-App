import * as React from 'react'
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [errors, setErrors] = React.useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        firstName?: string;
        code?: string;
    }>({})
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    // Clear errors when user starts typing
    const clearError = (field: keyof typeof errors) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    // Validate sign-up form
    const validateSignUpForm = () => {
        const newErrors: typeof errors = {}

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }

        if (!emailAddress.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(emailAddress)) {
            newErrors.email = 'Please enter a valid email'
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number'
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Validate verification code
    const validateVerificationForm = () => {
        const newErrors: typeof errors = {}

        if (!code.trim()) {
            newErrors.code = 'Verification code is required'
        } else if (code.length !== 6) {
            newErrors.code = 'Please enter the complete 6-digit code'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle submission of sign-up form
    const onSignUpPress = async () => {
        if (!isLoaded || isLoading) return

        // Clear previous errors
        setErrors({})

        // Validate form
        if (!validateSignUpForm()) return

        setIsLoading(true)

        try {
            // Start sign-up process using email and password provided
            await signUp.create({
                emailAddress,
                password,
                firstName,
                lastName,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display verification form
            setPendingVerification(true)
        } catch (err: any) {
            console.error('Sign-up error:', JSON.stringify(err, null, 2))

            // Handle specific Clerk errors
            if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                const error = err.errors[0]
                if (error.code === 'form_identifier_exists') {
                    setErrors({ email: 'An account with this email already exists' })
                } else if (error.code === 'form_password_pwned') {
                    setErrors({ password: 'This password has been compromised. Please choose a different one.' })
                } else if (error.code === 'form_password_too_common') {
                    setErrors({ password: 'This password is too common. Please choose a stronger one.' })
                } else {
                    Alert.alert('Sign Up Failed', error.longMessage || error.message || 'Please try again')
                }
            } else {
                Alert.alert('Error', 'Something went wrong. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
        if (!isLoaded || isLoading) return

        // Clear previous errors
        setErrors({})

        // Validate verification code
        if (!validateVerificationForm()) return

        setIsLoading(true)

        try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })

            // If verification was completed, set the session to active
            // Let the root layout handle the redirect
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                // Remove manual redirect - let the root layout handle it
            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error('Verification incomplete:', JSON.stringify(signUpAttempt, null, 2))
                Alert.alert('Verification Failed', 'Please try again or contact support.')
            }
        } catch (err: any) {
            console.error('Verification error:', JSON.stringify(err, null, 2))

            if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                const error = err.errors[0]
                if (error.code === 'form_code_incorrect') {
                    setErrors({ code: 'Invalid verification code' })
                } else {
                    Alert.alert('Verification Failed', error.longMessage || error.message || 'Please try again')
                }
            } else {
                Alert.alert('Error', 'Something went wrong. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Resend verification code
    const onResendPress = async () => {
        if (!isLoaded) return

        try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            Alert.alert('Code Sent', 'A new verification code has been sent to your email.')
        } catch (err) {
            Alert.alert('Error', 'Failed to resend code. Please try again.')
        }
    }

    if (pendingVerification) {
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
                                <View className="w-20 h-20 bg-green-600 rounded-2xl items-center justify-center mb-4">
                                    <Text className="text-white text-2xl font-bold">✓</Text>
                                </View>
                                <Text className="text-white text-3xl font-bold mb-2">Verify Your Email</Text>
                                <Text className="text-gray-400 text-base text-center">
                                    We&apos;ve sent a 6-digit code to{'\n'}
                                    <Text className="text-white font-medium">{emailAddress}</Text>
                                </Text>
                            </View>

                            {/* Verification Form */}
                            <View className="space-y-6">
                                <View>
                                    <Text className="text-white text-sm font-medium mb-2">Verification Code</Text>
                                    <TextInput
                                        className={`bg-gray-800 border rounded-xl px-4 py-4 text-white text-base text-center text-2xl tracking-widest ${errors.code ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                        placeholder="000000"
                                        placeholderTextColor="#9CA3AF"
                                        value={code}
                                        onChangeText={(text) => {
                                            setCode(text.replace(/[^0-9]/g, '').slice(0, 6))
                                            clearError('code')
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!isLoading}
                                    />
                                    {errors.code ? (
                                        <Text className="text-red-500 text-sm mt-1">{errors.code}</Text>
                                    ) : null}
                                </View>

                                {/* Verify Button */}
                                <TouchableOpacity
                                    className={`rounded-xl py-4 px-6 mt-5 mb-5 ${isLoading ? 'bg-green-700' : 'bg-green-600'
                                        }`}
                                    onPress={onVerifyPress}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <View className="flex-row items-center justify-center">
                                            <ActivityIndicator size="small" color="#fff" className="mr-2" />
                                            <Text className="text-white text-center text-lg font-semibold">
                                                Verifying...
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text className="text-white text-center text-lg font-semibold">
                                            Verify Email
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                {/* Resend Code */}
                                <View className="items-center">
                                    <Text className="text-gray-400 text-sm mb-2">Didn&apos;t receive the code?</Text>
                                    <TouchableOpacity onPress={onResendPress}>
                                        <Text className="text-blue-400 text-sm font-medium mt-5">Resend Code</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </>
        )
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
                            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4">
                                <Text className="text-white text-2xl font-bold">MF</Text>
                            </View>
                            <Text className="text-white text-3xl font-bold mb-2">Create Account</Text>
                            <Text className="text-gray-400 text-base text-center">
                                Join MovieFlex and discover your next favorite film
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View className="space-y-4">
                            {/* Name Fields */}
                            <View className="flex-row space-x-3 gap-5 mb-5">
                                <View className="flex-1">
                                    <Text className="text-white text-sm font-medium mb-2">First Name</Text>
                                    <TextInput
                                        className={`bg-gray-800 border rounded-xl px-4 py-4 text-white text-base ${errors.firstName ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                        placeholder="John"
                                        placeholderTextColor="#9CA3AF"
                                        value={firstName}
                                        onChangeText={(text) => {
                                            setFirstName(text)
                                            clearError('firstName')
                                        }}
                                        editable={!isLoading}
                                    />
                                    {errors.firstName ? (
                                        <Text className="text-red-500 text-sm mt-1">{errors.firstName}</Text>
                                    ) : null}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white text-sm font-medium mb-2">Last Name</Text>
                                    <TextInput
                                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white text-base"
                                        placeholder="Doe"
                                        placeholderTextColor="#9CA3AF"
                                        value={lastName}
                                        onChangeText={setLastName}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>

                            {/* Email Input */}
                            <View className='mb-5'>
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
                            <View className="mb-5">
                                <Text className="text-white text-sm font-medium mb-2">Password</Text>
                                <View className="relative">
                                    <TextInput
                                        className={`bg-gray-800 border rounded-xl px-4 py-4 text-white text-base pr-12 ${errors.password ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                        placeholder="Create a password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
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
                                        <Text className="text-gray-400 text-sm">
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.password ? (
                                    <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
                                ) : null}
                            </View>

                            {/* Confirm Password Input */}
                            <View className='mb-5'>
                                <Text className="text-white text-sm font-medium mb-2">Confirm Password</Text>
                                <View className="relative">
                                    <TextInput
                                        className={`bg-gray-800 border rounded-xl px-4 py-4 text-white text-base pr-12 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                        placeholder="Confirm your password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text)
                                            clearError('confirmPassword')
                                        }}
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        className="absolute right-4 top-4"
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Text className="text-gray-400 text-sm">
                                            {showConfirmPassword ? 'Hide' : 'Show'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword ? (
                                    <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
                                ) : null}
                            </View>

                            {/* Password Requirements */}
                            <View className="bg-gray-800/30 rounded-xl p-3 mb-5">
                                <Text className="text-gray-400 text-xs">Password must contain:</Text>
                                <Text className="text-gray-400 text-xs">• At least 8 characters</Text>
                                <Text className="text-gray-400 text-xs">• One uppercase letter</Text>
                                <Text className="text-gray-400 text-xs">• One lowercase letter</Text>
                                <Text className="text-gray-400 text-xs">• One number</Text>
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                className={`rounded-xl py-4 px-6 mt-6 mb-5 ${isLoading ? 'bg-blue-700' : 'bg-blue-600'
                                    }`}
                                onPress={onSignUpPress}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <View className="flex-row items-center justify-center">
                                        <ActivityIndicator size="small" color="#fff" className="mr-2" />
                                        <Text className="text-white text-center text-lg font-semibold">
                                            Creating Account...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-white text-center text-lg font-semibold">
                                        Create Account
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Terms and Privacy */}
                        <View className="mt-6">
                            <Text className="text-gray-400 text-xs text-center leading-4">
                                By creating an account, you agree to our{' '}
                                <Text className="text-blue-400">Terms of Service</Text>
                                {' '}and{' '}
                                <Text className="text-blue-400">Privacy Policy</Text>
                            </Text>
                        </View>

                        {/* Sign In Link */}
                        <View className="flex-row justify-center items-center mt-8 mb-5">
                            <Text className="text-gray-400 text-base">Already have an account? </Text>
                            <Link href="/sign-in" asChild>
                                <TouchableOpacity>
                                    <Text className="text-blue-400 text-base font-medium">Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
}