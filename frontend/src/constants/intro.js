export const INTRO_COPY = {
  brand: "SkinMAte",
  skip: "Bỏ qua",
  next: "Tiếp tục",
  start: "Bắt đầu ngay",
  hasAccount: "Đã có tài khoản?",
  login: "Đăng nhập",
  help: "Trợ giúp",
  helpTitle: "Khám phá SkinMAte",
  helpBody:
    "Vuốt ngang, chạm dấu trang hoặc nhấn Tiếp tục để khám phá SkinMAte. Bạn có thể chọn Bỏ qua hoặc Đăng nhập để đến màn đăng nhập bất cứ lúc nào.",
  understood: "Đã hiểu",
  saveFailed: "Chưa lưu được trạng thái Intro trên máy. Vui lòng thử lại.",
  retry: "Thử lại",
};

export const INTRO_SLIDES = [
  {
    id: "skin-awareness",
    badge: "Bước khởi đầu",
    title: "Hiểu làn da. Yêu bản thân hơn",
    description:
      "Khám phá nhu cầu của làn da và đồng hành dịu lành mỗi ngày cùng bạn.",
    image: require("../assets/intro/skin-awareness.jpg"),
    imageLabel: "Khoảnh khắc chăm sóc bản thân trong không gian dịu nhẹ",
    caption: "Lắng nghe làn da",
    icon: "heart-outline",
    captionIcon: "leaf-outline",
    accent: "pink",
  },
  {
    id: "daily-routine",
    badge: "Chu trình cá nhân",
    title: "Xây dựng routine cá nhân hóa",
    description:
      "Sắp xếp các bước chăm da sáng và tối phù hợp với nhu cầu và nhịp sống của bạn.",
    image: require("../assets/intro/daily-routine.jpg"),
    imageLabel: "Các sản phẩm chăm sóc da được sắp xếp trên kệ",
    caption: "Đồng hành sáng và tối",
    icon: "sunny-outline",
    captionIcon: "moon-outline",
    accent: "sage",
  },
  {
    id: "ingredient-scan",
    badge: "Tìm hiểu mỹ phẩm",
    title: "Tra cứu và quét thành phần",
    description:
      "Tìm hiểu thành phần mỹ phẩm để có thêm thông tin khi lựa chọn sản phẩm cho làn da.",
    image: require("../assets/intro/ingredient-scan.jpg"),
    imageLabel: "Điện thoại quét bảng thành phần trên sản phẩm mỹ phẩm",
    caption: "Hiểu rõ thành phần",
    icon: "scan-outline",
    captionIcon: "information-circle-outline",
    accent: "pink",
  },
];
