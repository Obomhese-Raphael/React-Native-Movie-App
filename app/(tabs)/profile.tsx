import { icons } from '@/assets/constants/icons';
// import { SignOutButton } from '@/components/SignOutButton'; // We are no longer using this import
import { SignedIn, SignedOut, useAuth, useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Custom SignOutButton component to apply specific styling
const SignOutButton = () => {
  const { signOut } = useClerkAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="flex-row items-center justify-center p-3 w-full bg-red-600 rounded-md"
    >
      <Text className="text-white text-base font-semibold">Sign Out</Text>
    </TouchableOpacity>
  );
};


const Profile = () => {
  const { user } = useUser();
  const { isLoaded } = useAuth();
  // State for uploading the profile picture AND saving the profile info
  const [isUploading, setIsUploading] = useState(false);
  // State for the edit modal visibility
  const [editVisible, setEditVisible] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Handles saving the name and email changes
  const handleEditSave = async () => {
    setIsUploading(true);

    try {
      const updates = {};
      let updateNeeded = false;

      // Check if firstName has changed and add it to updates object
      if (firstName !== user?.firstName) {
        updates.firstName = firstName;
        updateNeeded = true;
      }

      // Check if lastName has changed and add it to updates object
      if (lastName !== user?.lastName) {
        updates.lastName = lastName;
        updateNeeded = true;
      }

      // Only call the update API if a name has actually changed
      if (updateNeeded) {
        await user?.update(updates);
      }

      // For email, Clerk requires a verification flow, so we only trigger it
      // if the email has actually been changed.
      if (email && email !== user?.primaryEmailAddress?.emailAddress) {
        await user?.createEmailAddress({ emailAddress: email });
      }

      Alert.alert("Success", "Profile updated successfully!");
      setEditVisible(false);
    } catch (err) {
      Alert.alert("Error", "Could not update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setIsUploading(false);
    }
  };


  const handleAvatarPress = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImageLibrary },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadAvatar(result.assets[0]);
    }
  };

  const openImageLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Photo library permission is required to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (imageAsset) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Get the image file and upload to Clerk
      const file = {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: 'avatar.jpg',
      } as any;

      await user.setProfileImage({ file });

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView className="bg-primary flex-1">
      <SignedIn>
        {/* Header Section */}
        <View className="pt-16 pb-8 px-6">
          <View className="items-center">
            {/* Avatar with Upload Option */}
            <TouchableOpacity onPress={handleAvatarPress} className="mb-4 relative">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user?.imageUrl }}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-600 items-center justify-center">
                  <Image
                    source={icons.person}
                    className="w-12 h-12"
                    tintColor="#fff"
                  />
                </View>
              )}

              {/* Camera Icon Overlay */}
              <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full items-center justify-center border-2 border-primary">
                <Text className="text-white text-xs">📷</Text>
              </View>

              {/* Loading Overlay for avatar upload */}
              {isUploading && (
                <View className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* User Info */}
            <View className="items-center mb-6">
              <Text className="text-white text-2xl font-bold mb-2">
                {user?.firstName || user?.fullName || 'User'}
              </Text>
              <Text className="text-gray-300 text-base">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Tap photo to change
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Options Section */}
        <View className="px-6">
          {/* Account Information Card */}
          <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">Account Information</Text>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-300">Name</Text>
                <Text className="text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.fullName || 'Not set'}
                </Text>
              </View>

              <View className="h-px bg-gray-700" />

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-300">Email</Text>
                <Text className="text-white">
                  {user?.primaryEmailAddress?.emailAddress || 'Not set'}
                </Text>
              </View>

              <View className="h-px bg-gray-700" />

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-300">Member Since</Text>
                <Text className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Navigation Options */}
          <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">Navigation</Text>

            <TouchableOpacity
              onPress={() => router.push('/')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <Image source={icons.home} className="w-5 h-5 mr-3" tintColor="#60A5FA" />
                <Text className="text-white text-base">Home</Text>
              </View>
              <Text className="text-blue-400">→</Text>
            </TouchableOpacity>

            <View className="h-px bg-gray-700 my-1" />

            {/* Edit Info Button (Now TouchableOpacity) */}
            <TouchableOpacity
              onPress={() => setEditVisible(true)}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                {/* I've added a dummy icon here for consistency */}
                <Image source={icons.edit} className="w-5 h-5 mr-3" tintColor="#60A5FA" />
                <Text className="text-white text-base">Edit Info</Text>
              </View>
              <Text className="text-blue-400">→</Text>
            </TouchableOpacity>

            {/* Modal for editing profile details */}
            <Modal visible={editVisible} transparent>
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000099" }}>
                <View style={{ backgroundColor: "#1f2937", padding: 20, gap: 10, borderRadius: 10, width: 320 }}>
                  <Text className="text-white text-lg font-bold mb-2 text-center">Edit Profile</Text>

                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    placeholderTextColor="#9ca3af"
                    className='border border-gray-300 rounded-md p-3 w-full text-white'
                  />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    placeholderTextColor="#9ca3af"
                    className='border border-gray-300 rounded-md p-3 w-full text-white'
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#9ca3af"
                    className='border border-gray-300 rounded-md p-3 w-full text-white'
                  />

                  {/* Button container with loading indicator logic */}
                  <View className='flex flex-col gap-4 mt-4'>
                    <TouchableOpacity
                      onPress={handleEditSave}
                      disabled={isUploading}
                      className={`rounded-md py-3 flex-row justify-center items-center ${isUploading ? 'bg-gray-500' : 'bg-blue-600'}`}
                    >
                      {isUploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white text-base font-semibold">Save</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setEditVisible(false)}
                      disabled={isUploading}
                      className="rounded-md py-3 flex-row justify-center items-center bg-gray-400"
                    >
                      <Text className="text-white text-base font-semibold">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>

          {/* Sign Out Section */}
          <View className="bg-gray-800/50 rounded-xl p-4 mb-8 w-full">
            <View className="flex-row items-center justify-center w-full">
              <SignOutButton />
            </View>
          </View>
        </View>
      </SignedIn>

      <SignedOut>
        {/* Not Signed In State */}
        <View className="flex-1 justify-center items-center px-6 py-20">
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-gray-600 items-center justify-center mb-4">
              <Image
                source={icons.person}
                className="w-12 h-12"
                tintColor="#fff"
              />
            </View>
            <Text className="text-white text-xl font-semibold mb-2">Welcome to MovieFlex</Text>
            <Text className="text-gray-400 text-center mb-8">
              Sign in to access your profile and personalized movie experience
            </Text>
          </View>

          {/* Auth Buttons */}
          <View className="w-full max-w-sm space-y-4 gap-10">
            <Link href="/sign-in" asChild>
              <TouchableOpacity className="bg-blue-600 rounded-xl py-4 px-6">
                <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/sign-up" asChild>
              <TouchableOpacity className="bg-gray-700 rounded-xl py-4 px-6 border border-gray-600">
                <Text className="text-white text-center text-lg font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SignedOut>
    </ScrollView>
  )
}

export default Profile;
