import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SwipeListView } from "react-native-swipe-list-view";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../lib/api";

// Enable animation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------- Types ----------
type Priority = "high" | "medium" | "low";

type Todo = {
  _id: string;
  text: string;
  done: boolean;
  priority: Priority;
};

// helper: always ensure valid priority
const normalizePriority = (p: any): Priority => {
  if (p === "high" || p === "low" || p === "medium") return p;
  return "medium";
};

// helper: sort list by priority (High → Medium → Low)
const sortTodos = (list: Todo[]): Todo[] => {
  const weight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
  return [...list].sort((a, b) => weight[b.priority] - weight[a.priority]);
};

export default function TodoScreen() {
  const { token } = useAuth();

  const [task, setTask] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [todos, setTodos] = useState<Todo[]>([]);

  // -------- Load todos from API (or cache) --------
  const loadTodos = useCallback(async () => {
    try {
      const res = await API.get("/todo", { headers: { token } });

      const fixed: Todo[] = res.data.map((t: any) => ({
        _id: t._id,
        text: t.text,
        done: Boolean(t.done),
        priority: normalizePriority(t.priority),
      }));

      const sorted = sortTodos(fixed);
      setTodos(sorted);
      await AsyncStorage.setItem("todos_cache", JSON.stringify(sorted));
    } catch (err) {
      console.log("⚠ Failed to fetch from server, using cache", err);
      const cached = await AsyncStorage.getItem("todos_cache");
      if (cached) {
        try {
          const parsed: Todo[] = JSON.parse(cached);
          setTodos(parsed);
        } catch {
          // ignore invalid cache
        }
      }
    }
  }, [token]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // -------- Add task with priority --------
  const addTodo = async () => {
    const text = task.trim();
    if (!text) return alert("Write a task first!");

    const body = { text, priority };

    // optimistic temp item
    const temp: Todo = {
      _id: Date.now().toString(),
      text,
      done: false,
      priority,
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTodos((prev) => sortTodos([temp, ...prev]));
    setTask("");

    try {
      const res = await API.post("/todo/add", body, { headers: { token } });
      const serverTodo: Todo = {
        _id: res.data._id,
        text: res.data.text,
        done: res.data.done,
        priority: normalizePriority(res.data.priority),
      };

      // replace temp with real one using latest state
      setTodos((prev) => {
        const withoutTemp = prev.filter((t) => t._id !== temp._id);
        return sortTodos([...withoutTemp, serverTodo]);
      });
    } catch (err) {
      alert("Cloud sync failed, reloading from server");
      loadTodos();
    }
  };

  // -------- Toggle done ✔ --------
  const toggleDone = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setTodos((prev) =>
      sortTodos(
        prev.map((t) => (t._id === id ? { ...t, done: !t.done } : t))
      )
    );

    try {
      await API.post(
        "/todo/toggle",
        { id },
        {
          headers: { token },
        }
      );
    } catch (err) {
      console.log("Toggle failed, refreshing", err);
      loadTodos();
    }
  };

  // -------- Delete task --------
  const deleteTodo = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // optimistic delete
    setTodos((prev) => prev.filter((t) => t._id !== id));

    try {
      await API.post(
        "/todo/delete",
        { id },
        {
          headers: { token },
        }
      );
    } catch (err) {
      alert("Delete failed, refreshing");
      loadTodos();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔥 Priority Task Manager</Text>
      <Text style={styles.subheading}>
        {todos.filter((t) => !t.done).length} pending ·{" "}
        {todos.filter((t) => t.done).length} done
      </Text>

      {/* INPUT + PRIORITY + ADD */}
      <View style={styles.row}>
        <TextInput
          placeholder="Add a task..."
          placeholderTextColor="#8A94A6"
          style={styles.input}
          value={task}
          onChangeText={setTask}
        />

        {/* Priority selector */}
        <View style={styles.priorityBox}>
          <TouchableOpacity onPress={() => setPriority("high")}>
            <Text
              style={[styles.pill, priority === "high" && styles.activeRed]}
            >
              H
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPriority("medium")}>
            <Text
              style={[styles.pill, priority === "medium" && styles.activeYellow]}
            >
              M
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPriority("low")}>
            <Text
              style={[styles.pill, priority === "low" && styles.activeGreen]}
            >
              L
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={addTodo}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </View>

      {/* SWIPE LIST */}
      <SwipeListView
        data={todos}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 60 }}
        disableRightSwipe
        rightOpenValue={-85}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleDone(item._id)}
            style={[styles.todo, item.done && styles.done]}
          >
            <Text style={[styles.text, item.done && styles.textDone]}>
              {item.done ? "✔ " : ""} {item.text}
            </Text>

            <Text style={styles.priorityTag}>
              {item.priority === "high"
                ? "🔥 High priority"
                : item.priority === "medium"
                ? "⭐ Medium priority"
                : "🟢 Low priority"}
            </Text>
          </TouchableOpacity>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.hidden}>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteTodo(item._id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

/************** UI **************/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  heading: { color: "#fff", fontSize: 26, fontWeight: "800" },
  subheading: { color: "#8a9bb5", marginBottom: 15 },

  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  priorityBox: { flexDirection: "row", alignItems: "center", gap: 5 },
  pill: {
    color: "#aaa",
    fontWeight: "bold",
    padding: 6,
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: "#1F2433",
  },
  activeRed: { backgroundColor: "#ef4444", color: "#fff" },
  activeYellow: { backgroundColor: "#facc15", color: "#000" },
  activeGreen: { backgroundColor: "#22c55e", color: "#fff" },

  addBtn: { backgroundColor: "#22c55e", padding: 12, borderRadius: 10 },
  plus: { fontSize: 22, fontWeight: "900", color: "#fff" },

  todo: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  done: { backgroundColor: "#065f46" },
  text: { color: "#fff", fontSize: 16 },
  textDone: { color: "#a7f3d0", textDecorationLine: "line-through" },

  priorityTag: { fontSize: 12, color: "#9ca3af", marginTop: 4 },

  hidden: { flex: 1, justifyContent: "center", alignItems: "flex-end" },
  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  deleteText: { color: "#fff", fontWeight: "700" },
});
