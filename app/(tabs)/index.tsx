import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚡ Daily Productivity</Text>
      <Text style={styles.subtitle}>Welcome Raj! Stay organized 📅</Text>

      <View style={styles.boxWrap}>
        <TouchableOpacity style={styles.box} onPress={() => router.push("/todo")}>
          <Text style={styles.boxTitle}>📝 To-Do Tasks</Text>
          <Text style={styles.boxText}>Create + Track Daily Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => router.push("/profile")}>
          <Text style={styles.boxTitle}>☁️ Cloud Sync</Text>
          <Text style={styles.boxText}>Login & Save Data Online</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#0C1320",paddingTop:90,paddingHorizontal:22},
  title:{fontSize:30,fontWeight:"700",color:"#fff"},
  subtitle:{color:"#9EB3C2",marginBottom:30,fontSize:16},
  boxWrap:{marginTop:10,gap:20},
  box:{
    backgroundColor:"#1A2333",
    padding:20,
    borderRadius:14,
    borderWidth:1,
    borderColor:"#24324A"
  },
  boxTitle:{color:"#fff",fontSize:22,fontWeight:"600"},
  boxText:{color:"#9EB3C2",marginTop:4}
});
