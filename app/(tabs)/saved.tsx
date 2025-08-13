import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { router, Link, useFocusEffect } from 'expo-router'; // Import useFocusEffect
import { icons } from '@/assets/constants/icons';
import { fetchSavedMovies, removeSavedMovie } from '@/services/appwrite';

const Saved = () => {
  const { user } = useUser();
  const [savedMovies, setSavedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getSavedMovies = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const movies = await fetchSavedMovies(user.id);
      setSavedMovies(movies);
    } catch (error) {
      console.error('Error fetching saved movies:', error);
      Alert.alert('Error', 'Failed to fetch your saved movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const removeMovieFromList = useCallback(async (movieId: any, movieTitle: any) => {
    const success = await removeSavedMovie(movieId);
    if (success) {
      // Optimistically update the state to reflect the change immediately
      setSavedMovies(prevMovies => prevMovies.filter(movie => movie.$id !== movieId));
      Alert.alert('Removed', `${movieTitle} has been removed from your list.`);
    } else {
      Alert.alert('Error', `Failed to remove ${movieTitle}. Please try again.`);
    }
  }, []);

  const handleRemovePrompt = (movieId: any, movieTitle: any) => {
    Alert.alert(
      "Remove Movie",
      `Are you sure you want to remove "${movieTitle}" from your list?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeMovieFromList(movieId, movieTitle), style: "destructive" }
      ]
    );
  };

  // Use useFocusEffect to refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getSavedMovies();
    }, [getSavedMovies])
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  // Empty state view
  if (savedMovies.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center px-6">
        <Text className="text-white text-lg font-bold mb-4 text-center">
          You have no saved movies yet!
        </Text>
        <Text className="text-gray-400 text-base text-center mb-6">
          Start exploring and save your favorite movies.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          className="bg-accent rounded-lg py-3.5 px-6"
        >
          <Text className="text-white font-semibold text-base">Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
        <Text className="text-white text-2xl font-bold">Saved Movies</Text>
      </View>
      <FlatList
        data={savedMovies}
        keyExtractor={item => item.$id}
        numColumns={2}
        renderItem={({ item }) => {
          const movieData = JSON.parse(item.movieData);
          return (
            <View className="relative m-2" style={{ width: '45%' }}>
              <Link href={`/movies/${movieData.id}`} asChild>
                <TouchableOpacity>
                  <Image
                    source={{
                      uri: movieData.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
                        : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
                    }}
                    className="w-full h-52 rounded-lg"
                    resizeMode="cover"
                  />
                  <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
                    {movieData.title}
                  </Text>
                  <View className='flex-row items-center justify-start gap-x-1'>
                    <Image source={icons.star} className='size-4' />
                    <Text className='text-xs text-white font-bold uppercase'>
                      {Math.round(movieData.vote_average / 2)}
                    </Text>
                  </View>
                  <View className='flex-row items-center justify-between'>
                    <Text className='text-xs text-light-300 font-medium mt-1'>
                      {movieData.release_date ? new Date(movieData.release_date).getFullYear() : 'N/A'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>

              {/* Remove button */}
              <TouchableOpacity
                onPress={() => handleRemovePrompt(item.$id, movieData.title)}
                className="absolute top-2 right-2 bg-red-600 rounded-full w-8 h-8 items-center justify-center z-10"
              >
                <Image source={icons.close} className="size-4" tintColor="#fff" />
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default Saved;
