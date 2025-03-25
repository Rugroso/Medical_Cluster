import React, { createContext, useContext, useEffect, useState } from "react";
import { User ,onAuthStateChanged, signOut, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../config/Firebase_Conf";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Alert } from "react-native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { webCLientIdGoogle } from "../config/Firebase_Conf";
import { iosClientIdGoogle } from "../config/Firebase_Conf";
import { androidClientIdGoogle } from "../config/Firebase_Conf";


WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword:string, name:string, lastName:string, birthdate:string, gender:string,  location:string) => Promise<void>;
  registerwithGoogle: (email: string, name:string, lastName:string, birthdate:string, gender:string,  location:string, imageUrl:string,  uid:string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [requestGoogle, responseGoogle, promptGoogle] = Google.useAuthRequest({
    webClientId: webCLientIdGoogle,
    iosClientId: iosClientIdGoogle,
    androidClientId: androidClientIdGoogle
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(true)
        setUser(user);
        setLoading(false);
        console.log(user?.email)
    });

    return () => unsubscribe();
  }, []);

  const signInGoogle = async () => {
    if (responseGoogle?.type === "success") {
      const { id_token } = responseGoogle.params;
      console.log("Google ID Token:", id_token);
  
      if (!id_token) {
        console.error("Error: id_token es undefined");
        return;
      }
  
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          router.replace("/(drawer)/(tabs)/stackhome");
          return;
        }
        Alert.alert("Sesión con Google autenticada con éxito");
        router.replace({ pathname: "/registerAuthProvider", params: { nameParam: user?.displayName, emailParam: user?.email, imageUrlParam: user?.photoURL, uidParam: user?.uid } });
      } catch (error) {
        Alert.alert("Hubo un error al intentar iniciar sesión con Google");
        console.error("Error en signInWithCredential:", error);
      }
    }
  };

  useEffect(() => {
    signInGoogle();
  }, [responseGoogle]);

  const register = async (email: string, password: string, confirmPassword:string, name:string, lastName:string, birthdate:string, gender:string, location:string ) => {
    if (!email || !password || !confirmPassword || !name || !lastName || !birthdate || !gender || !location) {
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
            birthdate,
            gender,
            location, 
            userId: userCredential?.user?.uid,
         })
   
         await sendEmailVerification(user);
         Alert.alert(
           "Registro exitoso",
           "Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada."
         );
   
         router.replace("/login");
       } catch (error: any) {
        if (error.message === 'Firebase: Error (auth/email-already-in-use).') {
          Alert.alert("Error", "El correo ya está en uso");
        } else if (error.message === 'Firebase: Error (auth/invalid-email).') {
          Alert.alert("Error", "Correo inválido");
        } else if (error.message === 'Firebase: Error (auth/weak-password).') {
          Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
        } else if (error.message === 'Firebase: Error (auth/operation-not-allowed).') {
          Alert.alert("Error", "Operación no permitida");
        } else if (error.message === 'Firebase: Error (auth/argument-error).') {
          Alert.alert("Error", "Argumento inválido");
        } else if (error.message === 'Firebase: Error (auth/user-disabled).') {
          Alert.alert("Error", "La cuenta ha sido deshabilitada");
        } else if (error.message === 'Firebase: Error (auth/user-not-found).') {
          Alert.alert("Error", "No existe un usuario con ese correo");
        } else if (error.message === 'Firebase: Error (auth/wrong-password).') {
          Alert.alert("Error", "Contraseña incorrecta");
        } else if (error.message === 'Firebase: Error (auth/too-many-requests).') {
          Alert.alert("Error", "Demasiados intentos fallidos. Intenta más tarde");
        } else if (error.message === 'Firebase: Error (auth/network-request-failed).') {
          Alert.alert("Error", "Error de conexión. Verifica tu red");
        } else if (error.message === 'Firebase: Error (auth/requires-recent-login).') {
          Alert.alert("Error", "Se requiere volver a iniciar sesión para realizar esta acción");
        } else if (error.message === 'Firebase: Error (auth/account-exists-with-different-credential).') {
          Alert.alert("Error", "El correo ya está asociado a otro método de autenticación");
        } else if (error.message === 'Firebase: Error (auth/credential-already-in-use).') {
          Alert.alert("Error", "Las credenciales ya están en uso en otra cuenta");
        } else if (error.message === 'Firebase: Error (auth/invalid-credential).') {
          Alert.alert("Error", "La credencial proporcionada no es válida");
        } else if (error.message === 'Firebase: Error (auth/popup-blocked).') {
          Alert.alert("Error", "El navegador bloqueó la ventana emergente de autenticación");
        } else if (error.message === 'Firebase: Error (auth/popup-closed-by-user).') {
          Alert.alert("Error", "Cerraste la ventana antes de completar la autenticación");
        } else {
          Alert.alert("Error", "Error desconocido: " + error.message);
        }
       }
       setLoading(false);
 }

 const registerwithGoogle = async (email: string, name:string, lastName:string, birthdate:string, gender:string, location:string, imageUrl:string, uid:string ) => {
  if (!email || !name || !lastName || !birthdate || !gender || !location) {
       Alert.alert("Error", "Todos los campos son obligatorios");
       return;
     }
     console.log(imageUrl)
     
     setLoading(true);
     try {
       await setDoc(doc(db, "users", uid),{
          name,
          lastName, 
          email,
          birthdate,
          gender,
          location,
          profilePicture: imageUrl,
          userId: uid,
       })

       Alert.alert(
         "Registro exitoso",
       );
 
       router.replace("/(drawer)/(tabs)/stackhome");
     } catch (error: any) {
       Alert.alert("Error", error.message);
     }
     setLoading(false);
}



   const login = async (email:string, password:string) => {
      setLoading(true);
      try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        const userId = response.user.uid; 

        const userDocRef = doc(db, "users", userId); 
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          Alert.alert("Error", "No se encontró la información del usuario.");
          setLoading(false);
          return;
        }

        const userData = userSnapshot.data();
        const isAdmin = userData?.isAdmin || false;
      if (isAdmin) {
        Alert.alert("Bienvenido", "Has iniciado sesión como administrador");
        router.replace("/(drawer)/(admintabs)"); 
      } else {
        Alert.alert("Bienvenido", "Sesión iniciada con éxito");
        router.replace("/(drawer)/(tabs)/stackhome"); 
      }
      } catch (error: any) {
        if (error.message === 'Firebase: Error (auth/invalid-email).') {
          Alert.alert("Error", 'El correo electrónico es incorrecto');
        } else if (error.message === 'Firebase: Error (auth/invalid-credential).') {
          Alert.alert("Error", 'La contraseña es incorrecta');
        } else {
          Alert.alert("Error", error.message);
        }
      }
      setLoading(false);
    };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };


  const signInWithGoogle = async () => {
    promptGoogle();
  };

  const [requestFacebook, responseFacebook, promptFacebook] = Facebook.useAuthRequest({
    clientId: "FACEBOOK_APP_ID", // Pendiente para una actualización futura
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
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, signInWithFacebook, login, register, registerwithGoogle }}>
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
