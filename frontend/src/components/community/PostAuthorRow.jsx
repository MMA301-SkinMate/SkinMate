import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatRelativeTime, getAvatarColor, getInitials, SKIN_TYPE_LABELS } from '../../constants/community';
import { Colors } from '../../constants/theme';

export default function PostAuthorRow({ post, right }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(post.authorId) }]}>
        <Text style={styles.initials}>{getInitials(post.authorName)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{post.authorName === 'Thành viên SkinMate' ? 'SkinMate member' : post.authorName}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatRelativeTime(post.createdAt)}</Text>
          {(post.skinTypes?.length ? post.skinTypes : post.skinType ? [post.skinType] : []).map(type => <Text key={type} style={styles.tag}>{SKIN_TYPE_LABELS[type] || type}</Text>)}
        </View>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 3 },
  meta: { color: Colors.textSecondary, fontSize: 11 },
  tag: { color: Colors.primaryDark, fontSize: 10, backgroundColor: Colors.primaryLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9, overflow: 'hidden' },
});
