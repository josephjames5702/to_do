import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import AuthScreen from './src/components/AuthScreen';
import TasksScreen from './src/components/TasksScreen';
import { s } from './src/styles';
import { useAuth } from './src/useAuth';

export default function App() {
  const { user, checking, authenticate, logout } = useAuth();
  const { height } = useWindowDimensions();

  return (
    <View style={[s.root, { minHeight: height }]}>
      <StatusBar style="dark" />
      {checking ? (
        <View style={s.center}>
          <ActivityIndicator />
        </View>
      ) : user ? (
        <TasksScreen user={user} onLogout={logout} />
      ) : (
        <AuthScreen onSubmit={authenticate} />
      )}
    </View>
  );
}
