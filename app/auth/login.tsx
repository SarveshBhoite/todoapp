import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { API } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter email and password");
    }

    try {
      const res = await API.post("/auth/login", { email, password });

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.error) {
        return Alert.alert("Login failed", res.data.error);
      }

      if (!res.data.token || !res.data.user) {
        return Alert.alert("Login failed", "Invalid server response");
      }

      // 🔥 save token + user in context + storage
      await login(res.data.token, res.data.user);

      Alert.alert("Success", "Login successful");
      router.replace("/(tabs)");
    } 
    catch (err) {
      console.log("LOGIN ERROR:", err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#9CA3AF"
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => router.push("/auth/register")}>
        New here? Create Account →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#0B1120",padding:25,justifyContent:"center"},
  title:{color:"#fff",fontSize:28,fontWeight:"700",marginBottom:25,textAlign:"center"},
  input:{backgroundColor:"#1E293B",color:"#fff",borderRadius:10,padding:12,fontSize:16,marginBottom:15},
  button:{backgroundColor:"#3B82F6",padding:13,borderRadius:10,marginTop:10},
  buttonText:{color:"#fff",textAlign:"center",fontSize:18,fontWeight:"700"},
  link:{color:"#38BDF8",marginTop:18,textAlign:"center",fontSize:15}
});
