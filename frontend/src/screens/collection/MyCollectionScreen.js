import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ChevronRight, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useCollection } from '../../context/CollectionContext';
import { getProductIcon } from '../../constants/product-icons';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = Math.max((screenWidth - 62) / 3, 82);

const SHELVES = [
  { id: 'treatment', title: 'Kệ 1: Tinh chất & Serum', types: ['serum', 'treatment', 'oil', 'mask', 'essences', 'exfoliant'] },
  { id: 'moisture', title: 'Kệ 2: Dưỡng ẩm & Chống nắng', types: ['cream', 'moisturizer', 'sunscreen'] },
  { id: 'cleanse', title: 'Kệ 3: Làm sạch & Cân bằng', types: ['cleanser', 'toner', 'others', 'other'] },
];

const BOTTLE_COLORS = ['#E3ECFF', '#D4F5E8', '#FFDCC8', '#F2E2D4', '#DEE5FF'];

function formatDate(value) {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

function getExpirationStatus(product) {
  if (product.status === 'expired') return 'expired';
  if (product.status !== 'active') return product.status;
  const expiration = product.expirationDate || product.manufacturerExpirationDate;
  if (!expiration) return 'active';

  const daysLeft = Math.ceil((new Date(expiration) - new Date()) / 86400000);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring';
  return 'active';
}

function getDaysLeft(product) {
  const expiration = product.expirationDate || product.manufacturerExpirationDate;
  if (!expiration) return null;
  return Math.ceil((new Date(expiration) - new Date()) / 86400000);
}

function toDisplayProduct(product, index) {
  const expirationStatus = getExpirationStatus(product);
  const routine = product.routineUsage?.morning && product.routineUsage?.evening
    ? 'Sáng / Tối'
    : product.routineUsage?.morning
      ? 'Sáng'
      : product.routineUsage?.evening
        ? 'Tối'
        : 'Chưa thiết lập';

  return {
    ...product,
    name: product.productName,
    type: product.productType,
    productIcon: product.productIcon,
    analysisResult: product.analysisResult,
    openedDateText: formatDate(product.openedDate),
    expiryDateText: formatDate(product.expirationDate),
    daysLeft: getDaysLeft(product),
    status: product.status || 'active',
    continueAfterExpiry: Boolean(product.continueAfterExpiry),
    expirationStatus,
    routine,
    label: product.brand || product.productName,
    bottle: BOTTLE_COLORS[index % BOTTLE_COLORS.length],
  };
}

export default function MyCollectionScreen({ navigation }) {
  const {
    collection,
    isCollectionLoading,
    collectionError,
    refreshCollection,
  } = useCollection();
  const [tab, setTab] = useState('active');

  const displayProducts = useMemo(
    () => collection.map(toDisplayProduct),
    [collection]
  );

  const activeProducts = displayProducts.filter(
    product => product.status === 'active' || (product.status === 'expired' && product.continueAfterExpiry)
  );
  const archivedProducts = displayProducts.filter(
    product => product.status === 'finished' || (product.status === 'expired' && !product.continueAfterExpiry)
  );
  const productsForTab = tab === 'active' ? activeProducts : archivedProducts;

  const shelves = SHELVES.map(shelf => ({
    ...shelf,
    products: productsForTab.filter(product => shelf.types.includes(product.type)),
  })).filter(shelf => shelf.products.length);

  const expiringCount = activeProducts.filter(product => product.expirationStatus === 'expiring').length;
  const expiredActiveCount = activeProducts.filter(
    product => (product.daysLeft !== null && product.daysLeft < 0) || product.status === 'expired'
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <View>
            <View style={styles.titleWithCount}>
              <Text style={styles.title}>Tủ đồ Skincare</Text>
              <Text style={styles.monthBadge}>{collection.length} món</Text>
            </View>
            <Text style={styles.subtitle}>Không gian dưỡng da cá nhân & hạn sử dụng</Text>
          </View>
          <View style={styles.headingActions}>
            <TouchableOpacity style={styles.roundButton}><Search size={18} color={Colors.text} /></TouchableOpacity>
            <TouchableOpacity style={styles.roundButton}><SlidersHorizontal size={18} color={Colors.text} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabItem, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Đang sử dụng</Text>
            <Text style={styles.countBadge}>{activeProducts.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, tab === 'archived' && styles.tabActive]} onPress={() => setTab('archived')}>
            <Text style={[styles.tabText, tab === 'archived' && styles.tabTextActive]}>Đã dùng hết</Text>
            <Text style={styles.archivedBadge}>{archivedProducts.length}</Text>
          </TouchableOpacity>
        </View>

        {expiredActiveCount > 0 ? (
          <View style={styles.expiredBanner}>
            <View style={styles.expiredBannerDot}>
              <AlertTriangle size={13} color="#FFFFFF" />
            </View>
            <Text style={styles.expiredBannerText}>
              Cảnh báo đỏ: Có <Text style={styles.expiredBannerBold}>{expiredActiveCount} sản phẩm hết hạn</Text> đang tiếp tục dùng
            </Text>
          </View>
        ) : null}

        <View style={styles.reminder}>
          <View style={styles.reminderDot} />
          <Text style={styles.reminderText}>Nhắc nhở: <Text style={styles.reminderBold}>{expiringCount} món</Text> cần ưu tiên dùng sớm</Text>
          <TouchableOpacity><Text style={styles.calendarLink}>Xem lịch <ChevronRight size={14} color={Colors.dark} /></Text></TouchableOpacity>
        </View>

        {isCollectionLoading ? <LoadingState /> : null}
        {!isCollectionLoading && collectionError ? <ErrorState message={collectionError} onRetry={refreshCollection} /> : null}
        {!isCollectionLoading && !collectionError && !productsForTab.length ? <EmptyState tab={tab} /> : null}

        {!isCollectionLoading && !collectionError && shelves.length ? (
          <View style={styles.cabinet}>
            <View style={styles.cabinetTop}><View style={styles.cabinetKnob} /></View>
            {shelves.map(shelf => <ShelfSection key={shelf.id} shelf={shelf} navigation={navigation} />)}
            <View style={styles.cabinetBottom} />
          </View>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct')}
        activeOpacity={0.85}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addText}>Thêm món</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function LoadingState() {
  return <View style={styles.stateCard}><ActivityIndicator color={Colors.primary} /><Text style={styles.stateText}>Đang tải tủ đồ skincare...</Text></View>;
}

function ErrorState({ message, onRetry }) {
  return <View style={styles.stateCard}><Text style={styles.stateText}>{message}</Text><TouchableOpacity onPress={onRetry}><Text style={styles.retryText}>Thử lại</Text></TouchableOpacity></View>;
}

function EmptyState({ tab }) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.emptyTitle}>
        {tab === 'active' ? 'Tủ đồ của bạn đang trống' : 'Chưa có sản phẩm đã dùng hết'}
      </Text>
      <Text style={styles.stateText}>
        {tab === 'active'
          ? 'Thêm sản phẩm đầu tiên để theo dõi routine và hạn dùng.'
          : 'Sản phẩm sau khi được đánh dấu đã dùng hết sẽ hiển thị tại đây.'}
      </Text>
    </View>
  );
}

