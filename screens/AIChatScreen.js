import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, TYPE } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { getAIResponse } from '../services/aiService';

let nextId = 1;

const STARTERS = [
  'How do I persist data locally?',
  'Explain props vs state',
  'What should I learn next?',
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    { id: 0, from: 'ai', text: 'Ask me anything about your internship tasks or React Native.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  const sendText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    nextId += 1;
    setMessages((prev) => [...prev, { id: nextId, from: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);

    let reply;
    try {
      reply = await getAIResponse(trimmed);
    } catch (e) {
      reply = e.rateLimited
        ? 'Free-tier limit reached (20 requests a minute). Wait about a minute and send it again.'
        : 'That request did not go through. Check your connection and try again.';
    }
    nextId += 1;
    setMessages((prev) => [...prev, { id: nextId, from: 'ai', text: reply }]);
    setTyping(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const showStarters = messages.length === 1 && !typing;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <ScreenHeader eyebrow="Module 04" title="Assistant" tagColor={COLORS.chat} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.from === 'user';
          return (
            <View style={styles.messageRow}>
              {!isUser ? <Text style={[TYPE.eyebrow, styles.speaker]}>Assistant</Text> : null}
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={isUser ? styles.textUser : styles.textAi}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <>
            {typing ? (
              <View style={styles.messageRow}>
                <Text style={[TYPE.eyebrow, styles.speaker]}>Assistant</Text>
                <View style={[styles.bubble, styles.bubbleAi, styles.typingBubble]}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.dotMid]} />
                  <View style={styles.dot} />
                </View>
              </View>
            ) : null}

            {showStarters ? (
              <View style={styles.starters}>
                <Text style={[TYPE.eyebrow, styles.startersLabel]}>Try asking</Text>
                {STARTERS.map((s) => (
                  <TouchableOpacity key={s} style={styles.starter} onPress={() => sendText(s)}>
                    <Text style={styles.starterText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Send a message"
          placeholderTextColor={COLORS.placeholder}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendText(input)}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || typing) && styles.sendButtonOff]}
          onPress={() => sendText(input)}
          disabled={!input.trim() || typing}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 28 },
  messages: { paddingHorizontal: 20, paddingBottom: 16 },
  messageRow: { marginBottom: 14 },
  speaker: { marginBottom: 5, color: COLORS.chat },
  bubble: {
    maxWidth: '88%',
    borderRadius: 6,
    borderWidth: 2,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  bubbleUser: {
    backgroundColor: COLORS.heading,
    borderColor: COLORS.heading,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  bubbleAi: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.heading,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  textUser: { ...TYPE.body, color: '#FFFFFF' },
  textAi: { ...TYPE.body },
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.placeholder },
  dotMid: { marginHorizontal: 5, backgroundColor: COLORS.label },
  starters: { marginTop: 6 },
  startersLabel: { marginBottom: 9 },
  starter: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.card,
    borderRadius: 5,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  starterText: { ...TYPE.meta, color: COLORS.heading, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.heading,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.hairline,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.heading,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: COLORS.chat,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.heading,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  sendButtonOff: { backgroundColor: COLORS.placeholder },
  sendButtonText: { ...TYPE.eyebrow, color: '#FFFFFF', fontSize: 11 },
});
