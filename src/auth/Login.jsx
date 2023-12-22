import { observer } from "mobx-react";
import VStack from "../cpn/layout/VStack";
import { Text, TextInput, Button } from "react-native-paper";
import { useLayoutEffect, useState } from "react";
import authStore from "../store/AuthStore";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Login = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const nav = useNavigation();
  const handleLogin = async () => {
    if (loginData.email.trim() === "" || loginData.password.trim() == "") {
      Alert.alert("Form Invalid", "Please fill data to form");
      return;
    }
    await authStore.login(loginData);
  };
  useLayoutEffect(() => {
    const bs = async () => {
      const authInfo = JSON.parse(await AsyncStorage.getItem("auth_info"));
      if (authInfo != null) {
        authStore.login({ email: authInfo.email, password: authInfo.password });
      }
    };
    bs();
  }, []);
  return (
    <VStack flex={1} space={20} justifyContent={"center"} alignItems={"center"}>
      <Text variant="displayMedium" style={{ color: "black" }}>
        login
      </Text>
      <TextInput
        onChangeText={(text) => setLoginData({ ...loginData, email: text })}
        style={{ width: "90%" }}
        label="Email"
        right={<TextInput.Icon icon={"email"} />}
      />
      <TextInput
        onChangeText={(text) => setLoginData({ ...loginData, password: text })}
        style={{ width: "90%" }}
        label="Password"
        secureTextEntry
        right={<TextInput.Icon icon="eye" />}
      />
      {authStore.draft.logging ? (
        <ActivityIndicator size={40} color={"black"} />
      ) : (
        <>
          <Button mode="contained" onPress={handleLogin}>
            Login
          </Button>
          <TouchableOpacity
            onPress={() => {
              nav.navigate("reg");
            }}
          >
            <Text>Register</Text>
          </TouchableOpacity>
        </>
      )}
    </VStack>
  );
};

export default observer(Login);
