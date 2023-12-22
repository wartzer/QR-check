import { observer } from "mobx-react";
import authStore from "../store/AuthStore";
import { useLayoutEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useNavigation } from "@react-navigation/native";
const Profile = ({ route, navigation }) => {
  const { name } = route.params;
  const [user, setUser] = useState({});
  useLayoutEffect(() => {
    const bs = async () => {
      const rs = await authStore.getByName(name);
      if (rs) {
        setUser(rs);
      } else {
        Toast.show({ type: "error", text1: "No student found" });
        navigation.goBack();
      }
    };
    bs();
  }, []);
  return (
    <View
      style={{
        width: "100%",
        flex: 1,
        paddingVertical: 40,
        justifyContent: "start",
        alignItems: "center",
      }}
    >
      <TouchableOpacity>
        <Image
          source={{ uri: user?.avatar }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 100,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        />
      </TouchableOpacity>
      <Text
        style={{
          textAlign: "center",
          fontSize: 26,
          fontWeight: "300",
          marginTop: 10,
        }}
      >
        {user?.name}
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 12,
          fontStyle: "italic",
          color: "gray",
          fontWeight: 600,
          marginVertical: 3,
        }}
      >
        {user?.email}
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 20,
          color: "#2c2c2c",
          fontWeight: 600,
          marginVertical: 3,
        }}
      >
        {user?.classes?.name}
      </Text>
    </View>
  );
};
export default observer(Profile);
