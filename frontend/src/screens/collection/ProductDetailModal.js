import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  CircleGauge,
  FlaskConical,
  Leaf,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { getProductIcon } from '../../constants/product-icons';
import { useCollection } from '../../context/CollectionContext';

const TYPE_LABELS = {
  cleanser: 'Sữa rửa mặt',
  toner: 'Toner',
  essences: 'Tinh chất (Essence)',
  cream: 'Kem dưỡng',
  oil: 'Dầu dưỡng (Oil)',
  serum: 'Serum & Tinh chất',
  treatment: 'Đặc trị (Treatment)',
  moisturizer: 'Dưỡng ẩm (Moisturizer)',
  sunscreen: 'Chống nắng',
  mask: 'Mặt nạ',
  exfoliant: 'Tẩy tế bào chết',
  others: 'Khác',
  other: 'Khác',
};

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : 'Chưa cập nhật';
}

function getDaysLeft(expirationDate) {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate) - new Date()) / 86400000);
}

function formatPao(paoDays) {
  if (!paoDays) return 'Chưa cập nhật PAO';
  if (paoDays % 30 === 0) return `PAO ${paoDays / 30}M`;
  return `PAO ${paoDays} ngày`;
}

export default function ProductDetailModal({ route, navigation }) {
  const { product } = route.params;
  const { deleteProduct, markAsEmpty, updateProduct, restoreProduct } = useCollection();
  const [remaining, setRemaining] = useState(product.remainingPercent ?? 100);
  const [isSaving, setIsSaving] = useState(false);
  const isFinished = ['finished', 'archived'].includes(product.status);
  const expirationDate = product.expirationDate || product.manufacturerExpirationDate;
  const calculatedDaysLeft = getDaysLeft(expirationDate);
  const daysLeft = product.daysLeft ?? calculatedDaysLeft;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const openedDate = product.openedDateText || formatDate(product.openedDate);
  const manufacturerExpiry = product.manufacturerExpiryText || formatDate(product.manufacturerExpirationDate);
  const expiryDate = product.expiryDateText || formatDate(product.expirationDate);

  const [isEditingPercent, setIsEditingPercent] = useState(false);
  const [percentDraft, setPercentDraft] = useState('');

  const startEditPercent = () => {
    if (isFinished || isSaving) return;
    setPercentDraft(String(remaining));
    setIsEditingPercent(true);
  };

  const commitPercentDraft = () => {
    setIsEditingPercent(false);
    const parsed = Number.parseInt(percentDraft, 10);
    if (Number.isNaN(parsed)) return;
    setRemainingTo(parsed);
  };

  const updateRemaining = delta => setRemainingTo(remaining + delta);

  const setRemainingTo = async value => {
    const nextRemaining = Math.min(100, Math.max(0, value));
    if (nextRemaining === remaining || isSaving) return;

    if (nextRemaining === 0) {
      Alert.alert(
        'Đã dùng hết sản phẩm?',
        'Dung tích đã về 0%. Bạn có muốn chuyển sản phẩm sang danh sách "Đã dùng hết"?',
        [
          {
            text: 'Chỉ đặt 0%',
            onPress: async () => {
              setIsSaving(true);
              try {
                await updateProduct(product.id, { remainingPercent: 0 });
                setRemaining(0);
              } catch (error) {
                Alert.alert('Không thể cập nhật', error.message || 'Vui lòng thử lại.');
              } finally {
                setIsSaving(false);
              }
            },
          },
          {
            text: 'Đánh dấu dùng hết',
            onPress: async () => {
              try {
                await markAsEmpty(product.id);
                navigation.goBack();
              } catch (error) {
                Alert.alert('Không thể cập nhật', error.message || 'Vui lòng thử lại.');
              }
            },
          },
        ]
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateProduct(product.id, { remainingPercent: nextRemaining });
      setRemaining(nextRemaining);
    } catch (error) {
      Alert.alert('Không thể cập nhật', error.message || 'Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmFinish = () => {
    Alert.alert('Đánh dấu đã dùng hết?', 'Sản phẩm sẽ chuyển sang danh sách đã dùng hết và đặt dung tích về 0%.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đánh dấu hết',
        onPress: async () => {
          try {
            await markAsEmpty(product.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Không thể cập nhật', error.message || 'Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const confirmRestore = () => {
    Alert.alert('Dùng lại sản phẩm?', 'Sản phẩm sẽ được khôi phục về danh sách "Đang sử dụng".', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Khôi phục',
        onPress: async () => {
          try {
            await restoreProduct(product.id, 100);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Không thể khôi phục', error.message || 'Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const confirmArchive = () => {
    Alert.alert('Lưu trữ sản phẩm?', 'Sản phẩm sẽ được chuyển vào danh sách đã hoàn tất.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Lưu trữ',
        onPress: async () => {
          try {
            await updateProduct(product.id, { status: 'archived' });
            navigation.goBack();
          } catch (error) {
            Alert.alert('Không thể lưu trữ', error.message || 'Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert('Xoá sản phẩm?', 'Thao tác này không thể hoàn tác.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Không thể xoá', error.message || 'Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const productType = product.productType || product.type;
  const productIcon = getProductIcon(product.productIcon || product.iconId, productType);
  const routineTimeText =
    product.routineUsage?.morning && product.routineUsage?.evening
      ? 'Sáng (AM) & Tối (PM)'
      : product.routineUsage?.morning
      ? 'Buổi sáng (AM)'
      : product.routineUsage?.evening
      ? 'Buổi tối (PM)'
      : product.routine || 'Chưa thiết lập';
  const routineStepText = product.routineUsage?.step
    ? `Bước ${product.routineUsage.step} trong quy trình`
    : 'Chưa thiết lập thứ tự routine';
  const hasAnalysis = product.analysisResult && (
    product.analysisResult.verdict ||
    product.analysisResult.conflictResolution ||
    product.analysisResult.bestPairingInCloset ||
    product.analysisResult.futurePlan ||
    product.analysisResult.baseScore !== undefined
  );

  return (
    <SafeAreaView style={styles.overlay} edges={[]}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => navigation.goBack()} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.leafIcon}><Leaf size={21} color={Colors.primaryDark} /></View>
            <Text style={styles.headerTitle} numberOfLines={1}>VANITY SHELF • NGĂN {TYPE_LABELS[productType]?.toUpperCase() || 'SKINCARE'}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.productPreview}>
              <View style={styles.paoBadge}><ShieldCheck size={13} color={Colors.primaryDark} /><Text style={styles.paoText}>{formatPao(product.paoDays)}</Text></View>
              {product.productImageUrl ? (
                <Image
                  source={{ uri: product.productImageUrl }}
                  style={styles.productPhotoImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={productIcon.image}
                  style={styles.productTypeIcon}
                  resizeMode="contain"
                />
              )}
            </View>
            <View style={styles.heroCopy}>
              <View style={styles.categoryBadge}><FlaskConical size={15} color={Colors.primaryDark} /><Text style={styles.categoryText}>{TYPE_LABELS[productType] || 'Chăm sóc da'}</Text></View>
              <Text style={styles.productName} numberOfLines={2}>{product.name || product.productName}</Text>
              <Text style={styles.brandText} numberOfLines={1}>{product.brand || 'Tủ đồ SkinMate'} • {product.size || 'Dung tích chuẩn'}</Text>
              {isFinished ? (
                <View style={[styles.openBadge, styles.finishedBadge]}>
                  <View style={[styles.statusDot, styles.finishedDot]} />
                  <Text style={styles.finishedBadgeText}>Đã dùng hết</Text>
                </View>
              ) : isExpired ? (
                <View style={[styles.openBadge, styles.expiredActiveBadge]}>
                  <AlertTriangle size={12} color="#DC2626" />
                  <Text style={styles.expiredActiveBadgeText}>
                    Đã hết hạn ({daysLeft !== null ? Math.abs(daysLeft) : 0} ngày) • Tiếp tục dùng
                  </Text>
                </View>
              ) : (
                <View style={styles.openBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.openText}>
                    {daysLeft === null ? 'Chưa thiết lập hạn dùng' : `Đang mở nắp • ${Math.max(0, daysLeft)} ngày còn lại`}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.routineRow}>
              <View style={styles.routineIcon}><Sun size={22} color={Colors.primaryDark} /></View>
              <View style={styles.routineCopy}><Text style={styles.routineTitle}>Quy trình: {routineTimeText}</Text><Text style={styles.routineText}>{routineStepText}</Text></View>
              <ChevronRight size={21} color="#A6B7AE" />
            </TouchableOpacity>
          </View>

          {isExpired && !isFinished ? (
            <View style={styles.redWarningBox}>
              <AlertTriangle size={20} color="#DC2626" style={{ marginTop: 2 }} />
              <View style={styles.redWarningCopy}>
                <Text style={styles.redWarningTitle}>Trạng thái cảnh báo đỏ</Text>
                <Text style={styles.redWarningText}>
                  Sản phẩm này đã quá hạn {daysLeft !== null ? Math.abs(daysLeft) : ''} ngày nhưng bạn chọn tiếp tục sử dụng. Hãy kiểm tra kết cấu, mùi và ngừng dùng ngay nếu có dấu hiệu bất thường.
                </Text>
              </View>
            </View>
          ) : null}

          {/* AI Analysis Section */}
          {hasAnalysis ? (
            <View style={styles.analysisCard}>
              <View style={styles.sectionHeading}>
                <Sparkles size={20} color={Colors.primaryDark} />
                <Text style={styles.sectionTitle}>Kết quả phân tích SkinMate AI</Text>
              </View>

              <View style={styles.scoreRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreNumber}>{product.analysisResult.baseScore ?? 70}</Text>
                  <Text style={styles.scoreLabel}>Điểm nền tảng</Text>
                </View>
                <View style={[styles.scoreBox, styles.contextScoreBox]}>
                  <Text style={[styles.scoreNumber, styles.contextScoreNumber]}>{product.analysisResult.contextualScore ?? 70}</Text>
                  <Text style={styles.scoreLabel}>Điểm tương thích</Text>
                </View>
              </View>

              {product.analysisResult.verdict ? (
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisItemTitle}>Đánh giá tổng quan</Text>
                  <Text style={styles.analysisItemText}>{product.analysisResult.verdict}</Text>
                </View>
              ) : null}

              {product.analysisResult.bestPairingInCloset ? (
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisItemTitle}>Kết hợp tối ưu trong tủ đồ</Text>
                  <Text style={styles.analysisItemText}>{product.analysisResult.bestPairingInCloset}</Text>
                </View>
              ) : null}

              {product.analysisResult.conflictResolution ? (
                <View style={styles.analysisItemWarning}>
                  <Text style={styles.analysisItemWarningTitle}>Lưu ý tương tác & xung đột</Text>
                  <Text style={styles.analysisItemWarningText}>{product.analysisResult.conflictResolution}</Text>
                </View>
              ) : null}

              {product.analysisResult.futurePlan ? (
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisItemTitle}>Kế hoạch sử dụng gợi ý</Text>
                  <Text style={styles.analysisItemText}>{product.analysisResult.futurePlan}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Ingredients Section */}
          {Array.isArray(product.ingredients) && product.ingredients.length > 0 ? (
            <View style={styles.ingredientsCard}>
              <View style={styles.sectionHeading}>
                <FlaskConical size={19} color="#64776D" />
                <Text style={styles.sectionTitle}>Thành phần nổi bật ({product.ingredients.length})</Text>
              </View>
              <View style={styles.ingredientsWrap}>
                {product.ingredients.map((ing, idx) => (
                  <View key={idx} style={styles.ingredientTag}>
                    <Text style={styles.ingredientTagText}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.volumeCard}>
            <View style={styles.volumeHeader}>
              <View style={styles.metricIcon}><CircleGauge size={24} color={Colors.primaryDark} /></View>
              <View style={styles.metricCopy}><Text style={styles.metricTitle}>Dung tích ước lượng</Text><Text style={styles.metricText}>Khoảng {Math.round((Number.parseInt(product.size, 10) || 30) * remaining / 100)}ml</Text></View>
              {isEditingPercent ? (
                <View style={styles.percentEditRow}>
                  <TextInput
                    style={[styles.percentage, styles.percentInput]}
                    value={percentDraft}
                    onChangeText={text => setPercentDraft(text.replace(/[^0-9]/g, '').slice(0, 3))}
                    onBlur={commitPercentDraft}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    maxLength={3}
                    autoFocus
                    selectTextOnFocus
                    accessibilityLabel="Nhập phần trăm dung tích còn lại"
                  />
                  <Text style={styles.percentage}>%</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={startEditPercent} disabled={isFinished || isSaving} accessibilityRole="button" accessibilityLabel={`Dung tích còn ${remaining}%, chạm để nhập`}>
                  <Text style={styles.percentage}>{remaining}%</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${remaining}%` }]} /></View>
            {!isFinished ? (
              <View style={styles.quickControls}>
                <TouchableOpacity style={styles.quickButton} onPress={() => updateRemaining(-10)} disabled={isSaving}><Text style={styles.quickButtonText}>− 10%</Text></TouchableOpacity>
                <Text style={styles.quickLabel}>{isSaving ? 'Đang lưu...' : 'Cập nhật nhanh'}</Text>
                <TouchableOpacity style={styles.quickButton} onPress={() => updateRemaining(10)} disabled={isSaving}><Text style={styles.quickButtonText}>＋ 10%</Text></TouchableOpacity>
              </View>
            ) : (
              <View style={styles.finishedNoticeWrap}>
                <Text style={styles.finishedNoticeText}>Sản phẩm này đã được đánh dấu dùng hết (0%)</Text>
              </View>
            )}
          </View>

          <View style={styles.trackingCard}>
            <View style={styles.sectionHeading}><CalendarDays size={21} color="#64776D" /><Text style={styles.sectionTitle}>Theo dõi Hạn dùng & Mở nắp</Text></View>
            <View style={styles.trackingRow}>
              <View style={styles.trackingIcon}><LockKeyhole size={21} color={Colors.primaryDark} /></View>
              <View style={styles.trackingCopy}><Text style={styles.trackingLabel}>Ngày mở nắp</Text><Text style={styles.trackingValue}>{openedDate}</Text></View>
              <View style={styles.neutralBadge}><Text style={styles.neutralText}>{product.openedDate ? 'Đã mở nắp' : 'Chưa cập nhật'}</Text></View>
            </View>
            <View style={[styles.trackingRow, styles.warningRow]}>
              <View style={styles.trackingIcon}><AlertTriangle size={22} color="#A8470A" /></View>
              <View style={styles.trackingCopy}><Text style={styles.warningLabel}>Hạn sử dụng (PAO / EXP)</Text><Text style={styles.warningValue}>{expiryDate}</Text></View>
              {daysLeft !== null ? <View style={styles.daysBadge}><Text style={styles.daysText}>{isExpired ? 'Đã quá hạn' : `Còn ${Math.max(0, daysLeft)} ngày`}</Text></View> : null}
            </View>
            <View style={styles.trackingRow}>
              <View style={styles.trackingIcon}><ShieldCheck size={21} color="#64776D" /></View>
              <View style={styles.trackingCopy}><Text style={styles.trackingLabel}>Hạn niêm phong (EXP)</Text><Text style={styles.trackingValue}>{manufacturerExpiry}</Text></View>
              <View style={styles.safeBadge}><Text style={styles.safeText}>Nguyên vẹn</Text></View>
            </View>
          </View>

          <View style={styles.storageNote}>
            <Sparkles size={23} color={Colors.primaryDark} />
            <View style={styles.noteCopy}><Text style={styles.noteTitle}>Ghi chú & Lưu ý bảo quản</Text><Text style={styles.noteText}>{product.note || 'Đậy nắp kín sau khi dùng và cất nơi khô thoáng, tránh ánh nắng trực tiếp.'}</Text></View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('AddProduct', { product })}
              activeOpacity={0.8}
            >
              <Pencil size={16} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionRow}>
            {!isFinished ? (
              <TouchableOpacity style={styles.finishButton} onPress={confirmFinish} activeOpacity={0.8}>
                <Text style={styles.finishButtonText}>Đã dùng hết</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.restoreButton} onPress={confirmRestore} activeOpacity={0.8}>
                <Text style={styles.restoreButtonText}>Dùng lại (Khôi phục)</Text>
              </TouchableOpacity>
            )}
            {product.status !== 'archived' && !isFinished ? (
              <TouchableOpacity style={styles.archiveButton} onPress={confirmArchive} activeOpacity={0.8}>
                <Text style={styles.archiveButtonText}>Lưu trữ</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}><Text style={styles.deleteButtonText}>Xoá sản phẩm</Text></TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10, 16, 28, 0.62)' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 16, 28, 0.62)' },
  sheet: { maxHeight: '88%', minHeight: '76%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden' },
  handle: { width: 72, height: 7, borderRadius: 4, alignSelf: 'center', backgroundColor: '#D6E0DB', marginTop: 13 },
  header: { minHeight: 69, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  leafIcon: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#9BEFD2', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#34433E', fontSize: 14, letterSpacing: 0.2 },
  closeButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F2FF', marginLeft: 10 },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  heroCard: { borderRadius: 26, backgroundColor: '#F0F2FF', padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 16 },
  productPreview: { width: 128, height: 147, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 16 },
  productPhotoImage: { width: '100%', height: '100%', borderRadius: 16 },
  productTypeIcon: { width: '72%', height: '72%' },
  paoBadge: { position: 'absolute', top: 9, left: 9, zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 13, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 5 },
  paoText: { color: Colors.primaryDark, fontSize: 10 },
  heroCopy: { flex: 1, minWidth: 150, justifyContent: 'center' },
  categoryBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 16, backgroundColor: '#8FEFC9', paddingHorizontal: 11, paddingVertical: 6, marginBottom: 7 },
  categoryText: { color: Colors.primaryDark, fontSize: 12 },
  productName: { color: '#111629', fontSize: 22, lineHeight: 26, fontWeight: '700' },
  brandText: { color: '#425049', fontSize: 14, marginTop: 3 },
  openBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 17, backgroundColor: '#FFD9C7', paddingHorizontal: 12, paddingVertical: 7, marginTop: 12 },
  expiredBadge: { backgroundColor: '#F9DADA' },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#A8470A' },
  expiredDot: { backgroundColor: Colors.danger },
  openText: { color: '#502A1B', fontSize: 12, fontWeight: '500' },
  routineRow: { width: '100%', minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFFFFF', paddingHorizontal: 12, marginTop: 2 },
  routineIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E9EDFF', alignItems: 'center', justifyContent: 'center' },
  routineCopy: { flex: 1 },
  routineTitle: { color: '#111629', fontSize: 13, fontWeight: '700' },
  routineText: { color: '#52615A', fontSize: 12, marginTop: 2 },
  volumeCard: { borderRadius: 26, backgroundColor: '#FFFFFF', padding: 16, shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 16 },
  volumeHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  metricIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#9BEFD2', alignItems: 'center', justifyContent: 'center' },
  metricCopy: { flex: 1 },
  metricTitle: { color: '#111629', fontSize: 15, fontWeight: '600' },
  metricText: { color: '#52615A', fontSize: 12, marginTop: 2 },
  percentage: { color: Colors.primaryDark, fontSize: 28, fontWeight: '800' },
  percentEditRow: { flexDirection: 'row', alignItems: 'center' },
  percentInput: { minWidth: 56, paddingVertical: 0, textAlign: 'right', borderBottomWidth: 2, borderBottomColor: Colors.primary },
  progressTrack: { height: 12, borderRadius: 6, backgroundColor: '#E6E9FC', overflow: 'hidden', marginTop: 15 },
  progressFill: { height: '100%', borderRadius: 6, backgroundColor: Colors.primary },
  quickControls: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14 },
  quickButton: { flex: 1, minHeight: 42, borderRadius: 21, backgroundColor: '#F0F2FF', alignItems: 'center', justifyContent: 'center' },
  quickButtonText: { color: '#111629', fontSize: 16, fontWeight: '600' },
  quickLabel: { color: '#52615A', fontSize: 12 },
  trackingCard: { borderRadius: 26, backgroundColor: '#FFFFFF', padding: 16, shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 16 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#111629', fontSize: 16, fontWeight: '600' },
  trackingRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 10, backgroundColor: '#F0F2FF', marginBottom: 7 },
  trackingIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  trackingCopy: { flex: 1 },
  trackingLabel: { color: '#52615A', fontSize: 11 },
  trackingValue: { color: '#111629', fontSize: 15, fontWeight: '600', marginTop: 2 },
  neutralBadge: { borderRadius: 14, backgroundColor: '#E4E9FB', paddingHorizontal: 10, paddingVertical: 6 },
  neutralText: { color: '#425049', fontSize: 10 },
  warningRow: { backgroundColor: '#FFD9C7' },
  warningLabel: { color: '#8C3B15', fontSize: 11 },
  warningValue: { color: '#A8470A', fontSize: 16, fontWeight: '700', marginTop: 2 },
  daysBadge: { borderRadius: 14, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6 },
  daysText: { color: '#A8470A', fontSize: 10, fontWeight: '600' },
  safeBadge: { borderRadius: 14, backgroundColor: '#9BEFD2', paddingHorizontal: 10, paddingVertical: 6 },
  safeText: { color: Colors.primaryDark, fontSize: 10 },
  storageNote: { flexDirection: 'row', gap: 11, backgroundColor: '#F0F2FF', padding: 15, marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 10, justifyContent: 'center' },
  editButton: { flex: 1, minHeight: 46, borderRadius: 23, backgroundColor: Colors.primaryDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  editButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  finishButton: { flex: 1, minHeight: 46, borderRadius: 23, backgroundColor: '#D1F6EA', alignItems: 'center', justifyContent: 'center' },
  finishButtonText: { color: Colors.primaryDark, fontSize: 13, fontWeight: '700' },
  restoreButton: { flex: 1, minHeight: 46, borderRadius: 23, backgroundColor: '#D4F5E8', alignItems: 'center', justifyContent: 'center' },
  restoreButtonText: { color: '#047857', fontSize: 13, fontWeight: '700' },
  archiveButton: { flex: 1, minHeight: 46, borderRadius: 23, backgroundColor: '#E7ECFF', alignItems: 'center', justifyContent: 'center' },
  archiveButtonText: { color: '#33423D', fontSize: 13, fontWeight: '700' },
  deleteButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: Colors.danger, fontSize: 13, fontWeight: '700' },
  finishedBadge: { backgroundColor: '#E2E8F0' },
  finishedDot: { backgroundColor: '#64748B' },
  finishedBadgeText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  expiredActiveBadge: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  expiredActiveBadgeText: { color: '#B91C1C', fontSize: 11.5, fontWeight: '700' },
  redWarningBox: { flexDirection: 'row', gap: 10, backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#F87171', borderRadius: 18, padding: 14, marginBottom: 16, shadowColor: '#DC2626', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  redWarningCopy: { flex: 1 },
  redWarningTitle: { color: '#991B1B', fontSize: 14, fontWeight: '800', marginBottom: 3 },
  redWarningText: { color: '#B91C1C', fontSize: 12, lineHeight: 17 },
  noteCopy: { flex: 1 },
  noteTitle: { color: '#111629', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  noteText: { color: '#425049', fontSize: 12, lineHeight: 18 },
  analysisCard: { borderRadius: 26, backgroundColor: '#FFFFFF', padding: 16, shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 16 },
  scoreRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  scoreBox: { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
  contextScoreBox: { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' },
  scoreNumber: { fontSize: 24, fontWeight: '800', color: '#166534' },
  contextScoreNumber: { color: '#0369A1' },
  scoreLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },
  analysisItem: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 8 },
  analysisItemTitle: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 },
  analysisItemText: { fontSize: 13, color: '#475569', lineHeight: 18 },
  analysisItemWarning: { backgroundColor: '#FFFBEB', borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#FDE68A' },
  analysisItemWarningTitle: { fontSize: 12, fontWeight: '700', color: '#B45309', marginBottom: 4 },
  analysisItemWarningText: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  ingredientsCard: { borderRadius: 26, backgroundColor: '#FFFFFF', padding: 16, shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 16 },
  ingredientsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ingredientTag: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  ingredientTagText: { fontSize: 11, color: '#475569', fontWeight: '500' },
});
