import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SwipeListView } from "react-native-swipe-list-view";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../lib/api";

// enable animations on android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Todo = { _id: string; text: string; done: boolean; createdAt?: string };

export default function TodoScreen() {
  const { token } = useAuth();
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  // Load todos with fallback cache
  const loadTodos = async () => {
    try {
      const res = await API.get("/todo", { headers:{ token } });
      setTodos(res.data);
      await AsyncStorage.setItem("todos_cache", JSON.stringify(res.data));
    } catch {
      const cached = await AsyncStorage.getItem("todos_cache");
      if (cached) setTodos(JSON.parse(cached));
    }
  };

  useEffect(() => { loadTodos(); }, []);

  // Add new todo (Optimistic)
  const addTodo = async () => {
    const text = task.trim();
    if (!text) return;
    setTask("");

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const temp = { _id: Date.now().toString(), text, done:false };
    setTodos([temp, ...todos]); // instant UI update

    try {
      const res = await API.post("/todo/add", { text }, { headers:{ token } });
      setTodos(prev => prev.map(t => t._id === temp._id ? res.data : t));
    } catch {
      alert("Failed to sync online ❗");
      loadTodos();
    }
  };

  // Toggle status ✔
  const toggleDone = async (id:string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTodos(prev => prev.map(t => t._id === id ? {...t, done:!t.done} : t)); // fast UI swap

    await API.post("/todo/toggle", { id }, { headers:{ token } });
  };

  // Delete todo 🔥
  const deleteTodo = async (id:string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const orig = todos;
    setTodos(prev => prev.filter(t => t._id !== id));

    try {
      await API.post("/todo/delete", { id }, { headers:{ token } });
    } catch {
      alert("Delete failed — Restored");
      setTodos(orig);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <Text style={styles.heading}>🔥 Smart Todo Manager</Text>
      <Text style={styles.subheading}>
        {todos.filter(t=>!t.done).length} tasks pending • {todos.filter(t=>t.done).length} done
      </Text>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add new task..."
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
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleDone(item._id)}
            activeOpacity={0.7}
            style={[styles.todoItem, item.done && styles.todoItemDone]}
          >
            <Text style={[styles.todoText, item.done && styles.todoTextDone]}>
              {item.done ? "✔ " : ""} {item.text}
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
        rightOpenValue={-90}
        disableRightSwipe
      />
    </View>
  );
}

// 🎨 UI
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#050816",paddingTop:60,paddingHorizontal:20},
  heading:{color:"#fff",fontSize:26,fontWeight:"800"},
  subheading:{color:"#8a9bb5",marginBottom:15,fontSize:14},
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
