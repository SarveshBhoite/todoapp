import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SwipeListView } from "react-native-swipe-list-view";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../lib/api";

// enable animations for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Todo = { _id: string; text: string; done: boolean; createdAt?: string };

export default function TodoScreen() {
  const { token } = useAuth();
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  // Load todos + fallback to cache (offline support)
  const loadTodos = async () => {
    try {
      const res = await API.get("/todo", { headers:{ token } });
      setTodos(res.data);
      await AsyncStorage.setItem("todos_cache", JSON.stringify(res.data));
    } catch {
      console.log("⚠ Server offline — using cached data");
      const cached = await AsyncStorage.getItem("todos_cache");
      if (cached) setTodos(JSON.parse(cached));
    }
  };

  useEffect(() => { loadTodos(); }, []);

  // Add Todo (Optimistic UI)
  const addTodo = async () => {
    const text = task.trim();
    if (!text) return;
    setTask("");

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const temp = { _id: Date.now().toString(), text, done:false };
    setTodos(prev => [temp, ...prev]); // instant UI

    try {
      const res = await API.post("/todo/add", { text }, { headers:{ token } });
      setTodos(prev => prev.map(t => t._id === temp._id ? res.data : t)); // replace temp with real
    } catch {
      alert("❗ Failed syncing to cloud");
      loadTodos();
    }
  };

  // Toggle Done ✔
  const toggleDone = async (id:string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTodos(prev => prev.map(t => t._id === id ? {...t, done:!t.done} : t));

    await API.post("/todo/toggle", { id }, { headers:{ token } });
  };

  // Delete Todo
  const deleteTodo = async (id:string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const backup = todos;
    setTodos(prev => prev.filter(t => t._id !== id));

    try {
      await API.post("/todo/delete", { id }, { headers:{ token } });
    } catch {
      alert("⚠ Delete failed — restored");
      setTodos(backup);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER UI */}
      <Text style={styles.heading}>🔥 Smart Todo Manager</Text>
      <Text style={styles.subheading}>
        {todos.filter(t=>!t.done).length} pending • {todos.filter(t=>t.done).length} done
      </Text>

      {/* INPUT BAR */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add task..."
          placeholderTextColor="#8A94A6"
          value={task}
          onChangeText={setTask}
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* SWIPE LIST */}
      <SwipeListView
        style={{ marginTop: 10 }}
        data={todos}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleDone(item._id)}
            style={[styles.todoItem, item.done && styles.todoItemDone]}
            activeOpacity={0.8}
          >
            <Text style={[styles.todoText, item.done && styles.todoTextDone]}>
              {item.done ? "✔ " : ""}{item.text}
            </Text>
          </TouchableOpacity>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.hiddenRow}>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(item._id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-85}
        disableRightSwipe
      />
    </View>
  );
}

/* 🎨 UI */
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#050816",paddingTop:60,paddingHorizontal:20},
  heading:{color:"#fff",fontSize:26,fontWeight:"800"},
  subheading:{color:"#8a9bb5",marginTop:5,fontSize:14,marginBottom:15},
  inputRow:{flexDirection:"row",gap:10,alignItems:"center"},
  input:{flex:1,backgroundColor:"#111827",color:"#fff",padding:12,borderRadius:10,fontSize:16},
  addButton:{backgroundColor:"#22c55e",paddingHorizontal:18,paddingVertical:10,borderRadius:10},
  addButtonText:{fontSize:22,fontWeight:"900",color:"#fff"},
  todoItem:{backgroundColor:"#111827",padding:14,borderRadius:12,marginBottom:10},
  todoItemDone:{backgroundColor:"#065f46"},
  todoText:{color:"#fff",fontSize:16},
  todoTextDone:{textDecorationLine:"line-through",color:"#a7f3d0"},
  hiddenRow:{flex:1,justifyContent:"center",alignItems:"flex-end",marginBottom:10},
  deleteButton:{backgroundColor:"#ef4444",paddingVertical:12,paddingHorizontal:18,borderRadius:12},
  deleteText:{color:"#fff",fontWeight:"700"}
});
