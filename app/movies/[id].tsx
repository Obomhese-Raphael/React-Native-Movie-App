import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';
import { icons } from '@/assets/constants/icons';
import { checkIfSaved, removeSavedMovie, saveMovie } from '@/services/appwrite';
import * as Notifications from 'expo-notifications';


interface MovieInfoProps {
  label?: string;
  value?: string | number | null;
}

// Component to display a single movie detail info
const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className='flex-col items-start justify-center mt-5'>
    <Text className='text-light-200 font-normal text-sm'>{label}</Text>
    <Text className='text-light-100 font-bold text-sm mt-2'>{value || 'N/A'}</Text>
  </View>
);

const MovieDetails = () => {
  const router = useRouter();
  const { user } = useUser();
  const { id } = useLocalSearchParams();

  // Fetches movie data from the TMDB API
  const { data: movie, loading: isLoadingMovie } = useFetch(() => fetchMovieDetails(id as string));

  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedMovieId, setSavedMovieId] = useState(null);

  // Function to check if the movie is already saved by the user
  const getSavedStatus = async () => {
    if (!user || !id) return;
    // Note: userId first, then movieId
    const { isSaved, savedMovieId: appwriteDocId } = await checkIfSaved(user.id, id);
    setIsFavorite(isSaved);
    setSavedMovieId(appwriteDocId);
  };

  useEffect(() => {
    getSavedStatus();
  }, [user, id]);

  // Function to toggle the movie's saved status
  const toggleFavorite = async () => {
    if (!user || !movie) return;

    setIsSaving(true);
    try {
      // If already saved, show notification and do nothing
      if (isFavorite && isSaved) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Already Saved',
            body: 'Movie already saved to lists',
          },
          trigger: null,
        });
        return;
      }

      // Remove from saved list
      if (isFavorite) {
        if (savedMovieId) {
          const success = await removeSavedMovie(savedMovieId);
          if (success) {
            setIsFavorite(false);
            setIsSaved(false);
            setSavedMovieId(null);
            Alert.alert('Removed', `${movie.title} has been removed from your list.`);
          }
        }
      } else {
        // Add to saved list
        const newDocId = await saveMovie(user.id, id, movie);
        if (newDocId) {
          setIsFavorite(true);
          setIsSaved(true);
          setSavedMovieId(newDocId);
          Alert.alert('Saved', `${movie.title} has been added to your list!`);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      Alert.alert('Error', 'Failed to update your list. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingMovie) {
    return (
      <SafeAreaView className="bg-primary flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80, paddingTop: 20 }} className="flex-1">
        <View>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}` }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          {/* Play Button */}
          <TouchableOpacity className="absolute bottom-5 right-24 rounded-full size-14 bg-white flex items-center justify-center z-50">
            <Image source={icons.play} className="w-6 h-7 ml-1" resizeMode="stretch" />
          </TouchableOpacity>

          {/* Save/Favorite Button */}
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={isSaving}
            className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center z-50"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Image
                source={isFavorite && isSaved ? icons.heart : icons.heartEmpty}
                className="w-6 h-6"
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
