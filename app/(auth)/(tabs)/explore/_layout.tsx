import { Stack } from "expo-router";

export default function ExploreLayout() {
    return (
        <Stack>
            <Stack.Screen name="map" options={{ title: "Map", headerShown: false }} />
            <Stack.Screen 
                name="search" 
                options={{ 
                    title: "Search",
                    presentation:"modal"
                }} 
            />
        </Stack>
    )
}