import { observer } from "mobx-react";
import authStore from "../store/AuthStore";
import { useLayoutEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import IonIcon from "react-native-vector-icons/Ionicons";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import React from "react";
import { Button, TextInput } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import scheduleStore from "../store/ScheduleStore";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
const Student = (props) => {
  const handleUpdateProfile = async () => {
    if (Object.keys(authStore.updateInfo).length <= 0) {
      Toast.show({
        type: "info",
        text1: "Không thông tin nào được thay đổi",
      });
      return;
    }
    await authStore.updateProfile();
  };

  useLayoutEffect(() => {
    scheduleStore.getClasses();
  }, []);
  useLayoutEffect(() => {}, [scheduleStore.classes]);
  const SecondRoute = () => (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        paddingVertical: 20,
        backgroundColor: "white",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <View
        style={{
          marginVertical: 10,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ textAlign: "start", marginBottom: 4, width: "90%" }}>
          Tên Học sinh
        </Text>
        <TextInput
          onChangeText={(text) =>
            authStore.setUpdateInfo({ ...authStore.updateInfo, name: text })
          }
          placeholder={authStore.user.name}
          style={{
            width: "90%",
            height: 46,
            borderColor: "white",
            borderWidth: 0,
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 6,
          }}
        />
      </View>
      <View
        style={{
          marginVertical: 10,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ textAlign: "start", marginBottom: 4, width: "90%" }}>
          Email Học sinh
        </Text>
        <TextInput
          onChangeText={(text) =>
            authStore.setUpdateInfo({ ...authStore.updateInfo, email: text })
          }
          placeholder={authStore.user.email}
          style={{
            width: "90%",
            height: 46,
            borderColor: "white",
            borderWidth: 0,
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 6,
          }}
        />
      </View>
      {/* <RNPickerSelect
        style={{ width: "90%" }}
        placeholder={{ label: "Chọn lớp" }}
        onValueChange={(value) => {
          authStore.setUpdateInfo({ classes: { name: value } });
        }}
        value={authStore.user.classes.name}
        items={scheduleStore.classes.map((val) => {
          return {
            label: val?.name,
            value: val?.name,
          };
        })}
      /> */}
      <Button onPress={handleUpdateProfile} mode="contained">
        Cập nhật
      </Button>
    </ScrollView>
  );

  const renderScene = SceneMap({
    second: SecondRoute,
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([{ key: "second", title: "Profile" }]);
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "black" }}
      style={{ backgroundColor: "white" }}
      activeColor="black"
      inactiveColor="gray"
    />
  );

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await authStore.uploadAvatar(result.assets[0].uri);
    }
  };

  const nav = useNavigation();

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
      <View
        style={{
          flexDirection: "row",
          width: "90%",
          height: 40,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            nav.navigate("scanner");
          }}
          activeOpacity={0.7}
        >
          <IonIcon name="qr-code-outline" size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            authStore.logout(true);
          }}
          activeOpacity={0.7}
        >
          <IonIcon name="log-out-outline" color={"red"} size={24} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: authStore.user?.avatar }}
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
        {authStore.user.name}
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
        {authStore.user.email}
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
        {authStore.user.classes.name}
      </Text>
      <View
        style={{
          width: "100%",
          height: "100%",
          marginVertical: 20,
          backgroundColor: "black",
        }}
      >
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: "100%" }}
        />
      </View>
    </View>
  );
};
export default observer(Student);
