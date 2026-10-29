export const REGISTER_COPY = {
  registerEmail: "Địa chỉ Email",
  fullName: "Họ và tên",
  password: "Mật khẩu",
  confirmation: "Xác nhận mật khẩu",
  back: "Quay lại đăng nhập",
  registerTitle: "Tạo tài khoản SkinMAte",
  registerBadge: "Hành trình chăm da dịu lành",
  registerDescription:
    "Bắt đầu hành trình lắng nghe và yêu thương làn da của bạn.",
  registerAction: "Đăng ký tài khoản",
  registerSuccess: "Đăng ký thành công. Chào mừng bạn đến với SkinMAte!",
  hasAccount: "Đã có tài khoản?",
  loginAction: "Đăng nhập",
  namePlaceholder: "Nguyễn Lan Anh",
  emailPlaceholder: "lananh@example.com",
  passwordPlaceholder: "Nhập mật khẩu",
  confirmationPlaceholder: "Nhập lại mật khẩu",
  nameHint: "Nhập tên đầy đủ để SkinMAte đồng hành cùng bạn",
  emailHint: "Dùng email này để đăng nhập tài khoản SkinMAte.",
  passwordHint: "Mật khẩu cần từ 8 đến 128 ký tự",
  passwordValid: "Độ dài mật khẩu đạt yêu cầu",
  confirmationHint: "Nhập lại chính xác mật khẩu vừa thiết lập",
  passwordsMatch: "Mật khẩu đã khớp",
  passwordsDiffer: "Mật khẩu xác nhận chưa trùng khớp",
  consent:
    "Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của SkinMAte.",
  consentPrefix: "Tôi đồng ý với",
  terms: "Điều khoản dịch vụ",
  and: "và",
  privacy: "Chính sách bảo mật",
  retrySession: "Thử lưu phiên lại",
  accountCreated:
    "Tài khoản đã được tạo nhưng chưa lưu được phiên đăng nhập. Hãy thử lưu phiên lại hoặc chuyển sang Đăng nhập.",
  policiesUnavailable:
    "Tính năng tạo tài khoản chưa sẵn sàng. Vui lòng quay lại sau.",
  validation: {
    name: "Vui lòng nhập họ và tên từ 2 đến 100 ký tự.",
    email: "Địa chỉ email chưa đúng định dạng.",
    emailLong: "Email không được vượt quá 254 ký tự.",
    password: "Mật khẩu cần từ 8 đến 128 ký tự.",
    confirmation: "Mật khẩu xác nhận chưa trùng khớp.",
    consent: "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.",
  },
  errors: {
    validation: "Vui lòng kiểm tra lại thông tin đã nhập.",
    duplicate: "Email này đã được đăng ký. Bạn có thể chuyển sang Đăng nhập.",
    rateLimit: "Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại.",
    network:
      "Kết nối bị gián đoạn nên chưa xác nhận được kết quả. Vui lòng kiểm tra mạng rồi thử lại, hoặc đăng nhập nếu tài khoản đã được tạo.",
    server: "Chưa thể hoàn tất yêu cầu. Vui lòng thử lại sau.",
  },
};

// Replace these drafts with approved documents before release.
export const POLICIES = {
  terms: {
    title: REGISTER_COPY.terms,
    published: false,
    version: "development-only",
    paragraphs: [
      "NỘI DUNG MẪU — CHỈ DÀNH CHO BẢN PHÁT TRIỂN.",
      "Đây là nội dung thử nghiệm của luồng tạo tài khoản, không phải điều khoản dịch vụ chính thức. Chỉ sử dụng dữ liệu thử nghiệm trong môi trường phát triển.",
    ],
  },
  privacy: {
    title: REGISTER_COPY.privacy,
    published: false,
    version: "development-only",
    paragraphs: [
      "NỘI DUNG MẪU — CHỈ DÀNH CHO BẢN PHÁT TRIỂN.",
      "Chính sách bảo mật chính thức chưa được công bố. Nội dung này chỉ phục vụ kiểm thử giao diện; không sử dụng thông tin cá nhân thật trong bản phát triển.",
    ],
  },
};

export const CAN_REGISTER =
  __DEV__ || (POLICIES.terms.published && POLICIES.privacy.published);
