import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { s } from '../styles';
import type { Filter, User } from '../types';
import { useTasks } from '../useTasks';

const FILTERS: Filter[] = ['all', 'active', 'completed'];

export default function TasksScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (filter === 'all' || (filter === 'completed') === t.completed) &&
        t.text.toLowerCase().includes(q),
    );
  }, [tasks, query, filter]);

  return (
    <View style={s.screen}>
      <View style={s.row}>
        <Text style={[s.title, { flex: 1, marginBottom: 0 }]}>Todos</Text>
        <Pressable style={[s.button, s.danger]} onPress={onLogout}>
          <Text style={s.buttonText}>Sign out</Text>
        </Pressable>
      </View>
      <Text style={s.muted}>{user.email}</Text>

      <View style={s.row}>
        <TextInput style={s.input} placeholder="Add a todo…" value={text} onChangeText={setText} />
        <Pressable
          style={s.button}
          onPress={() => {
            const t = text.trim();
            if (t) run(() => addTask(t).then(() => setText('')));
          }}
        >
          <Text style={s.buttonText}>Add</Text>
        </Pressable>
      </View>

      <View style={s.row}>
        <TextInput style={s.input} placeholder="Search todos…" value={query} onChangeText={setQuery} />
      </View>
      <View style={s.row}>
        {FILTERS.map((f) => (
          <Pressable key={f} style={[s.button, filter === f ? s.filterActive : s.filterIdle]} onPress={() => setFilter(f)}>
            <Text style={s.buttonText}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={s.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(t) => t._id}
          ListEmptyComponent={<Text style={s.muted}>{query ? 'No matches.' : 'No todos yet.'}</Text>}
          renderItem={({ item }) => (
            <View style={s.item}>
              <Pressable style={{ flex: 1 }} onPress={() => run(() => toggleTask(item))}>
                <Text style={[s.itemText, item.completed && s.done]}>{item.text}</Text>
              </Pressable>
              <Pressable style={[s.button, s.danger]} onPress={() => run(() => deleteTask(item._id))}>
                <Text style={s.buttonText}>Delete</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}
