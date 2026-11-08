import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { s } from '../styles';

interface Props {
  onSubmit: (mode: 'login' | 'register', email: string, password: string) => Promise<void>;
}

export default function AuthScreen({ onSubmit }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await onSubmit(mode, email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <View style={s.authWrap}>
      <View style={s.authColumn}>
        <Text style={s.authTitle}>{isLogin ? 'Login' : 'Sign up'}</Text>
        {error ? <Text style={[s.error, { textAlign: 'center' }]}>{error}</Text> : null}

        <TextInput
          style={s.underlineInput}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={s.underlineInput}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
        />

        <Pressable style={s.authButton} onPress={submit} disabled={busy}>
          <Text style={s.buttonText}>{busy ? 'Please wait…' : isLogin ? 'Login' : 'Sign up'}</Text>
        </Pressable>

        <Pressable onPress={() => setMode(isLogin ? 'register' : 'login')}>
          <Text style={s.authLink}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Text style={s.authLinkBold}>{isLogin ? 'Sign up' : 'Login'}</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
