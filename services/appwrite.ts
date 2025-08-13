import { Client, Databases, ID, Query } from "react-native-appwrite"
// track the searches made by the user

export interface UserProfile {
    userId: string;
    name: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
}

const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const USERS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const SAVED_MOVIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID!;

const client = new Client()
    .setEndpoint(ENDPOINT) // Your Appwrite Endpoint
    .setProject(PROJECT_ID); // Your Appwrite Project ID


const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', query),
        ]);

        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];

            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1,
                }
            )
        } else {
            await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm: query,
                    movie_id: movie.id,
                    count: 1,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    title: movie.title,
                }
            )
        }

    } catch (error) {
        console.log('Error updating search count:', error);
        throw error;
    }



    // call the Appwrite to check if the search already exists
    // if document is found, increment the searchCount field
    // if document is not found, create a new document with searchCount set to 1

}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);

        return result.documents as unknown as TrendingMovie[];
    } catch (error) {
        console.log('Error fetching trending movies:', error);
        return undefined;
    }
}

export const checkIfSaved = async (movieId: string, userId: string) => {
    try {
        const response = await database.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
            Query.equal('userId', userId),
            Query.equal('movieId', movieId),
        ]);
        if (response.documents.length > 0) {
            return {
                isSaved: true,
                savedMovieId: response.documents[0].$id,
                savedMovieData: JSON.parse(response.documents[0].movieData),
            }
        } else {
            return {
                isSaved: false,
                savedMovieId: null,
                savedMovieData: null,
            }
        }
    } catch (error) {
        console.log('Error checking if movie is saved:', error);
        return {
            isSaved: false,
            savedMovieId: null,
            savedMovieData: null,
        }
    }
}

export const saveMovie = async (userId: string, movieId: string, movieData: any) => {
    try {
        const document = await database.createDocument(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            ID.unique(),
            {
                userId: userId,
                movieId: movieId,
                movieData: JSON.stringify(movieData),
            }
        );
        return document.$id;
    } catch (error) {
        console.error('Error saving movie:', error);
        return null;
    }
};

export const removeSavedMovie = async (savedMovieId: string) => {
    try {
        await database.deleteDocument(DATABASE_ID, SAVED_MOVIES_COLLECTION_ID, savedMovieId);
        return true;
    } catch (error) {
        console.error('Error removing saved movie:', error);
        return false;
    }
}

export const fetchSavedMovies = async (userId: string) => {
    try {
        const response = await database.listDocuments(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            [
                Query.equal('userId', userId)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching saved movies:', error);
        return [];
    }
};
