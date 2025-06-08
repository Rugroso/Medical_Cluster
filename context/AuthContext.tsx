import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db, storage, iosClientIdGoogle, androidClientIdGoogle } from "../config/Firebase_Conf";
import { router } from "expo-router";
import { Alert, Platform } from "react-native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// IMPORTACIONES PARA iOS (expo-auth-session)
import * as GoogleAuthSession from "expo-auth-session/providers/google";

// IMPORTACIÓN PARA ANDROID (react-native-google-signin)
// import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    lastName: string,
    birthdate: string,
    cellphone: string,
    gender: string,
    location: string,
    profilePicture: string
  ) => Promise<void>;
  registerwithGoogle: (
    email: string,
    name: string,
    lastName: string,
    birthdate: string,
    cellphone: string,
    gender: string,
    location: string,
    profilePicture: string,
    uid: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isIOS = Platform.OS === "ios";


  //Esto es para iOS usando expo-auth-session
  const [requestGoogle, responseGoogle, promptGoogle] = GoogleAuthSession.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID_GOOGLE,
    iosClientId: iosClientIdGoogle,
    androidClientId: androidClientIdGoogle,
  });

  // Esto es para android usando react-native-google-signin
  useEffect(() => {
    // if (!isIOS) {
    //   GoogleSignin.configure({
    //     webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID_GOOGLE,
    //     offlineAccess: true,
    //   });
    // }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isIOS]);
  //DESCOMENTAR ESTO PARA QUE FUNCIONE EN ANDROID

  //iOS
  useEffect(() => {
    if (isIOS && responseGoogle?.type === "success") {
      const { id_token } = responseGoogle.params;
      if (!id_token) {
        return;
      }
      (async () => {
        try {
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          const u = userCredential.user;
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists()) {
            router.replace("/(drawer)/(tabs)/stackhome");
          } else {
            Alert.alert("Sesión con Google autenticada con éxito");
            router.replace({
              pathname: "/registerAuthProvider",
              params: {
                nameParam: u.displayName,
                emailParam: u.email,
                imageUrlParam: u.photoURL,
                uidParam: u.uid,
              },
            });
          }
        } catch (error: any) {
          Alert.alert("Error", "No se pudo iniciar sesión con Google en iOS");
        }
      })();
    }
  }, [responseGoogle, isIOS]);

  //Android
  const signInWithGoogleAndroid = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        throw new Error("No se obtuvo idToken de Google");
      }
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const u = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        router.replace("/(drawer)/(tabs)/stackhome");
      } else {
        Alert.alert("Sesión con Google autenticada con éxito");
        router.replace({
          pathname: "/registerAuthProvider",
          params: {
            nameParam: u.displayName,
            emailParam: u.email,
            imageUrlParam: u.photoURL,
            uidParam: u.uid,
          },
        });
      }
    } catch (error: any) {
      Alert.alert("Error", "No se pudo iniciar sesión con Google");
    }
  };

  const signInWithGoogle = async () => {
    if (isIOS) {
      promptGoogle();
    } else {
      await signInWithGoogleAndroid();
    }
  };


  const processImage = async (imageUrl: string, userId: string): Promise<string> => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const imageName = `users/${userId}.jpg`;
    const storageRef = ref(storage, imageName);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        () => {},
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    lastName: string,
    birthdate: string,
    cellphone: string,
    gender: string,
    location: string,
    profilePicture: string
  ) => {
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !name ||
      !lastName ||
      !birthdate ||
      !gender ||
      !location ||
      !cellphone
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const uc = await createUserWithEmailAndPassword(auth, email, password);
      const u = uc.user;
      let imageUrl: string | null = null;
      if (profilePicture) {
        imageUrl = await processImage(profilePicture, u.uid);
      }
      await setDoc(doc(db, "users", u.uid), {
        name,
        lastName,
        email,
        birthdate,
        gender,
        location,
        cellphone,
        profilePicture: imageUrl,
        userId: u.uid,
      });
      await sendEmailVerification(u);
      Alert.alert("Registro exitoso", "Revisa tu correo para verificar tu cuenta.");
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  };

  const registerwithGoogle = async (
    email: string,
    name: string,
    lastName: string,
    birthdate: string,
    cellphone: string,
    gender: string,
    location: string,
    profilePicture: string,
    uid: string
  ) => {
    if (!email || !name || !lastName || !birthdate || !gender || !location || !cellphone) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const imageUrl = profilePicture ? await processImage(profilePicture, uid) : "";
      await setDoc(doc(db, "users", uid), {
        name,
        lastName,
        email,
        birthdate,
        gender,
        location,
        cellphone,
        profilePicture: imageUrl,
        userId: uid,
      });
      Alert.alert("Registro exitoso");
      router.replace("/(drawer)/(tabs)/stackhome");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await signInWithEmailAndPassword(auth, email, password);
      const uId = resp.user.uid;
      const snap = await getDoc(doc(db, "users", uId));
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      if (resp.user.emailVerified === false) {
        Alert.alert("Error", "Debes verificar tu correo electrónico antes de iniciar sesión");
        setLoading(false);
        return;
      }
      const isAdmin = snap.data()?.isAdmin || false;
      router.replace(isAdmin ? "/(drawer)/(admintabs)" : "/(drawer)/(tabs)/stackhome");
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        Alert.alert("Error", "El usuario no existe");
      }
      else if (e.code === "auth/wrong-password") {
        Alert.alert("Error", "La contraseña es incorrecta");
      }
      else if (e.code === "auth/missing-password") {
        Alert.alert("Error", "Debes introducir una contraseña");
      }
      else if (e.code === "auth/invalid-email") {
        Alert.alert("Error", "El correo electrónico no es válido");
      }
      else if (e.code === "auth/too-many-requests") {
        Alert.alert("Error", "Demasiados intentos de inicio de sesión fallidos. Intenta más tarde.");
      }
      else if (e.code === "auth/user-disabled") {
        Alert.alert("Error", "El usuario ha sido deshabilitado");
      }
      else if (e.code === "auth/operation-not-allowed") {
        Alert.alert("Error", "El inicio de sesión con correo electrónico y contraseña no está habilitado");
      }
      else if (e.code === "auth/weak-password") {
        Alert.alert("Error", "La contraseña es demasiado débil");
      }
      else if (e.code === "auth/invalid-credential") {
        Alert.alert("Error", "El correo o la contraseña no son correctos");
      }
      else if (e.code === "auth/invalid-verification-code") {  
        Alert.alert("Error", "El código de verificación proporcionado es inválido");
      }
      else if (e.code === "auth/invalid-verification-id") {
        Alert.alert("Error", "El ID de verificación proporcionado es inválido");
      }
      else if (e.code === "auth/invalid-argument") {
        Alert.alert("Error", "El argumento proporcionado es inválido");
      } 
      else {
        Alert.alert("Error", e.message);
      }
    }
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Función pendiente para Facebook
  const signInWithFacebook = async () => {
    
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerwithGoogle,
        logout,
        signInWithGoogle,
        signInWithFacebook,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};