import { observer } from "mobx-react";
import VStack from "../cpn/layout/VStack";
import { Text, TextInput, Button } from "react-native-paper";
import { useLayoutEffect, useState } from "react";
import authStore from "../store/AuthStore";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import scheduleStore from "../store/ScheduleStore";
import { useNavigation } from "@react-navigation/native";
const Register = () => {
  const nav = useNavigation();
  const [regData, setRegData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    classes: {},
    name: "",
  });
  useLayoutEffect(() => {
    const bs = async () => {
      await scheduleStore.getClasses();
    };
    bs();
  }, []);
  const handleLogin = async () => {
    if (
      regData.email.trim() === "" ||
      regData.password.trim() == "" ||
      regData.password != regData.confirmPassword ||
      Object.keys(regData.classes).length == 0 ||
      regData.name.trim() == ""
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    await authStore.register(regData);
  };
  return (
    <VStack flex={1} space={20} justifyContent={"center"} alignItems={"center"}>
      <Text variant="displayMedium" style={{ color: "black" }}>
        ĐĂNG KÝ
      </Text>
      <TextInput
        onChangeText={(text) => setRegData({ ...regData, email: text })}
        style={{ width: "90%" }}
        label="Email"
        right={<TextInput.Icon icon={"email"} />}
      />
      <TextInput
        onChangeText={(text) => setRegData({ ...regData, name: text })}
        style={{ width: "90%" }}
        label="Họ tên"
        right={<TextInput.Icon icon={"account"} />}
      />
      <TextInput
        onChangeText={(text) => setRegData({ ...regData, password: text })}
        style={{ width: "90%" }}
        label="Mật khẩu"
        secureTextEntry
        right={<TextInput.Icon icon="eye" />}
      />
      <TextInput
        onChangeText={(text) =>
          setRegData({ ...regData, confirmPassword: text })
        }
        style={{ width: "90%" }}
        label="Xác nhận mật khẩu"
        secureTextEntry
        right={<TextInput.Icon icon="eye" />}
      />
      <RNPickerSelect
        style={{ width: "90%" }}
        placeholder={{ label: "Chọn lớp" }}
        onValueChange={(value) =>
          setRegData({ ...regData, classes: { name: value } })
        }
        items={scheduleStore.classes.map((val) => {
          return {
            label: val?.name,
            value: val?.name,
          };
        })}
      />
      {authStore.draft.logging ? (
        <ActivityIndicator size={40} color={"black"} />
      ) : (
        <>
          <Button mode="contained" onPress={handleLogin}>
            Đăng ký
          </Button>
          <TouchableOpacity
            onPress={() => {
              nav.navigate("login");
            }}
          >
            <Text>Quay lại</Text>
          </TouchableOpacity>
        </>
      )}
    </VStack>
  );
};

export default observer(Register);
