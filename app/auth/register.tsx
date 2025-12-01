import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { API } from "../../lib/api";

export default function Register() {
  const router = useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const handleRegister = async () => {
    const res = await API.post("/auth/register",{ email,password });
    if(res.data.error) return alert(res.data.error);

    alert("Account created ✔");
    router.push("/auth/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Create Account</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999"
        value={email} onChangeText={setEmail}/>

      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#999"
        secureTextEntry value={password} onChangeText={setPassword}/>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => router.push("/auth/login")}>
        Already have an account? Login →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#0B1120",padding:25,justifyContent:"center"},
  title:{color:"#fff",fontSize:26,fontWeight:"700",marginBottom:25,textAlign:"center"},
  input:{backgroundColor:"#1E293B",color:"#fff",borderRadius:10,padding:12,fontSize:16,marginBottom:15},
  button:{backgroundColor:"#3B82F6",padding:13,borderRadius:10,marginTop:10},
  buttonText:{color:"#fff",textAlign:"center",fontSize:17,fontWeight:"600"},
  link:{color:"#38BDF8",marginTop:14,textAlign:"center",fontSize:15}
})
