import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent:"center", alignItems:"center" }}>
      <Text style={{ color:"white" ,fontSize:25, fontWeight:"700" }}>Welcome User 👋</Text>

      <TouchableOpacity 
        onPress={logout} 
        style={{ backgroundColor:"red", padding:12, borderRadius:6, marginTop:20 }}
      >
        <Text style={{ color:"white", fontSize:18 }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
