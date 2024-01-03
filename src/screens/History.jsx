import { observer } from "mobx-react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useLayoutEffect, useRef, useState } from "react";
import scheduleStore from "../store/ScheduleStore";
import { Button, Icon, MD3Colors } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import RNDateTimePicker from "@react-native-community/datetimepicker";
import authStore from "../store/AuthStore";
import RNPickerSelect from "react-native-picker-select";
import IonIcon from "react-native-vector-icons/Ionicons";
import React from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { ROLES } from "../enum/role";
const History = (props) => {
  const qrRef = useRef();
  const [showModal, setShowModel] = useState(false);
  const [value, setValue] = useState("");
  const [timeStart, setTimeStart] = useState(0);
  const [timeEnd, setTimeEnd] = useState(0);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const [showTimeStartClock, setShowTimeStartClock] = useState(false);
  const [showTimeEndClock, setShowTimeEndClock] = useState(false);
  const [classes, setClasses] = useState({});
  useLayoutEffect(() => {}, [scheduleStore.classes]);
  useLayoutEffect(() => {
    scheduleStore.listenSchedule(authStore.user.id);
  }, []);
  const handleSaveHistory = () => {
    if (!permissionResponse.granted) {
      requestPermission();
    }
    const filePath =
      FileSystem.documentDirectory +
      new Date().getTime() +
      "-" +
      authStore.user.name +
      "-" +
      authStore.user.id +
      ".csv";
    console.log(filePath);
    let data = {
      teacher: authStore.user,
      schedules: scheduleStore.schedules,
    };
    FileSystem.writeAsStringAsync(filePath, JSON.stringify(data), {
      encoding: FileSystem.EncodingType.UTF8,
    }).then(() => {
      MediaLibrary.saveToLibraryAsync(filePath).then(() => {
        Toast.show({
          type: "Thành công",
          text1: "Lưu thành công",
        });
      });
    });
  };

  const setDateTimeStart = (event, date) => {
    const {
      type,
      nativeEvent: { timestamp, utcOffset },
    } = event;
    setShowTimeStartClock(false);
    setTimeStart(timestamp);
  };
  const setDateTimeEnd = (event, date) => {
    const {
      type,
      nativeEvent: { timestamp, utcOffset },
    } = event;
    setShowTimeEndClock(false);
    setTimeEnd(timestamp);
  };

  const SC_W = Dimensions.get("window").width;
  const handleGenerateCode = () => {
    if (parseInt(timeEnd) <= parseInt(timeStart)) {
      Alert.alert("Lỗi", "Thời gian không được để trống");
      return;
    }
    if (timeEnd - timeStart < 10 * 60 * 1000) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải lớn hơn thời gian bắt đầu 10 phút");
      return;
    }
    if (Object.keys(classes).length <= 0) {
      Alert.alert("Lỗi", "Phải chọn lớp học");
      return;
    }
    const data = {
      start: timeStart,
      end: timeEnd,
      teacherId: authStore.user.id,
      classes: classes,
    };
    setValue(JSON.stringify(data));
  };

  const handleSaveQrToDisk = () => {
    if (!permissionResponse.granted) {
      requestPermission();
    }
    qrRef.current.toDataURL((data) => {
      const filePath =
        FileSystem.documentDirectory + new Date().getTime() + ".png";
      console.log(filePath);
      FileSystem.writeAsStringAsync(filePath, data, {
        encoding: FileSystem.EncodingType.Base64,
      }).then(() => {
        MediaLibrary.saveToLibraryAsync(filePath).then(() => {
          Toast.show({
            type: "info",
            text1: "Lưu thành công",
          });
        });
      });
    });
  };
  const filterScheduleWithClass = (clazz, schedules) => {
    return schedules?.filter((sc) => sc.classes.name == clazz);
  };
  const nav = useNavigation();
  useLayoutEffect(() => {
    if (
      authStore?.user?.role == ROLES.TEACHER &&
      scheduleStore.notifications.length > 0
    ) {
      Toast.show({
        type: "info",
        text1: "Thêm 1 học sinh vào lớp!",
      });
      scheduleStore.setNoti([]);
    }
  }, [scheduleStore.notifications]);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 30,
      }}
    >
      {!showModal && (
        <View
          style={{
            width: "100%",
            marginTop: 12,
            justifyContent: "space-around",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Button
            onPress={() => {
              setShowModel(true);
            }}
            mode="contained"
          >
            <Text>Tạo mã</Text>
          </Button>
          <Button
            onPress={() => {
              handleSaveHistory();
            }}
            mode="contained"
          >
            Lịch sử lưu
          </Button>
        </View>
      )}
      <>
        <Text style={{ fontSize: 26, marginVertical: 20, marginLeft: 10 }}>
          Danh sách học sinh đã vào lớp
        </Text>
        <ScrollView>
          {authStore.user.classes.map((cl, index) => {
            const listStudentOfClass = filterScheduleWithClass(
              cl.name,
              scheduleStore.schedules
            );

            return (
              <List.AccordionGroup key={index}>
                <List.Section>
                  <List.Accordion
                    id="1"
                    title={cl.name + "(" + listStudentOfClass.length + ")"}
                    style={{ width: SC_W - 20, paddingVertical: 0 }}
                  >
                    {listStudentOfClass.map((sc, idx) => {
                      const std = authStore.getByName(sc.user.name);
                      const isVerify = std !== null;
                      return (
                        <List.Item
                          key={idx}
                          onPress={() => {
                            nav.navigate("profile", {
                              name: sc.user.name,
                            });
                          }}
                          title={sc.user.name}
                          left={() => <List.Icon icon="account" />}
                        />
                      );
                    })}
                  </List.Accordion>
                </List.Section>
              </List.AccordionGroup>
            );
          })}
        </ScrollView>
        {showModal && (
          <TouchableOpacity
            onPress={() => {
              setShowModel(false);
              setValue("");
              setTimeEnd(0);
              setTimeStart(0);
              setClasses({});
            }}
            activeOpacity={1}
            style={{
              width: "100%",
              borderRadius: 6,
              height: "100%",
              backgroundColor: "rgba(0,0,0,.6)",
              display: "flex",
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              margin: "auto",
              zIndex: 10,
            }}
          >
            <View
              style={{
                width: "80%",
                borderRadius: 6,
                height: "80%",
                backgroundColor: "white",
                zIndex: 10,
                paddingHorizontal: 6,
                display: "flex",
                paddingVertical: 30,
                justifyContent: "flex-start",
                alignItems: "center",
                margin: "auto",
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(0,0,0,.04)",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 4,
                }}
                onPress={() => {
                  setShowTimeStartClock(true);
                }}
              >
                <Text style={{ textAlign: "start", width: "100%" }}>
                  {" "}
                  {timeStart != 0
                    ? new Date(timeStart).getHours() +
                      " : " +
                      new Date(timeStart).getMinutes() +
                      " : " +
                      (new Date(timeStart).getHours > 12 ? "PM" : "AM")
                    : "Thời gian bắt đầu"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  marginVertical: 8,
                  width: "100%",
                  backgroundColor: "rgba(0,0,0,.04)",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 4,
                }}
                onPress={() => {
                  setShowTimeEndClock(true);
                }}
              >
                <Text style={{ textAlign: "start" }}>
                  {timeEnd != 0
                    ? new Date(timeEnd).getHours() +
                      " : " +
                      new Date(timeEnd).getMinutes() +
                      " : " +
                      (new Date(timeEnd).getHours > 12 ? "PM" : "AM")
                    : "Thời gian kết thúc"}
                </Text>
              </TouchableOpacity>

              <RNPickerSelect
                style={{ width: "90%" }}
                placeholder={{ label: "Chọn lớp" }}
                onValueChange={(value) => {
                  setClasses({ name: value });
                }}
                items={authStore.user.classes.map((val) => {
                  return {
                    label: val?.name,
                    value: val?.name,
                  };
                })}
              />
              <Button onPress={handleGenerateCode} style={{ marginBottom: 12 }}>
                Khởi tạo mã
              </Button>
              {value !== "" && (
                <QRCode
                  getRef={(c) => (qrRef.current = c)}
                  size={200}
                  value={value}
                />
              )}
              {value !== "" && (
                <TouchableOpacity
                  onPress={handleSaveQrToDisk}
                  activeOpacity={0.7}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,.1)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 4,
                    marginVertical: 20,
                  }}
                >
                  <IonIcon
                    name="arrow-down-circle-outline"
                    color={"black"}
                    size={26}
                  />
                  <Text style={{ marginHorizontal: 6 }}>Lưu vào thư viện</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}

        {showTimeStartClock && (
          <RNDateTimePicker
            mode="time"
            display="spinner"
            onChange={setDateTimeStart}
            value={new Date()}
            maximumDate={new Date()}
          />
        )}
        {showTimeEndClock && (
          <RNDateTimePicker
            mode="time"
            display="spinner"
            onChange={setDateTimeEnd}
            value={new Date()}
            maximumDate={new Date()}
          />
        )}
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 20,
          }}
        ></View>
      </>
    </View>
  );
};
export default observer(History);
