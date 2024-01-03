import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { fireStore, storage } from "../../firebase.config";
import { Alert } from "react-native";
import { DEFAULT_AVT, ROLES } from "../enum/role";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
const { makeAutoObservable } = require("mobx");

class AuthStore {
  DB = fireStore;
  logged = false;
  updateInfo = {};
  draft = {
    logging: false,
  };
  user = {};
  constructor() {
    makeAutoObservable(this);
  }
  setUpdateInfo = (val) => {
    this.updateInfo = val;
  };
  setUser = (val) => {
    this.user = val;
  };
  setLogged = (val) => {
    this.logged = val;
  };
  setLogging = (val) => {
    this.draft.logging = val;
  };

  logout = async (deleteCookies) => {
    if (deleteCookies) {
      await AsyncStorage.removeItem("auth_info");
    }
    this.setLogged(false);
    this.setUser({});
  };
  register = async ({ email, password, classes, name }) => {
    try {
      if (!this.draft.logging) {
        this.setLogging(true);
        setTimeout(async () => {
          const doc = await getDocs(
            query(collection(this.DB, "users"), where("email", "==", email))
          );
          if (doc.docs.length > 0) {
            Alert.alert("Lỗi ", "Email đã được sử dụng");
            this.setLogging(false);
            return;
          }
          addDoc(collection(this.DB, "users"), {
            name,
            role: ROLES.STUDENT,
            email,
            password,
            classes,
            avatar: DEFAULT_AVT,
          });
          Alert.alert("Success", "Register success");
          this.setLogging(false);
        }, 1000);
      }
    } catch (e) {
      Alert.alert("Serve Error", "Something error please retry later");
    }
  };
  login = async ({ email, password }) => {
    try {
      console.log(email, password);
      if (!this.draft.logging) {
        this.setLogging(true);
        setTimeout(async () => {
          const q = query(
            collection(this.DB, "users"),
            where("email", "==", email),
            where("password", "==", password)
          );
          const queryResult = await getDocs(q);
          if (queryResult.size > 0) {
            queryResult.forEach((us) => {
              const us_ = { ...us.data(), id: us.id };
              this.setUser(us_);
            });
            await AsyncStorage.setItem("auth_info", JSON.stringify(this.user));
            this.setLogged(true);
          } else {
            Alert.alert("Login Error", "Email or password incorrect");
          }
          this.setLogging(false);
        }, 100);
      }
    } catch (e) {
      Alert.alert("Serve Error", "Something error please retry later");
    }
  };
  createObjectWithDefinedProperties(properties) {
    return Object.fromEntries(
      Object.entries(properties).filter(([_, value]) => value !== undefined)
    );
  }
  updateProfile = async () => {
    try {
      const { email, name, classes } = authStore.updateInfo;
      const updateF = this.createObjectWithDefinedProperties({
        email,
        name,
        classes,
      });
      await updateDoc(doc(this.DB, "users", this.user.id), updateF);
      if (email) {
        this.logout(true);
      } else {
        this.logout();
      }
    } catch (e) {
      Alert.alert("Error", "Something error try later");
    }
    this.setUpdateInfo({});
  };
  uploadAvatar = async (uri) => {
    const url = await fetch(uri);
    const blob = await url.blob();
    const storageRef = ref(storage, "/uploads");
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(this.DB, "users", this.user.id), {
      avatar: downloadUrl,
    });
    this.logout();
  };
  getByName = async (name) => {
    const rs = await getDocs(
      query(collection(this.DB, "users"), where("name", "==", name))
    );
    let user = null;
    rs.forEach((doc) => {
      if (doc.exists()) {
        user = doc.data();
      }
    });
    return user;
  };
}
const authStore = new AuthStore();
export default authStore;
