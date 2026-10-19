import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuthSession } from './AuthSessionContext';
import {
  createCollectionProduct,
  deleteCollectionProduct,
  listCollectionProducts,
  updateCollectionProduct,
} from '../api/collectionApi';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { session } = useAuthSession();
  // 1. Hồ sơ da
  const [userProfile, setUserProfile] = useState({
    name: 'Trần Quang',
    email: 'tranquang@example.com',
    skinType: 'Da dầu mụn',
    concerns: ['Mụn bọc', 'Bóng dầu vùng T', 'Thâm sau mụn'],
    allergies: ['Fragrance/Hương liệu', 'Alcohol Denat (Cồn khô)'],
    isGuest: true,
  });

  // Đồng bộ phiên đăng nhập đã được khôi phục từ SecureStore.
  useEffect(() => {
    if (!session?.user) return;

    setUserProfile(prev => ({
      ...prev,
      name: session.user.fullName,
      email: session.user.email,
      isGuest: false,
    }));
  }, [session]);

  // 2. Trạng thái Check-in hôm nay
  const [todaySkinStatus, setTodaySkinStatus] = useState([]);
  const [checkInDone, setCheckInDone] = useState(false);

  // 3. Tủ đồ cá nhân (My Collection)
  const [collection, setCollection] = useState([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState(null);

  const refreshCollection = useCallback(async () => {
    if (!session?.user) {
      setCollection([]);
      setCollectionError(null);
      return;
    }

    setIsCollectionLoading(true);
    setCollectionError(null);
    try {
      const result = await listCollectionProducts();
      setCollection(result.products || []);
    } catch (error) {
      setCollectionError(error.message || 'Không thể tải tủ đồ skincare.');
    } finally {
      setIsCollectionLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    refreshCollection();
  }, [refreshCollection]);

  const addProductToCollection = async payload => {
    const result = await createCollectionProduct(payload);
    setCollection(previous => [result.product, ...previous]);
    return result.product;
  };

  const updateProduct = async (id, updates) => {
    const result = await updateCollectionProduct(id, updates);
    setCollection(previous => previous.map(product => (
      product.id === id ? result.product : product
    )));
    return result.product;
  };

  const deleteProduct = async id => {
    await deleteCollectionProduct(id);
    setCollection(previous => previous.filter(product => product.id !== id));
  };

  const markAsEmpty = id => updateProduct(id, { status: 'finished', remainingPercent: 0 });

  // 4. Daily Routine 5 bước linh hoạt
  const [dailyRoutine, setDailyRoutine] = useState([
    { step: 1, title: 'BƯỚC 1 - LÀM SẠCH', product: 'Sữa rửa mặt CeraVe Foaming', note: 'Làm sạch bã nhờn, thông thoáng lỗ chân lông' },
    { step: 2, title: 'BƯỚC 2 - CÂN BẰNG', product: 'Toner Cân Bằng Dịu Nhẹ', note: 'Cân bằng độ ẩm pH tự nhiên' },
    { step: 3, title: 'BƯỚC 3 - ĐẶC TRỊ', product: 'Paula\'s Choice BHA 2%', note: 'Kháng viêm, giảm mụn ẩn sâu' },
    { step: 4, title: 'BƯỚC 4 - DƯỠNG PHỤC HỒI', product: 'Kem dưỡng La Roche-Posay B5+', note: 'Củng cố hàng rào bảo vệ' },
    { step: 5, title: 'BƯỚC 5 - BẢO VỆ', product: 'Kem chống nắng Anessa SPF50+', note: 'Bắt buộc dùng chống tia UV buổi sáng' },
  ]);

  // 5. Bản nháp lịch sử quét
  const [scanHistory, setScanHistory] = useState([
    {
      id: 'h1',
      date: '05/04/2026',
      productName: 'Serum The Ordinary Niacinamide 10%',
      compatibility: 92,
      ingredients: ['Niacinamide', 'Zinc PCA', 'Aqua'],
    },
  ]);

  // 6. Danh sách bài viết cộng đồng
  const [communityPosts, setCommunityPosts] = useState([
    {
      id: 'p1',
      author: 'BS. Da liễu Minh Thư',
      avatar: '👩‍⚕️',
      title: 'Routine 14 ngày dứt điểm mụn ẩn & kiềm dầu',
      skinTypeMatch: 'Da dầu mụn',
      likes: 312,
      isLiked: false,
      copies: 95,
      content: 'Chu trình tối giản kết hợp BHA 2% giãn cách và phục hồi màng ẩm B5...',
      steps: ['Sữa rửa mặt Cerave', 'Toner BHA', 'Kem B5+'],
    },
    {
      id: 'p2',
      author: 'Hoàng Anh Skincare',
      avatar: '🧴',
      title: 'Cứu cánh làn da treatment bị khô rát, bong tróc',
      skinTypeMatch: 'Da nhạy cảm',
      likes: 184,
      isLiked: false,
      copies: 42,
      content: 'Tập trung hoàn toàn vào cấp ẩm tầng sâu và ngưng hoạt chất mạnh 1 tuần.',
      steps: ['Rửa mặt dịu nhẹ', 'Xịt khoáng', 'Serum HA', 'Kem dưỡng khóa ẩm'],
    },
  ]);

  const addCommunityPost = (newPost) => {
    setCommunityPosts(prev => [newPost, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        userProfile, setUserProfile,
        todaySkinStatus, setTodaySkinStatus,
        checkInDone, setCheckInDone,
        collection, setCollection,
        isCollectionLoading, collectionError, refreshCollection,
        addProductToCollection, updateProduct, deleteProduct, markAsEmpty,
        dailyRoutine, setDailyRoutine,
        scanHistory, setScanHistory,
        communityPosts, setCommunityPosts, addCommunityPost,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);