function ShelfSection({ shelf, navigation }) {
  return (
    <View style={styles.shelfSection}>
      <View style={styles.shelfHeading}><View style={styles.shelfTitleWrap}><View style={styles.shelfAccent} /><Text style={styles.shelfTitle}>{shelf.title}</Text></View><Text style={styles.shelfCount}>{shelf.products.length} sản phẩm</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow} scrollEnabled={shelf.products.length > 3}>
        {shelf.products.map(product => <ProductCard key={product.id} product={product} navigation={navigation} />)}
      </ScrollView>
      <View style={styles.woodShelf}><View style={styles.woodHighlight} /></View>
    </View>
  );
}

function ProductCard({ product, navigation }) {
  const isArchived = product.status === 'finished' || (product.status === 'expired' && !product.continueAfterExpiry);
  const isExpired = (product.daysLeft !== null && product.daysLeft < 0) || product.status === 'expired';
  const showRedAlert = !isArchived && (isExpired || product.continueAfterExpiry);
  const icon = getProductIcon(product.productIcon || product.iconId, product.type);

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        isArchived && styles.productArchived,
        showRedAlert && styles.productCardExpired,
      ]}
      onPress={() => navigation.navigate('ProductDetailModal', { product })}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.productIconWrap,
          showRedAlert && styles.productIconWrapExpired,
        ]}
      >
        <Image source={icon.image} style={styles.productIconImage} resizeMode="contain" />
        <Text style={[styles.silhouetteLabel, showRedAlert && styles.silhouetteLabelExpired]} numberOfLines={2}>
          {product.label}
        </Text>
        {product.status === 'finished' ? (
          <View style={styles.finishedBadge}>
            <Text style={styles.finishedBadgeText}>Hết</Text>
          </View>
        ) : null}
        {showRedAlert ? (
          <View style={styles.expiredRedBadge}>
            <AlertTriangle size={8} color="#FFFFFF" />
            <Text style={styles.expiredRedBadgeText}>Hết hạn</Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[styles.productName, showRedAlert && styles.productNameExpired]}
        numberOfLines={2}
      >
        {product.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },
  content: { paddingHorizontal: 12, paddingBottom: 105 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  titleWithCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: '#111629', fontSize: 27, lineHeight: 31, fontWeight: '800' },
  monthBadge: { color: Colors.dark, backgroundColor: '#9BEFD2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 13, fontSize: 11 },
  subtitle: { color: Colors.muted, fontSize: 13, marginTop: 2 },
  headingActions: { flexDirection: 'row', gap: 8 },
  roundButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', shadowColor: '#A8AEBB', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#EEF0FF', borderRadius: 25, padding: 4, marginBottom: 13 },
  tabItem: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 21 },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#A8AEBB', shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  tabText: { color: '#34433E', fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: Colors.dark, fontWeight: '700' },
  countBadge: { color: Colors.dark, backgroundColor: '#C9F3E8', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, fontSize: 11 },
  archivedBadge: { color: '#536079', backgroundColor: '#DCE2F6', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, fontSize: 11 },
  expiredBanner: { minHeight: 38, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', marginBottom: 9, shadowColor: '#DC2626', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, gap: 8 },
  expiredBannerDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  expiredBannerText: { flex: 1, color: '#991B1B', fontSize: 11.5 },
  expiredBannerBold: { color: '#DC2626', fontWeight: '800' },
  reminder: { minHeight: 38, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, borderRadius: 20, backgroundColor: '#FFFFFF', marginBottom: 22, shadowColor: '#A8AEBB', shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  reminderDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#A8470A', marginRight: 9 },
  reminderText: { flex: 1, color: '#34433E', fontSize: 11 },
  reminderBold: { color: '#A8470A', fontWeight: '700' },
  calendarLink: { color: Colors.dark, fontSize: 11, fontWeight: '600' },
  stateCard: { alignItems: 'center', gap: 10, padding: 24, borderRadius: 18, backgroundColor: '#FFFFFF', marginTop: 12, shadowColor: '#A8AEBB', shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  emptyTitle: { color: '#111629', fontSize: 16, fontWeight: '700' },
  stateText: { color: Colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  retryText: { color: Colors.dark, fontSize: 14, fontWeight: '700' },
  cabinet: { marginHorizontal: -4, paddingHorizontal: 9, paddingTop: 5, backgroundColor: '#8B3F0A', borderRadius: 10, borderWidth: 2, borderColor: '#6C2F08', shadowColor: '#482006', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  cabinetTop: { height: 13, borderRadius: 5, backgroundColor: '#B65B17', marginBottom: 7, borderTopWidth: 2, borderTopColor: '#D47A2C' },
  cabinetKnob: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#F2BC65', marginLeft: 7, marginTop: 1 },
  cabinetBottom: { height: 13, marginHorizontal: -1, marginTop: -15, borderRadius: 4, backgroundColor: '#A94A0B', borderTopWidth: 2, borderTopColor: '#D47A2C' },
  shelfSection: { marginBottom: 14 },
  shelfHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, paddingHorizontal: 4 },
  shelfTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  shelfAccent: { width: 5, height: 14, borderRadius: 3, backgroundColor: '#F4A261', marginRight: 5 },
  shelfTitle: { color: '#FFF7ED', fontSize: 15, fontWeight: '700' },
  shelfCount: { color: '#FDE7CF', fontSize: 10 },
  productRow: { gap: 7, paddingHorizontal: 1, paddingTop: 5, paddingBottom: 4 },
  productCard: { width: CARD_WIDTH, minHeight: 104, alignItems: 'center', justifyContent: 'flex-end', padding: 2, backgroundColor: 'transparent' },
  productArchived: { opacity: 0.58 },
  productCardExpired: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },
  productIconWrap: { width: 58, height: 63, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 2, marginBottom: 5 },
  productIconImage: { width: '100%', height: '100%' },
  productIconWrapExpired: { borderWidth: 2, borderColor: '#DC2626', borderRadius: 8, shadowColor: '#DC2626', shadowOpacity: 0.35, shadowRadius: 5, elevation: 3 },
  finishedBadge: { position: 'absolute', top: 3, backgroundColor: 'rgba(0, 0, 0, 0.65)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, zIndex: 2 },
  finishedBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
  expiredRedBadge: { position: 'absolute', top: 2, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#DC2626', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, zIndex: 3 },
  expiredRedBadgeText: { color: '#FFFFFF', fontSize: 7, fontWeight: '800' },
  silhouetteLabel: { color: '#34433E', fontSize: 5, textAlign: 'center', fontWeight: '500', paddingHorizontal: 2 },
  silhouetteLabelExpired: { color: '#7F1D1D', fontWeight: '700' },
  productName: { width: '100%', color: '#FFF7ED', fontSize: 8, lineHeight: 10, fontWeight: '600', textAlign: 'center' },
  productNameExpired: { color: '#FECACA', fontWeight: '800' },
  woodShelf: { height: 10, borderRadius: 3, backgroundColor: '#A8470A', marginTop: 1, shadowColor: '#7F3504', shadowOpacity: 0.27, shadowRadius: 7, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  woodHighlight: { height: 3, borderRadius: 2, backgroundColor: '#CB6720', marginHorizontal: 1 },
  addButton: { position: 'absolute', right: 18, bottom: 18, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, minHeight: 52, borderRadius: 27, backgroundColor: '#047857', shadowColor: Colors.dark, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
