import { icons } from "@/assets/constants/icons";
import { images } from "@/assets/constants/images";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { user } = useUser();
  const router = useRouter();
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError
  } = useFetch(getTrendingMovies);
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError
  } = useFetch(() => fetchMovies({
    query: ''
  }));
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}>
        {/* User Button from clerk */}
        <View className="flex-row items-center justify-between mt-5">
          <Text className="text-lg text-white font-bold">Welcome 👋, {" "}{user?.firstName || "User"}</Text>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : icons.person}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>
        <Image source={icons.logo} className="w-12 h-10 mt-10 mb-5 mx-auto" />
        {moviesLoading || trendingLoading ? (
          <ActivityIndicator size={'large'} color={'#0000ff'} className="mt-10 self-center" />
        ) : moviesError || trendingError ? (
          <Text>Error: {moviesError?.message || trendingError?.message}</Text>
        ) : <View className="flex-1 mt-5">
          <SearchBar
            onPress={() => router.push("/search")}
            placeholder="Search for a movie"
          />
          {trendingMovies && (
            <View className="mt-10">
              <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4" />}
                className="mb-4 mt-3"
                data={trendingMovies}
                renderItem={({ item, index }) => (
                  <TrendingCard movie={item} index={index} />
                )}
                keyExtractor={(item) => item?.movie_id.toString()}
              />
            </View>
          )}
          <>

            <Text className="text-lg text-white font-bold mt-5">Latest Movies</Text>
            <FlatList
              data={movies}
              renderItem={({ item }) => (
                <MovieCard
                  id={item.id}
                  poster_path={item.poster_path}
                  title={item.title}
                  vote_average={item.vote_average}
                  release_date={item.release_date} adult={false} backdrop_path={""} genre_ids={[]} original_language={""} original_title={""} overview={""} popularity={0} video={false} vote_count={0} />
              )}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              columnWrapperStyle={{
                justifyContent: 'flex-start',
                gap: 20,
                paddingRight: 5,
                marginBottom: 10
              }}
              className="mt-2 pb-32"
              scrollEnabled={false}
            ></FlatList>
          </>
        </View>}

      </ScrollView>
    </View>
  );
}
