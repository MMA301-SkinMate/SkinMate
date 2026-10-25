import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { COLORS } from '../../constants/colors';
import { createCollectionProduct, deleteCollectionProduct, listCollectionProducts, updateCollectionProduct } from '../../api/collectionApi';

const TYPES = [
  'cleanser',
  'toner',
  'essences',
  'cream',
  'oil',
  'serum',
  'treatment',
  'moisturizer',
  'sunscreen',
  'mask',
  'exfoliant',
  'others',
];
const completed = new Set(['finished', 'archived', 'expired']);
const displayDate = value => value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : 'Chưa đặt hạn dùng';

export default function CollectionScreen() {
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [tab, setTab] = useState('active'); const [editor, setEditor] = useState(null); const [selected, setSelected] = useState(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setProducts((await listCollectionProducts()).products || []); } catch (e) { setError(e.message || 'Không thể tải tủ đồ.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const visible = useMemo(() => products.filter(p => tab === 'active' ? !completed.has(p.status) : completed.has(p.status)), [products, tab]);
  const save = async form => { try { const result = form.id ? await updateCollectionProduct(form.id, form) : await createCollectionProduct(form); setProducts(current => form.id ? current.map(p => p.id === form.id ? result.product : p) : [result.product, ...current]); setEditor(null); } catch (e) { Alert.alert('Không thể lưu', e.message || 'Vui lòng thử lại.'); } };
  const remove = product => Alert.alert('Xoá sản phẩm?', 'Thao tác này không thể hoàn tác.', [{ text: 'Huỷ', style: 'cancel' }, { text: 'Xoá', style: 'destructive', onPress: async () => { try { await deleteCollectionProduct(product.id); setProducts(current => current.filter(p => p.id !== product.id)); setSelected(null); } catch (e) { Alert.alert('Không thể xoá', e.message); } } }]);
  return <ScreenWrapper><View style={styles.header}><View><Text style={styles.title}>Tủ đồ skincare</Text><Text style={styles.subtitle}>{products.length} sản phẩm đang theo dõi</Text></View><TouchableOpacity style={styles.add} onPress={() => setEditor({ productName: '', brand: '', productType: 'serum', remainingPercent: 100, status: 'active', note: '' })}><Ionicons name="add" size={25} color={COLORS.textLight} /></TouchableOpacity></View><View style={styles.tabs}>{['active', 'completed'].map(key => <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}><Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{key === 'active' ? 'Đang dùng' : 'Đã hoàn tất'}</Text></TouchableOpacity>)}</View>{loading ? <ActivityIndicator color={COLORS.primary} style={styles.state} /> : error ? <TouchableOpacity style={styles.state} onPress={load}><Text>{error}</Text><Text style={styles.retry}>Thử lại</Text></TouchableOpacity> : <FlatList data={visible} keyExtractor={item => item.id} contentContainerStyle={visible.length ? styles.list : styles.empty} ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sản phẩm. Hãy thêm sản phẩm đầu tiên.</Text>} renderItem={({ item }) => <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}><View style={styles.icon}><Ionicons name="flask-outline" size={24} color={COLORS.primary} /></View><View style={styles.cardCopy}><Text style={styles.name}>{item.productName}</Text><Text style={styles.meta}>{item.brand || 'Chưa rõ thương hiệu'} · {item.productType}</Text><Text style={styles.meta}>Còn {item.remainingPercent}% · {displayDate(item.expirationDate)}</Text></View><Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} /></TouchableOpacity>} />}{editor && <Editor value={editor} onClose={() => setEditor(null)} onSave={save} />}{selected && <Details product={selected} onClose={() => setSelected(null)} onEdit={() => { setEditor(selected); setSelected(null); }} onFinish={async () => { await save({ ...selected, remainingPercent: 0, status: 'finished' }); setSelected(null); }} onDelete={() => remove(selected)} />}</ScreenWrapper>;
}
function Editor({ value, onClose, onSave }) {
  const [form, setForm] = useState(value);
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm(current => ({ ...current, [field]: value }));
  const submit = async () => {
    if (!form.productName.trim()) return Alert.alert('Thiếu tên sản phẩm');
    setSaving(true);
    await onSave({
      ...form,
      productName: form.productName.trim(),
      brand: form.brand.trim() || null,
      note: form.note.trim() || null,
      remainingPercent: Number(form.remainingPercent)
    });
    setSaving(false);
  };
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlayAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); onClose(); }}>
          <View style={styles.sheet}>
            <KeyboardAwareScrollView
              style={styles.sheetScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              enableOnAndroid={true}
              enableAutomaticScroll={true}
              extraScrollHeight={Platform.OS === 'ios' ? 60 : 90}
              extraHeight={Platform.OS === 'ios' ? 60 : 90}
              enableResetScrollToCoords={true}
              contentContainerStyle={styles.sheetScroll}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.sheetInner}>
                  <Text style={styles.sheetTitle}>{form.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</Text>
                  <Field label="Tên sản phẩm" value={form.productName} onChangeText={v => set('productName', v)} />
                  <Field label="Thương hiệu" value={form.brand || ''} onChangeText={v => set('brand', v)} />
                  <Text style={styles.label}>Loại sản phẩm</Text>
                  <View style={styles.typeRow}>
                    {TYPES.map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.type, form.productType === type && styles.typeSelected]}
                        onPress={() => set('productType', type)}
                      >
                        <Text style={styles.typeText}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Field
                    label="Lượng còn lại (%)"
                    value={String(form.remainingPercent ?? 100)}
                    keyboardType="numeric"
                    onChangeText={v => set('remainingPercent', v)}
                  />
                  <Field
                    label="Ghi chú"
                    value={form.note || ''}
                    onChangeText={v => set('note', v)}
                    multiline
                  />
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={onClose} style={styles.cancel}>
                      <Text>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={submit}
                      style={[styles.save, styles.actionsSave]}
                      disabled={saving}
                    >
                      <Text style={styles.saveText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
function Details({ product, onClose, onEdit, onFinish, onDelete }) { return <Modal transparent animationType="slide"><Pressable style={styles.overlay} onPress={onClose}><Pressable style={styles.sheet} onPress={() => {}}><Text style={styles.sheetTitle}>{product.productName}</Text><Text style={styles.detail}>{product.brand || 'Chưa rõ thương hiệu'} · {product.productType}</Text><Text style={styles.detail}>Còn lại: {product.remainingPercent}%</Text><Text style={styles.detail}>Hạn dùng: {displayDate(product.expirationDate)}</Text>{product.note ? <Text style={styles.detail}>{product.note}</Text> : null}<TouchableOpacity style={styles.save} onPress={onEdit}><Text style={styles.saveText}>Chỉnh sửa</Text></TouchableOpacity>{product.status === 'active' ? <TouchableOpacity style={styles.finish} onPress={onFinish}><Text>Đánh dấu đã dùng hết</Text></TouchableOpacity> : null}<TouchableOpacity style={styles.delete} onPress={onDelete}><Text style={styles.deleteText}>Xoá sản phẩm</Text></TouchableOpacity></Pressable></Pressable></Modal>; }
function Field({ label, ...props }) { return <View><Text style={styles.label}>{label}</Text><TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} {...props} /></View>; }
const styles = StyleSheet.create({ modalOverlayAvoid:{flex:1},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:16,marginBottom:18},title:{fontSize:26,fontWeight:'800',color:COLORS.textMain},subtitle:{color:COLORS.textSecondary,marginTop:3},add:{width:46,height:46,borderRadius:23,backgroundColor:COLORS.primary,alignItems:'center',justifyContent:'center'},tabs:{flexDirection:'row',backgroundColor:COLORS.surface,borderRadius:12,padding:4,marginBottom:12},tab:{flex:1,padding:10,alignItems:'center',borderRadius:9},tabActive:{backgroundColor:COLORS.background},tabText:{color:COLORS.textSecondary},tabTextActive:{color:COLORS.primary,fontWeight:'700'},list:{paddingBottom:110},empty:{flexGrow:1,justifyContent:'center',alignItems:'center'},emptyText:{color:COLORS.textSecondary,textAlign:'center'},state:{flex:1,alignItems:'center',justifyContent:'center',gap:10},retry:{color:COLORS.primary,fontWeight:'700'},card:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:COLORS.background,padding:14,borderRadius:14,borderWidth:1,borderColor:COLORS.border,marginBottom:10},icon:{width:46,height:46,borderRadius:23,backgroundColor:COLORS.primaryLight,alignItems:'center',justifyContent:'center'},cardCopy:{flex:1},name:{color:COLORS.textMain,fontWeight:'700',fontSize:16},meta:{color:COLORS.textSecondary,fontSize:12,marginTop:3},overlay:{flex:1,justifyContent:'flex-end',backgroundColor:COLORS.overlay},sheet:{backgroundColor:COLORS.background,borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'88%',width:'100%'},sheetScrollView:{width:'100%'},sheetScroll:{flexGrow:1,padding:20},sheetInner:{gap:9,paddingBottom:20},sheetTitle:{fontSize:21,fontWeight:'800',color:COLORS.textMain,marginBottom:4},label:{fontWeight:'600',color:COLORS.textMain,marginTop:4},input:{borderWidth:1,borderColor:COLORS.borderDark,borderRadius:10,padding:11,color:COLORS.textMain},typeRow:{flexDirection:'row',flexWrap:'wrap',gap:7},type:{borderWidth:1,borderColor:COLORS.borderDark,borderRadius:15,paddingHorizontal:10,paddingVertical:6},typeSelected:{backgroundColor:COLORS.primaryLight,borderColor:COLORS.primary},typeText:{fontSize:12,color:COLORS.textMain},actions:{flexDirection:'row',gap:10,marginTop:10},cancel:{flex:1,alignItems:'center',padding:13,borderRadius:10,backgroundColor:COLORS.surface},save:{alignItems:'center',padding:13,borderRadius:10,backgroundColor:COLORS.primary,marginTop:9},actionsSave:{flex:1,marginTop:0},saveText:{color:COLORS.textLight,fontWeight:'700'},detail:{color:COLORS.textSecondary,fontSize:15,lineHeight:22},finish:{alignItems:'center',padding:13,borderRadius:10,backgroundColor:COLORS.primaryLight,marginTop:3},delete:{alignItems:'center',padding:12,marginTop:2},deleteText:{color:COLORS.error,fontWeight:'700'} });

