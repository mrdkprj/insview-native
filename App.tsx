import React, { useState, useEffect, useCallback } from "react";
import { AppRegistry, SafeAreaView, View, Pressable, Alert, Image, FlatList, StyleSheet, Text, StatusBar, TextInput,Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {media, mediaResponse, resultMedia, query } from "./src/instagram";

const imageSize = Dimensions.get("window").width / 3;

const showAlert = (message: string) => {
    Alert.alert(
        "Error",
        message
    )
}

const App = () => {

    const Stack = createNativeStackNavigator();

    const [images, setImages] = useState<mediaResponse>({username: "", media: [], rowIndex:0});

    const [username, setUsername]  = useState("");

    const getInsImages = useCallback(async (name) => {

        //setLoading(true)

        try{
            const result = await query(name);
            setUsername(result.username);
            setImages(result);
        }catch(ex:any){
            setUsername(name);
            showAlert(ex.message);
            setImages({username: "", media: [], rowIndex:0});
        }finally{
            //setLoading(false)
        }
    },[]);

    const restore = async () => {
        try{
            const savedUsername :any = "a";
            if(savedUsername){
                setUsername(savedUsername);
            }
        }catch(ex){

        }
    }

    const save = async (newUsername : string) => {
        try{
            setUsername(newUsername);
        }catch(ex : any){
            showAlert(ex.message);
        }
    }

    useEffect(()=>{

        getInsImages("");

    },[getInsImages])

    const HomeScreen = ({ navigation, route } : any) => {

        const Item = ( { media } : any) => (
            <Pressable style={styles.galleryItem} onPress={() => navigation.navigate("ImageModal",{uri:media.media_url})}>
                <Image style={styles.img} source={{uri:media.media_url}}/>
            </Pressable>
        );

        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={images.media}
                    initialNumToRender={10}
                    initialScrollIndex={0}
                    renderItem={({ item }) => <Item media={item}/>}
                    keyExtractor={item => item.id}
                    numColumns={3}
                />
            </SafeAreaView>
        );

    }

    const ModalScreen = ({ navigation, route } : any) => {
        const [postText, setPostText] = React.useState("");

        useEffect(() => {
            setPostText(username)
        },[])

        const onDone = async() => {
            await save(postText);
            navigation.navigate("Insview");
        }

        const onCancel = () => {
            navigation.navigate("Insview");
        }

        return (
            <View style={{ display:"flex", flex: 1, alignItems: "baseline", justifyContent: "center", flexDirection: "row", width:"100%"}}>
                <View style={{ display:"flex", alignItems: "center", justifyContent: "center", flexDirection: "column" , width:"100%"}}>
                    <View style={{ padding:20, width:"100%"}}>
                        <TextInput
                            placeholder="Enter username"
                            style={styles.usernameInput}
                            value={postText}
                            onChangeText={setPostText}
                            autoCorrect={false}
                            autoFocus={true}
                            clearButtonMode={"always"}
                            contextMenuHidden={true}
                            multiline={false}
                            returnKeyType={"done"}
                        />
                    </View>
                    <View style={{ display: "flex", justifyContent:"space-around", alignItems: "center", flexDirection: "row", width:"100%"}}>
                        <Pressable style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={onDone}>
                            <Text style={styles.text}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    const ImageModal = ({ navigation, route } : any) => {

        return (
            <Pressable style={{ width:"100%", height:"100%"}} >
                <Image style={{flex:1}} source={{uri:route.params.uri}}/>
            </Pressable>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Group>
                    <Stack.Screen
                        name="Insview"
                        component={HomeScreen}
                        options={({ navigation }) => ({
                            headerTitle: props => <Text></Text>,
                            headerRight: () => (
                                <Pressable style={styles.headerRightBtn} onPress={() => navigation.navigate("MyModal")}>
                                    <Text style={styles.headerText}>{username ? username : "Input username"}</Text>
                                </Pressable>
                            ),
                        })}
                    />
                </Stack.Group>
                <Stack.Group screenOptions={{ presentation: "modal" }}>
                    <Stack.Screen name="MyModal" component={ModalScreen} options={{title:"Select user"}}/>
                    <Stack.Screen name="ImageModal" component={ImageModal} options={{title:"Image"}}/>
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight,

    },
    item: {
        backgroundColor: "#ccc",
        height: 150,
        justifyContent: "center",
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 20,
    },

    title: {
        fontSize: 32,
    },

    galleryItem: {
        width: imageSize,
        height: imageSize,
        overflow: "hidden",
        position: "relative",
        marginBottom: 2,
        borderColor: "#ccc",
        borderWidth:1,
        borderStyle: "solid",
    },

    img:{
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
    },

    imgLarge:{
        maxHeight: "100%",
        position: "absolute",
        maxWidth: "100%",
    },

    button: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: "#726e6e",
    },

    cancelButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: "#fff",
        marginRight: 10,
    },

    text: {
        fontSize: 12,
        lineHeight: 13,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: "#fff",
    },

    cancelButtonText : {
        fontSize: 12,
        lineHeight: 13,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: "#726e6e",
    },

    headerRightBtn:{
        marginRight: 16,
        width: "100%",
        textAlign: "right",
    },

    headerText: {
        fontSize: 18,
        fontWeight: "500",
        color: "#1c1c1e",
    },

    usernameInput: {
        backgroundColor: "#fff",
        padding: 10,
        borderColor: "#ccc",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 4,
        height: 50,
        width:"100%"
    },

    usernameInputFocus: {
        marginBottom: 10,
        backgroundColor: "#fff",
        padding: 10,
        borderColor: "blue",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 4,
    }
});

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });

export default App;