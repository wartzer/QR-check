import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import scheduleStore from "../store/ScheduleStore";
import authStore from "../store/AuthStore";
import { useNavigation } from "@react-navigation/native";
import VStack from "../cpn/layout/VStack";
export const Scanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const nav = useNavigation();
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    if (data.length > 0) {
      const checkData = JSON.parse(data);
      let time = new Date().getTime();

      if (time < checkData?.start) {
        Alert.alert("Error", "Time check incorrect u checked in early!");
        return;
      }
      if (time > checkData?.end) {
        Alert.alert("Error", "Time check incorrect u checked in late!");
        return;
      }
      if (authStore.user.classes.name != checkData.classes.name) {
        Alert.alert("Error", "Invalid classes");
        return;
      }
      if (time >= checkData?.start && time <= checkData?.end) {
        const scheduleData = {
          start: checkData.start,
          end: checkData.end,
          checked_at: new Date(),
          teacher_id: checkData.teacherId,
          user: { name: authStore.user.name },
          classes: checkData.classes,
        };
        scheduleStore.checked(scheduleData);
      } else {
        Alert.alert("Error", "Time check incorrect u checked late!");
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <VStack flex={1} justifyContent={'center'} alginItems={'center'}>
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
        <Button title={"Back to home screen"} onPress={() => {
              nav.navigate('home');
        }} />
        </VStack>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
