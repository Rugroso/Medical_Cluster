import React, { createContext, useContext, useEffect, useState } from "react";
import { User ,onAuthStateChanged, signOut, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../config/Firebase_Conf";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Alert } from "react-native";
import { doc, setDoc } from "firebase/firestore";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword:string, name:string, lastName:string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(true)
        setUser(user);
        setLoading(false);
        console.log(user?.email)
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, confirmPassword:string, name:string, lastName:string) => {
    if (!email || !password || !confirmPassword || !name || !lastName) {
         Alert.alert("Error", "Todos los campos son obligatorios");
         return;
       }
   
       if (password !== confirmPassword) {
         Alert.alert("Error", "Las contraseñas no coinciden");
         return;
       }
       setLoading(true);
       try {
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         const user = userCredential.user;
         
         await setDoc(doc(db, "users", userCredential?.user?.uid),{
            name,
            lastName, 
            email, 
            userId: userCredential?.user?.uid
         })
   
         await sendEmailVerification(user);
         Alert.alert(
           "Registro exitoso",
           "Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada."
         );
   
         router.replace("/login");
       } catch (error: any) {
         Alert.alert("Error", error.message);
       }
       setLoading(false);
 }


   const login = async (email:string, password:string) => {
      setLoading(true);
      try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Sesion iniciada con exito");
        router.replace("/(drawer)/(tabs)/stackhome");
      } catch (error: any) {
        Alert.alert("Error", error.message);
      }
      setLoading(false);
    };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const [requestGoogle, responseGoogle, promptGoogle] = Google.useAuthRequest({
    webClientId: "272694628429-jkbiuh1q2rqjtp34i5jp3m1em11m4snc.apps.googleusercontent.com",
    iosClientId: "TU_GOOGLE_CLIENT_ID_IOS",
  });

  const signInWithGoogle = async () => {
    try {
      if (responseGoogle?.type === "success") {
        const { id_token } = responseGoogle.params;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      }
    } catch (error) {
      console.error("Error con Google Sign-In", error);
    }
  };

  const [requestFacebook, responseFacebook, promptFacebook] = Facebook.useAuthRequest({
    clientId: "TU_FACEBOOK_APP_ID",
  });

  const signInWithFacebook = async () => {
    try {
      if (responseFacebook?.type === "success") {
        const { access_token } = responseFacebook.params;
        const credential = FacebookAuthProvider.credential(access_token);
        await signInWithCredential(auth, credential);
      }
    } catch (error) {
      console.error("Error con Facebook Sign-In", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, signInWithFacebook, login, register }}>
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
