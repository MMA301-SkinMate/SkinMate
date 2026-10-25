import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
} from 'lucide-react-native';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useCollection } from '../../context/CollectionContext';

const { width: screenWidth } = Dimensions.get('window');
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const pad = value => String(value).padStart(2, '0');
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function getExpirationDate(product) {
  const value = product.expirationDate || product.manufacturerExpirationDate;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDaysFromToday(date) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((startDate - startToday) / 86400000);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(date);
}

function getStatus(product, date) {
  if (product.status === 'finished') return { label: 'Đã dùng hết', color: Colors.textMuted };
  const days = getDaysFromToday(date);
  if (days < 0 || product.status === 'expired') return { label: 'Đã hết hạn', color: Colors.error };
  if (days <= 30) return { label: days === 0 ? 'Hết hạn hôm nay' : `Còn ${days} ngày`, color: Colors.warning };
  return { label: 'Còn hạn', color: Colors.success };
}

export default function ExpiryCalendarScreen({ navigation }) {
  const { collection } = useCollection();
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));

  const products = useMemo(() => collection
    .map(product => ({ ...product, expiryDate: getExpirationDate(product) }))
    .filter(product => product.expiryDate), [collection]);

  const productsByDate = useMemo(() => products.reduce((result, product) => {
    const key = dateKey(product.expiryDate);
    result[key] = [...(result[key] || []), product];
    return result;
  }, {}), [products]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
    return [
      ...Array(mondayFirstOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(
        visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1
      )),
    ];
  }, [visibleMonth]);

  const selectedProducts = productsByDate[selectedDate] || [];
  const monthProductCount = calendarDays.reduce(
    (count, date) => count + (date ? (productsByDate[dateKey(date)] || []).length : 0), 0
  );

  const changeMonth = offset => {
    setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <X size={20} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Lịch hạn dùng</Text>
            <Text style={styles.subtitle}>Theo dõi ngày cần ưu tiên sử dụng</Text>
          </View>
          <View style={styles.headerIcon}><CalendarDays size={21} color={Colors.primary} /></View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}><Clock3 size={19} color={Colors.warning} /></View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>{monthProductCount} sản phẩm trong tháng này</Text>
            <Text style={styles.summaryText}>Các sản phẩm được sắp xếp theo ngày hết hạn.</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth(-1)}>
              <ChevronLeft size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</Text>
            <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth(1)}>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.weekRow}>{WEEK_DAYS.map(day => <Text key={day} style={styles.weekDay}>{day}</Text>)}</View>
          <View style={styles.daysGrid}>
            {calendarDays.map((date, index) => {
              if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />;
              const key = dateKey(date);
              const hasProducts = Boolean(productsByDate[key]?.length);
              const isSelected = key === selectedDate;
              const isToday = key === dateKey(today);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.dayCell, isSelected && styles.selectedDay]}
                  onPress={() => setSelectedDate(key)}
                >
                  <Text style={[styles.dayText, isToday && styles.todayText, isSelected && styles.selectedDayText]}>{date.getDate()}</Text>
                  {hasProducts ? <View style={[styles.dayDot, isSelected && styles.selectedDayDot]} /> : <View style={styles.dayDotPlaceholder} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.warning }]} /><Text style={styles.legendText}>Sắp hết hạn</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.error }]} /><Text style={styles.legendText}>Đã hết hạn</Text></View>
          </View>
        </View>

        <View style={styles.detailsHeader}>
          <Text style={styles.sectionTitle}>{formatDate(new Date(`${selectedDate}T12:00:00`))}</Text>
          <Text style={styles.itemCount}>{selectedProducts.length} sản phẩm</Text>
        </View>
        {selectedProducts.length ? selectedProducts.map(product => {
          const status = getStatus(product, product.expiryDate);
          return (
            <View key={product.id} style={styles.productCard}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <View style={styles.productCopy}>
                <Text style={styles.productName} numberOfLines={1}>{product.productName}</Text>
                <Text style={styles.productBrand} numberOfLines={1}>{product.brand || 'Chưa rõ thương hiệu'}</Text>
              </View>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          );
        }) : (
          <View style={styles.emptyCard}>
            <CalendarDays size={22} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Không có sản phẩm hết hạn ngày này</Text>
            <Text style={styles.emptyText}>Chọn ngày có chấm màu trên lịch để xem sản phẩm.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 18 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: Colors.muted, fontSize: 12, marginTop: 2 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 16, padding: 13, marginBottom: 14, borderWidth: 1, borderColor: Colors.borderDark },
  summaryIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7E6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  summaryText: { color: Colors.muted, fontSize: 11, marginTop: 3 },
  calendarCard: { backgroundColor: Colors.background, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: Colors.borderDark, marginBottom: 20 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { width: `${100 / 7}%`, color: Colors.textMuted, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  selectedDay: { backgroundColor: Colors.primary },
  dayText: { color: Colors.text, fontSize: 13 },
  todayText: { color: Colors.primary, fontWeight: '800' },
  selectedDayText: { color: Colors.textLight, fontWeight: '800' },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.warning, marginTop: 4 },
  selectedDayDot: { backgroundColor: Colors.textLight },
  dayDotPlaceholder: { width: 5, height: 5, marginTop: 4 },
  legendRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 11, marginTop: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: Colors.muted, fontSize: 10 },
  detailsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  sectionTitle: { color: Colors.text, fontSize: 15, fontWeight: '800', maxWidth: screenWidth - 120 },
  itemCount: { color: Colors.muted, fontSize: 11 },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  statusDot: { width: 9, height: 9, borderRadius: 5, marginRight: 10 },
  productCopy: { flex: 1 },
  productName: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  productBrand: { color: Colors.muted, fontSize: 11, marginTop: 3 },
  statusText: { fontSize: 10, fontWeight: '700', marginLeft: 8 },
  emptyCard: { alignItems: 'center', backgroundColor: Colors.background, borderRadius: 16, padding: 22, borderWidth: 1, borderColor: Colors.border },
  emptyTitle: { color: Colors.text, fontSize: 13, fontWeight: '700', marginTop: 8 },
  emptyText: { color: Colors.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
