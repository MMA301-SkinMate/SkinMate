import { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Hồ sơ da
  const [userProfile, setUserProfile] = useState({
    name: 'Trần Quang',
    email: 'tranquang@example.com',
    skinType: 'Da dầu mụn',
    concerns: ['Mụn bọc', 'Bóng dầu vùng T', 'Thâm sau mụn'],
    allergies: ['Fragrance/Hương liệu', 'Alcohol Denat (Cồn khô)'],
    isGuest: false,
  });

  // 2. Trạng thái Check-in hôm nay
  const [todaySkinStatus, setTodaySkinStatus] = useState([]);
  const [checkInDone, setCheckInDone] = useState(false);

  // 3. Tủ đồ cá nhân (My Collection)
  const [collection, setCollection] = useState([
    {
      id: '1',
      name: 'Sữa rửa mặt CeraVe Foaming Cleanser',
      type: 'cleanser',
      openedDate: '10/01/2026',
      expiryDate: '10/01/2027',
      status: 'active', // 'active' | 'expiring' | 'expired' | 'empty'
      ingredients: ['Water', 'Niacinamide', 'Ceramide NP', 'Hyaluronic Acid'],
      note: 'Dùng sáng và tối',
    },
    {
      id: '2',
      name: 'Paula\'s Choice Skin Perfecting BHA 2%',
      type: 'serum',
      openedDate: '15/12/2025',
      expiryDate: '20/04/2026', // Sắp hết hạn -> chấm cam
      status: 'expiring',
      ingredients: ['Salicylic Acid', 'Camellia Oleifera Leaf Extract'],
      note: 'Chỉ dùng buổi tối cách ngày',
    },
    {
      id: '3',
      name: 'Kem dưỡng La Roche-Posay Cicaplast B5+',
      type: 'cream',
      openedDate: '01/02/2026',
      expiryDate: '01/02/2027',
      status: 'active',
      ingredients: ['Panthenol 5%', 'Madecassoside', 'Zinc Gluconate'],
      note: 'Phục hồi da khi khô rát',
    },
    {
      id: '4',
      name: 'Toner Tràm Trà Some By Mi AHA-BHA-PHA',
      type: 'toner',
      openedDate: '01/01/2025',
      expiryDate: '01/01/2026', // Hết hạn -> bị mờ + badge đỏ
      status: 'expired',
      ingredients: ['Tea Tree Water', 'AHA', 'BHA', 'PHA'],
      note: 'Đã hết hạn sử dụng',
    },
  ]);

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

  // Thao tác với tủ đồ
  const addProductToCollection = (newProd) => {
    setCollection(prev => [newProd, ...prev]);
  };

  const updateProduct = (id, updatedFields) => {
    setCollection(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = (id) => {
    setCollection(prev => prev.filter(p => p.id !== id));
  };

  const markAsEmpty = (id) => {
    setCollection(prev => prev.map(p => p.id === id ? { ...p, status: 'empty' } : p));
  };

  return (
    <AppContext.Provider
      value={{
        userProfile, setUserProfile,
        todaySkinStatus, setTodaySkinStatus,
        checkInDone, setCheckInDone,
        collection, setCollection,
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