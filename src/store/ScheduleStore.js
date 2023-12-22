import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { fireStore } from "../../firebase.config";
import { Alert } from "react-native";
import authStore from "./AuthStore";

const { makeAutoObservable } = require("mobx");

class ScheduleStore {
  DB = fireStore;
  schedules = [];
  classes = [];
  notifications = [];

  constructor() {
    makeAutoObservable(this);
  }
  setSchedule = (val) => {
    this.schedules = val;
  };
  setClasses = (val) => {
    this.classes = val;
  };
  getClasses = async () => {
    const rs = await getDocs(query(collection(this.DB, "classes")));
    let rss = [];
    rs.forEach((doc) => {
      rss.push(doc.data());
    });
    this.setClasses(rss);
  };
  uniqueArrayWithClasses = (array) => {
    if (array.length <= 0) return [];
    const returnArr = [array[0]];
    for (let cs of array) {
      for (let cs_ of returnArr) {
        if (cs.user?.name == cs_.user?.name) {
          if (cs.classes?.name != cs_.classes?.name) {
            returnArr.push(cs);
          }
        }
      }
    }
    return returnArr;
  };
  listenSchedule = async (teacherId) => {
    try {
      let start = new Date();
      start.setUTCHours(0, 0, 0, 0);

      let end = new Date();
      end.setUTCHours(23, 59, 59, 999);
      const q = query(
        collection(this.DB, "schedules"),
        where("checked_at", ">=", start),
        where("checked_at", "<=", end),
        where("teacher_id", "==", teacherId)
      );
      const unsub = onSnapshot(q, (querySnapshot) => {
        let schedule = [];
        let mine = false;
        querySnapshot.docChanges().forEach((change) => {
          if (change.type == "added") {
            if (querySnapshot.docChanges().length == 1) {
              let data = change.doc.data();
              if (data.teacher_id == authStore.user.id) {
                mine = true;
              }
            }
            schedule.push(change.doc.data());
          }
        });

        if (schedule.length == 1) {
          schedule = [...schedule, ...this.schedules];
        } else {
          schedule = this.uniqueArrayWithClasses(schedule);
        }
        if (mine && schedule.length > this.schedules.length) {
          this.setNoti([0]);
        }

        this.setSchedule(schedule);
      });
    } catch (e) {
      console.log(e);
    }
  };
  setNoti = (val) => {
    this.notifications = val;
  };
  checked = async (checkData) => {
    try {
      const q = query(
        collection(this.DB, "schedules"),
        where("checked_at", ">=", checkData.start),
        where("checked_at", "<=", checkData.end),
        where("teacher_id", "==", checkData.teacher_id)
      );
      const rs = await getDocs(q);
      let canAdd = true;
      rs.forEach((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data?.user.name == checkData.user.name) {
            canAdd = false;
          }
        }
      });
      if (!canAdd) {
        Alert.alert("Invalid", "U checked in!");
        return;
      }
      addDoc(collection(this.DB, "schedules"), checkData);
      Alert.alert("Success", "Check in success");
    } catch (e) {
      console.log(e);
    }
  };
}
const scheduleStore = new ScheduleStore();
export default scheduleStore;
